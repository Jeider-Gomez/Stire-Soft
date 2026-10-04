import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, IsNull, Repository } from 'typeorm';
import { Institution } from './entities/institution.entity';
import { Program } from './entities/program.entity';
import { Asignatura } from './entities/asignatura.entity';
import {
  ActualizarAsignaturaDto,
  BuscarAsignaturasDto,
  CrearAsignaturaDto,
  CrearInstitucionDto,
  CrearProgramaDto,
  ParecidasDto,
} from './dto/catalogo.dto';
import { ambitoDe, normalizarNombre, sonParecidas } from './normalizar';

/**
 * Catálogo académico (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md): instituciones, programas y asignaturas. Lo amplía
 * cualquier docente al crear una clase, sin pedir permiso; crear algo que ya existe devuelve lo existente (nunca un
 * duplicado por escribirlo dos veces). Las mayúsculas y tildes no distinguen: la base compara con su intercalación.
 */
@Injectable()
export class InstitutionService {
  constructor(
    @InjectRepository(Institution)
    private readonly institutionRepo: Repository<Institution>,
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
    @InjectRepository(Asignatura)
    private readonly asignaturaRepo: Repository<Asignatura>,
  ) {}

  /** Instituciones con sus programas, para elegir dónde va una asignatura. */
  async findAllInstitutions() {
    return this.institutionRepo.find({ relations: ['programs'], order: { name: 'ASC', programs: { name: 'ASC' } } });
  }

  async createInstitution(dto: CrearInstitucionDto) {
    const name = dto.name.trim().replace(/\s+/g, ' ');
    const existente = await this.institutionRepo.findOne({ where: { name } });
    if (existente) return existente;
    return this.institutionRepo.save(this.institutionRepo.create({ name, sigla: dto.sigla?.trim() || null, tipo: dto.tipo }));
  }

  async findAllPrograms(institutionId?: number) {
    const query = this.programRepo.createQueryBuilder('program');
    if (institutionId) {
      query.where('program.institutionId = :institutionId', { institutionId });
    }
    return query.orderBy('program.name', 'ASC').getMany();
  }

  async createProgram(dto: CrearProgramaDto) {
    if (!(await this.institutionRepo.findOne({ where: { id: dto.institutionId } }))) {
      throw new BadRequestException('Esa institución no existe.');
    }
    const name = dto.name.trim().replace(/\s+/g, ' ');
    const existente = await this.programRepo.findOne({ where: { name, institutionId: dto.institutionId } });
    if (existente) return existente;
    return this.programRepo.save(
      this.programRepo.create({ name, institutionId: dto.institutionId, tipo: dto.tipo, maxSemesters: dto.maxSemesters, facultad: dto.facultad?.trim() || null }),
    );
  }

  async findProgramById(id: number) {
    const program = await this.programRepo.findOne({ where: { id } });
    if (!program) {
      throw new NotFoundException(`Programa con ID ${id} no encontrado`);
    }
    return program;
  }

  /**
   * Buscar asignaturas por nombre, sinónimo o código. Compara nombres normalizados (sin tildes ni mayúsculas: la base de
   * producción distingue mayúsculas al comparar). Primero las del programa del docente, después las oficiales; hasta 20.
   * Sin texto, devuelve las del programa indicado, para sugerirlas antes de escribir.
   */
  async buscarAsignaturas(dto: BuscarAsignaturasDto): Promise<Asignatura[]> {
    const q = (dto.q ?? '').trim();
    const qn = normalizarNombre(q);
    if (!qn && !dto.programId) return [];
    const qb = this.asignaturaRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.program', 'program')
      .leftJoinAndSelect('a.institution', 'institution');
    if (qn) {
      qb.where(
        new Brackets((w) =>
          w
            .where('a.nombreNormalizado LIKE :qn', { qn: `%${qn}%` })
            .orWhere('a.sinonimos LIKE :qn', { qn: `%${qn}%` })
            .orWhere('a.codigo LIKE :cod', { cod: `${q}%` }),
        ),
      );
    } else {
      qb.where('a.programId = :programId', { programId: dto.programId });
    }
    const filas = await qb.orderBy('a.nombre', 'ASC').take(60).getMany();
    // Su programa, otros programas, electivas, cursos libres; dentro de cada grupo, las oficiales primero.
    const rango = (a: Asignatura) => (dto.programId && a.programId === dto.programId ? 0 : a.programId ? 1 : a.institutionId ? 2 : 3);
    return filas
      .sort(
        (x, y) =>
          rango(x) - rango(y) ||
          Number(y.oficial) - Number(x.oficial) ||
          (x.periodoPlan ?? 99) - (y.periodoPlan ?? 99) ||
          x.nombre.localeCompare(y.nombre, 'es'),
      )
      .slice(0, 20);
  }

