import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityQuestionsRepository } from './activity-questions.repository';
import { ActivityQuestion } from './entities/activity-question.entity';
import { Activity } from '../activities/entities/activity.entity';
import { QuestionType } from '../common/enums/question-type.enum';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { User, UserRole } from '../user/entities/user.entity';
import { ContentRenderingService } from '../content-rendering/content-rendering.service';
import { PublicationStatus } from '../common/enums/status.enum';

import { IsInt, IsEnum, IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreateActivityQuestionDto {
  @IsInt()
  activityId: number;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  question: string;

  @IsNumber()
  @IsOptional()
  points?: number;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsObject()
  config: Record<string, any>;
}

@Injectable()
export class ActivityQuestionsService {
  constructor(
    private readonly questionsRepo: ActivityQuestionsRepository,
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
    private readonly authorizationService: AuthorizationService,
    private readonly contentRenderingService: ContentRenderingService,
  ) {}

  /**
   * Crear una pregunta. Solo el docente dueño de la clase de la actividad
   * destino (o admin) — sin esto, cualquier docente podía inyectar
   * preguntas, con su respuesta correcta, en actividades ajenas.
   */
  async create(dto: CreateActivityQuestionDto, user: User): Promise<ActivityQuestion> {
    this.validateConfig(dto.type, dto.config);
    await this.authorizationService.assertTeacherOwnsClass(
      user,
      await this.resolveClassId(dto.activityId),
    );

    const question = this.questionsRepo.create({
      activityId: dto.activityId,
      type: dto.type,
      // ADR 07, perfil RICH: activity_question.question es autoría docente.
      question: this.contentRenderingService.sanitizeRichText(dto.question),
      points: dto.points ?? 50,
      order: dto.order ?? 0,
      config: dto.config,
    });
    return this.questionsRepo.save(question);
  }

  /**
   * OLA 3 - PUNTO 2/3 (P1-R2, docs/REAUDITORIA_OLA2.md): `create()` ya
   * verificaba propiedad de la clase, pero esta lectura no — cualquier
   * cuenta con rol docente podía leer el `config` crudo (ground truth) de
   * actividades de OTRO docente. Un docente ajeno ahora recibe 403; un
   * estudiante sigue recibiendo la versión redactada (StudentQuestionDto,
   * en el controller) sin cambios — no forma parte de este hallazgo.
   */
  async findByActivity(activityId: number, user: User): Promise<ActivityQuestion[]> {
    const { activity, classId } = await this.findActivityWithClass(activityId);

    if (user.role === UserRole.DOCENTE) {
      await this.authorizationService.assertTeacherOwnsClass(user, classId);
    } else if (user.role === UserRole.ESTUDIANTE) {
      // La redacción de StudentQuestionDto evita exponer la respuesta correcta,
      // pero no sustituye la autorización: sin esta comprobación cualquier
      // estudiante autenticado podía enumerar preguntas de una clase ajena.
      await this.authorizationService.assertEnrolledInClass(user, classId);

      if (activity.status !== PublicationStatus.PUBLISHED) {
        throw new NotFoundException(`Actividad con ID ${activityId} no encontrada`);
      }
    }
    return this.questionsRepo.findByActivityId(activityId);
  }

  /**
   * Validacion de producto: una pregunta CODING sin ningun testCase publico
   * deja al estudiante programando a ciegas, sin saber que formato de
   * entrada/salida se espera (ver P0-03: los ocultos se filtran antes de
   * servirse al estudiante).
   */
  private validateConfig(type: QuestionType, config: Record<string, any>): void {
    // BE-01: el enum existe pero no hay evaluador registrado; una pregunta así
    // haría fallar con 400 la entrega de CADA estudiante. Se rechaza al crearla.
    if (type === QuestionType.AI_EVALUATED) {
      throw new BadRequestException(
        'El tipo ai_evaluated todavía no está disponible: no hay un evaluador que lo califique.',
      );
    }
    if (type !== QuestionType.CODING) return;

    const testCases = Array.isArray(config?.testCases) ? config.testCases : [];
    const hasPublicCase = testCases.some((tc: any) => tc?.isPublic === true);

    if (!hasPublicCase) {
      throw new BadRequestException(
        'Una pregunta de tipo coding debe incluir al menos un testCase con isPublic:true, ' +
          'para que el estudiante sepa qué formato de entrada/salida se espera.',
      );
    }
  }

  /**
   * ActivityQuestion (aún no creada) -> Activity -> LearningUnit -> Topic ->
   * Section -> classId. Mismo patrón de "falla cerrado" que
   * `ActivitiesService.resolveClassId`.
   */
  private async resolveClassId(activityId: number): Promise<number> {
    const { classId } = await this.findActivityWithClass(activityId);
    return classId;
  }

  private async findActivityWithClass(activityId: number): Promise<{ activity: Activity; classId: number }> {
    const activity = await this.activitiesRepository.findOne({
      where: { id: activityId },
      relations: ['learningUnit', 'learningUnit.topic', 'learningUnit.topic.section'],
    });
    const classId = activity?.learningUnit?.topic?.section?.classId;
    if (!activity || !classId) {
      throw new NotFoundException(
        `No se pudo resolver la clase de la actividad ${activityId} (actividad inexistente o sin unidad/topic/sección asociado).`,
      );
    }
    return { activity, classId };
  }
}
