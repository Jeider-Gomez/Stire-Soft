import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningState, ProgressState } from './entities/learning-state.entity';
import { LearningUnitService } from '../learning-unit/learning-unit.service';
import { EvaluationService } from '../evaluation/evaluation.service';
import { SubmissionService } from '../submission/submission.service';

@Injectable()
export class LearningStateService {
  constructor(
    @InjectRepository(LearningState)
    private readonly learningStateRepository: Repository<LearningState>,
    private readonly learningUnitService: LearningUnitService,
    @Inject(forwardRef(() => EvaluationService))
    private readonly evaluationService: EvaluationService,
    @Inject(forwardRef(() => SubmissionService))
    private readonly submissionService: SubmissionService,
  ) {}

  // =====================================================
  // CÁLCULO DE ESTADO
  // =====================================================

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

  private calculateUrgency(state: ProgressState, nextReviewDate: Date | null): number {
    if (state === ProgressState.DOMINADO) return 0;
    if (!nextReviewDate) return 3;

    const now = new Date();
    const diffMs = nextReviewDate.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays <= 0) return 3;
    if (diffDays <= 3) return 2;
    return 1;
  }

  // =====================================================
  // CORE: RECÁLCULO DE MASTERY
  // =====================================================

  private async getOrCreateLearningState(studentId: number, unitId: number): Promise<LearningState> {
    let state = await this.learningStateRepository.findOne({
      where: { studentId, learningUnitId: unitId },
    });

    if (!state) {
      await this.learningUnitService.findOne(unitId);

      state = this.learningStateRepository.create({
        studentId,
        learningUnitId: unitId,
        state: ProgressState.NO_VISTO,
        mastery: 0,
        successRate: 0,
        totalAttempts: 0,
        urgencyLevel: 0,
      });
      state = await this.learningStateRepository.save(state);
    }

    return state;
  }

  /**
   * RECALCULAR MASTERY — Se llama desde SubmissionService después de cada intento
   */
  async recalculateMastery(studentId: number, unitId: number): Promise<LearningState> {
    const learningState = await this.getOrCreateLearningState(studentId, unitId);

    // 1. Obtener todas las evaluaciones activas de esta unidad
    const evaluations = await this.evaluationService.findActiveByUnit(unitId);

    if (evaluations.length === 0) {
      return learningState;
    }

    // 2. Calcular variables con weight
    let totalWeightedMax = 0;
    let totalWeightedBest = 0;
    let approvedEvaluations = 0;

    for (const evaluation of evaluations) {
      const bestScore = await this.submissionService.getBestScore(studentId, evaluation.id);
      
      const weight = evaluation.weight || 1.0;
      totalWeightedMax += evaluation.maxScore * weight;
      totalWeightedBest += bestScore * weight;

      if (bestScore >= (evaluation.maxScore * 0.7)) {
        approvedEvaluations++;
      }
    }

    // 3. Calcular mastery y successRate
    const mastery = totalWeightedMax > 0 
      ? Math.round((totalWeightedBest / totalWeightedMax) * 100) 
      : 0;
      
    const successRate = evaluations.length > 0
      ? Math.round((approvedEvaluations / evaluations.length) * 100)
      : 0;

    // 4. Calcular estado y tiempos
    const state = this.calculateState(mastery);
    const nextReviewDate = this.calculateNextReviewDate(state);
    const urgencyLevel = this.calculateUrgency(state, nextReviewDate);
    
    // 5. Conteo de intentos (solo para estadísticas)
    const totalAttempts = await this.submissionService.countByUnit(studentId, unitId);

    // 6. Actualizar entity
    learningState.mastery = mastery;
    learningState.successRate = successRate;
    learningState.state = state;
    learningState.lastPracticedAt = new Date();
    learningState.nextReviewDate = nextReviewDate;
    learningState.urgencyLevel = urgencyLevel;
    learningState.totalAttempts = totalAttempts;

    return await this.learningStateRepository.save(learningState);
  }

  // =====================================================
  // DECAIMIENTO POR INACTIVIDAD
  // =====================================================

  async applyDecay(studentId: number): Promise<void> {
    const allStates = await this.learningStateRepository.find({
      where: { studentId },
    });

    const now = new Date();

    for (const state of allStates) {
      if (state.state === ProgressState.DOMINADO) continue;
      if (state.state === ProgressState.NO_VISTO) continue;

      if (state.nextReviewDate && state.nextReviewDate < now) {
        const daysPastDue = Math.floor(
          (now.getTime() - state.nextReviewDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const decayAmount = Math.min(daysPastDue * 2, 15);
        state.mastery = Math.max(1, state.mastery - decayAmount);
        state.state = this.calculateState(state.mastery);
        state.urgencyLevel = 3;

        await this.learningStateRepository.save(state);
      } else {
        const newUrgency = this.calculateUrgency(state.state, state.nextReviewDate);
        if (newUrgency !== state.urgencyLevel) {
          state.urgencyLevel = newUrgency;
          await this.learningStateRepository.save(state);
        }
      }
    }
  }

  // =====================================================
  // CONSULTAS
  // =====================================================

  async markAsViewed(studentId: number, unitId: number): Promise<LearningState> {
    const state = await this.getOrCreateLearningState(studentId, unitId);

    if (state.state === ProgressState.NO_VISTO) {
      state.state = ProgressState.EXPLORANDO;
      state.mastery = 5;
      state.lastPracticedAt = new Date();
      state.nextReviewDate = this.calculateNextReviewDate(ProgressState.EXPLORANDO);
      state.urgencyLevel = 0;
    }

    return await this.learningStateRepository.save(state);
  }

  async updateMastery(studentId: number, unitId: number, mastery: number): Promise<LearningState> {
    const state = await this.getOrCreateLearningState(studentId, unitId);

    state.mastery = mastery;
    state.state = this.calculateState(mastery);
    state.lastPracticedAt = new Date();
    state.nextReviewDate = this.calculateNextReviewDate(state.state);
    state.urgencyLevel = this.calculateUrgency(state.state, state.nextReviewDate);

    return await this.learningStateRepository.save(state);
  }

  async getStudentProgress(studentId: number): Promise<LearningState[]> {
    return await this.learningStateRepository.find({
      where: { studentId },
      relations: ['learningUnit', 'learningUnit.topic'],
      order: { learningUnit: { order: 'ASC' } },
    });
  }

  async getFullStudentProgress(studentId: number) {
    const allUnits = await this.learningUnitService.findAll();
    const studentProgress = await this.getStudentProgress(studentId);

    return allUnits.map((unit) => {
      const state = studentProgress.find((p) => p.learningUnitId === unit.id);
      return {
        learningUnit: unit,
        state: state?.state || ProgressState.NO_VISTO,
        mastery: state?.mastery || 0,
        successRate: state?.successRate || 0,
        lastPracticedAt: state?.lastPracticedAt || null,
        nextReviewDate: state?.nextReviewDate || null,
        urgencyLevel: state?.urgencyLevel || 0,
        totalAttempts: state?.totalAttempts || 0,
      };
    });
  }

  async getMyDashboard(studentId: number) {
    await this.applyDecay(studentId);

    const allUnits = await this.learningUnitService.findAll();
    const studentProgress = await this.getStudentProgress(studentId);

    const topicMap = new Map<number | null, {
      topicId: number | null;
      topicTitle: string;
      units: any[];
    }>();

    for (const unit of allUnits) {
      const topicId = unit.topicId || null;
      
      // Intentar obtener el título del topic desde la relación en unit o progress
      let topicTitle = 'Sin Topic';
      if (unit.topic?.title) {
        topicTitle = unit.topic.title;
      } else {
        const prog = studentProgress.find(p => p.learningUnitId === unit.id);
        if (prog?.learningUnit?.topic?.title) {
          topicTitle = prog.learningUnit.topic.title;
        } else if (topicId) {
          topicTitle = `Topic ${topicId}`; // Fallback solo si realmente no se encontró
        }
      }

      if (!topicMap.has(topicId)) {
        topicMap.set(topicId, {
          topicId,
          topicTitle,
          units: [],
        });
      }

      const state = studentProgress.find((p) => p.learningUnitId === unit.id);
      topicMap.get(topicId)!.units.push({
        learningUnit: unit,
        state: state?.state || ProgressState.NO_VISTO,
        mastery: state?.mastery || 0,
        successRate: state?.successRate || 0,
        lastPracticedAt: state?.lastPracticedAt || null,
        nextReviewDate: state?.nextReviewDate || null,
        urgencyLevel: state?.urgencyLevel || 0,
        totalAttempts: state?.totalAttempts || 0,
      });
    }

    const topics = Array.from(topicMap.values());

    const allProgressData = topics.flatMap((t) => t.units);
    const stats = {
      totalUnits: allProgressData.length,
      dominado: allProgressData.filter((p) => p.state === ProgressState.DOMINADO).length,
      consolidando: allProgressData.filter((p) => p.state === ProgressState.CONSOLIDANDO).length,
      enPractica: allProgressData.filter((p) => p.state === ProgressState.EN_PRACTICA).length,
      explorando: allProgressData.filter((p) => p.state === ProgressState.EXPLORANDO).length,
      noVisto: allProgressData.filter((p) => p.state === ProgressState.NO_VISTO).length,
    };

    const recommendations = allProgressData
      .filter((p) => p.state !== ProgressState.DOMINADO)
      .sort((a, b) => {
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
   * Resumen COMPACTO para el tutor
   */
  async getProgressSummaryForTutor(studentId: number, currentUnitId?: number) {
    const fullProgress = await this.getFullStudentProgress(studentId);

    if (fullProgress.length === 0) {
      return null;
    }

    let currentUnit: any = null;
    if (currentUnitId) {
      const found = fullProgress.find(p => p.learningUnit.id === currentUnitId);
      if (found) {
        currentUnit = {
          title: found.learningUnit.title,
          mastery: found.mastery,
          state: found.state,
          successRate: found.successRate,
          urgencyLevel: found.urgencyLevel
        };
      }
    }

    const priorities = fullProgress
      .filter((p) => p.state !== ProgressState.DOMINADO && p.learningUnit.id !== currentUnitId)
      .sort((a, b) => {
        if (b.urgencyLevel !== a.urgencyLevel) return b.urgencyLevel - a.urgencyLevel;
        return a.mastery - b.mastery;
      })
      .slice(0, 5)
      .map(p => ({
        title: p.learningUnit.title,
        mastery: p.mastery,
        state: p.state,
        urgencyLevel: p.urgencyLevel
      }));

    const stats = {
      totalUnits: fullProgress.length,
      dominado: fullProgress.filter((p) => p.state === ProgressState.DOMINADO).length,
      noVisto: fullProgress.filter((p) => p.state === ProgressState.NO_VISTO).length,
    };

    return {
      currentUnit,
      priorities,
      stats
    };
  }
}
