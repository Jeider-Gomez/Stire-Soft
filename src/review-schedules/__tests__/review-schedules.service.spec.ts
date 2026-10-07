import { ReviewSchedulesService } from '../review-schedules.service';
import { ReviewSchedule } from '../entities/review-schedule.entity';
import { NotificationType } from '../../common/enums/notification-type.enum';
import { LessThanOrEqual, LessThan } from 'typeorm';

function makeReviewSchedule(overrides: Partial<any> = {}): any {
  return {
    id: 1,
    studentId: 42,
    learningUnitId: 10,
    nextReviewDate: new Date(Date.now() - 3600000), // 1 hour ago (overdue)
    urgencyLevel: 0,
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
    lastReviewedAt: null,
    learningUnit: { id: 10, title: 'Unidad de Introducción' },
    ...overrides,
  };
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

describe('ReviewSchedulesService Unit Tests', () => {
  let reviewRepo: any;
  let notificationsService: any;
  let service: ReviewSchedulesService;

  beforeEach(() => {
    reviewRepo = {
      findOne: jest.fn(),
      create: jest.fn((datos) => ({ ...datos })),
      save: jest.fn(async (s) => s),
      find: jest.fn(),
      count: jest.fn(),
      findDueForStudent: jest.fn(),
    };
    notificationsService = {
      createNotification: jest.fn(async () => ({})),
    };
    service = new ReviewSchedulesService(reviewRepo, notificationsService);
  });

  describe('registrarResultado', () => {
    const AHORA = new Date(2026, 8, 27, 10, 0);

    it('el primer intento de la unidad crea el calendario y no cuenta como repaso', async () => {
      reviewRepo.findOne.mockResolvedValue(null);

      const r = await service.registrarResultado(42, 10, 4, AHORA);

      expect(r.esRepaso).toBe(false);
      expect(reviewRepo.create).toHaveBeenCalledWith(expect.objectContaining({ studentId: 42, learningUnitId: 10 }));
      const guardado = reviewRepo.save.mock.calls[0][0];
      expect(guardado).toEqual(expect.objectContaining({ repetitions: 1, intervalDays: 1 }));
    });

    it('practicar antes de la fecha no mueve el calendario (antes cada ejercicio del día contaba como repaso)', async () => {
      const schedule = makeReviewSchedule({ repetitions: 2, intervalDays: 3, nextReviewDate: new Date(2026, 8, 29) });
      reviewRepo.findOne.mockResolvedValue(schedule);

      const r = await service.registrarResultado(42, 10, 5, AHORA);

      expect(r.esRepaso).toBe(false);
      expect(reviewRepo.save).not.toHaveBeenCalled();
      expect(schedule.repetitions).toBe(2);
    });

    it('un repaso vencido acertado avanza el intervalo', async () => {
      const schedule = makeReviewSchedule({ repetitions: 1, intervalDays: 1, nextReviewDate: new Date(2026, 8, 26) });
      reviewRepo.findOne.mockResolvedValue(schedule);

      const r = await service.registrarResultado(42, 10, 4, AHORA);

      expect(r.esRepaso).toBe(true);
      expect(schedule).toEqual(expect.objectContaining({ repetitions: 2, intervalDays: 3, urgencyLevel: 0 }));
      expect(schedule.lastReviewedAt).toEqual(AHORA);
    });

    it('un repaso vencido fallado reinicia el intervalo aunque viniera de muchos aciertos', async () => {
      const schedule = makeReviewSchedule({ repetitions: 5, intervalDays: 30, nextReviewDate: new Date(2026, 8, 26) });
      reviewRepo.findOne.mockResolvedValue(schedule);

      await service.registrarResultado(42, 10, 1, AHORA);

      expect(schedule).toEqual(expect.objectContaining({ repetitions: 0, intervalDays: 1 }));
    });

    it('persiste el factor de facilidad calculado', async () => {
      const schedule = makeReviewSchedule({ repetitions: 3, intervalDays: 8, easeFactor: 2.5, nextReviewDate: new Date(2026, 8, 26) });
      reviewRepo.findOne.mockResolvedValue(schedule);

      await service.registrarResultado(42, 10, 3, AHORA);

      expect(schedule.easeFactor).toBeLessThan(2.5);
      expect(schedule.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('estaVencido', () => {
    it('es verdadero solo si hay calendario y su fecha ya pasó', async () => {
      const ahora = new Date(2026, 8, 27);
      reviewRepo.findOne.mockResolvedValueOnce(null);
      expect(await service.estaVencido(42, 10, ahora)).toBe(false);
      reviewRepo.findOne.mockResolvedValueOnce(makeReviewSchedule({ nextReviewDate: new Date(2026, 8, 28) }));
      expect(await service.estaVencido(42, 10, ahora)).toBe(false);
      reviewRepo.findOne.mockResolvedValueOnce(makeReviewSchedule({ nextReviewDate: new Date(2026, 8, 26) }));
      expect(await service.estaVencido(42, 10, ahora)).toBe(true);
    });
  });

  describe('getDueReviews', () => {
    it('un estudiante no puede consultar los repasos de otro — solo pasa su propio studentId al repo', async () => {
      reviewRepo.findDueForStudent.mockResolvedValue([]);

      await service.getDueReviews(42);

      expect(reviewRepo.findDueForStudent).toHaveBeenCalledWith(42);
      expect(reviewRepo.findDueForStudent).toHaveBeenCalledTimes(1);
    });

    it('clasifica la urgencia a partir de nextReviewDate: hoy=vencido, mañana=manana, +4 días=al-dia, ayer=critico', async () => {
      reviewRepo.findDueForStudent.mockResolvedValue([
        makeReviewSchedule({ id: 1, nextReviewDate: daysFromNow(0) }),
        makeReviewSchedule({ id: 2, nextReviewDate: daysFromNow(1) }),
        makeReviewSchedule({ id: 3, nextReviewDate: daysFromNow(4) }),
        makeReviewSchedule({ id: 4, nextReviewDate: daysFromNow(-1) }),
      ]);

      const result = await service.getDueReviews(42);

      expect(result.find((r: any) => r.id === 1).urgency).toBe('vencido');
      expect(result.find((r: any) => r.id === 2).urgency).toBe('manana');
      expect(result.find((r: any) => r.id === 3).urgency).toBe('al-dia');
      expect(result.find((r: any) => r.id === 4).urgency).toBe('critico');
    });

    it('los días son los de Colombia: a las 10:18 p. m. del 30/09, un repaso del 1/10 es «mañana», no «para hoy»', async () => {
      // 10:18 p. m. en Colombia = 03:18 del 1/10 en UTC, la hora del servidor.
      const ahora = new Date('2026-10-01T03:18:00Z');
      reviewRepo.findDueForStudent.mockResolvedValue([
        makeReviewSchedule({ id: 1, nextReviewDate: new Date('2026-10-01T14:00:00Z') }),
        makeReviewSchedule({ id: 2, nextReviewDate: new Date('2026-09-30T20:00:00Z') }),
        makeReviewSchedule({ id: 3, nextReviewDate: new Date('2026-09-29T20:00:00Z') }),
      ]);

      const result = await service.getDueReviews(42, ahora);

      expect(result.map((r: any) => r.urgency)).toEqual(['manana', 'vencido', 'critico']);
    });

    it('incluye easeFactor persistido en cada repaso devuelto', async () => {
      reviewRepo.findDueForStudent.mockResolvedValue([
        makeReviewSchedule({ id: 1, easeFactor: 1.9, nextReviewDate: daysFromNow(0) }),
      ]);

      const result = await service.getDueReviews(42);

      expect(result[0].easeFactor).toBe(1.9);
    });
  });

  describe('checkOverdueReviews (Cron Job)', () => {
    it('should do nothing if no overdue schedules are found', async () => {
      reviewRepo.find.mockResolvedValue([]);

      await service.checkOverdueReviews();

      expect(reviewRepo.find).toHaveBeenCalledWith({
        where: {
          nextReviewDate: expect.any(Object), // LessThanOrEqual object
          urgencyLevel: expect.any(Object), // LessThan object
        },
        relations: ['learningUnit'],
      });
      expect(reviewRepo.save).not.toHaveBeenCalled();
      expect(notificationsService.createNotification).not.toHaveBeenCalled();
    });

    it('marca los vencidos como urgentes y manda UN solo aviso al día por estudiante, con cuántos tiene (07/10)', async () => {
      // Antes: un aviso por cada lección vencida. Ahora: uno por estudiante, que lleva a «Repasos» y no se repite ese día.
      const overdue1 = makeReviewSchedule({ id: 100, studentId: 42, learningUnitId: 10 });
      const overdue1b = makeReviewSchedule({ id: 102, studentId: 42, learningUnitId: 12 });
      const overdue2 = makeReviewSchedule({ id: 101, studentId: 88, learningUnitId: 11, learningUnit: { id: 11, title: 'Unidad de Recursión' } });
      reviewRepo.find.mockResolvedValue([overdue1, overdue1b, overdue2]);
      reviewRepo.count.mockImplementation(async ({ where }: { where: { studentId: number } }) => (where.studentId === 42 ? 3 : 1));

      await service.checkOverdueReviews();

      expect([overdue1, overdue1b, overdue2].map((o) => o.urgencyLevel)).toEqual([3, 3, 3]);
      expect(notificationsService.createNotification).toHaveBeenCalledTimes(2);
      const hoy = new Date().toISOString().slice(0, 10);
      expect(notificationsService.createNotification).toHaveBeenCalledWith(
        42, 'Tienes 3 repasos pendientes hoy', expect.any(String), NotificationType.REVIEW_SCHEDULE,
        { enlace: '/estudiante/repasos', clave: `repasos:${hoy}` },
      );
      expect(notificationsService.createNotification).toHaveBeenCalledWith(
        88, 'Tienes 1 repaso pendiente hoy', expect.any(String), NotificationType.REVIEW_SCHEDULE,
        { enlace: '/estudiante/repasos', clave: `repasos:${hoy}` },
      );
    });
  });
});
