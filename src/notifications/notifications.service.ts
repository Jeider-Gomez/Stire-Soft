import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere } from 'typeorm';
import { NotificationsRepository } from './notifications.repository';
import { Notification } from './entities/notification.entity';
import { NotificationType } from '../common/enums/notification-type.enum';

/** La campana muestra las 50 más recientes: las viejas no se borran, pero ya no se acumulan en la lista. */
export const MAXIMO_EN_LA_LISTA = 50;

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
    if (
      clave &&
      (await this.notificationsRepository.findOne({ where: { userId, clave } }))
    )
      return null;
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
      if (clave && (error as { code?: string }).code === 'ER_DUP_ENTRY')
        return null;
      throw error;
    }
  }

  /** Marca como leídas todas las notificaciones del usuario. */
  async markAllAsRead(userId: number): Promise<{ marcadas: number }> {
    const r = await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { marcadas: r.affected ?? 0 };
  }

  /**
   * Obtiene todas las notificaciones de un usuario (ordenadas por fecha descendente).
   * Opcionalmente filtra por estado no leído.
   */
  async findForUser(
    userId: number,
    onlyUnread = false,
  ): Promise<Notification[]> {
    const where: FindOptionsWhere<Notification> = { userId };
    if (onlyUnread) {
      where.isRead = false;
    }
    return this.notificationsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: MAXIMO_EN_LA_LISTA,
    });
  }

  /**
   * Borra una notificación del usuario (12/10, Jeider: «se acumulan mucho»). Es un borrado suave (`deletedAt`): con
   * `clave`, el índice único sigue viendo la fila y el aviso no vuelve a llegar.
   */
  async borrar(
    notificationId: number,
    userId: number,
  ): Promise<{ borradas: number }> {
    const r = await this.notificationsRepository.softDelete({
      id: notificationId,
      userId,
    });
    if (!r.affected)
      throw new NotFoundException(
        `No se encontró la notificación con ID ${notificationId}`,
      );
    return { borradas: r.affected };
  }

  /** Borra todas las notificaciones ya leídas del usuario («Borrar las leídas»). */
  async borrarLeidas(userId: number): Promise<{ borradas: number }> {
    const r = await this.notificationsRepository.softDelete({
      userId,
      isRead: true,
    });
    return { borradas: r.affected ?? 0 };
  }

  /**
   * Borra los avisos anteriores de un tipo que el nuevo reemplaza (el aviso de repasos de hoy deja sin sentido los de
   * días pasados), menos el de `claveVigente`.
   */
  async borrarAnterioresDelTipo(
    userId: number,
    type: NotificationType,
    claveVigente: string,
  ): Promise<number> {
    const delTipo = await this.notificationsRepository.find({
      where: { userId, type },
      select: ['id', 'clave'],
    });
    const ids = delTipo
      .filter((n) => n.clave !== claveVigente)
      .map((n) => n.id);
    if (!ids.length) return 0;
    const r = await this.notificationsRepository.softDelete(ids);
    return r.affected ?? 0;
  }

  /**
   * Marca una notificación como leída asegurándose de que pertenezca al usuario especificado.
   */
  async markAsRead(
    notificationId: number,
    userId: number,
  ): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException(
        `No se encontró la notificación con ID ${notificationId}`,
      );
    }

    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }
}
