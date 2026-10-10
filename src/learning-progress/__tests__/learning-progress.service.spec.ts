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
    // Preguntas de las actividades, progreso (confianza) y calendario de repasos se leen por el manager.
    manager: { find: jest.fn().mockResolvedValue([]), findOne: jest.fn().mockResolvedValue(null), query: jest.fn().mockResolvedValue([]) },
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

    it('un ejercicio asignado solo a otros estudiantes (un refuerzo ajeno) no cuenta en el dominio (§4.1)', async () => {
      const propio = makeActivity({ id: 1, totalPoints: 100, passingScore: 60 });
      const ajeno = makeActivity({ id: 2, totalPoints: 100, passingScore: 60, asignadaA: [99] });
      progressRepo.findOrCreate.mockResolvedValue(makeProgress());
      activitiesRepo.find.mockResolvedValue([propio, ajeno]);
      mockQueryBuilder([makeSubmission({ activityId: 1, score: 100 })]);

      const result = await service.recalculateMastery(42, 10, 1, 100, 60);

      expect(result.mastery).toBe(100);
    });

    it('lo conservado al cambiar las reglas (10/10) es un piso: una entrega nueva no baja de ahí; sin piso, baja normal', async () => {
      const activity = makeActivity({ id: 1, totalPoints: 100, passingScore: 60 });
      activitiesRepo.find.mockResolvedValue([activity, makeActivity({ id: 2, totalPoints: 100, passingScore: 60, questionType: 'ordering' })]);
      mockQueryBuilder([makeSubmission({ activityId: 1, score: 100 })]);

      progressRepo.findOrCreate.mockResolvedValue(makeProgress({ mastery: 100, dominioConservado: 100 }));
      expect((await service.recalculateMastery(42, 10, 1, 0, 60)).mastery).toBe(100);

      progressRepo.findOrCreate.mockResolvedValue(makeProgress({ mastery: 100, dominioConservado: null }));
      expect((await service.recalculateMastery(42, 10, 1, 0, 60)).mastery).toBeLessThan(100);
    });

    it('una entrega revisada que cuenta para el dominio es evidencia que solo sube: una nota baja no deja la lección sin salida (09/10)', async () => {
      const activity = makeActivity({ id: 1, totalPoints: 100, passingScore: 60 });
      progressRepo.findOrCreate.mockResolvedValue(makeProgress({ attemptsCount: 3 }));
      activitiesRepo.find.mockResolvedValue([activity]);
      mockQueryBuilder([makeSubmission({ activityId: 1, score: 100 })]);
      // Dos versiones revisadas de la misma entrega: cuenta la última (version DESC), 2,5 de 5.
      activitiesRepo.manager.query.mockResolvedValue([
        { entregaId: 7, dificultad: 'basico', nota: '2.5', revisadoAt: new Date() },
        { entregaId: 7, dificultad: 'basico', nota: '5.0', revisadoAt: new Date() },
      ]);

      const result = await service.recalculateMastery(42, 10, null, 0, 0, false);

      // Antes, 2,5 de 5 dejaba la lección en 75 % para siempre (el estudiante no puede rehacer una entrega cerrada).
      expect(result.mastery).toBe(100);
      expect(result.attemptsCount).toBe(3);
      expect(activitiesRepo.manager.query.mock.calls[0][1]).toEqual([10, 42]);
    });

    it('sin intentos, una entrega bien calificada ya marca la lección como trabajada', async () => {
      progressRepo.findOrCreate.mockResolvedValue(makeProgress());
      activitiesRepo.find.mockResolvedValue([]);
      activitiesRepo.manager.query.mockResolvedValue([{ entregaId: 3, dificultad: 'intermedio', nota: 4.5, revisadoAt: new Date() }]);

      const result = await service.recalculateMastery(42, 10, null, 0, 0, false);

      expect(result.mastery).toBe(90);
      expect(result.status).toBe('dominado');
      expect(result.attemptsCount).toBe(0);
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

    // [FIX] Regresión: antes se comparaba el score CRUDO contra un
    // passingScore fijo (60), así que una actividad de bajo puntaje total
    // (10, 15, 20... como las de mcq/fill_code/drag_drop/ordering/matching
    // sembradas en seed-runner.ts) nunca podía "aprobarse" sin importar qué
    // tan bien la resolviera el estudiante — su score máximo posible ya era
    // menor que el umbral. passingScore es un PORCENTAJE del totalPoints de
    // CADA actividad.
    it('[FIX] completedActivities=1 con un score PERFECTO en una actividad de bajo puntaje total (20 pts)', async () => {
      const activity = makeActivity({ id: 1, totalPoints: 20, passingScore: 60 });
      const submission = makeSubmission({ activityId: 1, score: 20 }); // perfecto: 20/20 = 100%

      progressRepo.findOrCreate.mockResolvedValue(makeProgress());
      activitiesRepo.find.mockResolvedValue([activity]);
      mockQueryBuilder([submission]);

      const result = await service.recalculateMastery(42, 10, 1, 20, 60);

      expect(result.completedActivities).toBe(1);
      expect(result.successRate).toBe(100);
    });

    it('[FIX] completedActivities=0 en una actividad de bajo puntaje total cuando el % real no alcanza', async () => {
      const activity = makeActivity({ id: 1, totalPoints: 20, passingScore: 60 });
      const submission = makeSubmission({ activityId: 1, score: 10 }); // 10/20 = 50% < 60%

      progressRepo.findOrCreate.mockResolvedValue(makeProgress());
      activitiesRepo.find.mockResolvedValue([activity]);
      mockQueryBuilder([submission]);

      const result = await service.recalculateMastery(42, 10, 1, 10, 60);

      expect(result.completedActivities).toBe(0);
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

  describe('getNextActivity', () => {
    function mockNextActivityQuery(submissions: any[]) {
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(submissions),
      };
      submissionsRepo.createQueryBuilder.mockReturnValue(qb);
    }

    it('recomienda la actividad publicada de menor order sin aprobaciones', async () => {
      activitiesRepo.find.mockResolvedValue([
        makeActivity({ id: 1, order: 1, title: 'Primera', activityType: { code: 'mcq', baseWeight: 1 } }),
        makeActivity({ id: 2, order: 2, title: 'Segunda', activityType: { code: 'fill_code', baseWeight: 1 } }),
      ]);
      mockNextActivityQuery([]);

      const result = await service.getNextActivity(42, 10);

      expect(result).toEqual(expect.objectContaining({ activityId: 1, order: 1, allCompleted: false }));
    });

    it('recomienda la siguiente actividad cuando la primera ya fue aprobada por porcentaje', async () => {
      activitiesRepo.find.mockResolvedValue([
        makeActivity({ id: 1, order: 1, totalPoints: 20, passingScore: 60, activityType: { code: 'mcq', baseWeight: 1 } }),
        makeActivity({ id: 2, order: 2, activityType: { code: 'fill_code', baseWeight: 1 } }),
      ]);
      mockNextActivityQuery([makeSubmission({ activityId: 1, score: 12 })]);

      const result = await service.getNextActivity(42, 10);

      expect(result).toEqual(expect.objectContaining({ activityId: 2, order: 2, allCompleted: false }));
    });

    it('con todas aprobadas pero el dominio bajo 100, sigue ofreciendo la que más lo sube (09/10: practicar hasta el 100 %)', async () => {
      activitiesRepo.find.mockResolvedValue([
        makeActivity({ id: 1, order: 1, activityType: { code: 'mcq', baseWeight: 1 } }),
        makeActivity({ id: 2, order: 2, activityType: { code: 'coding', baseWeight: 1 } }),
      ]);
      mockNextActivityQuery([
        makeSubmission({ activityId: 1, score: 60 }),
        makeSubmission({ id: 'sub-2', activityId: 2, score: 80 }),
      ]);

      const result = await service.getNextActivity(42, 10);

      // 60 y 80 de 100: aprobadas, pero el dominio va en 70 %. La de 60 es la que más sube.
      expect(result).toEqual(expect.objectContaining({ activityId: 1, allCompleted: true, reason: 'practica_extra' }));
    });
  });

  describe('getNextActivity con práctica adaptativa', () => {
    function mockIntentos(submissions: any[]) {
      submissionsRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(submissions),
      });
    }
    const UNIDAD = [
      makeActivity({ id: 1, order: 1, difficulty: 'basico', title: 'Predecir' }),
      makeActivity({ id: 2, order: 2, difficulty: 'intermedio', title: 'Completar' }),
    ];
    const PREGUNTAS = [
      { activityId: 1, type: 'mcq', order: 0 },
      { activityId: 2, type: 'fill_code', order: 0 },
    ];

    it('usa el tipo de la pregunta y devuelve nivel y motivo en una línea', async () => {
      activitiesRepo.find.mockResolvedValue(UNIDAD);
      activitiesRepo.manager.find.mockResolvedValue(PREGUNTAS);
      mockIntentos([]);

      const r = await service.getNextActivity(42, 10);

      expect(r).toEqual(expect.objectContaining({ activityId: 1, questionType: 'mcq', level: 'basico', reason: 'siguiente' }));
      expect(r!.reasonMessage.length).toBeGreaterThan(10);
    });

    it('«Me siento seguro» guardado en el progreso abre con un reto', async () => {
      activitiesRepo.find.mockResolvedValue(UNIDAD);
      activitiesRepo.manager.find.mockResolvedValue(PREGUNTAS);
      activitiesRepo.manager.findOne.mockImplementation(async (entidad: any) =>
        entidad.name === 'LearningProgress' ? { entryConfidence: 3 } : null,
      );
      mockIntentos([]);

      const r = await service.getNextActivity(42, 10);

      expect(r).toEqual(expect.objectContaining({ activityId: 2, reason: 'reto' }));
    });

    it('con el repaso de la unidad vencido, recomienda repasar', async () => {
      activitiesRepo.find.mockResolvedValue([...UNIDAD, makeActivity({ id: 3, order: 3, difficulty: 'basico' })]);
      activitiesRepo.manager.find.mockResolvedValue([...PREGUNTAS, { activityId: 3, type: 'mcq', order: 0 }]);
      activitiesRepo.manager.findOne.mockImplementation(async (entidad: any) =>
        entidad.name === 'ReviewSchedule' ? { nextReviewDate: new Date(Date.now() - 86400000) } : null,
      );
      mockIntentos([makeSubmission({ activityId: 1, score: 100, submittedAt: new Date() })]);

      const r = await service.getNextActivity(42, 10);

      expect(r).toEqual(expect.objectContaining({ activityId: 3, reason: 'repaso' }));
    });
  });

  describe('setEntryConfidence', () => {
    it('guarda 1, 2 o 3 en el progreso del estudiante', async () => {
      progressRepo.findOrCreate.mockResolvedValue(makeProgress());

      const r = await service.setEntryConfidence(42, 10, 3);

      expect(progressRepo.findOrCreate).toHaveBeenCalledWith(42, 10);
      expect(r.entryConfidence).toBe(3);
    });

    it.each([0, 4, 2.5, NaN])('rechaza %p', async (valor) => {
      await expect(service.setEntryConfidence(42, 10, valor)).rejects.toThrow('La confianza debe ser');
      expect(progressRepo.save).not.toHaveBeenCalled();
    });

    it('la confianza sola no sube el dominio', async () => {
      progressRepo.findOrCreate.mockResolvedValue(makeProgress({ mastery: 0 }));

      const r = await service.setEntryConfidence(42, 10, 3);

      expect(r.mastery).toBe(0);
    });
  });

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
