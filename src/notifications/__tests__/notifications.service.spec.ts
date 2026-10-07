import { NotificationsService } from '../notifications.service';
import { RevisionDocenteListener } from '../listeners/revision-docente.listener';
import { EnvioRevisadoEvent, NotaRegistradaEvent } from '../../common/events/revision-docente.event';
import { avisoDeHito, avisoDeRepasos, hitoCruzado, resumenRevision } from '../notificacion-reglas';
import { LearningStatusChangedListener } from '../listeners/learning-status-changed.listener';
import { LearningStatusChangedEvent } from '../../common/events/learning-status-changed.event';
import { LearningStatus } from '../../common/enums/learning-status.enum';
import { NotificationType } from '../../common/enums/notification-type.enum';
import { NotFoundException } from '@nestjs/common';

function makeNotification(overrides: Partial<any> = {}): any {
  return {
    id: 1,
    userId: 42,
    title: 'Test Notification',
    message: 'Test message content',
    isRead: false,
    type: NotificationType.INFO,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('Notifications Module Unit Tests', () => {
  let notificationsRepo: any;
  let service: NotificationsService;

  beforeEach(() => {
    notificationsRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn(async (n) => ({ id: 100, ...n, createdAt: new Date(), updatedAt: new Date() })),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    service = new NotificationsService(notificationsRepo);
  });

  describe('NotificationsService', () => {
    it('should create a notification with default type INFO', async () => {
      const result = await service.createNotification(42, 'Hello Title', 'Hello Message');

      expect(notificationsRepo.create).toHaveBeenCalledWith({
        userId: 42,
        title: 'Hello Title',
        message: 'Hello Message',
        type: NotificationType.INFO,
        enlace: null,
        clave: null,
      });
      expect(notificationsRepo.save).toHaveBeenCalled();
      expect(result?.id).toBe(100);
      expect(result?.type).toBe(NotificationType.INFO);
    });

    it('should create a notification with specific type GRADE', async () => {
      const result = await service.createNotification(
        42,
        'Grade Received',
        'Your activity has been graded',
        NotificationType.GRADE,
      );

      expect(notificationsRepo.create).toHaveBeenCalledWith({
        userId: 42,
        title: 'Grade Received',
        message: 'Your activity has been graded',
        type: NotificationType.GRADE,
        enlace: null,
        clave: null,
      });
      expect(result?.type).toBe(NotificationType.GRADE);
    });

    it('should find unread notifications for a user', async () => {
      const mockList = [
        makeNotification({ userId: 42, isRead: false }),
        makeNotification({ id: 2, userId: 42, isRead: false }),
      ];
      notificationsRepo.find.mockResolvedValue(mockList);

      const result = await service.findForUser(42, true);

      expect(notificationsRepo.find).toHaveBeenCalledWith({
        where: { userId: 42, isRead: false },
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe(42);
    });

    it('should find all notifications for a user (including read)', async () => {
      const mockList = [
        makeNotification({ userId: 42, isRead: false }),
        makeNotification({ id: 2, userId: 42, isRead: true }),
      ];
      notificationsRepo.find.mockResolvedValue(mockList);

      const result = await service.findForUser(42, false);

      expect(notificationsRepo.find).toHaveBeenCalledWith({
        where: { userId: 42 },
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(2);
    });

    it('should mark notification as read successfully', async () => {
      const existing = makeNotification({ id: 10, userId: 42, isRead: false });
      notificationsRepo.findOne.mockResolvedValue(existing);

      const result = await service.markAsRead(10, 42);

      expect(notificationsRepo.findOne).toHaveBeenCalledWith({
        where: { id: 10, userId: 42 },
      });
      expect(existing.isRead).toBe(true);
      expect(notificationsRepo.save).toHaveBeenCalledWith(existing);
      expect(result.isRead).toBe(true);
    });

    it('should throw NotFoundException if notification is not found or belongs to another user', async () => {
      notificationsRepo.findOne.mockResolvedValue(null);

      await expect(service.markAsRead(999, 42)).rejects.toThrow(NotFoundException);
      expect(notificationsRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('notificaciones con clave y enlace (07/10)', () => {
    it('con una clave que ya existe para ese usuario no crea otra', async () => {
      notificationsRepo.findOne.mockResolvedValue(makeNotification({ clave: 'modulo:3:50' }));
      const r = await service.createNotification(42, 'Hito', 'x', NotificationType.INFO, { clave: 'modulo:3:50' });
      expect(r).toBeNull();
      expect(notificationsRepo.save).not.toHaveBeenCalled();
    });

    it('guarda el enlace y la clave', async () => {
      notificationsRepo.findOne.mockResolvedValue(null);
      await service.createNotification(42, 'Hito', 'x', NotificationType.INFO, { enlace: '/estudiante/progreso', clave: 'modulo:3:50' });
      expect(notificationsRepo.create).toHaveBeenCalledWith(expect.objectContaining({ enlace: '/estudiante/progreso', clave: 'modulo:3:50' }));
    });

    it('si dos eventos a la vez chocan con el índice único, no falla: queda una sola', async () => {
      notificationsRepo.findOne.mockResolvedValue(null);
      notificationsRepo.save.mockRejectedValue(Object.assign(new Error('dup'), { code: 'ER_DUP_ENTRY' }));
      await expect(service.createNotification(42, 'Hito', 'x', NotificationType.INFO, { clave: 'k' })).resolves.toBeNull();
    });

    it('marca todas como leídas', async () => {
      notificationsRepo.update = jest.fn().mockResolvedValue({ affected: 4 });
      await expect(service.markAllAsRead(42)).resolves.toEqual({ marcadas: 4 });
      expect(notificationsRepo.update).toHaveBeenCalledWith({ userId: 42, isRead: false }, { isRead: true });
    });
  });

  describe('reglas: qué se avisa (notificacion-reglas.ts)', () => {
    it('avisa al cruzar el 50, el 75 y el 100 % de lecciones dominadas del módulo, y nada en medio', () => {
      // Módulo de 8 lecciones: 4 → 50 %, 6 → 75 %, 8 → 100 %; las demás no avisan.
      expect([1, 2, 3, 4, 5, 6, 7, 8].map((n) => hitoCruzado(n - 1, n, 8))).toEqual([null, null, null, 50, null, 75, null, 100]);
    });

    it('un módulo de una lección cruza los tres a la vez: un solo aviso, el del 100 %', () => {
      expect(hitoCruzado(0, 1, 1)).toBe(100);
      expect(hitoCruzado(0, 0, 4)).toBeNull();
      expect(hitoCruzado(2, 3, 0)).toBeNull();
    });

    it('los textos dicen el avance en lecciones y la revisión en una línea', () => {
      expect(avisoDeHito(75, 'Variables', 6, 8)).toEqual({ titulo: 'Llevas el 75 % del módulo «Variables»', mensaje: 'Dominaste 6 de 8 lecciones. Ya casi lo terminas.' });
      expect(avisoDeHito(100, 'Variables', 8, 8).titulo).toBe('¡Dominaste el módulo «Variables»!');
      expect(avisoDeRepasos(1).titulo).toBe('Tienes 1 repaso pendiente hoy');
      expect(resumenRevision(4.5, null, 'Buen trabajo')).toBe('Nota: 4,5 · «Buen trabajo»');
      expect(resumenRevision(null, 'aprobado', null)).toBe('Valoración: aprobado');
    });
  });

  describe('LearningStatusChangedListener: avance por módulo', () => {
    const evento = (oldStatus: LearningStatus, newStatus: LearningStatus) => new LearningStatusChangedEvent(42, 7, oldStatus, newStatus, 90);
    let dataSource: { query: jest.Mock };
    let notifier: { createNotification: jest.Mock };
    let listener: LearningStatusChangedListener;
    beforeEach(() => {
      dataSource = { query: jest.fn() };
      notifier = { createNotification: jest.fn() };
      listener = new LearningStatusChangedListener(dataSource as never, notifier as never);
    });

    it('al dominar la lección que completa la mitad del módulo, avisa una vez con su clave y su enlace', async () => {
      dataSource.query.mockResolvedValueOnce([{ id: 3, title: 'Variables' }]).mockResolvedValueOnce([{ total: '8', dominadas: '4' }]);
      await listener.handleLearningStatusChangedEvent(evento(LearningStatus.COMPRENSION_PARCIAL, LearningStatus.DOMINADO));
      expect(notifier.createNotification).toHaveBeenCalledWith(42, 'Llevas el 50 % del módulo «Variables»', 'Dominaste 4 de 8 lecciones. Vas por la mitad: sigue así.',
        NotificationType.INFO, { enlace: '/estudiante/progreso', clave: 'modulo:3:50' });
    });

    it('sin cruzar un hito, o en cualquier otro cambio de estado, no avisa (antes avisaba cada cambio)', async () => {
      dataSource.query.mockResolvedValueOnce([{ id: 3, title: 'Variables' }]).mockResolvedValueOnce([{ total: '8', dominadas: '5' }]);
      await listener.handleLearningStatusChangedEvent(evento(LearningStatus.EN_PRACTICA, LearningStatus.DOMINADO));
      await listener.handleLearningStatusChangedEvent(evento(LearningStatus.EXPLORADO, LearningStatus.EN_PRACTICA));
      await listener.handleLearningStatusChangedEvent(evento(LearningStatus.EN_PRACTICA, LearningStatus.COMPRENSION_PARCIAL));
      expect(notifier.createNotification).not.toHaveBeenCalled();
    });
  });

  describe('RevisionDocenteListener: lo que hace el docente sí se avisa', () => {
    it('la revisión de una entrega llega con la nota y el comentario, y lleva a la entrega', async () => {
      const notifier = { createNotification: jest.fn() };
      const l = new RevisionDocenteListener({ query: jest.fn() } as never, notifier as never);
      await l.envioRevisado(new EnvioRevisadoEvent(42, 9, 'Proyecto final', 4.5, null, 'Muy bien'));
      expect(notifier.createNotification).toHaveBeenCalledWith(42, 'Tu docente revisó «Proyecto final»', 'Nota: 4,5 · «Muy bien»', NotificationType.GRADE, { enlace: '/estudiante/entregas/9' });
    });

    it('una nota del libro llega con el nombre de la clase y lleva a «Mi progreso»', async () => {
      const notifier = { createNotification: jest.fn() };
      const l = new RevisionDocenteListener({ query: jest.fn().mockResolvedValue([{ name: 'Algoritmia G1' }]) } as never, notifier as never);
      await l.notaRegistrada(new NotaRegistradaEvent(5, 42, 'Parcial 1', 3.8));
      expect(notifier.createNotification).toHaveBeenCalledWith(42, 'Nueva nota en Algoritmia G1', 'Parcial 1: 3,8. Mira el detalle en «Mi progreso».', NotificationType.GRADE, { enlace: '/estudiante/progreso' });
    });
  });
});
