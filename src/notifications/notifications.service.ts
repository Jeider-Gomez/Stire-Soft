import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { Notification } from './entities/notification.entity';
import { NotificationType } from '../common/enums/notification-type.enum';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  /**
   * Crea una nueva notificación para un estudiante.
   */
  async createNotification(
    userId: number,
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      userId,
      title,
      message,
      type,
    });
    return this.notificationsRepository.save(notification);
  }

  /**
   * Obtiene todas las notificaciones de un usuario (ordenadas por fecha descendente).
   * Opcionalmente filtra por estado no leído.
   */
  async findForUser(userId: number, onlyUnread = false): Promise<Notification[]> {
    const where: any = { userId };
    if (onlyUnread) {
      where.isRead = false;
    }
    return this.notificationsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Marca una notificación como leída asegurándose de que pertenezca al usuario especificado.
   */
  async markAsRead(notificationId: number, userId: number): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException(`No se encontró la notificación con ID ${notificationId}`);
    }

    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }
}
