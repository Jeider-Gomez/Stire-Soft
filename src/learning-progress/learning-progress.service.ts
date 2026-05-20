import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { LearningProgressRepository } from './learning-progress.repository';
import { SubmissionsRepository } from '../submissions/submissions.repository';
import { ActivitiesRepository } from '../activities/activities.repository';
import { calculateUnitMastery } from '../common/utils/mastery.calculator';

@Injectable()
export class LearningProgressService {
  constructor(
    private readonly progressRepo: LearningProgressRepository,
    private readonly submissionsRepo: SubmissionsRepository,
    private readonly activitiesRepo: ActivitiesRepository,
  ) {}

  async recalculateMastery(studentId: number, learningUnitId: number, lastActivityId: number, score: number, passingScore: number) {
    const progress = await this.progressRepo.findOrCreate(studentId, learningUnitId);
    
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

    return this.progressRepo.save(progress);
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
