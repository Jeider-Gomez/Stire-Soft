import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SubmissionGradedEvent } from '../../common/events/submission-graded.event';
import { LearningProgressService } from '../learning-progress.service';
import { ReviewSchedulesService } from '../../review-schedules/review-schedules.service';

@Injectable()
export class SubmissionGradedListener {
  private readonly logger = new Logger(SubmissionGradedListener.name);

  constructor(
    private readonly progressService: LearningProgressService,
    private readonly reviewService: ReviewSchedulesService,
  ) {}

  @OnEvent('submission.graded')
  async handleSubmissionGradedEvent(event: SubmissionGradedEvent) {
    this.logger.log(`Procesando submission.graded para estudiante ${event.studentId}, actividad ${event.activityId}`);
    
    // 1. Recalcular Mastery
    const progress = await this.progressService.recalculateMastery(
      event.studentId,
      event.learningUnitId,
      event.activityId,
      event.score,
      event.passingScore
    );

    // 2. Actualizar Repaso Espaciado
    await this.reviewService.updateSchedule(event.studentId, event.learningUnitId, progress.mastery);
    
    // 3. (Futuro) Emitir eventos para Gamification / Notificaciones
  }
}
