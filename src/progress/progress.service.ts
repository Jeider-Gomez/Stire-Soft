import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progress, ProgressState } from './entities/progress.entity';
import { LearningUnitService } from '../learning-unit/learning-unit.service';
import { Evaluation } from '../evaluation/entities/evaluation.entity';
import { Submission } from '../submission/entities/submission.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    private readonly learningUnitService: LearningUnitService,
  ) {}

  // =====================================================
  // CÁLCULO DE ESTADO
  // =====================================================

  /**
   * Determinar el estado basado en el mastery
   * 0        → NO_VISTO
   * 1-30     → EXPLORANDO
   * 31-60    → EN_PRACTICA
   * 61-85    → CONSOLIDANDO
   * 86-100   → DOMINADO
   */
  private calculateState(mastery: number): ProgressState {
    if (mastery > 85) return ProgressState.DOMINADO;
    if (mastery > 60) return ProgressState.CONSOLIDANDO;
    if (mastery > 30) return ProgressState.EN_PRACTICA;
    if (mastery > 0) return ProgressState.EXPLORANDO;
    return ProgressState.NO_VISTO;
  }

  // =====================================================
  // REPETICIÓN ESPACIADA — TIEMPOS
  // =====================================================

  /**
   * Calcular la próxima fecha de repaso según el estado
   * DOMINADO → 365 días (no necesita repaso)
   * CONSOLIDANDO → 14 días
   * EN_PRACTICA → 5 días
   * EXPLORANDO → 2 días
   * NO_VISTO → ahora (urgente)
   */
  private calculateNextReviewDate(state: ProgressState): Date {
    const now = new Date();
    const daysMap: Record<ProgressState, number> = {
      [ProgressState.DOMINADO]: 365,
      [ProgressState.CONSOLIDANDO]: 14,
      [ProgressState.EN_PRACTICA]: 5,
      [ProgressState.EXPLORANDO]: 2,
      [ProgressState.NO_VISTO]: 0,
    };

    const days = daysMap[state];
    now.setDate(now.getDate() + days);
    return now;
  }

  /**
   * Calcular nivel de urgencia basado en nextReviewDate
   * 0 = sin urgencia (DOMINADO o recién practicado)
   * 1 = baja (faltan >3 días)
   * 2 = media (faltan 1-3 días)
   * 3 = alta (pasó la fecha o es hoy)
   */
  private calculateUrgency(state: ProgressState, nextReviewDate: Date | null): number {
    // DOMINADO nunca tiene urgencia
    if (state === ProgressState.DOMINADO) return 0;

    if (!nextReviewDate) return 3; // Si no hay fecha, es urgente

    const now = new Date();
    const diffMs = nextReviewDate.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays <= 0) return 3;  // Pasó la fecha
    if (diffDays <= 3) return 2;  // Próximamente
    return 1;                      // Aún queda tiempo
  }

  // =====================================================
  // CORE: RECÁLCULO DE MASTERY
  // =====================================================

  /**
   * Obtener o crear el progreso de un estudiante en una unidad
   */
  private async getOrCreateProgress(studentId: number, unitId: number): Promise<Progress> {
    let progress = await this.progressRepository.findOne({
      where: { studentId, learningUnitId: unitId },
    });

    if (!progress) {
      await this.learningUnitService.findOne(unitId);

      progress = this.progressRepository.create({
        studentId,
        learningUnitId: unitId,
        state: ProgressState.NO_VISTO,
        mastery: 0,
        reviewCount: 0,
        urgencyLevel: 0,
      });
      progress = await this.progressRepository.save(progress);
    }

    return progress;
  }

  /**
   * RECALCULAR MASTERY — Se llama desde SubmissionService después de cada intento
   *
   * Fórmula: mastery = (Σ mejores scores / Σ maxScores) × 100
   *
   * Solo considera evaluaciones ACTIVAS.
   * Por cada evaluación, usa SOLO el mejor intento del estudiante.
   */
  async recalculateMastery(studentId: number, unitId: number): Promise<Progress> {
    const progress = await this.getOrCreateProgress(studentId, unitId);

    // 1. Obtener todas las evaluaciones activas de esta unidad
    const evaluations = await this.evaluationRepository.find({
      where: { learningUnitId: unitId, isActive: true },
    });

    if (evaluations.length === 0) {
      // Sin evaluaciones, mastery se mantiene en 0
      return progress;
    }

    // 2. Calcular suma de maxScores (denominador)
    const totalMaxScore = evaluations.reduce((sum, e) => sum + e.maxScore, 0);

    // 3. Para cada evaluación, obtener el MEJOR score del estudiante
    let totalBestScore = 0;
    for (const evaluation of evaluations) {
      const bestSubmission = await this.submissionRepository
        .createQueryBuilder('sub')
        .select('MAX(sub.score)', 'bestScore')
        .where('sub.studentId = :studentId', { studentId })
        .andWhere('sub.evaluationId = :evaluationId', { evaluationId: evaluation.id })
        .getRawOne();

      totalBestScore += (bestSubmission?.bestScore || 0);
    }

    // 4. Calcular mastery
    const mastery = Math.round((totalBestScore / totalMaxScore) * 100);

    // 5. Calcular estado
    const state = this.calculateState(mastery);

    // 6. Calcular tiempos de repetición espaciada
    const nextReviewDate = this.calculateNextReviewDate(state);
    const urgencyLevel = this.calculateUrgency(state, nextReviewDate);

    // 7. Actualizar progress
    progress.mastery = mastery;
    progress.state = state;
    progress.lastPracticedAt = new Date();
    progress.lastReview = new Date();
    progress.nextReviewDate = nextReviewDate;
    progress.urgencyLevel = urgencyLevel;
    progress.reviewCount += 1;

    return await this.progressRepository.save(progress);
  }

  // =====================================================
  // DECAIMIENTO POR INACTIVIDAD
  // =====================================================

  /**
   * Aplicar decaimiento leve a unidades que no se practican
   * Regla: si NO está DOMINADO y pasó nextReviewDate → sube urgencia
   * Se puede llamar periódicamente (cron) o al entrar al dashboard
   */
  async applyDecay(studentId: number): Promise<void> {
    const allProgress = await this.progressRepository.find({
      where: { studentId },
    });

    const now = new Date();

    for (const progress of allProgress) {
      // DOMINADO nunca decae
      if (progress.state === ProgressState.DOMINADO) continue;
      // NO_VISTO no tiene qué decaer
      if (progress.state === ProgressState.NO_VISTO) continue;

      // Si pasó la fecha de repaso → actualizar urgencia
      if (progress.nextReviewDate && progress.nextReviewDate < now) {
        // Decaimiento suave: reducir mastery en 5 puntos (mínimo 1)
        const daysPastDue = Math.floor(
          (now.getTime() - progress.nextReviewDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const decayAmount = Math.min(daysPastDue * 2, 15); // Max 15 puntos de decaimiento
        progress.mastery = Math.max(1, progress.mastery - decayAmount);
        progress.state = this.calculateState(progress.mastery);
        progress.urgencyLevel = 3; // Alta urgencia

        await this.progressRepository.save(progress);
      } else {
        // Actualizar urgencia sin decaer mastery
        const newUrgency = this.calculateUrgency(progress.state, progress.nextReviewDate);
        if (newUrgency !== progress.urgencyLevel) {
          progress.urgencyLevel = newUrgency;
          await this.progressRepository.save(progress);
        }
      }
    }
  }

  // =====================================================
  // CONSULTAS
  // =====================================================

  /**
   * Marcar una unidad como vista (mantener para compatibilidad)
   */
  async markAsViewed(studentId: number, unitId: number): Promise<Progress> {
    const progress = await this.getOrCreateProgress(studentId, unitId);

    if (progress.state === ProgressState.NO_VISTO) {
      progress.state = ProgressState.EXPLORANDO;
      progress.mastery = 5;
      progress.lastPracticedAt = new Date();
      progress.lastReview = new Date();
      progress.nextReviewDate = this.calculateNextReviewDate(ProgressState.EXPLORANDO);
      progress.urgencyLevel = 0;
    }

    progress.reviewCount += 1;
    return await this.progressRepository.save(progress);
  }

  /**
   * Actualizar mastery manualmente (mantener para compatibilidad)
   */
  async updateMastery(studentId: number, unitId: number, mastery: number): Promise<Progress> {
    const progress = await this.getOrCreateProgress(studentId, unitId);

    progress.mastery = mastery;
    progress.state = this.calculateState(mastery);
    progress.lastPracticedAt = new Date();
    progress.lastReview = new Date();
    progress.nextReviewDate = this.calculateNextReviewDate(progress.state);
    progress.urgencyLevel = this.calculateUrgency(progress.state, progress.nextReviewDate);
    progress.reviewCount += 1;

    return await this.progressRepository.save(progress);
  }

  /**
   * Obtener todo el progreso de un estudiante
   */
  async getStudentProgress(studentId: number): Promise<Progress[]> {
    return await this.progressRepository.find({
      where: { studentId },
      relations: ['learningUnit'],
      order: { learningUnit: { order: 'ASC' } },
    });
  }

  /**
   * Obtener progreso completo (incluye unidades sin progreso)
   */
  async getFullStudentProgress(studentId: number) {
    const allUnits = await this.learningUnitService.findAll();
    const studentProgress = await this.getStudentProgress(studentId);

    return allUnits.map((unit) => {
      const progress = studentProgress.find((p) => p.learningUnitId === unit.id);
      return {
        learningUnit: unit,
        state: progress?.state || ProgressState.NO_VISTO,
        mastery: progress?.mastery || 0,
        lastPracticedAt: progress?.lastPracticedAt || null,
        nextReviewDate: progress?.nextReviewDate || null,
        urgencyLevel: progress?.urgencyLevel || 0,
        lastReview: progress?.lastReview || null,
        reviewCount: progress?.reviewCount || 0,
      };
    });
  }

  /**
   * GET /progress/my-dashboard — Dashboard completo del estudiante
   * Retorna: topics organizados → unidades → mastery → recomendaciones
   */
  async getMyDashboard(studentId: number) {
    // Aplicar decaimiento antes de calcular
    await this.applyDecay(studentId);

    const allUnits = await this.learningUnitService.findAll();
    const studentProgress = await this.getStudentProgress(studentId);

    // Agrupar unidades por topic
    const topicMap = new Map<number | null, {
      topicId: number | null;
      topicTitle: string;
      units: any[];
    }>();

    for (const unit of allUnits) {
      const topicId = unit.topicId || null;
      if (!topicMap.has(topicId)) {
        topicMap.set(topicId, {
          topicId,
          topicTitle: topicId ? `Topic ${topicId}` : 'Sin Topic',
          units: [],
        });
      }

      const progress = studentProgress.find((p) => p.learningUnitId === unit.id);
      topicMap.get(topicId)!.units.push({
        learningUnit: unit,
        state: progress?.state || ProgressState.NO_VISTO,
        mastery: progress?.mastery || 0,
        lastPracticedAt: progress?.lastPracticedAt || null,
        nextReviewDate: progress?.nextReviewDate || null,
        urgencyLevel: progress?.urgencyLevel || 0,
        reviewCount: progress?.reviewCount || 0,
      });
    }

    // Obtener nombres reales de topics si tienen topicId
    // (Los topics se cargan con la relación en getLearningUnit)
    const topics = Array.from(topicMap.values());

    // Estadísticas globales
    const allProgressData = topics.flatMap((t) => t.units);
    const stats = {
      totalUnits: allProgressData.length,
      dominado: allProgressData.filter((p) => p.state === ProgressState.DOMINADO).length,
      consolidando: allProgressData.filter((p) => p.state === ProgressState.CONSOLIDANDO).length,
      enPractica: allProgressData.filter((p) => p.state === ProgressState.EN_PRACTICA).length,
      explorando: allProgressData.filter((p) => p.state === ProgressState.EXPLORANDO).length,
      noVisto: allProgressData.filter((p) => p.state === ProgressState.NO_VISTO).length,
    };

    // Top 3 recomendaciones (menor mastery, excluyendo DOMINADO)
    const recommendations = allProgressData
      .filter((p) => p.state !== ProgressState.DOMINADO)
      .sort((a, b) => {
        // Primero por urgencia descendente, luego por mastery ascendente
        if (b.urgencyLevel !== a.urgencyLevel) return b.urgencyLevel - a.urgencyLevel;
        return a.mastery - b.mastery;
      })
      .slice(0, 3);

    return {
      topics,
      stats,
      recommendations,
    };
  }

  /**
   * Obtener recomendaciones para un estudiante
   */
  async getRecommendations(studentId: number) {
    const fullProgress = await this.getFullStudentProgress(studentId);

    const sorted = fullProgress
      .filter((p) => p.state !== ProgressState.DOMINADO)
      .sort((a, b) => {
        if (b.urgencyLevel !== a.urgencyLevel) return b.urgencyLevel - a.urgencyLevel;
        return a.mastery - b.mastery;
      });

    return {
      recommendations: sorted.slice(0, 5),
      totalUnits: fullProgress.length,
      dominated: fullProgress.filter((p) => p.state === ProgressState.DOMINADO).length,
      consolidating: fullProgress.filter((p) => p.state === ProgressState.CONSOLIDANDO).length,
      inProgress: fullProgress.filter((p) => p.state === ProgressState.EN_PRACTICA).length,
      exploring: fullProgress.filter((p) => p.state === ProgressState.EXPLORANDO).length,
      notViewed: fullProgress.filter((p) => p.state === ProgressState.NO_VISTO).length,
    };
  }

  /**
   * Resumen del progreso para el tutor inteligente
   */
  async getProgressSummaryForTutor(studentId: number): Promise<string> {
    const fullProgress = await this.getFullStudentProgress(studentId);

    if (fullProgress.length === 0) {
      return 'El estudiante no tiene unidades de aprendizaje asignadas.';
    }

    const lines = fullProgress.map((p) => {
      const urgencyIcon = p.urgencyLevel >= 3 ? '🔴' : p.urgencyLevel >= 2 ? '🟡' : '🟢';
      return `${urgencyIcon} ${p.learningUnit.title}: ${p.state} (${p.mastery}%)`;
    });

    const recommendations = await this.getRecommendations(studentId);

    let summary = 'Progreso del estudiante:\n';
    summary += lines.join('\n');
    summary += `\n\nResumen: ${recommendations.dominated}/${recommendations.totalUnits} dominados, `;
    summary += `${recommendations.consolidating} consolidando, `;
    summary += `${recommendations.inProgress} en práctica, `;
    summary += `${recommendations.exploring} explorando, `;
    summary += `${recommendations.notViewed} no vistos.`;

    if (recommendations.recommendations.length > 0) {
      summary += '\n\nPrioridades de estudio (por urgencia):\n';
      recommendations.recommendations.forEach((r, i) => {
        summary += `${i + 1}. ${r.learningUnit.title} (${r.state}, ${r.mastery}%, urgencia: ${r.urgencyLevel})\n`;
      });
    }

    return summary;
  }
}
