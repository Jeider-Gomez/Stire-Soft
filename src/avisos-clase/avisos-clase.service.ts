import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AvisoClase } from './entities/aviso-clase.entity';
import { AvisoInvalidoError, notificacionDeAviso, validarAviso, type DatosAviso } from './aviso-reglas';
import { User, UserRole } from '../user/entities/user.entity';
import { Class } from '../class/entities/class.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/enums/notification-type.enum';

/** Avisos del docente a toda su clase (aviso-reglas.ts): publicarlos, verlos y borrarlos. */
@Injectable()
export class AvisosClaseService {
  private readonly logger = new Logger(AvisosClaseService.name);

  constructor(
    @InjectRepository(AvisoClase) private readonly avisos: Repository<AvisoClase>,
    @InjectRepository(Class) private readonly clases: Repository<Class>,
    @InjectRepository(Enrollment) private readonly matriculas: Repository<Enrollment>,
    private readonly autorizacion: AuthorizationService,
    private readonly notificaciones: NotificationsService,
  ) {}

  /** Publica el aviso y le llega una notificación a cada estudiante activo de la clase. */
  async crear(user: User, classId: number, datos: Record<string, unknown>) {
    await this.autorizacion.assertTeacherOwnsClass(user, classId);
    let v: DatosAviso;
    try {
      v = validarAviso(datos);
    } catch (e) {
      if (e instanceof AvisoInvalidoError) throw new BadRequestException(e.message);
      throw e;
    }
    const aviso = await this.avisos.save(this.avisos.create({ ...v, classId, autorId: user.id }));
    const clase = await this.clases.findOne({ where: { id: classId } });
    const estudiantes = await this.matriculas.find({ where: { classId, status: EnrollmentStatus.ACTIVE } });
    const { titulo, mensaje } = notificacionDeAviso(v, clase?.name ?? 'Tu clase');
    let avisados = 0;
    for (const m of estudiantes) {
      try {
        await this.notificaciones.createNotification(m.studentId, titulo, mensaje, NotificationType.AVISO, {
          enlace: '/estudiante/mensajes?ver=avisos',
          clave: `aviso:${aviso.id}`,
        });
        avisados++;
      } catch (error) {
        // Un estudiante sin aviso no debe dejar sin aviso a los demás.
        this.logger.error(`No se pudo avisar al estudiante ${m.studentId}: ${(error as Error).message}`);
      }
    }
    return { ...this.vista(aviso, clase?.name ?? ''), avisados };
  }

  /** Los avisos de una clase, el más nuevo primero: para su docente o un estudiante matriculado. */
  async deClase(user: User, classId: number) {
    if (user.role === UserRole.ESTUDIANTE) await this.autorizacion.assertEnrolledInClass(user, classId);
    else await this.autorizacion.assertTeacherOwnsClass(user, classId);
    const clase = await this.clases.findOne({ where: { id: classId } });
    const lista = await this.avisos.find({ where: { classId }, order: { createdAt: 'DESC', id: 'DESC' }, take: 100 });
    return lista.map((a) => this.vista(a, clase?.name ?? ''));
  }

  /** Para el estudiante: los avisos de todas sus clases activas, el más nuevo primero. */
  async mios(user: User) {
    const ms = await this.matriculas.find({ where: { studentId: user.id, status: EnrollmentStatus.ACTIVE } });
    if (!ms.length) return [];
    const clases = await this.clases.find({ where: { id: In(ms.map((m) => m.classId)) } });
    const nombre = new Map(clases.filter((c) => c.isActive !== false).map((c) => [c.id, c.name]));
    if (!nombre.size) return [];
    const lista = await this.avisos.find({ where: { classId: In([...nombre.keys()]) }, order: { createdAt: 'DESC', id: 'DESC' }, take: 100 });
    return lista.map((a) => this.vista(a, nombre.get(a.classId) ?? ''));
  }

  async eliminar(user: User, id: number) {
    const aviso = await this.avisos.findOne({ where: { id } });
    if (!aviso) throw new NotFoundException('Aviso no encontrado.');
    await this.autorizacion.assertTeacherOwnsClass(user, aviso.classId);
    await this.avisos.delete(id);
    return { eliminado: true };
  }

  private vista(a: AvisoClase, clase: string) {
    return { id: a.id, classId: a.classId, clase, tipo: a.tipo, titulo: a.titulo, cuerpo: a.cuerpo, fechaEvento: a.fechaEvento, lugar: a.lugar, createdAt: a.createdAt };
  }
}
