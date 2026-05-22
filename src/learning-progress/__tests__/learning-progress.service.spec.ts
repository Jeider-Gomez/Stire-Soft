import { LearningProgressService } from '../learning-progress.service';

// ─── Factories de objetos mock ─────────────────────────────────────────────

function makeActivity(overrides: Partial<any> = {}): any {
  return {
    id: 1,
    learningUnitId: 10,
    status: 'published',
    totalPoints: 100,
    passingScore: 60,
    adaptiveWeight: 1.0,
    activityType: { baseWeight: 1.0 },
    ...overrides,
  };
}

function makeSubmission(overrides: Partial<any> = {}): any {
  return {
    id: 'sub-1',
    activityId: 1,
    studentId: 42,
    score: 80,
    status: 'GRADED',
    ...overrides,
  };
}

function makeProgress(overrides: Partial<any> = {}): any {
  return {
    id: 1,
    studentId: 42,
    learningUnitId: 10,
    mastery: 0,
    attemptsCount: 0,
    completedActivities: 0,
    successRate: 0,
    lastActivityId: null,
    ...overrides,
  };
}

// ─── Mocks de repositorios ─────────────────────────────────────────────────

function buildMocks() {
  const progressRepo: any = {
    findOrCreate: jest.fn(),
    find: jest.fn(),
    save: jest.fn(async (p) => p),
  };

  const submissionsRepo: any = {
    createQueryBuilder: jest.fn(),
  };

  const activitiesRepo: any = {
    find: jest.fn(),
  };

  return { progressRepo, submissionsRepo, activitiesRepo };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('LearningProgressService', () => {
  let service: LearningProgressService;
  let progressRepo: any;
  let submissionsRepo: any;
  let activitiesRepo: any;
  let eventEmitter: any;

  beforeEach(() => {
    ({ progressRepo, submissionsRepo, activitiesRepo } = buildMocks());
    eventEmitter = {
      emit: jest.fn(),
    };
    service = new LearningProgressService(progressRepo, submissionsRepo, activitiesRepo, eventEmitter);
  });

  // ─── recalculateMastery ───────────────────────────────────────────────────

  describe('recalculateMastery', () => {
    function mockQueryBuilder(submissions: any[]) {
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(submissions),
      };
      submissionsRepo.createQueryBuilder.mockReturnValue(qb);
      return qb;
    }

    it('mastery=0 cuando no hay actividades publicadas', async () => {
      progressRepo.findOrCreate.mockResolvedValue(makeProgress());
      activitiesRepo.find.mockResolvedValue([]);
      // sin actividades no se llama al queryBuilder
      submissionsRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      });

      const result = await service.recalculateMastery(42, 10, 1, 80, 60);

      expect(result.mastery).toBe(0);
      expect(result.attemptsCount).toBe(1);
    });

    it('mastery>0 y completedActivities=1 cuando hay 1 submission aprobada', async () => {
      const activity = makeActivity({ id: 1, totalPoints: 100, passingScore: 60 });
      const submission = makeSubmission({ activityId: 1, score: 80 });

      progressRepo.findOrCreate.mockResolvedValue(makeProgress());
      activitiesRepo.find.mockResolvedValue([activity]);
      mockQueryBuilder([submission]);

      const result = await service.recalculateMastery(42, 10, 1, 80, 60);

      expect(result.mastery).toBeGreaterThan(0);
      expect(result.completedActivities).toBe(1);
    });

    it('completedActivities=0 cuando la única submission está reprobada (score < passingScore)', async () => {
      const activity = makeActivity({ id: 1, totalPoints: 100, passingScore: 60 });
      const submission = makeSubmission({ activityId: 1, score: 40 }); // reprobada

      progressRepo.findOrCreate.mockResolvedValue(makeProgress());
      activitiesRepo.find.mockResolvedValue([activity]);
      mockQueryBuilder([submission]);

      const result = await service.recalculateMastery(42, 10, 1, 40, 60);

      expect(result.completedActivities).toBe(0);
    });

    it('successRate=50 cuando 2 de 4 submissions están aprobadas', async () => {
      const activity = makeActivity({ id: 1, totalPoints: 100, passingScore: 60 });
      const submissions = [
        makeSubmission({ id: 's1', activityId: 1, score: 80 }),  // aprobada
        makeSubmission({ id: 's2', activityId: 1, score: 90 }),  // aprobada
        makeSubmission({ id: 's3', activityId: 1, score: 30 }),  // reprobada
        makeSubmission({ id: 's4', activityId: 1, score: 10 }),  // reprobada
      ];

      progressRepo.findOrCreate.mockResolvedValue(makeProgress());
      activitiesRepo.find.mockResolvedValue([activity]);
      mockQueryBuilder(submissions);

      const result = await service.recalculateMastery(42, 10, 1, 80, 60);

      expect(result.successRate).toBe(50);
    });

    it('distinctPassedActivities no duplica actividades con múltiples intentos aprobados', async () => {
      // La misma actividad con 3 intentos aprobados — debe contar como 1
      const activity = makeActivity({ id: 1, totalPoints: 100, passingScore: 60 });
      const submissions = [
        makeSubmission({ id: 's1', activityId: 1, score: 70 }),
        makeSubmission({ id: 's2', activityId: 1, score: 80 }),
        makeSubmission({ id: 's3', activityId: 1, score: 90 }),
      ];

      progressRepo.findOrCreate.mockResolvedValue(makeProgress());
      activitiesRepo.find.mockResolvedValue([activity]);
      mockQueryBuilder(submissions);

      const result = await service.recalculateMastery(42, 10, 1, 90, 60);

      expect(result.completedActivities).toBe(1); // NO 3
    });

    it('guarda el lastActivityId correcto en el progress', async () => {
      const activity = makeActivity();
      progressRepo.findOrCreate.mockResolvedValue(makeProgress());
      activitiesRepo.find.mockResolvedValue([activity]);
      mockQueryBuilder([]);

      const result = await service.recalculateMastery(42, 10, 99, 80, 60);

      expect(result.lastActivityId).toBe(99);
    });

    it('transiciona el estado cognitivo a dominado cuando la maestria >= 85', async () => {
      const activity = makeActivity({ id: 1, totalPoints: 100, passingScore: 60 });
      const submission = makeSubmission({ activityId: 1, score: 95 });

      progressRepo.findOrCreate.mockResolvedValue(makeProgress({ status: 'no_visto', attemptsCount: 0 }));
      activitiesRepo.find.mockResolvedValue([activity]);
      mockQueryBuilder([submission]);

      const result = await service.recalculateMastery(42, 10, 1, 95, 60);

      expect(result.status).toBe('dominado');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'learning.status.changed',
        expect.objectContaining({
          studentId: 42,
          learningUnitId: 10,
          oldStatus: 'no_visto',
          newStatus: 'dominado',
        })
      );
    });

    it('transiciona a explorado si la maestria < 20', async () => {
      const activity = makeActivity({ id: 1, totalPoints: 100, passingScore: 60 });
      const submission = makeSubmission({ activityId: 1, score: 10 });

      progressRepo.findOrCreate.mockResolvedValue(makeProgress({ status: 'no_visto', attemptsCount: 0 }));
      activitiesRepo.find.mockResolvedValue([activity]);
      mockQueryBuilder([submission]);

      const result = await service.recalculateMastery(42, 10, 1, 10, 60);

      expect(result.status).toBe('explorado');
    });
  });

  // ─── getClassProgress ─────────────────────────────────────────────────────

  describe('getClassProgress', () => {
    it('retorna 0 cuando el estudiante no tiene ningún progress registrado', async () => {
      progressRepo.find.mockResolvedValue([]);

      const result = await service.getClassProgress(42, 5);

      expect(result).toBe(0);
    });

    it('retorna el promedio redondeado de mastery de todas las unidades', async () => {
      progressRepo.find.mockResolvedValue([
        makeProgress({ mastery: 80 }),
        makeProgress({ mastery: 60 }),
        makeProgress({ mastery: 70 }),
      ]);

      const result = await service.getClassProgress(42, 5);

      expect(result).toBe(70); // (80+60+70)/3 = 70
    });

    it('redondea correctamente cuando el promedio no es entero', async () => {
      progressRepo.find.mockResolvedValue([
        makeProgress({ mastery: 67 }),
        makeProgress({ mastery: 68 }),
      ]);

      const result = await service.getClassProgress(42, 5);

      expect(result).toBe(68); // 135/2 = 67.5 → Math.round = 68
    });
  });

  // ─── findForUnits ─────────────────────────────────────────────────────────

  describe('findForUnits', () => {
    it('retorna [] sin llamar al repositorio cuando unitIds está vacío', async () => {
      const result = await service.findForUnits(42, []);

      expect(result).toEqual([]);
      expect(progressRepo.find).not.toHaveBeenCalled();
    });

    it('retorna [] sin llamar al repositorio cuando unitIds es undefined', async () => {
      const result = await service.findForUnits(42, undefined as any);

      expect(result).toEqual([]);
      expect(progressRepo.find).not.toHaveBeenCalled();
    });

    it('delega al repositorio con los unitIds correctos cuando hay IDs', async () => {
      const mockData = [makeProgress({ learningUnitId: 10 })];
      progressRepo.find.mockResolvedValue(mockData);

      const result = await service.findForUnits(42, [10, 20]);

      expect(progressRepo.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });
  });
});
