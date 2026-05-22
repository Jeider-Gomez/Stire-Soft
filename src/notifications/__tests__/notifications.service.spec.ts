import { NotificationsService } from '../notifications.service';
import { SubmissionGradedListener } from '../listeners/submission-graded.listener';
import { LearningStatusChangedListener } from '../listeners/learning-status-changed.listener';
import { SubmissionGradedEvent } from '../../common/events/submission-graded.event';
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
      });
      expect(notificationsRepo.save).toHaveBeenCalled();
      expect(result.id).toBe(100);
      expect(result.type).toBe(NotificationType.INFO);
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
      });
      expect(result.type).toBe(NotificationType.GRADE);
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

  describe('SubmissionGradedListener', () => {
    let listener: SubmissionGradedListener;
    let createNotificationSpy: jest.SpyInstance;

    beforeEach(() => {
      createNotificationSpy = jest.spyOn(service, 'createNotification').mockImplementation(async () => ({} as any));
      listener = new SubmissionGradedListener(service);
    });

    it('should create an approved activity notification when student passes', async () => {
      const event = new SubmissionGradedEvent('sub-1', 42, 5, 10, 8.5, 6.0);

      await listener.handleSubmissionGradedEvent(event);

      expect(createNotificationSpy).toHaveBeenCalledWith(
        42,
        '¡Actividad Aprobada!',
        expect.stringContaining('Felicidades'),
        NotificationType.GRADE,
      );
    });

    it('should create a graded notification urging review when student does not pass', async () => {
      const event = new SubmissionGradedEvent('sub-2', 42, 5, 10, 4.0, 6.0);

      await listener.handleSubmissionGradedEvent(event);

      expect(createNotificationSpy).toHaveBeenCalledWith(
        42,
        'Actividad Calificada',
        expect.stringContaining('Te invitamos a revisar'),
        NotificationType.GRADE,
      );
    });
  });

  describe('LearningStatusChangedListener', () => {
    let listener: LearningStatusChangedListener;
    let createNotificationSpy: jest.SpyInstance;

    beforeEach(() => {
      createNotificationSpy = jest.spyOn(service, 'createNotification').mockImplementation(async () => ({} as any));
      listener = new LearningStatusChangedListener(service);
    });

    it('should create a special DOMINADO notification when status transitions to DOMINADO', async () => {
      const event = new LearningStatusChangedEvent(
        42,
        10,
        LearningStatus.COMPRENSION_PARCIAL,
        LearningStatus.DOMINADO,
        90.0,
      );

      await listener.handleLearningStatusChangedEvent(event);

      expect(createNotificationSpy).toHaveBeenCalledWith(
        42,
        '¡Felicidades, Unidad Dominada! 🏆',
        expect.stringContaining('dominado por completo'),
        NotificationType.INFO,
      );
    });

    it('should create a standard progress notification when status transitions to COMPRENSION_PARCIAL', async () => {
      const event = new LearningStatusChangedEvent(
        42,
        10,
        LearningStatus.EN_PRACTICA,
        LearningStatus.COMPRENSION_PARCIAL,
        75.0,
      );

      await listener.handleLearningStatusChangedEvent(event);

      expect(createNotificationSpy).toHaveBeenCalledWith(
        42,
        '¡Gran Avance! 🌟',
        expect.stringContaining('comprensión parcial'),
        NotificationType.INFO,
      );
    });
  });
});
