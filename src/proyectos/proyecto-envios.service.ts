import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProyectoEnvio } from './entities/proyecto-envio.entity';
import { ProyectosService } from './proyectos.service';
import { siguienteVersion, validarRevision, VERSIONES_POR_CLASE } from './envio-reglas';
import { ProyectoInvalidoError } from './proyecto-reglas';
import { Class } from '../class/entities/class.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { User, UserRole } from '../user/entities/user.entity';

/** Un envío sin los archivos: lo que muestran las listas. */
export interface ResumenEnvio {
  id: number;
  proyectoId: number;
  classId: number;
  version: number;
  titulo: string;
  tipo: string;
  nota: number | null;
  comentario: string | null;
  revisadoAt: Date | null;
  createdAt: Date;
}

const resumen = (e: ProyectoEnvio): ResumenEnvio => ({
  id: e.id,
  proyectoId: e.proyectoId,
  classId: e.classId,
  version: e.version,
  titulo: e.titulo,
  tipo: e.tipo,
  nota: e.nota,
  comentario: e.comentario,
  revisadoAt: e.revisadoAt,
  createdAt: e.createdAt,
});

@Injectable()
export class ProyectoEnviosService {
  constructor(
    @InjectRepository(ProyectoEnvio) private readonly envios: Repository<ProyectoEnvio>,
    @InjectRepository(Enrollment) private readonly matriculas: Repository<Enrollment>,
    @InjectRepository(Class) private readonly clases: Repository<Class>,
    @InjectRepository(User) private readonly usuarios: Repository<User>,
    private readonly proyectos: ProyectosService,
    private readonly autorizacion: AuthorizationService,
  ) {}

  /** Las clases del estudiante que reciben proyectos, y lo que ya envió de este proyecto (con nota y comentario). */
  async delProyecto(user: User, proyectoId: number) {
    const proyecto = await this.proyectos.obtener(user, proyectoId);
    const suyas = await this.matriculas.find({ where: { studentId: user.id, status: EnrollmentStatus.ACTIVE }, relations: ['class'] });
    const destinos = suyas
      .map((m) => m.class)
      .filter((c): c is Class => !!c && c.aceptaProyectos && c.isActive)
      .map((c) => ({ classId: c.id, nombre: c.name }));
    const nombres = new Map(suyas.filter((m) => m.class).map((m) => [m.class.id, m.class.name]));
    const enviados = await this.envios.find({ where: { proyectoId: proyecto.id, studentId: user.id }, order: { createdAt: 'DESC' } });
    return {
      destinos,
      versionesPorClase: VERSIONES_POR_CLASE,
      envios: enviados.map((e) => ({ ...resumen(e), clase: nombres.get(e.classId) ?? 'Clase' })),
    };
  }

  /** Guarda una copia congelada del proyecto tal como está ahora en el servidor. */
  async enviar(user: User, datos: { proyectoId?: unknown; classId?: unknown }): Promise<ResumenEnvio> {
    const proyectoId = Number(datos.proyectoId);
    const classId = Number(datos.classId);
    if (!Number.isInteger(proyectoId) || !Number.isInteger(classId)) throw new BadRequestException('Elige el proyecto y la clase.');
    const proyecto = await this.proyectos.obtener(user, proyectoId);
    const matricula = await this.matriculas.findOne({ where: { studentId: user.id, classId, status: EnrollmentStatus.ACTIVE }, relations: ['class'] });
    if (!matricula?.class) throw new ForbiddenException('No estás matriculado en esa clase.');
    if (!matricula.class.aceptaProyectos || !matricula.class.isActive) throw new ForbiddenException('Esa clase no está recibiendo proyectos.');
    const anteriores = await this.envios.find({ where: { proyectoId: proyecto.id, classId, studentId: user.id } });
    let version: number;
    try {
      version = siguienteVersion(anteriores, proyecto);
    } catch (e) {
      if (e instanceof ProyectoInvalidoError) throw new BadRequestException(e.message);
      throw e;
    }
    const copia = await this.envios.save(
      this.envios.create({
        proyectoId: proyecto.id,
        studentId: user.id,
        classId,
        version,
        titulo: proyecto.titulo,
        tipo: proyecto.tipo,
        archivos: proyecto.archivos,
        nota: null,
        comentario: null,
        revisadoAt: null,
      }),
    );
    return resumen(copia);
  }

  /** Lo que recibió una clase: solo su docente (o un administrador). */
  async deLaClase(user: User, classId: number) {
    await this.autorizacion.assertTeacherOwnsClass(user, classId);
    const clase = await this.clases.findOne({ where: { id: classId } });
    const lista = await this.envios.find({ where: { classId }, order: { createdAt: 'DESC' } });
    const ids = [...new Set(lista.map((e) => e.studentId))];
    const estudiantes = ids.length ? await this.usuarios.find({ where: { id: In(ids) } }) : [];
    const nombre = new Map(estudiantes.map((u) => [u.id, u.fullName || u.email]));
    return {
      aceptaProyectos: clase?.aceptaProyectos ?? false,
      envios: lista.map((e) => ({ ...resumen(e), estudiante: nombre.get(e.studentId) ?? 'Estudiante' })),
    };
  }

  /** Un envío con sus archivos: su autor, el docente de la clase o un administrador. A cualquier otro, 404. */
  async obtener(user: User, id: number) {
    const envio = await this.envios.findOne({ where: { id } });
    if (!envio) throw new NotFoundException('Envío no encontrado.');
    if (user.role === UserRole.ESTUDIANTE) {
      if (envio.studentId !== user.id) throw new NotFoundException('Envío no encontrado.');
    } else if (user.role !== UserRole.ADMIN) {
      const clase = await this.clases.findOne({ where: { id: envio.classId } });
      if (!clase || clase.teacherId !== user.id) throw new NotFoundException('Envío no encontrado.');
    }
    const estudiante = await this.usuarios.findOne({ where: { id: envio.studentId } });
    const clase = await this.clases.findOne({ where: { id: envio.classId } });
    return {
      ...resumen(envio),
      archivos: envio.archivos,
      estudiante: estudiante?.fullName || estudiante?.email || 'Estudiante',
      clase: clase?.name ?? '',
    };
  }

  /** El docente pone nota, comentario o ambos. Dejar los dos vacíos lo vuelve a «sin revisar». */
  async revisar(user: User, id: number, datos: { nota?: unknown; comentario?: unknown }): Promise<ResumenEnvio> {
    const envio = await this.envios.findOne({ where: { id } });
    if (!envio) throw new NotFoundException('Envío no encontrado.');
    await this.autorizacion.assertTeacherOwnsClass(user, envio.classId);
    let revision;
    try {
      revision = validarRevision(datos);
    } catch (e) {
      if (e instanceof ProyectoInvalidoError) throw new BadRequestException(e.message);
      throw e;
    }
    envio.nota = revision.nota;
    envio.comentario = revision.comentario;
    envio.revisadoAt = revision.nota === null && revision.comentario === null ? null : new Date();
    return resumen(await this.envios.save(envio));
  }
}
