import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LearningProgressService } from '../learning-progress.service';

/**
 * La revisión del docente en una entrega que cuenta para el dominio recalcula esa lección
 * (docs/DISENO_INTERVENCION_DOCENTE.md §5). No suma un intento: el estudiante no practicó, el docente valoró su trabajo.
 */
@Injectable()
export class EntregaRevisadaListener {
  private readonly logger = new Logger(EntregaRevisadaListener.name);

  constructor(private readonly progressService: LearningProgressService) {}

  @OnEvent('entrega.revisada')
  async handle(event: { studentId: number; learningUnitId: number }) {
    this.logger.log(`Entrega revisada: estudiante ${event.studentId}, lección ${event.learningUnitId}`);
    await this.progressService.recalculateMastery(event.studentId, event.learningUnitId, null, 0, 0, false);
  }
}
