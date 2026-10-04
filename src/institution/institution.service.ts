import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, IsNull, Repository } from 'typeorm';
import { Institution } from './entities/institution.entity';
import { Program } from './entities/program.entity';
import { Asignatura } from './entities/asignatura.entity';
import { BuscarAsignaturasDto, CrearAsignaturaDto, CrearInstitucionDto, CrearProgramaDto } from './dto/catalogo.dto';

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
   * Buscar asignaturas por nombre o código. Primero las del programa indicado (el del docente), luego el resto; hasta 20.
   * Sin texto, devuelve las del programa indicado, para sugerirlas antes de escribir.
   */
  async buscarAsignaturas(dto: BuscarAsignaturasDto): Promise<Asignatura[]> {
    const q = (dto.q ?? '').trim();
    if (!q && !dto.programId) return [];
    const qb = this.asignaturaRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.program', 'program')
      .leftJoinAndSelect('a.institution', 'institution');
    if (q) {
      qb.where(new Brackets((w) => w.where('a.nombre LIKE :q', { q: `%${q}%` }).orWhere('a.codigo LIKE :q', { q: `${q}%` })));
    } else {
      qb.where('a.programId = :programId', { programId: dto.programId });
    }
    const filas = await qb.orderBy('a.nombre', 'ASC').take(60).getMany();
    // Primero las del programa del docente, luego las de algún programa, luego las electivas y los cursos libres.
    const rango = (a: Asignatura) => (dto.programId && a.programId === dto.programId ? 0 : a.programId ? 1 : a.institutionId ? 2 : 3);
    return filas
      .sort((x, y) => rango(x) - rango(y) || (x.periodoPlan ?? 99) - (y.periodoPlan ?? 99) || x.nombre.localeCompare(y.nombre, 'es'))
      .slice(0, 20);
  }

  /** Agregar una asignatura: de un programa, de una institución sin programa (electiva libre) o libre. */
  async crearAsignatura(dto: CrearAsignaturaDto, creadaPorId: number): Promise<Asignatura> {
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

    const existente = await this.asignaturaRepo.findOne({
      where: { nombre, programId: programId ?? IsNull(), institutionId: institutionId ?? IsNull() },
    });
    if (existente) return existente;

    const nueva = await this.asignaturaRepo.save(
      this.asignaturaRepo.create({ nombre, codigo: dto.codigo?.trim() || null, periodoPlan, programId, institutionId, creadaPorId }),
    );
    return (await this.asignaturaRepo.findOne({ where: { id: nueva.id } })) ?? nueva;
  }
}
