import { LearningProgressService } from './learning-progress.service';
import { SubmissionStatus } from '../common/enums/submission-status.enum';

describe('LearningProgressService.countFailedAttempts', () => {
  const activity = { id: 20, totalPoints: 100, passingScore: 70 };
  let submissionsRepo: any;
  let activitiesRepo: any;
  let service: LearningProgressService;

  beforeEach(() => {
    submissionsRepo = { find: jest.fn().mockResolvedValue([]) };
    activitiesRepo = { findOne: jest.fn().mockResolvedValue(activity) };
    service = new LearningProgressService({} as any, submissionsRepo, activitiesRepo, {} as any);
  });

  it('cuenta solo los intentos ya calificados que no alcanzaron el puntaje de aprobación', async () => {
    submissionsRepo.find.mockResolvedValue([
      { status: SubmissionStatus.GRADED, score: 40 },
      { status: SubmissionStatus.GRADED, score: 69 },
      { status: SubmissionStatus.GRADED, score: 70 },
      { status: SubmissionStatus.SUBMITTED, score: 10 },
      { status: SubmissionStatus.IN_PROGRESS, score: 0 },
    ]);

    await expect(service.countFailedAttempts(5, 20)).resolves.toBe(3);
    expect(submissionsRepo.find).toHaveBeenCalledWith({ where: { studentId: 5, activityId: 20 } });
  });

  it('solo mira los envíos del propio estudiante y devuelve 0 si la actividad no existe', async () => {
    activitiesRepo.findOne.mockResolvedValue(null);

    await expect(service.countFailedAttempts(5, 999)).resolves.toBe(0);
    expect(submissionsRepo.find).not.toHaveBeenCalled();
  });
});
