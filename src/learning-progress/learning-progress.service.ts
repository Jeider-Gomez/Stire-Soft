import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { In } from 'typeorm';
import { LearningProgressRepository } from './learning-progress.repository';
import { SubmissionsRepository } from '../submissions/submissions.repository';
import { ActivitiesRepository } from '../activities/activities.repository';
import { calculateUnitMastery } from '../common/utils/mastery.calculator';
import { LearningStatus } from '../common/enums/learning-status.enum';
import { PublicationStatus } from '../common/enums/status.enum';
import { LearningStatusChangedEvent } from '../common/events/learning-status-changed.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Activity } from '../activities/entities/activity.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { SubmissionStatus } from '../common/enums/submission-status.enum';
import { ActivityQuestion } from '../activity-questions/entities/activity-question.entity';
import { QuestionType } from '../common/enums/question-type.enum';
import { ReviewSchedule } from '../review-schedules/entities/review-schedule.entity';
import { LearningUnit } from '../learning-unit/entities/learning-unit.entity';
import { Topic } from '../topic/entities/topic.entity';
import { Section } from '../section/entities/section.entity';
import { LearningProgress } from './entities/learning-progress.entity';
import { Confianza, MotivoRecomendacion, nivelSaltadoHasta, recomendarSiguiente } from './recommendation/recomendar-siguiente';
import { construirEstadisticas, SEMANAS_CALENDARIO } from './estadisticas';
import { actividadVisiblePara } from '../activities/visibilidad';

export interface NextActivityRecommendation {
  activityId: number;
  title: string;
  /** Tipo de pregunta de la actividad (mcq, coding…); null si no tiene preguntas. */
  questionType: string | null;
  order: number;
  allCompleted: boolean;
  /** Nivel de la actividad recomendada: basico, intermedio o avanzado. */
  level: string;
  /** Por qué se recomienda (docs/DISENO_PRACTICA_ADAPTATIVA.md §3.3). */
  reason: MotivoRecomendacion;
  /** El motivo en una línea, para mostrarlo al estudiante. */
  reasonMessage: string;
}

type ActividadConTipo = Activity & { questionType: QuestionType | null };

export function isSubmissionPassed(submission: Submission, activity: Activity | undefined): boolean {
  return !!activity && activity.totalPoints > 0
    && (submission.score / activity.totalPoints) * 100 >= activity.passingScore;
}

@Injectable()
export class LearningProgressService {
  private readonly logger = new Logger(LearningProgressService.name);

