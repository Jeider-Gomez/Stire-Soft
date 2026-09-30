import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Proyecto } from './entities/proyecto.entity';
import {
  accesoAProyectos,
  bytesDeArchivos,
  esTipoProyecto,
  LIMITES_PROYECTOS,
  plantillaInicial,
  ProyectoInvalidoError,
  validarArchivos,
  validarTitulo,
} from './proyecto-reglas';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';
import { User } from '../user/entities/user.entity';

export interface ResumenProyecto {
  id: number;
  titulo: string;
  tipo: string;
  bytes: number;
  updatedAt: Date;
}

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto) private readonly proyectos: Repository<Proyecto>,
    @InjectRepository(Enrollment) private readonly matriculas: Repository<Enrollment>,
    private readonly config: ConfigService,
  ) {}

  /** Los errores de las reglas son un 400 con el motivo. */
  private reglas<T>(fn: () => T): T {
    try {
      return fn();
    } catch (e) {
      if (e instanceof ProyectoInvalidoError) throw new BadRequestException(e.message);
      throw e;
    }
  }

  async disponible(user: User): Promise<boolean> {
    let codigos: string[] = [];
    if (user.role === 'estudiante') {
      const suyas = await this.matriculas.find({ where: { studentId: user.id, status: EnrollmentStatus.ACTIVE }, relations: ['class'] });
      codigos = suyas.map((m) => m.class?.code).filter((c): c is string => typeof c === 'string');
    }
    return accesoAProyectos({
      modo: this.config.get<string>('PROYECTOS_MODO'),
      clasesPiloto: this.config.get<string>('PROYECTOS_CLASES_PILOTO'),
      rol: user.role,
      codigosDeSusClases: codigos,
    });
  }

  private async exigirAcceso(user: User): Promise<void> {
    if (!(await this.disponible(user))) throw new ForbiddenException('Proyectos todavía no está disponible para tu cuenta.');
  }

  async estado(user: User) {
    return { disponible: await this.disponible(user), limites: LIMITES_PROYECTOS };
  }

  async listar(user: User): Promise<ResumenProyecto[]> {
    await this.exigirAcceso(user);
    const lista = await this.proyectos.find({ where: { ownerId: user.id }, order: { updatedAt: 'DESC' } });
    return lista.map((p) => ({ id: p.id, titulo: p.titulo, tipo: p.tipo, bytes: bytesDeArchivos(p.archivos), updatedAt: p.updatedAt }));
  }

  async crear(user: User, datos: { titulo?: unknown; tipo?: unknown }): Promise<Proyecto> {
    await this.exigirAcceso(user);
    const titulo = this.reglas(() => validarTitulo(datos.titulo));
    if (!esTipoProyecto(datos.tipo)) throw new BadRequestException('Elige el tipo de proyecto: página web o JavaScript.');
    const tipo = datos.tipo;
    const cuantos = await this.proyectos.count({ where: { ownerId: user.id } });
    if (cuantos >= LIMITES_PROYECTOS.proyectosPorUsuario) {
      throw new BadRequestException(`Tienes ${LIMITES_PROYECTOS.proyectosPorUsuario} proyectos, el máximo. Descarga y borra alguno que ya no uses.`);
    }
    return this.proyectos.save(this.proyectos.create({ ownerId: user.id, titulo, tipo, archivos: plantillaInicial(tipo, titulo) }));
  }

  /** Un proyecto ajeno responde 404, igual que uno que no existe: no se revela que existe. */
  async obtener(user: User, id: number): Promise<Proyecto> {
    await this.exigirAcceso(user);
    const proyecto = await this.proyectos.findOne({ where: { id, ownerId: user.id } });
    if (!proyecto) throw new NotFoundException('Proyecto no encontrado.');
    return proyecto;
  }

  async actualizar(user: User, id: number, datos: { titulo?: unknown; archivos?: unknown }): Promise<Proyecto> {
    const proyecto = await this.obtener(user, id);
    if (datos.titulo !== undefined) proyecto.titulo = this.reglas(() => validarTitulo(datos.titulo));
    if (datos.archivos !== undefined) proyecto.archivos = this.reglas(() => validarArchivos(proyecto.tipo, datos.archivos));
    return this.proyectos.save(proyecto);
  }

  async eliminar(user: User, id: number): Promise<void> {
    const proyecto = await this.obtener(user, id);
    await this.proyectos.delete({ id: proyecto.id, ownerId: user.id });
  }
}