  /**
   * «¿Es alguna de estas?»: antes de agregar una asignatura, las parecidas de la misma institución (o los cursos libres):
   * mismo código, o un nombre a una o dos letras, o con las mismas palabras. Hasta 5, las oficiales primero.
   */
  async parecidas(dto: ParecidasDto): Promise<Asignatura[]> {
    const nn = normalizarNombre(dto.nombre);
    if (!nn) return [];
    let institutionId = dto.institutionId ?? null;
    if (dto.programId) institutionId = (await this.programRepo.findOne({ where: { id: dto.programId } }))?.institutionId ?? institutionId;
    const candidatas = await this.asignaturaRepo.find({ where: { institutionId: institutionId ?? IsNull() }, take: 2000 });
    const codigo = dto.codigo?.trim();
    return candidatas
      .filter(
        (a) =>
          (!!codigo && a.codigo === codigo) ||
          sonParecidas(nn, a.nombreNormalizado) ||
          (a.sinonimos ?? '').split('|').some((s) => sonParecidas(nn, s)),
      )
      .sort((x, y) => Number(y.oficial) - Number(x.oficial) || x.nombre.localeCompare(y.nombre, 'es'))
      .slice(0, 5);
  }

  /**
   * Agregar una asignatura: de un programa, de una institución sin programa (electiva libre) o libre. Si ya existe la
   * misma en el mismo lugar (nombre normalizado o código), devuelve esa: el índice único lo garantiza aunque dos docentes
   * la agreguen a la vez. La de un admin queda oficial; la de un docente, agregada (funciona igual).
   */
  async crearAsignatura(dto: CrearAsignaturaDto, creadaPorId: number, esAdmin = false): Promise<Asignatura> {
    const nombre = dto.nombre.trim().replace(/\s+/g, ' ');
    let programId: number | null = null;
    let institutionId: number | null = dto.institutionId ?? null;
    let periodoPlan: number | null = null;

    if (dto.programId) {
      const program = await this.programRepo.findOne({ where: { id: dto.programId } });
      if (!program) throw new BadRequestException('Ese programa no existe.');
      if (institutionId && institutionId !== program.institutionId) {
        throw new BadRequestException('Ese programa es de otra institución.');
      }
      programId = program.id;
      institutionId = program.institutionId;
      if (dto.periodoPlan) {
        if (dto.periodoPlan > program.maxSemesters) {
          throw new BadRequestException(`${program.name} tiene ${program.maxSemesters} ${program.tipo === 'grado' ? 'grados' : 'semestres'}.`);
        }
        periodoPlan = dto.periodoPlan;
      }
    } else if (institutionId && !(await this.institutionRepo.findOne({ where: { id: institutionId } }))) {
      throw new BadRequestException('Esa institución no existe.');
    }

    const nombreNormalizado = normalizarNombre(nombre);
    if (nombreNormalizado.length < 3) throw new BadRequestException('Escribe el nombre completo de la asignatura.');
    const ambito = ambitoDe(programId, institutionId);
    const codigo = dto.codigo?.trim() || null;
    const existente = await this.mismaEnElAmbito(ambito, nombreNormalizado, codigo);
    if (existente) return existente;

    try {
      const nueva = await this.asignaturaRepo.save(
        this.asignaturaRepo.create({ nombre, nombreNormalizado, ambito, oficial: esAdmin, codigo, periodoPlan, programId, institutionId, creadaPorId }),
      );
      return (await this.asignaturaRepo.findOne({ where: { id: nueva.id } })) ?? nueva;
    } catch (err) {
      // Otro docente la agregó en el mismo instante: el índice único decide y se devuelve esa.
      if ((err as { code?: string })?.code === 'ER_DUP_ENTRY') {
        const ganadora = await this.mismaEnElAmbito(ambito, nombreNormalizado, codigo);
        if (ganadora) return ganadora;
      }
      throw err;
    }
  }

  private async mismaEnElAmbito(ambito: string, nombreNormalizado: string, codigo: string | null): Promise<Asignatura | null> {
    return (
      (await this.asignaturaRepo.findOne({ where: { ambito, nombreNormalizado } })) ??
      (codigo ? await this.asignaturaRepo.findOne({ where: { ambito, codigo } }) : null)
    );
  }

  // ─── Pantalla «Catálogo» del admin (§2.2.2): revisar lo que STIRE detecta, sin buscar a mano ───

