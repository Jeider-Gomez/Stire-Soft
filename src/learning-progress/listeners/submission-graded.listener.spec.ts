import { SubmissionGradedListener } from './submission-graded.listener';
import { SubmissionGradedEvent } from '../../common/events/submission-graded.event';
import { LearningProgressService } from '../learning-progress.service';
import { ReviewSchedulesService } from '../../review-schedules/review-schedules.service';

// 07/10: cada entrega guarda el dominio de la lección antes y después de calificarla, para el historial del estudiante.
describe('SubmissionGradedListener · dominio por entrega', () => {
  function armar(antes: number, despues: number) {
    const progreso = {
      dominioActual: jest.fn().mockResolvedValue(antes),
      recalculateMastery: jest.fn().mockResolvedValue({ mastery: despues, entryConfidence: null }),
      registrarDominioDeEntrega: jest.fn().mockResolvedValue(undefined),
      marcarComoRepaso: jest.fn(),
      esPrimerIntento: jest.fn().mockResolvedValue(true),
      juicioDeEntrega: jest.fn().mockResolvedValue(null),
    };
    const repasos = { estaVencido: jest.fn().mockResolvedValue(false), registrarResultado: jest.fn() };
    const listener = new SubmissionGradedListener(
      progreso as unknown as LearningProgressService,
      repasos as unknown as ReviewSchedulesService,
    );
    return { listener, progreso };
  }

  it('lee el dominio antes de recalcular y guarda los dos valores en la entrega', async () => {
    const { listener, progreso } = armar(20, 37);
    await listener.handleSubmissionGradedEvent(new SubmissionGradedEvent('s-1', 7, 3, 44, 20, 60, 20));

    expect(progreso.dominioActual).toHaveBeenCalledWith(7, 44);
    expect(progreso.dominioActual.mock.invocationCallOrder[0]).toBeLessThan(progreso.recalculateMastery.mock.invocationCallOrder[0]);
    expect(progreso.registrarDominioDeEntrega).toHaveBeenCalledWith('s-1', 20, 37);
  });
});
