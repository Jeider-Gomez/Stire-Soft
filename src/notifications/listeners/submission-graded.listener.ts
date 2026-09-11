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

    // passingScore es un porcentaje (0-100): normalizamos el score crudo
    // contra el totalPoints de ESA actividad antes de comparar — actividades
    // distintas valen puntajes totales distintos (10, 15, 20...).
    const percentage = event.totalPoints > 0 ? (event.score / event.totalPoints) * 100 : 0;
    const isApproved = percentage >= event.passingScore;
    const title = isApproved ? '¡Actividad Aprobada!' : 'Actividad Calificada';
    const message = isApproved
      ? `¡Felicidades! Has superado con éxito la actividad. Obtuviste ${event.score}/${event.totalPoints} puntos (${percentage.toFixed(0)}%). ¡Sigue así!`
      : `Tu entrega ha sido calificada con ${event.score}/${event.totalPoints} puntos (${percentage.toFixed(0)}%, mínimo requerido: ${event.passingScore.toFixed(0)}%). Te invitamos a revisar el material de estudio e intentarlo de nuevo.`;

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
