import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubmissionsService } from '../submissions.service';
import { SubmissionStatus } from '../../common/enums/submission-status.enum';
import { QuestionType } from '../../common/enums/question-type.enum';

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeActivity(overrides: Partial<any> = {}): any {
  return {
    id: 1,
    learningUnitId: 10,
    attemptsAllowed: 3,
    passingScore: 60,
    totalPoints: 100,
    ...overrides,
  };
}

function makeSubmission(overrides: Partial<any> = {}): any {
  return {
    id: 'sub-uuid-1',
    activityId: 1,
    studentId: 42,
    status: SubmissionStatus.IN_PROGRESS,
    attemptNumber: 1,
    autosaveData: null,
    lastSavedAt: null,
    timeSpentSeconds: 0,
    ...overrides,
  };
}

// ─── Mock de QueryRunner (transacción DB) ─────────────────────────────────

function makeQueryRunner(overrides: Partial<any> = {}) {
  return {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager: {
      save: jest.fn().mockImplementation(async (entities) => entities),
    },
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('SubmissionsService', () => {
  let service: SubmissionsService;

  // Mocks de dependencias
  let dataSource: any;
  let submissionsRepo: any;
  let answersRepo: any;
  let activitiesRepo: any;
  let questionsRepo: any;
  let evalEngine: any;
  let eventEmitter: any;
  let judgeQueue: any;
  let judgeExecutionService: any;

  beforeEach(() => {
    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(makeQueryRunner()),
    };

    submissionsRepo = {
      findOne: jest.fn(),
      findActiveSubmission: jest.fn(),
      getAttemptCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    answersRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation(async (e) => e),
    };

    activitiesRepo = {
      findOne: jest.fn(),
    };

    questionsRepo = {
      findByActivityId: jest.fn(),
    };

    evalEngine = {
      evaluateAnswer: jest.fn(),
    };

    eventEmitter = {
      emit: jest.fn(),
      emitAsync: jest.fn().mockResolvedValue([]),
    };

    judgeQueue = {
      enqueue: jest.fn().mockResolvedValue(undefined),
    };

    judgeExecutionService = {
      runPublicCases: jest.fn(),
    };

    const contentRenderingService = {
      escapePlainText: jest.fn((s: string) => s),
    };

    service = new SubmissionsService(
      dataSource,
      submissionsRepo,
      answersRepo,
      activitiesRepo,
      questionsRepo,
      evalEngine,
      eventEmitter,
      judgeQueue,
      contentRenderingService as any,
      judgeExecutionService,
    );
  });

  // ─── startSubmission ────────────────────────────────────────────────────

  describe('startSubmission', () => {
    const dto = { activityId: 1 };
    const studentId = 42;

    it('lanza NotFoundException cuando la actividad no existe', async () => {
      activitiesRepo.findOne.mockResolvedValue(null);

      await expect(service.startSubmission(dto, studentId))
        .rejects.toThrow(NotFoundException);
    });

    it('retorna el intento activo existente sin crear uno nuevo', async () => {
      const activeSubmission = makeSubmission();
      activitiesRepo.findOne.mockResolvedValue(makeActivity());
      submissionsRepo.findActiveSubmission.mockResolvedValue(activeSubmission);

      const result = await service.startSubmission(dto, studentId);

      expect(result).toBe(activeSubmission);
      expect(submissionsRepo.create).not.toHaveBeenCalled();
    });

    it('lanza BadRequestException cuando se alcanzó el límite de intentos', async () => {
      const activity = makeActivity({ attemptsAllowed: 3 });
      activitiesRepo.findOne.mockResolvedValue(activity);
      submissionsRepo.findActiveSubmission.mockResolvedValue(null);
      submissionsRepo.getAttemptCount.mockResolvedValue(3); // ya llegó al límite

      await expect(service.startSubmission(dto, studentId))
        .rejects.toThrow(BadRequestException);
    });

    it('[FIX] attemptsAllowed = 0 permite intentos ilimitados — no bloquea cuando ya hay N intentos', async () => {
      // attemptsAllowed = 0 significa "sin límite"
      const activity = makeActivity({ attemptsAllowed: 0 });
      const newSubmission = makeSubmission();
      activitiesRepo.findOne.mockResolvedValue(activity);
      submissionsRepo.findActiveSubmission.mockResolvedValue(null);
      // Simular que el estudiante ya hizo 999 intentos
      submissionsRepo.getAttemptCount.mockResolvedValue(999);
      submissionsRepo.create.mockReturnValue(newSubmission);
      submissionsRepo.save.mockResolvedValue(newSubmission);

      // No debe lanzar BadRequestException
      await expect(service.startSubmission(dto, studentId)).resolves.toBe(newSubmission);
      expect(submissionsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ attemptNumber: 1000 }),
      );
    });

    it('[FIX] attemptsAllowed = 0 con 0 intentos previos también permite iniciar', async () => {
      const activity = makeActivity({ attemptsAllowed: 0 });
      const newSubmission = makeSubmission();
      activitiesRepo.findOne.mockResolvedValue(activity);
      submissionsRepo.findActiveSubmission.mockResolvedValue(null);
      submissionsRepo.getAttemptCount.mockResolvedValue(0);
      submissionsRepo.create.mockReturnValue(newSubmission);
      submissionsRepo.save.mockResolvedValue(newSubmission);

      await expect(service.startSubmission(dto, studentId)).resolves.toBe(newSubmission);
    });


    it('crea y guarda un nuevo intento cuando es el primero del estudiante', async () => {
      const activity = makeActivity({ attemptsAllowed: 3 });
      const newSubmission = makeSubmission();
      activitiesRepo.findOne.mockResolvedValue(activity);
      submissionsRepo.findActiveSubmission.mockResolvedValue(null);
      submissionsRepo.getAttemptCount.mockResolvedValue(0);
      submissionsRepo.create.mockReturnValue(newSubmission);
      submissionsRepo.save.mockResolvedValue(newSubmission);

      const result = await service.startSubmission(dto, studentId);

      expect(submissionsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: activity.id,
          studentId,
          attemptNumber: 1,
          status: SubmissionStatus.IN_PROGRESS,
        }),
      );
      expect(submissionsRepo.save).toHaveBeenCalled();
      expect(result).toBe(newSubmission);
    });
  });

  // ─── runPublicCases ("Probar código", FASE CC-09 Bloqueo 1) ──────────────

  describe('runPublicCases', () => {
    const submissionId = 'sub-uuid-1';
    const studentId = 42;
    const dto = { code: 'function sumarPares(a,b){return a+b;}' };

    function makeCodingQuestion(overrides: Partial<any> = {}) {
      return {
        id: 1,
        activityId: 1,
        type: QuestionType.CODING,
        config: {
          language: 'javascript',
          testCases: [
            { label: 'público', input: '5\n3', expected: '8', isPublic: true },
            { label: 'oculto', input: '10\n20', expected: '30', isPublic: false },
          ],
        },
        ...overrides,
      };
    }

    it('lanza NotFoundException cuando la submission no existe o no pertenece al estudiante', async () => {
      submissionsRepo.findOne.mockResolvedValue(null);

      await expect(service.runPublicCases(submissionId, dto, studentId))
        .rejects.toThrow(NotFoundException);
      expect(judgeExecutionService.runPublicCases).not.toHaveBeenCalled();
    });

    it('lanza BadRequestException cuando la actividad no tiene pregunta CODING', async () => {
      submissionsRepo.findOne.mockResolvedValue(makeSubmission());
      questionsRepo.findByActivityId.mockResolvedValue([]);

      await expect(service.runPublicCases(submissionId, dto, studentId))
        .rejects.toThrow(BadRequestException);
    });

    it('ejecuta solo contra los casos públicos, sin crear intento ni tocar attemptsCount/status', async () => {
      const submission = makeSubmission({ attemptNumber: 1, status: SubmissionStatus.IN_PROGRESS });
      submissionsRepo.findOne.mockResolvedValue(submission);
      questionsRepo.findByActivityId.mockResolvedValue([makeCodingQuestion()]);
      judgeExecutionService.runPublicCases.mockResolvedValue([
        { label: 'público', passed: true, actualOutput: '8', expectedOutput: '8' },
      ]);

      const result = await service.runPublicCases(submissionId, dto, studentId);

      // Solo el caso público llega al sandbox — el oculto se filtra en JudgeExecutionService,
      // pero verificamos aquí que el flujo completo no lo filtra tarde ni lo expone.
      expect(judgeExecutionService.runPublicCases).toHaveBeenCalledWith(
        dto.code,
        'javascript',
        expect.arrayContaining([
          expect.objectContaining({ isPublic: true }),
          expect.objectContaining({ isPublic: false }),
        ]),
      );
      expect(result.results).toEqual([
        { label: 'público', passed: true, actualOutput: '8', expectedOutput: '8' },
      ]);
      expect(result.results.some((r: any) => r.label === 'oculto')).toBe(false);

      // No side effects: ni save, ni create, ni evento, ni cambio de estado.
      expect(submissionsRepo.save).not.toHaveBeenCalled();
      expect(submissionsRepo.create).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
      expect(submission.attemptNumber).toBe(1);
      expect(submission.status).toBe(SubmissionStatus.IN_PROGRESS);
    });

    it('un estudiante no puede ejecutar sobre la submission de otro (ownership por where studentId)', async () => {
      submissionsRepo.findOne.mockResolvedValue(null); // findOne con {id, studentId} no matchea

      await expect(service.runPublicCases(submissionId, dto, 999))
        .rejects.toThrow(NotFoundException);
      expect(submissionsRepo.findOne).toHaveBeenCalledWith({
        where: { id: submissionId, studentId: 999 },
      });
    });
  });

  // ─── autosave ───────────────────────────────────────────────────────────

  describe('autosave', () => {
    const submissionId = 'sub-uuid-1';
    const studentId = 42;
    const dto: any = { answers: [{ questionId: 1, answer: { selectedId: 'a' } }] };

    it('lanza BadRequestException cuando la submission no existe', async () => {
      submissionsRepo.findOne.mockResolvedValue(null);

      await expect(service.autosave(submissionId, dto, studentId))
        .rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException cuando la submission ya fue finalizada (GRADED)', async () => {
      submissionsRepo.findOne.mockResolvedValue(
        makeSubmission({ status: SubmissionStatus.GRADED }),
      );

      await expect(service.autosave(submissionId, dto, studentId))
        .rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException cuando la submission está en SUBMITTED', async () => {
      submissionsRepo.findOne.mockResolvedValue(
        makeSubmission({ status: SubmissionStatus.SUBMITTED }),
      );

      await expect(service.autosave(submissionId, dto, studentId))
        .rejects.toThrow(BadRequestException);
    });

    it('actualiza autosaveData y lastSavedAt cuando la submission está IN_PROGRESS', async () => {
      const submission = makeSubmission({ status: SubmissionStatus.IN_PROGRESS });
      submissionsRepo.findOne.mockResolvedValue(submission);
      submissionsRepo.save.mockImplementation(async (s) => s);

      const result = await service.autosave(submissionId, dto, studentId);

      expect(result.autosaveData).toEqual(dto.answers);
      expect(result.lastSavedAt).toBeInstanceOf(Date);
    });

    it('acumula timeSpentSeconds cuando el DTO lo incluye', async () => {
      const submission = makeSubmission({
        status: SubmissionStatus.IN_PROGRESS,
        timeSpentSeconds: 120,
      });
      submissionsRepo.findOne.mockResolvedValue(submission);
      submissionsRepo.save.mockImplementation(async (s) => s);

      const dtoWithTime: any = { ...dto, timeSpentSeconds: 60 };
      const result = await service.autosave(submissionId, dtoWithTime, studentId);

      expect(result.timeSpentSeconds).toBe(180); // 120 + 60
    });
  });

  // ─── submitAnswers — normalización de passingScore como PORCENTAJE ───────
  // Regresión: antes se comparaba el score crudo contra un passingScore fijo
  // (60) sin importar cuánto valiera la actividad en total (10, 15, 20...),
  // así que una actividad de 20 puntos jamás podía "aprobarse" aunque el
  // estudiante la resolviera perfecta. Ver learning-progress.service.ts y
  // notifications/listeners/submission-graded.listener.ts para el mismo fix.

  describe('submitAnswers', () => {
    const submissionId = 'sub-uuid-1';
    const studentId = 42;

    function makeQuestion(overrides: Partial<any> = {}) {
      return {
        id: 1,
        activityId: 1,
        type: QuestionType.MCQ,
        points: 20,
        config: { options: [], correctAnswerId: 'a' },
        ...overrides,
      };
    }

    it('marca passed=true cuando el score normalizado alcanza el passingScore (actividad de bajo puntaje total)', async () => {
      const activity = makeActivity({ totalPoints: 20, passingScore: 60 });
      const submission = makeSubmission({ status: SubmissionStatus.IN_PROGRESS, activity });
      submissionsRepo.findOne.mockResolvedValue(submission);
      questionsRepo.findByActivityId.mockResolvedValue([makeQuestion()]);
      evalEngine.evaluateAnswer.mockReturnValue({
        isCorrect: true,
        score: 20, // 20/20 = 100% >= 60%
        needsAsyncJudge: false,
        feedback: '¡Correcto!',
      });
      submissionsRepo.save.mockResolvedValue(submission);

      const dto: any = { answers: [{ questionId: 1, answer: { selectedId: 'a' } }] };
      const result = await service.submitAnswers(submissionId, dto, studentId);

      expect(result.totalScore).toBe(20);
      expect(result.maxScore).toBe(20);
      expect(result.passed).toBe(true);
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        'submission.graded',
        expect.objectContaining({ score: 20, passingScore: 60, totalPoints: 20 }),
      );
    });

    it('marca passed=false cuando el score normalizado no alcanza el passingScore', async () => {
      const activity = makeActivity({ totalPoints: 20, passingScore: 60 });
      const submission = makeSubmission({ status: SubmissionStatus.IN_PROGRESS, activity });
      submissionsRepo.findOne.mockResolvedValue(submission);
      questionsRepo.findByActivityId.mockResolvedValue([makeQuestion()]);
      evalEngine.evaluateAnswer.mockReturnValue({
        isCorrect: false,
        score: 5, // 5/20 = 25% < 60%
        needsAsyncJudge: false,
        feedback: 'Respuesta incorrecta.',
      });
      submissionsRepo.save.mockResolvedValue(submission);

      const dto: any = { answers: [{ questionId: 1, answer: { selectedId: 'b' } }] };
      const result = await service.submitAnswers(submissionId, dto, studentId);

      expect(result.totalScore).toBe(5);
      expect(result.maxScore).toBe(20);
      expect(result.passed).toBe(false);
    });

    it('deja passed=null cuando queda evaluación asíncrona pendiente (CODING)', async () => {
      const activity = makeActivity({ totalPoints: 25, passingScore: 60 });
      const submission = makeSubmission({ status: SubmissionStatus.IN_PROGRESS, activity });
      submissionsRepo.findOne.mockResolvedValue(submission);
      questionsRepo.findByActivityId.mockResolvedValue([
        makeQuestion({ type: QuestionType.CODING, config: { language: 'javascript', testCases: [] } }),
      ]);
      evalEngine.evaluateAnswer.mockReturnValue({
        isCorrect: null,
        score: 0,
        needsAsyncJudge: true,
        feedback: null,
      });
      submissionsRepo.save.mockResolvedValue(submission);

      const dto: any = { answers: [{ questionId: 1, answer: { code: 'x' } }] };
      const result = await service.submitAnswers(submissionId, dto, studentId);

      expect(result.status).toBe(SubmissionStatus.SUBMITTED);
      expect(result.passed).toBeNull();
      // Sin evaluación síncrona completa, el evento no se emite todavía.
      expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
    });
  });

  // ─── getSubmissionStatus ──────────────────────────────────────────────────

  describe('getSubmissionStatus', () => {
    const submissionId = 'sub-uuid-1';
    const studentId = 42;

    it('incluye maxScore y passed normalizado cuando status=GRADED', async () => {
      const activity = makeActivity({ totalPoints: 20, passingScore: 60 });
      const submission = makeSubmission({
        status: SubmissionStatus.GRADED,
        score: 20,
        activity,
        answers: [{ isCorrect: true }],
      });
      submissionsRepo.findOne.mockResolvedValue(submission);

      const result = await service.getSubmissionStatus(submissionId, studentId);

      expect(result.maxScore).toBe(20);
      expect(result.passed).toBe(true);
      expect(result.totalScore).toBe(20);
    });

    it('deja passed=null mientras status no sea GRADED', async () => {
      const activity = makeActivity({ totalPoints: 20, passingScore: 60 });
      const submission = makeSubmission({
        status: SubmissionStatus.SUBMITTED,
        score: 0,
        activity,
        answers: [],
      });
      submissionsRepo.findOne.mockResolvedValue(submission);

      const result = await service.getSubmissionStatus(submissionId, studentId);

      expect(result.passed).toBeNull();
    });
  });
});
