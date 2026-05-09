import { IEvaluatorStrategy, EvaluationResult } from '../interfaces/evaluator-strategy.interface';
import { McqConfig } from '../../activity-questions/interfaces/question-configs.interface';

export class McqEvaluator implements IEvaluatorStrategy {
  evaluate(studentAnswer: { selectedId: string | string[] }, config: McqConfig, maxPoints: number): EvaluationResult {
    if (!studentAnswer || !studentAnswer.selectedId) {
      return { isCorrect: false, score: 0, feedback: 'No se proporcionó respuesta.' };
    }

    let isCorrect = false;

    if (config.isMultipleChoice) {
      const correctIds = Array.isArray(config.correctAnswerId) ? config.correctAnswerId : [config.correctAnswerId];
      const selectedIds = Array.isArray(studentAnswer.selectedId) ? studentAnswer.selectedId : [studentAnswer.selectedId];
      
      // Validar si los arrays tienen exactamente los mismos elementos
      isCorrect = correctIds.length === selectedIds.length && 
                  correctIds.every(id => selectedIds.includes(id));
    } else {
      isCorrect = studentAnswer.selectedId === config.correctAnswerId;
    }

    return {
      isCorrect,
      score: isCorrect ? maxPoints : 0,
      feedback: isCorrect ? '¡Correcto!' : (config.explanation || 'Respuesta incorrecta.'),
    };
  }
}
