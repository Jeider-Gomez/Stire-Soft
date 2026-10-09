import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Not, Repository } from 'typeorm';
import { ActivitiesRepository } from './activities.repository';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Activity } from './entities/activity.entity';
import { LearningUnit } from '../learning-unit/entities/learning-unit.entity';
import { PublicationStatus } from '../common/enums/status.enum';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { User, UserRole } from '../user/entities/user.entity';
import { ContentRenderingService } from '../content-rendering/content-rendering.service';
import { Submission } from '../submissions/entities/submission.entity';
import { SubmissionStatus } from '../common/enums/submission-status.enum';
import { actividadVisiblePara } from './visibilidad';
import { intentosDisponibles, reglasDeClase } from '../common/utils/motor-dominio';
import { Class } from '../class/entities/class.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly activitiesRepo: ActivitiesRepository,
    private readonly authorizationService: AuthorizationService,
    @InjectRepository(LearningUnit)
    private readonly learningUnitRepository: Repository<LearningUnit>,
    private readonly contentRenderingService: ContentRenderingService,
  ) {}

  /**
   * OLA 2 P2: `create` era el único de los cinco métodos hermanos
   * (update/publish/archive/remove sí lo hacían) sin verificar que el
   * docente fuera dueño de la clase de la unidad de aprendizaje destino —
   * cualquier docente podía crear actividades en unidades de otro.
   */
  async create(createActivityDto: CreateActivityDto, user: User): Promise<Activity> {
    await this.authorizationService.assertTeacherOwnsClass(
      user,
      await this.resolveClassIdFromUnitId(createActivityDto.learningUnitId),
    );

    const activity = this.activitiesRepo.create({
      ...createActivityDto,
      // ADR 07, perfil RICH: activity.description es autoría docente.
      description: createActivityDto.description
        ? this.contentRenderingService.sanitizeRichText(createActivityDto.description)
        : createActivityDto.description,
      createdBy: user.id,
      status: PublicationStatus.DRAFT,
    });
    return this.activitiesRepo.save(activity);
  }

  /**
   * OLA 3 - PUNTO 3 (P0-R1): sin `user`, este método no tenía forma de
   * distinguir un estudiante de un docente ni de saber de quién. Cuando se
   * pide un `learningUnitId` puntual, se verifica propiedad/matrícula ANTES
   * de consultar (404/403 explícito, igual que `findOneForRequester`); el
   * acotamiento por rol en sí (qué filas puede ver cada rol) vive en
   * `ActivitiesRepository.findWithPagination`, para que aplique también al
   * listado global sin `learningUnitId` y para que la paginación cuente
   * sobre el conjunto ya filtrado, no sobre todo antes de recortar.
   */
  async findAll(paginationQuery: PaginationQueryDto, user: User, learningUnitId?: number) {
    const { skip, limit, search } = paginationQuery;

    if (learningUnitId) {
      const classId = await this.resolveClassIdFromUnitId(learningUnitId);
      if (user.role === UserRole.DOCENTE) {
        await this.authorizationService.assertTeacherOwnsClass(user, classId);
      } else if (user.role === UserRole.ESTUDIANTE) {
        await this.authorizationService.assertEnrolledInClass(user, classId);
      }
    }

    const [items, total] = await this.activitiesRepo.findWithPagination(
      skip || 0,
      limit || 10,
      search,
      learningUnitId,
      user,
    );
    return {
      data: items,
      meta: {
        totalItems: total,
        itemsPerPage: limit || 10,
        currentPage: paginationQuery.page || 1,
      },
    };
  }

  /**
   * Carga cruda de la actividad, con la cadena completa hasta la clase
   * (learningUnit -> topic -> section) necesaria para resolver propiedad
   * docente y matrícula. Uso interno: no aplica ninguna autorización.
   */
  async findOne(id: number): Promise<Activity> {
    const activity = await this.activitiesRepo.findOne({
      where: { id },
      relations: [
        'activityType',
        'creator',
        'learningUnit',
        'learningUnit.topic',
        'learningUnit.topic.section',
      ],
    });

    if (!activity) {
      throw new NotFoundException(`Actividad con id ${id} no encontrada`);
    }
    return activity;
  }

  /**
   * GET /activities/:id para un usuario autenticado concreto (P0-04).
   * Un estudiante solo puede ver actividades publicadas de una clase en la
   * que está matriculado; un draft nunca es visible para un estudiante,
   * pertenezca o no a su clase.
   */
  async findOneForRequester(id: number, user: User): Promise<Activity> {
    const activity = await this.findOne(id);

    if (user.role === UserRole.ESTUDIANTE) {
      const classId = this.resolveClassId(activity);
      await this.authorizationService.assertEnrolledInClass(user, classId);

      if (!actividadVisiblePara(activity, user.id)) {
        // Se responde como "no encontrada", no como "prohibida": un draft, o una actividad asignada a otros
        // estudiantes, no existe desde la perspectiva de este estudiante.
        throw new NotFoundException(`Actividad con id ${id} no encontrada`);
      }

      // Intentos ya terminados (sin contar el que esté en curso): la pantalla del ejercicio decía
      // «Intentos: 0 / 3» aunque el estudiante ya hubiera entregado.
      const attemptsUsed = await this.activitiesRepo.manager.count(Submission, {
        where: { studentId: user.id, activityId: activity.id, status: Not(SubmissionStatus.IN_PROGRESS) },
      });
      // ¿Ya lo aprobó alguna vez? La pantalla avisa que repetirlo es práctica (08/10, Jeider).
      const aprobadas = await this.activitiesRepo.manager.count(Submission, {
        where: {
          studentId: user.id,
          activityId: activity.id,
          status: SubmissionStatus.GRADED,
          score: MoreThanOrEqual((activity.totalPoints * activity.passingScore) / 100),
        },
      });
      // 09/10: con el límite usado, se reabre un intento a las 24 horas del último (motor-dominio.ts). La pantalla deja
      // entregar si `intentoDisponible` y, si no, dice cuándo se reabre.
      const terminados = await this.activitiesRepo.manager.find(Submission, {
        where: { studentId: user.id, activityId: activity.id, status: Not(SubmissionStatus.IN_PROGRESS) },
        select: { id: true, submittedAt: true, createdAt: true },
      });
      const clase = await this.activitiesRepo.manager.findOne(Class, { where: { id: classId } });
      const { quedan, reabreEn } = intentosDisponibles(activity.attemptsAllowed, terminados.map((t) => new Date(t.submittedAt ?? t.createdAt ?? 0)), new Date(), reglasDeClase(clase).horasParaReabrir);
      return Object.assign(activity, { attemptsUsed, yaAprobada: aprobadas > 0, intentoDisponible: quedan > 0, reabreEn: reabreEn?.toISOString() ?? null });
    }

    // Un docente solo ve (incluidos borradores) las actividades de SUS clases:
    // GET /activity-questions ya exigía esto, GET /activities/:id no.
    if (user.role === UserRole.DOCENTE) {
      await this.authorizationService.assertTeacherOwnsClass(user, this.resolveClassId(activity));
    }

    return activity;
  }

  async update(id: number, updateActivityDto: UpdateActivityDto, user: User): Promise<Activity> {
    const activity = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, this.resolveClassId(activity));

    if (activity.status === PublicationStatus.ARCHIVED) {
        throw new BadRequestException('No se puede modificar una actividad archivada.');
    }

    this.activitiesRepo.merge(activity, updateActivityDto);
    if (updateActivityDto.activityTypeId) {
      activity.activityTypeId = updateActivityDto.activityTypeId;
      delete (activity as any).activityType;
    }
    if (updateActivityDto.description) {
      activity.description = this.contentRenderingService.sanitizeRichText(updateActivityDto.description);
    }
    await this.activitiesRepo.save(activity);
    return this.findOne(id);
  }

  async changeStatus(id: number, status: PublicationStatus, user: User): Promise<Activity> {
    const activity = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, this.resolveClassId(activity));

    let publishedAt = activity.publishedAt;
    if (status === PublicationStatus.PUBLISHED && !activity.publishedAt) {
      publishedAt = new Date();
    }

    await this.activitiesRepo.updateStatus(id, status, publishedAt);
    return this.findOne(id);
  }

  async remove(id: number, user: User): Promise<void> {
    const activity = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, this.resolveClassId(activity));
    await this.activitiesRepo.softRemove(activity);
  }

  /**
   * Camina learningUnit -> topic -> section para obtener el classId real.
   * Falla cerrado: si el encadenamiento está roto (p.ej. una learningUnit
   * legacy sin topic), no se puede autorizar y se reporta como no encontrada
   * en vez de dejar pasar la mutación sin verificación.
   */
  private resolveClassId(activity: Activity): number {
    const classId = activity.learningUnit?.topic?.section?.classId;
    if (!classId) {
      throw new NotFoundException(
        'No se pudo resolver la clase de esta actividad (unidad de aprendizaje sin tema/sección asociado).',
      );
    }
    return classId;
  }

  /**
   * Misma cadena que `resolveClassId`, pero partiendo de un `learningUnitId`
   * en vez de una `Activity` ya cargada — usado en `create`, donde la
   * actividad todavía no existe.
   */
  private async resolveClassIdFromUnitId(learningUnitId: number): Promise<number> {
    const unit = await this.learningUnitRepository.findOne({
      where: { id: learningUnitId },
      relations: ['topic', 'topic.section'],
    });
    const classId = unit?.topic?.section?.classId;
    if (!classId) {
      throw new NotFoundException(
        `No se pudo resolver la clase de la unidad de aprendizaje ${learningUnitId} (sin topic/sección asociado).`,
      );
    }
    return classId;
  }
}
