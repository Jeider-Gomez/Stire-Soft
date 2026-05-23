import { Injectable, Logger } from '@nestjs/common';
// import { OnEvent } from '@nestjs/event-emitter';   // [DEAD CODE] Listener desactivado
// import { SubmissionGradedEvent } from '../common/events/submission-graded.event';

/**
 * GamificationService — MÓDULO EN PAUSA
 *
 * TODO: Reactivar en Sprint de Gamificación (Fase 3 del roadmap).
 *       Pasos:
 *         1. Descomentar imports de OnEvent y SubmissionGradedEvent.
 *         2. Descomentar el decorador @OnEvent en handleSubmissionGraded.
 *         3. Implementar la lógica de persistencia de Achievement en DB.
 *         4. Emitir notificación al estudiante vía NotificationsService.
 */
@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  // @OnEvent('submission.graded')   ← DESACTIVADO — no consume CPU hasta la Fase 3
  // async handleSubmissionGraded(event: SubmissionGradedEvent) {
  //   this.logger.log(`Evaluando recompensas gamificadas para el estudiante ${event.studentId}`);
  //   if (event.score >= event.passingScore && event.score === 100) {
  //     this.logger.log(`¡Estudiante ${event.studentId} obtuvo puntuación perfecta! Otorga insignia.`);
  //     // Lógica para guardar Achievement en DB y emitir Notificación
  //   }
  // }
}
