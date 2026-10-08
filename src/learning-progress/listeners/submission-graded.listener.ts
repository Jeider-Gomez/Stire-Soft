import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SubmissionGradedEvent } from '../../common/events/submission-graded.event';
import { LearningProgressService } from '../learning-progress.service';
import { ReviewSchedulesService } from '../../review-schedules/review-schedules.service';
import { calidadDeRepaso } from '../../common/utils/spaced-repetition';
import { CONFIANZA_SEGURO } from '../recommendation/recomendar-siguiente';

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

    // 1. ¿Es un repaso? Se decide antes de recalcular: un repaso fallado baja el dominio de su casilla.
    const esRepaso = await this.reviewService.estaVencido(event.studentId, event.learningUnitId);
    if (esRepaso) await this.progressService.marcarComoRepaso(event.submissionId);

    // 2. Recalcular el dominio, y guardar en la entrega cuánto lo movió (historial del estudiante)
    const antes = await this.progressService.dominioActual(event.studentId, event.learningUnitId);
    const progress = await this.progressService.recalculateMastery(
      event.studentId,
      event.learningUnitId,
      event.activityId,
      event.score,
      event.passingScore
    );
    await this.progressService.registrarDominioDeEntrega(event.submissionId, antes, progress.mastery);

    // 3. Calendario de repasos con la calidad del resultado (docs/DISENO_PRACTICA_ADAPTATIVA.md §3.4)
    //    «Seguro»: tomó el reto de la lección o dijo «Estoy seguro» antes de entregar este ejercicio.
    const calidad = calidadDeRepaso({
      aprobado: event.totalPoints > 0 && (event.score / event.totalPoints) * 100 >= event.passingScore,
      primerIntento: await this.progressService.esPrimerIntento(event.submissionId),
      seSentiaSeguro: progress.entryConfidence === CONFIANZA_SEGURO || (await this.progressService.juicioDeEntrega(event.submissionId)) === 'seguro',
    });
    await this.reviewService.registrarResultado(event.studentId, event.learningUnitId, calidad);
  }
}
