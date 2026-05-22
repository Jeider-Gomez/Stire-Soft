import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SubmissionGradedEvent } from '../../common/events/submission-graded.event';
import { NotificationsService } from '../notifications.service';
import { NotificationType } from '../../common/enums/notification-type.enum';

@Injectable()
export class SubmissionGradedListener {
  private readonly logger = new Logger(SubmissionGradedListener.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('submission.graded')
  async handleSubmissionGradedEvent(event: SubmissionGradedEvent) {
    this.logger.log(
      `[Notificaciones] Generando notificación de calificación para estudiante ${event.studentId}, actividad ${event.activityId}`,
    );

    const isApproved = event.score >= event.passingScore;
    const title = isApproved ? '¡Actividad Aprobada!' : 'Actividad Calificada';
    const message = isApproved
      ? `¡Felicidades! Has superado con éxito la actividad. Obtuviste una calificación de ${event.score.toFixed(1)} (Puntaje mínimo requerido: ${event.passingScore.toFixed(1)}). ¡Sigue así!`
      : `Tu entrega de la actividad ha sido calificada con ${event.score.toFixed(1)} (Puntaje mínimo requerido: ${event.passingScore.toFixed(1)}). Te invitamos a revisar el material de estudio e intentarlo de nuevo.`;

    try {
      await this.notificationsService.createNotification(
        event.studentId,
        title,
        message,
        NotificationType.GRADE,
      );
      this.logger.log(`[Notificaciones] Notificación creada con éxito para estudiante ${event.studentId}`);
    } catch (error) {
      this.logger.error(
        `[Notificaciones] Error creando notificación para estudiante ${event.studentId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