  constructor(
    private readonly progressRepo: LearningProgressRepository,
    private readonly submissionsRepo: SubmissionsRepository,
    private readonly activitiesRepo: ActivitiesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Recalcula el dominio de la lección. `contarIntento` es false cuando el cambio no viene de un intento del estudiante
   * sino de la revisión del docente en una entrega que cuenta para el dominio (docs/DISENO_INTERVENCION_DOCENTE.md §5).
   */
  async recalculateMastery(studentId: number, learningUnitId: number, lastActivityId: number | null, score: number, passingScore: number, contarIntento = true) {
    const progress = await this.progressRepo.findOrCreate(studentId, learningUnitId);
    const oldStatus = progress.status || LearningStatus.NO_VISTO;
    
    // Todas las actividades de la unidad, con su tipo de pregunta (las hermanas forman una casilla)
    const activities = await this.cargarActividadesConTipo(learningUnitId, studentId);

    // Todos los submissions del estudiante para estas actividades
    const activityIds = activities.map(a => a.id);
    const submissions = activityIds.length > 0
      ? await this.submissionsRepo.createQueryBuilder('sub')
          .where('sub.studentId = :studentId', { studentId })
          .andWhere('sub.activityId IN (:...activityIds)', { activityIds })
          .andWhere('sub.status != :status', { status: 'in_progress' })
          .getMany()
      : [];

    // Con «Me siento seguro» y el reto acertado, las casillas saltadas que nunca intentó no cuentan (§3.3).
    const saltadoHasta = nivelSaltadoHasta(
      activities,
      submissions.map((s) => ({ activityId: s.activityId, score: s.score, calificado: true, fecha: new Date(s.submittedAt ?? s.createdAt ?? 0) })),
      esConfianza(progress.entryConfidence) ? progress.entryConfidence : null,
    );
    const evidencias = await this.evidenciasDeEntregas(studentId, learningUnitId);
    progress.mastery = calculateUnitMastery([...submissions, ...evidencias.intentos], [...activities, ...evidencias.actividades], saltadoHasta);

    if (contarIntento) progress.attemptsCount += 1;

    // Transición automática del estado cognitivo del estudiante
    let newStatus = LearningStatus.NO_VISTO;
    if (progress.attemptsCount > 0 || progress.mastery > 0) {
      if (progress.mastery < 20) {
        newStatus = LearningStatus.EXPLORADO;
      } else if (progress.mastery < 60) {
        newStatus = LearningStatus.EN_PRACTICA;
      } else if (progress.mastery < 85) {
        newStatus = LearningStatus.COMPRENSION_PARCIAL;
      } else {
        newStatus = LearningStatus.DOMINADO;
      }
    }
    progress.status = newStatus;
    
    // passingScore es un PORCENTAJE (0-100) del totalPoints de CADA actividad,
    // no un puntaje crudo — las actividades no valen todas lo mismo (10, 15,
    // 20... puntos según su tipo/dificultad), así que comparar el score crudo
    // contra un mismo umbral fijo dejaba actividades de bajo puntaje total
    // imposibles de aprobar sin importar qué tan bien se resolvieran.
    // Calcular de forma exacta el conteo de actividades únicas completadas
    const distinctPassedActivities = new Set(
      submissions
        .filter(s => isSubmissionPassed(s, activities.find(a => a.id === s.activityId)))
        .map(s => s.activityId)
    );
    progress.completedActivities = distinctPassedActivities.size;

    // Calcular successRate global de la unidad
    const passed = submissions.filter(s =>
      isSubmissionPassed(s, activities.find(a => a.id === s.activityId))
    ).length;
    progress.successRate = submissions.length > 0 ? (passed / submissions.length) * 100 : 0;
    
    if (lastActivityId !== null) progress.lastActivityId = lastActivityId;

    const savedProgress = await this.progressRepo.save(progress);

    // Emitir y registrar evento de cambio de estado de aprendizaje
    if (oldStatus !== newStatus) {
      this.logger.log(
        `[Transición Cognitiva] Estudiante ${studentId} cambió su estado en Unidad ${learningUnitId}: ${oldStatus} -> ${newStatus} (Maestría: ${progress.mastery.toFixed(2)}%)`
      );
      this.eventEmitter.emit(
        'learning.status.changed',
        new LearningStatusChangedEvent(studentId, learningUnitId, oldStatus, newStatus, progress.mastery)
      );
    }

    return savedProgress;
  }

  async getClassProgress(studentId: number, classId: number): Promise<number> {
    // Aquí implementaremos el progreso real basado en learning units asociadas a la clase.
    // Por ahora retornamos un promedio simulado de las unidades actuales del estudiante
    const progresses = await this.progressRepo.find({ where: { studentId } });
    if (!progresses || progresses.length === 0) return 0;
    
    const sum = progresses.reduce((acc, curr) => acc + curr.mastery, 0);
    return Math.round(sum / progresses.length);
  }

  async findForUnits(studentId: number, unitIds: number[]) {
    if (!unitIds || unitIds.length === 0) {
      return [];
    }
    return this.progressRepo.find({
      where: {
        studentId,
        learningUnitId: In(unitIds),
      },
    });
  }

  /**
   * Intentos ya calificados de esta actividad que NO alcanzaron el puntaje de aprobación. Es la señal
   * real con la que el Tutor decide cuánta ayuda dar (andamiaje progresivo, P03): solo cuenta datos
   * propios del estudiante, así que un `activityId` inventado por el cliente devuelve 0.
   */
  async countFailedAttempts(studentId: number, activityId: number): Promise<number> {
    const activity = await this.activitiesRepo.findOne({ where: { id: activityId } });
    if (!activity) return 0;

    const submissions = await this.submissionsRepo.find({ where: { studentId, activityId } });
    return submissions.filter(
      submission =>
        submission.status !== SubmissionStatus.IN_PROGRESS && !isSubmissionPassed(submission, activity),
    ).length;
  }

  async getNextActivity(studentId: number, learningUnitId: number, opciones: { reto?: boolean } = {}): Promise<NextActivityRecommendation | null> {
    const activities = await this.cargarActividadesConTipo(learningUnitId, studentId);
    if (activities.length === 0) return null;

    // Incluye los intentos en curso: gastan un intento aunque todavía no tengan resultado.
    const submissions = await this.submissionsRepo.createQueryBuilder('sub')
      .where('sub.studentId = :studentId', { studentId })
      .andWhere('sub.activityId IN (:...activityIds)', { activityIds: activities.map(activity => activity.id) })
      .getMany();
    const progress = await this.activitiesRepo.manager.findOne(LearningProgress, { where: { studentId, learningUnitId } });
    const schedule = await this.activitiesRepo.manager.findOne(ReviewSchedule, { where: { studentId, learningUnitId } });

    const confianza = progress?.entryConfidence;
    const recomendacion = recomendarSiguiente({
      actividades: activities.map(activity => ({
        id: activity.id,
        title: activity.title,
        order: activity.order,
        difficulty: activity.difficulty,
        questionType: activity.questionType,
        totalPoints: activity.totalPoints,
        passingScore: activity.passingScore,
        attemptsAllowed: activity.attemptsAllowed,
      })),
      intentos: submissions.map(submission => ({
        activityId: submission.activityId,
        score: submission.score,
        calificado: submission.status !== SubmissionStatus.IN_PROGRESS,
        fecha: new Date(submission.submittedAt ?? submission.createdAt ?? 0),
      })),
      confianza: esConfianza(confianza) ? confianza : null,
      repasoVencido: !!schedule && new Date(schedule.nextReviewDate).getTime() <= Date.now(),
      reto: opciones.reto,
    });
    if (!recomendacion) return null;

    return {
      activityId: recomendacion.actividad.id,
      title: recomendacion.actividad.title,
      questionType: recomendacion.actividad.questionType,
      order: recomendacion.actividad.order,
      allCompleted: recomendacion.completada,
      level: recomendacion.nivel,
      reason: recomendacion.motivo,
      reasonMessage: recomendacion.mensaje,
    };
  }

  /**
   * Guarda la respuesta del estudiante a «¿Cómo te sientes con este tema?». Solo el propio estudiante, y solo en una
   * unidad de una clase en la que está matriculado (la autorización la hace el controlador con `resolveClassId`).
   */
  async setEntryConfidence(studentId: number, learningUnitId: number, confianza: number): Promise<LearningProgress> {
    if (!esConfianza(confianza)) {
      throw new BadRequestException('La confianza debe ser 1 (Es nuevo para mí), 2 (Tengo dudas) o 3 (Me siento seguro).');
    }
    const progress = await this.progressRepo.findOrCreate(studentId, learningUnitId);
    progress.entryConfidence = confianza;
    return this.progressRepo.save(progress);
  }

  /** LearningUnit → Topic → Section → classId, para autorizar. Falla cerrado si la cadena está rota. */
  async resolveClassId(learningUnitId: number): Promise<number> {
    const manager = this.activitiesRepo.manager;
    const unit = await manager.findOne(LearningUnit, { where: { id: learningUnitId } });
    const topic = unit?.topicId != null ? await manager.findOne(Topic, { where: { id: unit.topicId } }) : null;
    const section = topic ? await manager.findOne(Section, { where: { id: topic.sectionId } }) : null;
    if (!section) throw new NotFoundException(`Unidad de aprendizaje ${learningUnitId} no encontrada`);
    return section.classId;
  }

  /** Marca un intento como repaso: se calificó cuando la unidad tenía un repaso vencido. */
  async marcarComoRepaso(submissionId: string): Promise<void> {
    await this.submissionsRepo.update(submissionId, { isReview: true });
  }

  /** Lo que dijo el estudiante antes de entregar («seguro», «dudo», «adivino») o null si no respondió. */
  async juicioDeEntrega(submissionId: string): Promise<string | null> {
    const submission = await this.submissionsRepo.findOne({ where: { id: submissionId } });
    return submission?.confianza ?? null;
  }

  async esPrimerIntento(submissionId: string): Promise<boolean> {
    const submission = await this.submissionsRepo.findOne({ where: { id: submissionId } });
    return submission?.attemptNumber === 1;
  }

  /** Actividades publicadas de la unidad con el tipo de su primera pregunta (define la casilla de hermanas). */
  /**
   * Entregas revisadas que cuentan para el dominio de la lección (docs/DISENO_INTERVENCION_DOCENTE.md §5): cada una es
   * una casilla propia, con la nota de la última versión revisada (0,0 a 5,0). La nota del docente es evidencia, no un
   * valor del dominio escrito a mano. Las entregas sin revisar no cuentan: no bajan el dominio de quien no ha entregado.
   */
  async evidenciasDeEntregas(studentId: number, learningUnitId: number): Promise<{ actividades: Parameters<typeof calculateUnitMastery>[1]; intentos: Parameters<typeof calculateUnitMastery>[0] }> {
    const filas: Array<{ entregaId: number; dificultad: string; nota: string | number; revisadoAt: Date }> = await this.activitiesRepo.manager.query(
      'SELECT e.id AS entregaId, e.dificultad AS dificultad, pe.nota AS nota, pe.revisadoAt AS revisadoAt ' +
        'FROM entregas e JOIN proyecto_envios pe ON pe.entregaId = e.id ' +
        'WHERE e.learningUnitId = ? AND e.cuentaParaDominio = 1 AND pe.studentId = ? AND pe.nota IS NOT NULL ' +
        'ORDER BY pe.version DESC',
      [learningUnitId, studentId],
    );
    const vistas = new Set<number>();
    const actividades: Parameters<typeof calculateUnitMastery>[1] = [];
    const intentos: Parameters<typeof calculateUnitMastery>[0] = [];
    for (const f of filas) {
      if (vistas.has(f.entregaId)) continue;
      vistas.add(f.entregaId);
      const id = -Number(f.entregaId);
      actividades.push({ id, difficulty: f.dificultad, questionType: null, totalPoints: 5, passingScore: 60, adaptiveWeight: 1, activityType: { baseWeight: 1 } });
      intentos.push({ activityId: id, score: Number(f.nota), isReview: false, submittedAt: f.revisadoAt });
    }
    return { actividades, intentos };
  }

  /**
   * Estadísticas del estudiante al estilo de Anki (docs/DISENO_INTERVENCION_DOCENTE.md §10.3). El calendario y la
   * retención cuentan todo lo que hizo; las lecciones y los repasos, solo los de la clase pedida.
   */
  async estadisticas(studentId: number, classId: number | null) {
    const manager = this.activitiesRepo.manager;
    const ahora = new Date();
    const lecciones: number[] = classId
      ? (
          await manager.query(
            'SELECT lu.id AS id FROM learning_units lu JOIN topics t ON lu.topicId = t.id JOIN sections s ON t.sectionId = s.id ' +
              'WHERE s.classId = ? AND s.isPublished = 1 AND t.isActive = 1 AND lu.isActive = 1',
            [classId],
          )
        ).map((f: { id: number }) => Number(f.id))
      : [];
    const desde = new Date(ahora.getTime() - (SEMANAS_CALENDARIO * 7 + 1) * 86_400_000);
    const envios: Array<{ fecha: Date; score: number; isReview: number | boolean; totalPoints: number; passingScore: number }> = await manager.query(
      'SELECT COALESCE(s.submittedAt, s.createdAt) AS fecha, s.score AS score, s.isReview AS isReview, a.totalPoints AS totalPoints, a.passingScore AS passingScore ' +
        'FROM submissions s JOIN activities a ON a.id = s.activityId ' +
        'WHERE s.studentId = ? AND s.status <> ? AND COALESCE(s.submittedAt, s.createdAt) >= ?',
      [studentId, SubmissionStatus.IN_PROGRESS, desde],
    );
    const repasos = lecciones.length ? await manager.find(ReviewSchedule, { where: { studentId, learningUnitId: In(lecciones) } }) : [];
    const progresos = lecciones.length ? await this.progressRepo.find({ where: { studentId, learningUnitId: In(lecciones) } }) : [];
    return construirEstadisticas({
      envios: envios.map((e) => ({
        fecha: new Date(e.fecha),
        esRepaso: !!Number(e.isReview),
        aprobado: Number(e.totalPoints) > 0 && (Number(e.score) / Number(e.totalPoints)) * 100 >= Number(e.passingScore),
      })),
      repasos: repasos.map((r) => ({ learningUnitId: r.learningUnitId, nextReviewDate: new Date(r.nextReviewDate), intervalDays: r.intervalDays })),
      progresos: progresos.map((p) => ({ learningUnitId: p.learningUnitId, mastery: p.mastery })),
      lecciones,
      ahora,
    });
  }

  /** Las actividades publicadas de la lección que este estudiante ve (sin las asignadas solo a otros, §4.1). */
  private async cargarActividadesConTipo(learningUnitId: number, studentId: number): Promise<ActividadConTipo[]> {
    const activities = (await this.activitiesRepo.find({
      where: { learningUnitId, status: PublicationStatus.PUBLISHED },
      relations: ['activityType'],
      order: { order: 'ASC', id: 'ASC' },
    })).filter((a) => actividadVisiblePara(a, studentId));
    if (activities.length === 0) return [];

    const preguntas = await this.activitiesRepo.manager.find(ActivityQuestion, {
      where: { activityId: In(activities.map(activity => activity.id)) },
      order: { order: 'ASC', id: 'ASC' },
    });
    return activities.map(activity =>
      Object.assign(activity, { questionType: preguntas.find(p => p.activityId === activity.id)?.type ?? null }),
    );
  }
}

function esConfianza(valor: number | null | undefined): valor is Confianza {
  return valor === 1 || valor === 2 || valor === 3;
}
