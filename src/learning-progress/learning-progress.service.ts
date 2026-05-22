import { Injectable, Logger } from '@nestjs/common';
import { In } from 'typeorm';
import { LearningProgressRepository } from './learning-progress.repository';
import { SubmissionsRepository } from '../submissions/submissions.repository';
import { ActivitiesRepository } from '../activities/activities.repository';
import { calculateUnitMastery } from '../common/utils/mastery.calculator';
import { LearningStatus } from '../common/enums/learning-status.enum';
import { LearningStatusChangedEvent } from '../common/events/learning-status-changed.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LearningProgressService {
  private readonly logger = new Logger(LearningProgressService.name);

  constructor(
    private readonly progressRepo: LearningProgressRepository,
    private readonly submissionsRepo: SubmissionsRepository,
    private readonly activitiesRepo: ActivitiesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async recalculateMastery(studentId: number, learningUnitId: number, lastActivityId: number, score: number, passingScore: number) {
    const progress = await this.progressRepo.findOrCreate(studentId, learningUnitId);
    const oldStatus = progress.status || LearningStatus.NO_VISTO;
    
    // Todas las actividades de la unidad
    const activities = await this.activitiesRepo.find({
      where: { learningUnitId, status: 'published' as any },
      relations: ['activityType'],
    });

    // Todos los submissions del estudiante para estas actividades
    const activityIds = activities.map(a => a.id);
    const submissions = activityIds.length > 0
      ? await this.submissionsRepo.createQueryBuilder('sub')
          .where('sub.studentId = :studentId', { studentId })
          .andWhere('sub.activityId IN (:...activityIds)', { activityIds })
          .andWhere('sub.status != :status', { status: 'in_progress' })
          .getMany()
      : [];

    progress.mastery = calculateUnitMastery(submissions, activities);
    
    progress.attemptsCount += 1;

    // Transición automática del estado cognitivo del estudiante
    let newStatus = LearningStatus.NO_VISTO;
    if (progress.attemptsCount > 0) {
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
    
    // Calcular de forma exacta el conteo de actividades únicas completadas
    const distinctPassedActivities = new Set(
      submissions
        .filter(s => {
          const act = activities.find(a => a.id === s.activityId);
          return act && s.score >= act.passingScore;
        })
        .map(s => s.activityId)
    );
    progress.completedActivities = distinctPassedActivities.size;
    
    // Calcular successRate global de la unidad
    const passed = submissions.filter(s => {
      const act = activities.find(a => a.id === s.activityId);
      return act && s.score >= act.passingScore;
    }).length;
    progress.successRate = submissions.length > 0 ? (passed / submissions.length) * 100 : 0;
    
    progress.lastActivityId = lastActivityId;

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
}
