import { IEvaluatorStrategy, EvaluationResult } from '../interfaces/evaluator-strategy.interface';
import { CodingConfig } from '../../activity-questions/interfaces/question-configs.interface';

export class CodingEvaluator implements IEvaluatorStrategy {
  evaluate(studentAnswer: { code: string }, config: CodingConfig, maxPoints: number): EvaluationResult {
    if (!studentAnswer || !studentAnswer.code) {
      return { isCorrect: false, score: 0, feedback: 'No se envió código.' };
    }

    // La evaluación real ocurre de forma asíncrona mediante el Judge Engine (Docker + BullMQ)
    // El evaluador sincrónico solo delega e indica que necesita procesamiento externo.
    
    return {
      isCorrect: false, // Será actualizado por el Worker
      score: 0,
      needsAsyncJudge: true,
      feedback: 'El código ha sido enviado al motor de evaluación. Esperando resultados...',
    };
  }
}
