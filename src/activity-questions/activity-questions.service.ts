import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ActivityQuestionsRepository } from './activity-questions.repository';
import { ActivityQuestion } from './entities/activity-question.entity';
import { Activity } from '../activities/entities/activity.entity';
import { QuestionType } from '../common/enums/question-type.enum';
import { validateHtmlCssConfig } from '../evaluation-engine/html-css/html-css.validator';
import { HIGHLIGHT_LANGUAGES, isExecutableLanguage, isHighlightLanguage } from '../common/code-languages';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { User, UserRole } from '../user/entities/user.entity';
import { ContentRenderingService } from '../content-rendering/content-rendering.service';
import { PublicationStatus } from '../common/enums/status.enum';
import { Submission } from '../submissions/entities/submission.entity';
import { SubmissionStatus } from '../common/enums/submission-status.enum';

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

/** Paso 4b: qué se puede cambiar de una pregunta. El tipo no cambia (sería otro ejercicio) y la actividad tampoco. */
export class UpdateActivityQuestionDto {
  @IsString()
  @IsOptional()
  question?: string;

  @IsNumber()
  @IsOptional()
  points?: number;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}

/** Entregas que ya se calificaron con las respuestas actuales: con ellas, cambiar la pregunta cambiaría notas puestas. */
const ESTADOS_ENTREGADOS = [SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED];

@Injectable()
export class ActivityQuestionsService {
  constructor(
    private readonly questionsRepo: ActivityQuestionsRepository,
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
    private readonly authorizationService: AuthorizationService,
    private readonly contentRenderingService: ContentRenderingService,
    @InjectRepository(Submission)
    private readonly submissionsRepository: Repository<Submission>,
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
   * Paso 4b: editar el enunciado, los puntos o los datos (opciones, casos, plantilla) de una pregunta. Así «Duplicar
   * como variante» sirve de verdad: la copia se edita en vez de quedar idéntica. Solo el docente de la clase (o admin),
   * y solo mientras nadie haya entregado: una entrega calificada con las respuestas viejas quedaría con otra nota que
   * la que vería el docente. En ese caso se responde 409 y el camino es duplicar como variante.
   */
  async update(id: number, dto: UpdateActivityQuestionDto, user: User): Promise<ActivityQuestion> {
    const question = await this.questionsRepo.findOne({ where: { id } });
    if (!question) throw new NotFoundException(`Pregunta con ID ${id} no encontrada`);
    await this.authorizationService.assertTeacherOwnsClass(user, await this.resolveClassId(question.activityId));

    const entregas = await this.contarEntregas(question.activityId);
    if (entregas > 0) {
      throw new ConflictException(
        `Este ejercicio ya tiene ${entregas} ${entregas === 1 ? 'entrega' : 'entregas'} de estudiantes: cambiar sus respuestas ` +
          'cambiaría notas ya puestas. Duplícalo como variante y edita la copia.',
      );
    }

    if (dto.config !== undefined) {
      this.validateConfig(question.type, dto.config);
      question.config = dto.config;
    }
    if (dto.question !== undefined) {
      if (!dto.question.trim()) throw new BadRequestException('El enunciado no puede quedar vacío.');
      question.question = this.contentRenderingService.sanitizeRichText(dto.question);
    }
    if (dto.points !== undefined) {
      if (!(dto.points > 0)) throw new BadRequestException('Los puntos deben ser mayores que 0.');
      question.points = dto.points;
    }
    return this.questionsRepo.save(question);
  }

  /** Paso 4b: para que la pantalla sepa, antes de abrir el editor, si las preguntas de una actividad se pueden editar. */
  async getEditability(activityId: number, user: User): Promise<{ activityId: number; editable: boolean; submissions: number }> {
    await this.authorizationService.assertTeacherOwnsClass(user, await this.resolveClassId(activityId));
    const submissions = await this.contarEntregas(activityId);
    return { activityId, editable: submissions === 0, submissions };
  }

  private contarEntregas(activityId: number): Promise<number> {
    return this.submissionsRepository.count({ where: { activityId, status: In(ESTADOS_ENTREGADOS) } });
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
    // Fase 25: HTML y CSS por reglas. La forma, los selectores y que la solución modelo cumpla todas las reglas.
    if (type === QuestionType.HTML_CSS) {
      const problems = validateHtmlCssConfig(config);
      if (problems.length > 0) throw new BadRequestException(problems.join(' '));
      return;
    }
    // Fase 26: el lenguaje con el que el editor resalta la plantilla. Es opcional (sin él se muestra sin colores).
    if (type === QuestionType.FILL_CODE) {
      if (config?.language !== undefined && !isHighlightLanguage(config.language)) {
        throw new BadRequestException(
          `El lenguaje «${String(config.language)}» no es válido para resaltar la plantilla. Usa uno de: ${HIGHLIGHT_LANGUAGES.join(', ')}.`,
        );
      }
      return;
    }
    if (type !== QuestionType.CODING) return;

    // Fase 26: el juez solo ejecuta JavaScript. Otro lenguaje haría fallar cada intento de cada estudiante con «solo JavaScript».
    if (config?.language !== undefined && !isExecutableLanguage(config.language)) {
      throw new BadRequestException(
        `El juez solo ejecuta JavaScript por ahora (lenguaje recibido: «${String(config.language)}»). Usa language: "javascript" o crea una pregunta de otro tipo.`,
      );
    }

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
