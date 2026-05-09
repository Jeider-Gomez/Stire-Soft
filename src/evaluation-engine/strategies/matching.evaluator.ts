import { IEvaluatorStrategy, EvaluationResult } from '../interfaces/evaluator-strategy.interface';
import { MatchingConfig } from '../../activity-questions/interfaces/question-configs.interface';

export class MatchingEvaluator implements IEvaluatorStrategy {
  evaluate(studentAnswer: { pairs: Record<string, string> }, config: MatchingConfig, maxPoints: number): EvaluationResult {
    if (!studentAnswer || !studentAnswer.pairs) {
      return { isCorrect: false, score: 0, feedback: 'No se enviaron pares.' };
    }

    let correctCount = 0;
    const totalPairs = Object.keys(config.pairs).length;

    for (const [leftId, rightId] of Object.entries(config.pairs)) {
      if (studentAnswer.pairs[leftId] === rightId) {
        correctCount++;
      }
    }

    const score = (correctCount / totalPairs) * maxPoints;
    const isCorrect = correctCount === totalPairs;

    return {
      isCorrect,
      score: Math.round(score),
      feedback: isCorrect ? '¡Todas las parejas son correctas!' : `Emparejaste ${correctCount} de ${totalPairs} correctamente.`,
    };
  }
}
