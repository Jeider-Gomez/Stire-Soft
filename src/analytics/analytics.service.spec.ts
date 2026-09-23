import { AnalyticsService } from './analytics.service';
import { LearningProgress } from '../learning-progress/entities/learning-progress.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { ReviewSchedule } from '../review-schedules/entities/review-schedule.entity';

// Regresión de la simulación del 23/09: la pantalla del docente mostraba
// "20 / 100" en rojo para un 20/20 porque el backend no enviaba el máximo.
describe('AnalyticsService.getStudentDashboard — puntaje máximo y aprobación por entrega', () => {
  const submissions = [
    { id: 'a', activityId: 1, score: 20, status: 'graded', createdAt: new Date(), activity: { title: 'Ej', totalPoints: 20, passingScore: 60 } },
    { id: 'b', activityId: 1, score: 5, status: 'graded', createdAt: new Date(), activity: { title: 'Ej', totalPoints: 20, passingScore: 60 } },
    { id: 'c', activityId: 1, score: 0, status: 'in_progress', createdAt: new Date(), activity: { title: 'Ej', totalPoints: 20, passingScore: 60 } },
  ];
  const repos = new Map<unknown, any>([
    [LearningProgress, { find: jest.fn().mockResolvedValue([]) }],
    [Submission, { find: jest.fn().mockResolvedValue(submissions) }],
    [ReviewSchedule, { find: jest.fn().mockResolvedValue([]) }],
  ]);
  const dataSource = { getRepository: (e: unknown) => repos.get(e) };
  const authorization = { assertTeacherSharesClassWithStudent: jest.fn().mockResolvedValue(undefined) };
  const service = new AnalyticsService(dataSource as any, authorization as any);

  it('cada entrega trae maxScore real y passed (null si no está calificada)', async () => {
    const res = await service.getStudentDashboard(2, { id: 10, role: 'docente' });
    const by = Object.fromEntries(res.recentSubmissions.map((s) => [s.id, s]));

    expect(by.a).toMatchObject({ score: 20, maxScore: 20, passed: true });
    expect(by.b).toMatchObject({ score: 5, maxScore: 20, passed: false });
    expect(by.c).toMatchObject({ maxScore: 20, passed: null });
  });
});
