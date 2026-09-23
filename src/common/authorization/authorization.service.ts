import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../../class/entities/class.entity';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { EnrollmentStatus } from '../../enrollment/enums/enrollment-status.enum';
import { User, UserRole } from '../../user/entities/user.entity';

// Servicio generico de autorizacion por propiedad de recurso (P0-04, P1-06).
// Admin siempre pasa. Lanza ForbiddenException/NotFoundException — nunca
// devuelve un booleano suelto que el llamador pueda ignorar por error.
@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(Class) private readonly classRepo: Repository<Class>,
    @InjectRepository(Enrollment) private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  async assertTeacherOwnsClass(user: User, classId: number): Promise<void> {
    if (user.role === UserRole.ADMIN) return;
    const cls = await this.classRepo.findOne({ where: { id: classId } });
    if (!cls) {
      throw new NotFoundException('Clase no encontrada');
    }
    if (cls.teacherId !== user.id) {
      throw new ForbiddenException('No dictas esta clase');
    }
  }

  async assertEnrolledInClass(user: User, classId: number): Promise<void> {
    if (user.role === UserRole.ADMIN) return;
    const enrollment = await this.enrollmentRepo.findOne({
      where: { classId, studentId: user.id, status: EnrollmentStatus.ACTIVE },
    });
    if (!enrollment) {
      throw new ForbiddenException('No estás matriculado en esta clase');
    }
  }

  /**
   * OLA 3 - PUNTO 2/3 (P1-R5, docs/REAUDITORIA_OLA2.md): un docente podía
   * consultar el progreso/analítica de CUALQUIER estudiante de la
   * institución, no solo los de sus propias clases — el mismo patrón en
   * `analytics.service.ts` y `learning-progress.controller.ts`, factorizado
   * aquí para no duplicar la consulta en ambos lugares.
   */
  async assertTeacherSharesClassWithStudent(user: User, studentId: number): Promise<void> {
    // Solo aplica a docentes: admin siempre pasa, y un estudiante que llega
    // hasta aquí ya fue autorizado por el chequeo de auto-acceso del
    // llamador (comparar contra un `teacherId` que en realidad es su propio
    // id de estudiante daría un falso 403, o peor, un falso positivo si
    // coincide por casualidad con el id de algún docente).
    if (user.role !== UserRole.DOCENTE) return;
    const sharedClasses = await this.enrollmentRepo
      .createQueryBuilder('e')
      .innerJoin(Class, 'c', 'c.id = e.classId')
      .where('e.studentId = :studentId', { studentId })
      .andWhere('c.teacherId = :teacherId', { teacherId: user.id })
      .getCount();
    if (sharedClasses === 0) {
      throw new ForbiddenException('No tienes ninguna clase en común con este estudiante');
    }
  }

  /**
   * Quién puede escribirle a quién (simulación 23/09: `POST /message` aceptaba
   * cualquier receiverId — un estudiante podía escribirle a otro estudiante, a
   * un admin, y un id inexistente terminaba en un 500 por la llave foránea):
   * - admin: a cualquiera.
   * - docente: a estudiantes de alguna de sus clases.
   * - estudiante: a docentes de las clases donde tiene matrícula activa.
   * Las relaciones que no existen responden 403 (no se revela si el id existe).
   */
  async assertCanMessage(sender: User, receiverId: number): Promise<void> {
    if (sender.role === UserRole.ADMIN) return;
    if (sender.role === UserRole.DOCENTE) {
      await this.assertTeacherSharesClassWithStudent(sender, receiverId);
      return;
    }
    const shared = await this.enrollmentRepo
      .createQueryBuilder('e')
      .innerJoin(Class, 'c', 'c.id = e.classId')
      .where('e.studentId = :studentId', { studentId: sender.id })
      .andWhere('e.status = :status', { status: EnrollmentStatus.ACTIVE })
      .andWhere('c.teacherId = :teacherId', { teacherId: receiverId })
      .getCount();
    if (shared === 0) {
      throw new ForbiddenException('Solo puedes escribirle a los docentes de tus clases');
    }
  }
}
