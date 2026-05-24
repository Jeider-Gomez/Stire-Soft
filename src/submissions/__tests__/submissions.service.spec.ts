import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubmissionsService } from '../submissions.service';
import { SubmissionStatus } from '../../common/enums/submission-status.enum';

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
    };

    judgeQueue = {
      add: jest.fn().mockResolvedValue(undefined),
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
});
