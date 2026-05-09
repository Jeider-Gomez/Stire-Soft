import { Injectable } from '@nestjs/common';
import { LearningProgressService } from '../learning-progress/learning-progress.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly progressService: LearningProgressService) {}

  async getStudentDashboard(studentId: number) {
    // Aquí podemos agrupar datos de LearningProgress, ReviewSchedules, etc.
    return {
      studentId,
      overview: 'Student dashboard logic here',
    };
  }

  async getClassMetrics(classId: number) {
    return {
      classId,
      metrics: 'Class performance metrics here',
    };
  }
}
