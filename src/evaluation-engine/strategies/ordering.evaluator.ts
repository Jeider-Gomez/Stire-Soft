import { IEvaluatorStrategy, EvaluationResult } from '../interfaces/evaluator-strategy.interface';
import { OrderingConfig } from '../../activity-questions/interfaces/question-configs.interface';

export class OrderingEvaluator implements IEvaluatorStrategy {
  evaluate(studentAnswer: { order: string[] }, config: OrderingConfig, maxPoints: number): EvaluationResult {
    if (!studentAnswer || !Array.isArray(studentAnswer.order)) {
      return { isCorrect: false, score: 0, feedback: 'Formato de respuesta inválido.' };
    }

    const expectedOrder = config.correctOrder;
    
    // Comparación estricta de array completo
    let isCorrect = false;
    if (expectedOrder.length === studentAnswer.order.length) {
      isCorrect = expectedOrder.every((id, index) => id === studentAnswer.order[index]);
    }

    // Para drag & drop ordering, suele ser Todo o Nada, aunque podríamos calcular Longest Common Subsequence
    return {
      isCorrect,
      score: isCorrect ? maxPoints : 0,
      feedback: isCorrect ? '¡Orden correcto!' : 'El orden de los bloques no es correcto.',
    };
  }
}
