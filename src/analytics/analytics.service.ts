import { Injectable, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LearningProgress } from '../learning-progress/entities/learning-progress.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { ReviewSchedule } from '../review-schedules/entities/review-schedule.entity';
import { Class } from '../class/entities/class.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';

@Injectable()
export class AnalyticsService {
  constructor(private readonly dataSource: DataSource) {}

  async getStudentDashboard(studentId: number, requestingUser: any) {
    // 0. Control de Acceso
    if (requestingUser.role === 'estudiante' && requestingUser.id !== studentId) {
      throw new ForbiddenException('No tienes acceso a las métricas de otro estudiante.');
    }

    const progressRepo = this.dataSource.getRepository(LearningProgress);
    const submissionRepo = this.dataSource.getRepository(Submission);
    const reviewRepo = this.dataSource.getRepository(ReviewSchedule);

    // 1. Progress stats
    const progressList = await progressRepo.find({
      where: { studentId },
      relations: ['learningUnit'],
    });

    const totalUnitsTracked = progressList.length;
    const avgMastery = totalUnitsTracked > 0
      ? progressList.reduce((acc, p) => acc + p.mastery, 0) / totalUnitsTracked
      : 0;

    const avgSuccessRate = totalUnitsTracked > 0
      ? progressList.reduce((acc, p) => acc + p.successRate, 0) / totalUnitsTracked
      : 0;

    const totalAttempts = progressList.reduce((acc, p) => acc + p.attemptsCount, 0);
    const completedActivitiesCount = progressList.reduce((acc, p) => acc + p.completedActivities, 0);

    // 2. Review stats
    const now = new Date();
    const reviews = await reviewRepo.find({
      where: { studentId },
    });
    
    const totalReviews = reviews.length;
    const pendingReviews = reviews.filter(r => r.nextReviewDate <= now).length;

    // 3. Recent submissions
    const recentSubmissions = await submissionRepo.find({
      where: { studentId },
      relations: ['activity'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      studentId,
      summary: {
        avgMastery: Math.round(avgMastery * 100) / 100,
        avgSuccessRate: Math.round(avgSuccessRate * 100) / 100,
        totalUnitsTracked,
        totalAttempts,
        completedActivitiesCount,
        reviewStats: {
          total: totalReviews,
          pending: pendingReviews,
        }
      },
      recentSubmissions: recentSubmissions.map(s => ({
        id: s.id,
        activityId: s.activityId,
        activityTitle: s.activity?.title || 'Actividad Desconocida',
        score: s.score,
        status: s.status,
        submittedAt: s.submittedAt,
        createdAt: s.createdAt,
      })),
      masteryByUnit: progressList.map(p => ({
        unitId: p.learningUnitId,
        unitTitle: p.learningUnit?.title || 'Unidad Desconocida',
        mastery: p.mastery,
        successRate: p.successRate,
      })),
    };
  }

  async getClassMetrics(classId: number, requestingUser: any) {
    const enrollmentRepo = this.dataSource.getRepository(Enrollment);
    const progressRepo = this.dataSource.getRepository(LearningProgress);
    const submissionRepo = this.dataSource.getRepository(Submission);
    const classRepo = this.dataSource.getRepository(Class);

    const cls = await classRepo.findOne({ where: { id: classId } });
    if (!cls) {
      return null;
    }

    // Control de Acceso: solo el docente dueño de la clase o un admin pueden ver las métricas
    if (requestingUser.role === 'estudiante') {
      throw new ForbiddenException('Los estudiantes no tienen permiso para ver métricas de clase.');
    }
    if (requestingUser.role === 'docente' && cls.teacherId !== requestingUser.id) {
      throw new ForbiddenException('No tienes acceso a las métricas de esta clase.');
    }

    // Estudiantes matriculados
    const enrollments = await enrollmentRepo.find({
      where: { classId },
      relations: ['student'],
    });

    const studentIds = enrollments.map(e => e.studentId);
    if (studentIds.length === 0) {
      return {
        classId,
        className: cls.name,
        classCode: cls.code,
        metrics: {
          totalStudents: 0,
          avgClassMastery: 0,
          avgClassSuccessRate: 0,
          totalSubmissions: 0,
        },
        studentRankings: [],
      };
    }

    // Promedio de mastery de los estudiantes
    // Use a JOIN to fetch learning progress directly linked to enrollments of this class
    const progressList = await progressRepo.createQueryBuilder('p')
      .innerJoin(Enrollment, 'e', 'e.studentId = p.studentId')
      .where('e.classId = :classId', { classId })
      .getMany();

    const submissions = await submissionRepo.createQueryBuilder('s')
      .where('s.studentId IN (:...studentIds)', { studentIds })
      .andWhere('s.status = :status', { status: 'graded' })
      .getMany();

    const totalProgressEntries = progressList.length;
    const avgClassMastery = totalProgressEntries > 0
      ? progressList.reduce((acc, p) => acc + p.mastery, 0) / totalProgressEntries
      : 0;

    const avgClassSuccessRate = totalProgressEntries > 0
      ? progressList.reduce((acc, p) => acc + p.successRate, 0) / totalProgressEntries
      : 0;

    // Calcular métricas por estudiante
    const studentMetrics = enrollments.map(e => {
      const studentProgress = progressList.filter(p => p.studentId === e.studentId);
      const studentSubs = submissions.filter(s => s.studentId === e.studentId);
      
      const sMastery = studentProgress.length > 0
        ? studentProgress.reduce((acc, p) => acc + p.mastery, 0) / studentProgress.length
        : 0;

      const sSuccessRate = studentProgress.length > 0
        ? studentProgress.reduce((acc, p) => acc + p.successRate, 0) / studentProgress.length
        : 0;

      return {
        studentId: e.studentId,
        fullName: e.student?.fullName || 'Estudiante Desconocido',
        email: e.student?.email,
        avgMastery: Math.round(sMastery * 100) / 100,
        successRate: Math.round(sSuccessRate * 100) / 100,
        submissionsCount: studentSubs.length,
      };
    });

    // Ordenar de mayor a menor mastery
    studentMetrics.sort((a, b) => b.avgMastery - a.avgMastery);

    return {
      classId,
      className: cls.name,
      classCode: cls.code,
      metrics: {
        totalStudents: studentIds.length,
        avgClassMastery: Math.round(avgClassMastery * 100) / 100,
        avgClassSuccessRate: Math.round(avgClassSuccessRate * 100) / 100,
        totalSubmissions: submissions.length,
      },
      studentRankings: studentMetrics,
    };
  }
}
