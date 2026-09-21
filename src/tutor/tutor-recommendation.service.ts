import { Injectable } from '@nestjs/common';
import { LearningProgressService } from '../learning-progress/learning-progress.service';
import { LearningProgressRepository } from '../learning-progress/learning-progress.repository';
import { ReviewSchedulesService } from '../review-schedules/review-schedules.service';

const MASTERY_LOW_THRESHOLD = 60;
const URGENCY_RANK: Record<string, number> = { critico: 3, vencido: 2, manana: 1, 'al-dia': 0 };

export type SuggestionReason = 'repaso_vencido' | 'mastery_bajo' | 'contexto_actual';

export interface SuggestedActivity {
  activityId: number;
  activityTitle: string;
  learningUnitId: number;
  learningUnitTitle: string;
  reason: SuggestionReason;
  reasonMessage: string;
}

export interface DueReviewsSummary {
  /** Repasos que ya tocan hoy o están atrasados (los mismos que la pantalla de Repasos marca como vencidos/críticos). */
  overdueCount: number;
  /** Repasos programados en total, incluidos los de mañana y los que van al día. */
  scheduledCount: number;
  /** El repaso más atrasado, para poder nombrarlo; null si no hay ninguno vencido. */
  oldest: { learningUnitId: number; learningUnitTitle: string | null; daysOverdue: number } | null;
}

/**
 * Convierte el seguimiento real del estudiante (repasos vencidos, mastery por unidad,
 * recomendador de siguiente actividad ya existente) en UNA sugerencia concreta que el Tutor
 * puede ofrecer -- la pieza que le faltaba para dejar de ser un chat y actuar como un
 * acompañante que conoce tu progreso (docs/00_VISION_FUNCIONAL.md, pausa técnica 2026-09-15).
 */
@Injectable()
export class TutorRecommendationService {
  constructor(
    private readonly learningProgressService: LearningProgressService,
    private readonly progressRepo: LearningProgressRepository,
    private readonly reviewSchedulesService: ReviewSchedulesService,
  ) {}

  /**
   * Resumen de repasos vencidos para mostrarlo dentro del chat sin generar texto con el LLM.
   * "Vencido" incluye el que toca hoy (`vencido`) y el ya pasado (`critico`): mismo criterio que
   * usa `suggestAmbient` y la pantalla de Repasos.
   */
  async summarizeDueReviews(studentId: number): Promise<DueReviewsSummary> {
    const reviews = await this.reviewSchedulesService.getDueReviews(studentId);
    const overdue = reviews
      .filter(r => URGENCY_RANK[r.urgency] >= URGENCY_RANK['vencido'])
      .sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());

    let oldest: DueReviewsSummary['oldest'] = null;
    if (overdue.length > 0) {
      const first = overdue[0];
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const reviewDay = new Date(first.nextReviewDate);
      reviewDay.setHours(0, 0, 0, 0);
      oldest = {
        learningUnitId: first.learningUnitId,
        learningUnitTitle: first.learningUnitTitle,
        daysOverdue: Math.max(0, Math.round((startOfToday.getTime() - reviewDay.getTime()) / 86400000)),
      };
    }

    return { overdueCount: overdue.length, scheduledCount: reviews.length, oldest };
  }

  /** Sugerencia dentro de una unidad ya identificada (el estudiante está ahí, o se decidió que esa es la unidad relevante). */
  async suggestForUnit(
    studentId: number,
    learningUnitId: number,
    reason: SuggestionReason,
    reasonMessage: string,
  ): Promise<SuggestedActivity | null> {
    const next = await this.learningProgressService.getNextActivity(studentId, learningUnitId);
    if (!next || next.allCompleted) return null;

    const progress = await this.progressRepo.findOne({
      where: { studentId, learningUnitId },
      relations: ['learningUnit'],
    });

    return {
      activityId: next.activityId,
      activityTitle: next.title,
      learningUnitId,
      learningUnitTitle: progress?.learningUnit?.title ?? 'tu unidad actual',
      reason,
      reasonMessage,
    };
  }

  /**
   * Sugerencia sin contexto de unidad activa (saludo proactivo, o "quiero practicar" sin
   * decir qué). Prioriza repasos realmente vencidos (fecha real, no "vence mañana") sobre la
   * unidad de menor mastery -- un repaso que ya venció es más urgente que seguir avanzando.
   */
  async suggestAmbient(studentId: number): Promise<SuggestedActivity | null> {
    const dueReviews = await this.reviewSchedulesService.getDueReviews(studentId);
    const overdue = dueReviews
      .filter(r => URGENCY_RANK[r.urgency] >= URGENCY_RANK['vencido'])
      .sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());

    if (overdue.length > 0) {
      const oldest = overdue[0];
      const daysAgo = Math.max(1, Math.round((Date.now() - new Date(oldest.nextReviewDate).getTime()) / 86400000));
      return this.suggestForUnit(
        studentId,
        oldest.learningUnitId,
        'repaso_vencido',
        `Tienes pendiente repasar "${oldest.learningUnitTitle ?? 'una unidad'}" desde hace ${daysAgo} día${daysAgo === 1 ? '' : 's'}.`,
      );
    }

    const progressRecords = await this.progressRepo.find({ where: { studentId }, relations: ['learningUnit'] });
    if (progressRecords.length === 0) return null;

    const weakest = progressRecords.slice().sort((a, b) => a.mastery - b.mastery)[0];
    if (weakest.mastery >= MASTERY_LOW_THRESHOLD) return null;

    return this.suggestForUnit(
      studentId,
      weakest.learningUnitId,
      'mastery_bajo',
      `Tu dominio en "${weakest.learningUnit?.title ?? 'esta unidad'}" es ${Math.round(weakest.mastery)}%, por debajo del ${MASTERY_LOW_THRESHOLD}% recomendado.`,
    );
  }
}
