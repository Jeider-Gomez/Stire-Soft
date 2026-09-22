import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MessageCreatedEvent } from '../../common/events/message-created.event';
import { NotificationsService } from '../notifications.service';
import { NotificationType } from '../../common/enums/notification-type.enum';

const CONTENT_PREVIEW_MAX_LENGTH = 140;

@Injectable()
export class MessageCreatedListener {
  private readonly logger = new Logger(MessageCreatedListener.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('message.created')
  async handleMessageCreatedEvent(event: MessageCreatedEvent) {
    const preview =
      event.content.length > CONTENT_PREVIEW_MAX_LENGTH
        ? `${event.content.slice(0, CONTENT_PREVIEW_MAX_LENGTH)}…`
        : event.content;

    try {
      await this.notificationsService.createNotification(
        event.receiverId,
        `Nuevo mensaje de ${event.senderName}`,
        preview,
        NotificationType.MESSAGE,
      );
      this.logger.log(`[Notificaciones] Notificación de mensaje creada para el usuario ${event.receiverId}`);
    } catch (error) {
      this.logger.error(
        `[Notificaciones] Error creando notificación de mensaje para el usuario ${event.receiverId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
