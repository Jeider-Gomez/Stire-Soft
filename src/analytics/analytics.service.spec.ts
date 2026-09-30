import { AnalyticsService } from './analytics.service';
import { LearningProgress } from '../learning-progress/entities/learning-progress.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { ReviewSchedule } from '../review-schedules/entities/review-schedule.entity';
import { User } from '../user/entities/user.entity';
import { Class } from '../class/entities/class.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { LearningUnit } from '../learning-unit/entities/learning-unit.entity';

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

// Evaluación heurística del 30/09: un estudiante en dos clases salía con el mismo dominio y las mismas entregas en ambas,
// porque las métricas de la clase leían todo su progreso. Ahora solo lo de las unidades de esa clase.
describe('AnalyticsService.getClassMetrics — solo las unidades de la clase', () => {
  type Deps = ConstructorParameters<typeof AnalyticsService>;

  function crear(unidadesDeLaClase: number[]) {
    const llamadas: Array<{ repo: string; metodo: string; args: unknown[] }> = [];
    const qb = (repo: string, filas: unknown[], raw: unknown[] = []) => {
      const q: Record<string, unknown> = {};
      for (const m of ['innerJoin', 'where', 'andWhere', 'select', 'orderBy', 'addOrderBy']) {
        q[m] = (...args: unknown[]) => { llamadas.push({ repo, metodo: m, args }); return q; };
      }
      q.getMany = () => Promise.resolve(filas);
      q.getRawMany = () => Promise.resolve(raw);
      return q;
    };
    const progreso = [{ studentId: 7, learningUnitId: 1, mastery: 80, successRate: 50 }];
    const entregas = [{ studentId: 7, status: 'graded' }];
    const repos = new Map<unknown, unknown>([
      [Class, { findOne: () => Promise.resolve({ id: 3, name: 'ALGO', code: 'ALGO', teacherId: 10 }) }],
      [Enrollment, { find: () => Promise.resolve([{ studentId: 7, student: { fullName: 'Andrés', email: 'a@x' } }]) }],
      [LearningProgress, { createQueryBuilder: () => qb('progreso', progreso) }],
      [Submission, { createQueryBuilder: () => qb('entregas', entregas) }],
      [LearningUnit, { createQueryBuilder: () => qb('unidades', [], unidadesDeLaClase.map((id) => ({ id, title: 'U', sectionTitle: 'S' }))) }],
    ]);
    const service = new AnalyticsService({ getRepository: (e: unknown) => repos.get(e) } as unknown as Deps[0], {} as unknown as Deps[1]);
    return { service, llamadas };
  }

  it('el progreso y las entregas se filtran por las unidades de la clase', async () => {
    const { service, llamadas } = crear([1, 2]);
    const r = await service.getClassMetrics(3, { id: 10, role: 'docente' });
    expect(llamadas).toContainEqual({ repo: 'progreso', metodo: 'andWhere', args: ['p.learningUnitId IN (:...idsUnidad)', { idsUnidad: [1, 2] }] });
    expect(llamadas).toContainEqual({ repo: 'entregas', metodo: 'andWhere', args: ['a.learningUnitId IN (:...idsUnidad)', { idsUnidad: [1, 2] }] });
    expect(r?.studentRankings[0]).toMatchObject({ studentId: 7, avgMastery: 80, submissionsCount: 1 });
  });

  it('una clase sin unidades no lee progreso de otras clases: todo en cero', async () => {
    const { service, llamadas } = crear([]);
    const r = await service.getClassMetrics(3, { id: 10, role: 'docente' });
    expect(llamadas.some((l) => l.repo === 'progreso' || l.repo === 'entregas')).toBe(false);
    expect(r?.studentRankings[0]).toMatchObject({ avgMastery: 0, submissionsCount: 0 });
  });
});
