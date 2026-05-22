import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LearningStatusChangedEvent } from '../../common/events/learning-status-changed.event';
import { NotificationsService } from '../notifications.service';
import { LearningStatus } from '../../common/enums/learning-status.enum';
import { NotificationType } from '../../common/enums/notification-type.enum';

@Injectable()
export class LearningStatusChangedListener {
  private readonly logger = new Logger(LearningStatusChangedListener.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('learning.status.changed')
  async handleLearningStatusChangedEvent(event: LearningStatusChangedEvent) {
    this.logger.log(
      `[Notificaciones] Generando notificación de transición de estado para estudiante ${event.studentId}, unidad ${event.learningUnitId} (${event.oldStatus} -> ${event.newStatus})`,
    );

    let title = 'Nuevo Progreso Académico';
    let message = `Tu estado de aprendizaje ha cambiado a '${event.newStatus}' (Maestría: ${event.mastery.toFixed(1)}%).`;

    if (event.newStatus === LearningStatus.DOMINADO) {
      title = '¡Felicidades, Unidad Dominada! 🏆';
      message = `¡Excelente logro! Has dominado por completo los conceptos clave de la Unidad de Aprendizaje con un nivel de maestría del ${event.mastery.toFixed(1)}%. ¡Increíble trabajo!`;
    } else if (event.newStatus === LearningStatus.COMPRENSION_PARCIAL) {
      title = '¡Gran Avance! 🌟';
      message = `¡Vas por un excelente camino! Has alcanzado comprensión parcial en la Unidad de Aprendizaje (Maestría: ${event.mastery.toFixed(1)}%). ¡Solo un poco más para dominarla!`;
    } else if (event.newStatus === LearningStatus.EN_PRACTICA) {
      title = '¡En Marcha! 📚';
      message = `Tu estado ha progresado a 'En Práctica' (Maestría: ${event.mastery.toFixed(1)}%). Continúa resolviendo actividades para afianzar tus conocimientos.`;
    } else if (event.newStatus === LearningStatus.EXPLORADO) {
      title = '¡Unidad Explorada! 🔍';
      message = `Has comenzado a explorar la Unidad de Aprendizaje. Sigue adelante para comenzar tus prácticas y subir tu nivel de maestría.`;
    }

    try {
      await this.notificationsService.createNotification(
        event.studentId,
        title,
        message,
        NotificationType.INFO,
      );
      this.logger.log(`[Notificaciones] Notificación de estado creada con éxito para estudiante ${event.studentId}`);
    } catch (error) {
      this.logger.error(
        `[Notificaciones] Error creando notificación de estado para estudiante ${event.studentId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
