import { TutorRecommendationService } from './tutor-recommendation.service';

describe('TutorRecommendationService', () => {
  let service: TutorRecommendationService;
  let learningProgressService: { getNextActivity: jest.Mock };
  let progressRepo: { findOne: jest.Mock; find: jest.Mock };
  let reviewSchedulesService: { getDueReviews: jest.Mock };

  beforeEach(() => {
    learningProgressService = { getNextActivity: jest.fn() };
    progressRepo = { findOne: jest.fn(), find: jest.fn() };
    reviewSchedulesService = { getDueReviews: jest.fn() };

    service = new TutorRecommendationService(
      learningProgressService as any,
      progressRepo as any,
      reviewSchedulesService as any,
    );
  });

  describe('suggestForUnit', () => {
    it('returns null when the unit has no pending activity', async () => {
      learningProgressService.getNextActivity.mockResolvedValue({ allCompleted: true });

      const result = await service.suggestForUnit(1, 7, 'contexto_actual', 'razón');

      expect(result).toBeNull();
    });

    it('returns the suggestion with the real unit title', async () => {
      learningProgressService.getNextActivity.mockResolvedValue({
        activityId: 42, title: 'Ejercicio de bucles', allCompleted: false,
      });
      progressRepo.findOne.mockResolvedValue({ learningUnit: { title: 'Bucles for/while' } });

      const result = await service.suggestForUnit(1, 7, 'contexto_actual', 'razón real');

      expect(result).toEqual({
        activityId: 42,
        activityTitle: 'Ejercicio de bucles',
        learningUnitId: 7,
        learningUnitTitle: 'Bucles for/while',
        reason: 'contexto_actual',
        reasonMessage: 'razón real',
      });
    });
  });

  describe('summarizeDueReviews', () => {
    const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);

    it('cuenta como vencidos el de hoy y los atrasados, y nombra el más antiguo', async () => {
      reviewSchedulesService.getDueReviews.mockResolvedValue([
        { learningUnitId: 3, learningUnitTitle: 'Funciones', urgency: 'manana', nextReviewDate: new Date(Date.now() + 86400000) },
        { learningUnitId: 5, learningUnitTitle: 'Arreglos', urgency: 'vencido', nextReviewDate: new Date() },
        { learningUnitId: 7, learningUnitTitle: 'Bucles', urgency: 'critico', nextReviewDate: daysAgo(4) },
        { learningUnitId: 9, learningUnitTitle: 'Variables', urgency: 'al-dia', nextReviewDate: new Date(Date.now() + 5 * 86400000) },
      ]);

      const summary = await service.summarizeDueReviews(1);

      expect(summary.overdueCount).toBe(2);
      expect(summary.scheduledCount).toBe(4);
      expect(summary.oldest).toEqual({ learningUnitId: 7, learningUnitTitle: 'Bucles', daysOverdue: 4 });
    });

    it('un repaso que toca hoy tiene 0 días de atraso (no 1)', async () => {
      reviewSchedulesService.getDueReviews.mockResolvedValue([
        { learningUnitId: 5, learningUnitTitle: 'Arreglos', urgency: 'vencido', nextReviewDate: new Date() },
      ]);

      expect((await service.summarizeDueReviews(1)).oldest?.daysOverdue).toBe(0);
    });

    it('sin repasos vencidos no hay "más antiguo" y el conteo es 0', async () => {
      reviewSchedulesService.getDueReviews.mockResolvedValue([
        { learningUnitId: 3, learningUnitTitle: 'Funciones', urgency: 'manana', nextReviewDate: new Date(Date.now() + 86400000) },
      ]);

      expect(await service.summarizeDueReviews(1)).toEqual({ overdueCount: 0, scheduledCount: 1, oldest: null });
    });

    it('sin ningún repaso programado devuelve ceros', async () => {
      reviewSchedulesService.getDueReviews.mockResolvedValue([]);

      expect(await service.summarizeDueReviews(1)).toEqual({ overdueCount: 0, scheduledCount: 0, oldest: null });
    });

    it('el título puede ser null (unidad sin título cargado) y no rompe el resumen', async () => {
      reviewSchedulesService.getDueReviews.mockResolvedValue([
        { learningUnitId: 7, learningUnitTitle: null, urgency: 'critico', nextReviewDate: daysAgo(1) },
      ]);

      expect((await service.summarizeDueReviews(1)).oldest).toEqual({ learningUnitId: 7, learningUnitTitle: null, daysOverdue: 1 });
    });
  });

  describe('suggestAmbient', () => {
    it('prioritizes the oldest overdue review over a weak unit', async () => {
      reviewSchedulesService.getDueReviews.mockResolvedValue([
        { learningUnitId: 3, learningUnitTitle: 'Funciones', urgency: 'manana', nextReviewDate: new Date() },
        {
          learningUnitId: 7,
          learningUnitTitle: 'Bucles',
          urgency: 'critico',
          nextReviewDate: new Date(Date.now() - 5 * 86400000),
        },
      ]);
      learningProgressService.getNextActivity.mockResolvedValue({ activityId: 11, title: 'Repaso de bucles', allCompleted: false });
      progressRepo.findOne.mockResolvedValue({ learningUnit: { title: 'Bucles' } });

      const result = await service.suggestAmbient(1);

      expect(result?.reason).toBe('repaso_vencido');
      expect(result?.reasonMessage).toContain('5 días');
      expect(learningProgressService.getNextActivity).toHaveBeenCalledWith(1, 7);
    });

    it('falls back to the weakest unit when no review is overdue', async () => {
      reviewSchedulesService.getDueReviews.mockResolvedValue([
        { learningUnitId: 3, learningUnitTitle: 'Funciones', urgency: 'manana', nextReviewDate: new Date() },
      ]);
      progressRepo.find.mockResolvedValue([
        { learningUnitId: 1, mastery: 90, learningUnit: { title: 'Variables' } },
        { learningUnitId: 2, mastery: 35, learningUnit: { title: 'Condicionales' } },
      ]);
      learningProgressService.getNextActivity.mockResolvedValue({ activityId: 8, title: 'Ejercicio', allCompleted: false });
      progressRepo.findOne.mockResolvedValue({ learningUnit: { title: 'Condicionales' } });

      const result = await service.suggestAmbient(1);

      expect(result?.reason).toBe('mastery_bajo');
      expect(learningProgressService.getNextActivity).toHaveBeenCalledWith(1, 2);
    });

    it('returns null when there are no overdue reviews and every unit is at or above threshold', async () => {
      reviewSchedulesService.getDueReviews.mockResolvedValue([]);
      progressRepo.find.mockResolvedValue([{ learningUnitId: 1, mastery: 95, learningUnit: { title: 'Variables' } }]);

      const result = await service.suggestAmbient(1);

      expect(result).toBeNull();
    });

    it('returns null when the student has no progress records at all', async () => {
      reviewSchedulesService.getDueReviews.mockResolvedValue([]);
      progressRepo.find.mockResolvedValue([]);

      const result = await service.suggestAmbient(1);

      expect(result).toBeNull();
    });
  });
});
