import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SubmissionGradedEvent } from '../common/events/submission-graded.event';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  @OnEvent('submission.graded')
  async handleSubmissionGraded(event: SubmissionGradedEvent) {
    this.logger.log(`Evaluando recompensas gamificadas para el estudiante ${event.studentId}`);
    
    // Si saca puntaje perfecto
    if (event.score >= event.passingScore && event.score === 100) {
      this.logger.log(`¡Estudiante ${event.studentId} obtuvo puntuación perfecta! Otorga insignia.`);
      // Lógica para guardar Achievement en DB y emitir Notificación
    }
  }
}
