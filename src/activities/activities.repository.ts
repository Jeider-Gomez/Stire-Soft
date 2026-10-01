import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { PublicationStatus } from '../common/enums/status.enum';
import { User, UserRole } from '../user/entities/user.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';

@Injectable()
export class ActivitiesRepository extends Repository<Activity> {
  constructor(private dataSource: DataSource) {
    super(Activity, dataSource.createEntityManager());
  }

  /**
   * OLA 3 - PUNTO 3 (P0-R1, docs/REAUDITORIA_OLA2.md): `findAll` no aplicaba
   * NINGUN filtro de rol — cualquier usuario autenticado, estudiante
   * incluido, veia actividades DRAFT/ARCHIVED de clases ajenas. El acotamiento
   * por rol vive aqui (a nivel de consulta, para que la paginacion cuente
   * bien) y se aplica SIEMPRE, tanto si se pide un learningUnitId puntual
   * como en el listado global sin filtro:
   *   - admin: sin restriccion.
   *   - docente: solo actividades de clases que el propio docente dicta
   *     (cualquier estado, incluido DRAFT — es su propio contenido).
   *   - estudiante: solo actividades PUBLISHED de clases donde esta
   *     matriculado activamente.
   * El 403 explicito para "docente ajeno pide un learningUnitId puntual" lo
   * lanza el service ANTES de llegar aqui (assertTeacherOwnsClass) — este
   * filtro es la red de seguridad a nivel de datos para el listado sin
   * segmentar, donde no hay un unico recurso al que devolver 403.
   */
  async findWithPagination(
    skip: number,
    limit: number,
    search: string | undefined,
    learningUnitId: number | undefined,
    user: User,
  ): Promise<[Activity[], number]> {
    const query = this.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.activityType', 'activityType')
      .leftJoinAndSelect('activity.creator', 'creator')
      .leftJoinAndSelect('activity.learningUnit', 'learningUnit')
      .leftJoin('learningUnit.topic', 'topic')
      .leftJoin('topic.section', 'section');

    if (search) {
      query.andWhere('activity.title ILIKE :search', { search: `%${search}%` });
    }

    if (learningUnitId) {
      query.andWhere('activity.learningUnitId = :learningUnitId', { learningUnitId });
    }

    if (user.role === UserRole.DOCENTE) {
      query.leftJoin('section.class', 'cls').andWhere('cls.teacherId = :teacherId', { teacherId: user.id });
    } else if (user.role === UserRole.ESTUDIANTE) {
      query
        .innerJoin(
          Enrollment,
          'enr',
          'enr.classId = section.classId AND enr.studentId = :studentId AND enr.status = :active',
          { studentId: user.id, active: EnrollmentStatus.ACTIVE },
        )
        .andWhere('activity.status = :published', { published: PublicationStatus.PUBLISHED })
        // Una actividad asignada a algunos estudiantes (refuerzo o reto) no existe para los demás.
        .andWhere('(activity.asignadaA IS NULL OR JSON_CONTAINS(activity.asignadaA, :sidJson))', { sidJson: JSON.stringify(user.id) });
    }
    // admin: sin filtro adicional.

    query.skip(skip).take(limit).orderBy('activity.order', 'ASC').addOrderBy('activity.id', 'ASC');

    return query.getManyAndCount();
  }

  async updateStatus(id: number, status: PublicationStatus, publishedAt?: Date): Promise<void> {
    const updateData: Partial<Activity> = { status };
    if (publishedAt) updateData.publishedAt = publishedAt;
    
    await this.update(id, updateData);
  }
}