  /** Posibles duplicados (misma institución o ambos libres) que nadie marcó como distintos, y las agregadas sin confirmar. */
  async revisionDelCatalogo(): Promise<{
    duplicados: Array<{ a: Asignatura; b: Asignatura; motivo: string }>;
    agregadas: Asignatura[];
    clasesPorAsignatura: Record<number, number>;
  }> {
    const todas = await this.asignaturaRepo.find({ order: { id: 'ASC' }, take: 5000 });
    const distintas: Array<{ menorId: number; mayorId: number }> = await this.asignaturaRepo.manager.query(
      'SELECT `menorId`, `mayorId` FROM `asignaturas_distintas`',
    );
    const yaRevisado = new Set(distintas.map((d) => `${d.menorId}-${d.mayorId}`));
    const duplicados: Array<{ a: Asignatura; b: Asignatura; motivo: string }> = [];
    for (let i = 0; i < todas.length; i++) {
      for (let j = i + 1; j < todas.length; j++) {
        const [a, b] = [todas[i], todas[j]];
        if ((a.institutionId ?? 0) !== (b.institutionId ?? 0) || yaRevisado.has(`${a.id}-${b.id}`)) continue;
        const motivo =
          a.codigo && a.codigo === b.codigo ? 'mismo código' : sonParecidas(a.nombreNormalizado, b.nombreNormalizado) ? 'nombre parecido' : '';
        if (motivo) duplicados.push({ a, b, motivo });
      }
    }
    const conteo: Array<{ asignaturaId: number; n: string }> = await this.asignaturaRepo.manager.query(
      'SELECT `asignaturaId`, COUNT(*) AS n FROM `classes` WHERE `asignaturaId` IS NOT NULL GROUP BY `asignaturaId`',
    );
    return {
      duplicados: duplicados.slice(0, 100),
      agregadas: todas.filter((a) => !a.oficial),
      clasesPorAsignatura: Object.fromEntries(conteo.map((c) => [c.asignaturaId, Number(c.n)])),
    };
  }

  /** El admin corrige el nombre o el código, o la confirma como oficial. El nombre viejo queda como sinónimo. */
  async actualizarAsignatura(id: number, dto: ActualizarAsignaturaDto): Promise<Asignatura> {
    const a = await this.asignaturaRepo.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Esa asignatura no existe.');
    if (dto.nombre && dto.nombre.trim() !== a.nombre) {
      const nombreNormalizado = normalizarNombre(dto.nombre);
      const otra = await this.asignaturaRepo.findOne({ where: { ambito: a.ambito, nombreNormalizado } });
      if (otra && otra.id !== a.id) throw new BadRequestException(`Ya existe «${otra.nombre}» en el mismo lugar: únelas en lugar de renombrar.`);
      a.sinonimos = agregarSinonimos(a.sinonimos, [a.nombreNormalizado], nombreNormalizado);
      a.nombre = dto.nombre.trim().replace(/\s+/g, ' ');
      a.nombreNormalizado = nombreNormalizado;
    }
    if (dto.codigo !== undefined) a.codigo = dto.codigo.trim() || null;
    if (dto.oficial !== undefined) a.oficial = dto.oficial;
    return this.asignaturaRepo.save(a);
  }

  /**
   * Unir: las clases de «origen» pasan a «destino», sus nombres quedan como sinónimos de destino y origen se borra.
   * Nada se pierde: quien busque el nombre viejo encuentra la que se quedó.
   */
  async unirAsignaturas(origenId: number, destinoId: number): Promise<Asignatura> {
    if (origenId === destinoId) throw new BadRequestException('Elige dos asignaturas distintas.');
    return this.asignaturaRepo.manager.transaction(async (m) => {
      const repo = m.getRepository(Asignatura);
      const origen = await repo.findOne({ where: { id: origenId } });
      const destino = await repo.findOne({ where: { id: destinoId } });
      if (!origen || !destino) throw new NotFoundException('Esa asignatura no existe.');
      await m.query('UPDATE `classes` SET `asignaturaId` = ? WHERE `asignaturaId` = ?', [destino.id, origen.id]);
      destino.sinonimos = agregarSinonimos(destino.sinonimos, [origen.nombreNormalizado, ...(origen.sinonimos ?? '').split('|')], destino.nombreNormalizado);
      if (!destino.codigo && origen.codigo) destino.codigo = origen.codigo;
      if (!destino.periodoPlan && origen.periodoPlan && destino.programId === origen.programId) destino.periodoPlan = origen.periodoPlan;
      destino.oficial = destino.oficial || origen.oficial;
      await repo.remove(origen);
      return repo.save(destino);
    });
  }

  /** «Son distintas»: el par deja de salir como posible duplicado. */
  async marcarDistintas(aId: number, bId: number): Promise<void> {
    if (aId === bId) throw new BadRequestException('Elige dos asignaturas distintas.');
    await this.asignaturaRepo.manager.query('INSERT IGNORE INTO `asignaturas_distintas` (`menorId`, `mayorId`) VALUES (?, ?)', [
      Math.min(aId, bId),
      Math.max(aId, bId),
    ]);
  }
}

/** Suma nombres normalizados a la lista de sinónimos, sin repetir ni incluir el nombre actual; cabe en 600 caracteres. */
export function agregarSinonimos(actuales: string | null, nuevos: string[], nombreActual: string): string | null {
  const lista = [...new Set([...(actuales ?? '').split('|'), ...nuevos].map((s) => s.trim()).filter((s) => s && s !== nombreActual))];
  let out = '';
  for (const s of lista) if ((out ? out.length + 1 : 0) + s.length <= 600) out = out ? `${out}|${s}` : s;
  return out || null;
}
