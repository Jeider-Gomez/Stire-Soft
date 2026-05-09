import { IEvaluatorStrategy, EvaluationResult } from '../interfaces/evaluator-strategy.interface';
import { DragDropConfig } from '../../activity-questions/interfaces/question-configs.interface';

export class DragDropEvaluator implements IEvaluatorStrategy {
  evaluate(studentAnswer: { mappings: Record<string, string> }, config: DragDropConfig, maxPoints: number): EvaluationResult {
    if (!studentAnswer || !studentAnswer.mappings) {
      return { isCorrect: false, score: 0, feedback: 'No se enviaron respuestas.' };
    }

    const correctMappings = config.mappings;
    let correctCount = 0;
    const totalMappings = Object.keys(correctMappings).length;

    if (totalMappings === 0) {
       return { isCorrect: true, score: maxPoints, feedback: 'Sin items a evaluar.' };
    }

    for (const [itemId, targetId] of Object.entries(correctMappings)) {
      if (studentAnswer.mappings[itemId] === targetId) {
        correctCount++;
      }
    }

    const score = (correctCount / totalMappings) * maxPoints;
    const isCorrect = correctCount === totalMappings;

    return {
      isCorrect,
      score: Math.round(score),
      feedback: isCorrect ? '¡Excelente!' : `Acertaste ${correctCount} de ${totalMappings} elementos.`,
    };
  }
}
