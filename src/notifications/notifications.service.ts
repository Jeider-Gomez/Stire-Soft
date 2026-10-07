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
   * Crea una notificación. Con `clave`, solo una vez por usuario: si ya existe, no crea otra y devuelve null (el hito de
   * un módulo, los repasos de un día). Con `enlace`, la notificación lleva a donde se resuelve.
   */
  async createNotification(
    userId: number,
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    extra: { enlace?: string | null; clave?: string | null } = {},
  ): Promise<Notification | null> {
    const clave = extra.clave ?? null;
    if (clave && (await this.notificationsRepository.findOne({ where: { userId, clave } }))) return null;
    const notification = this.notificationsRepository.create({
      userId,
      title,
      message,
      type,
      enlace: extra.enlace ?? null,
      clave,
    });
    try {
      return await this.notificationsRepository.save(notification);
    } catch (error) {
      // Dos eventos a la vez con la misma clave: el índice único deja pasar solo uno.
      if (clave && (error as { code?: string }).code === 'ER_DUP_ENTRY') return null;
      throw error;
    }
  }

  /** Marca como leídas todas las notificaciones del usuario. */
  async markAllAsRead(userId: number): Promise<{ marcadas: number }> {
    const r = await this.notificationsRepository.update({ userId, isRead: false }, { isRead: true });
    return { marcadas: r.affected ?? 0 };
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
