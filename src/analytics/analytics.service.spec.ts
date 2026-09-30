import { AnalyticsService } from './analytics.service';
import { LearningProgress } from '../learning-progress/entities/learning-progress.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { ReviewSchedule } from '../review-schedules/entities/review-schedule.entity';
import { User } from '../user/entities/user.entity';

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
    [User, { findOne: jest.fn().mockResolvedValue({ id: 2, fullName: 'Ana Pérez' }) }],
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

  // La cabecera del detalle del docente mostraba «ID: #4» porque no llegaba el nombre.
  it('trae el nombre del estudiante', async () => {
    const res = await service.getStudentDashboard(2, { id: 10, role: 'docente' });
    expect(res.studentName).toBe('Ana Pérez');
  });
});

// Paso 6: el mapa de calor muestra datos de todos los estudiantes de la clase; solo su docente o un admin lo ven.
describe('AnalyticsService.getClassHeatmap — permisos', () => {
  type Deps = ConstructorParameters<typeof AnalyticsService>;
  const clases = { findOne: jest.fn(({ where }: { where: { id: number } }) => Promise.resolve(where.id === 7 ? { id: 7, teacherId: 10 } : null)) };
  const vacio = {
    createQueryBuilder: () => {
      const qb = { innerJoin: () => qb, where: () => qb, andWhere: () => qb, select: () => qb, orderBy: () => qb, addOrderBy: () => qb, getRawMany: () => Promise.resolve([]), getMany: () => Promise.resolve([]) };
      return qb;
    },
    find: () => Promise.resolve([]),
    findOne: clases.findOne,
  };
  const dataSource = { getRepository: () => vacio };
  const service = new AnalyticsService(dataSource as unknown as Deps[0], {} as unknown as Deps[1]);

  it('el docente de la clase lo ve (una clase sin unidades da un mapa vacío)', async () => {
    const m = await service.getClassHeatmap(7, { id: 10, role: 'docente' });
    expect(m).toMatchObject({ unidades: [], celdas: [], bloqueados: [] });
  });

  it('otro docente recibe 403', async () => {
    await expect(service.getClassHeatmap(7, { id: 11, role: 'docente' })).rejects.toThrow('No tienes acceso');
  });

  it('un estudiante recibe 403', async () => {
    await expect(service.getClassHeatmap(7, { id: 3, role: 'estudiante' })).rejects.toThrow('Los estudiantes no tienen permiso');
  });

  it('una clase que no existe: 404', async () => {
    await expect(service.getClassHeatmap(99, { id: 10, role: 'admin' })).rejects.toThrow('La clase no existe');
  });
});
