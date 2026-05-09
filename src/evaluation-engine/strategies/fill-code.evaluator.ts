import { IEvaluatorStrategy, EvaluationResult } from '../interfaces/evaluator-strategy.interface';
import { FillCodeConfig } from '../../activity-questions/interfaces/question-configs.interface';

export class FillCodeEvaluator implements IEvaluatorStrategy {
  evaluate(studentAnswer: { blanks: Record<string, string> }, config: FillCodeConfig, maxPoints: number): EvaluationResult {
    if (!studentAnswer || !studentAnswer.blanks) {
      return { isCorrect: false, score: 0, feedback: 'No se enviaron respuestas.' };
    }

    let correctCount = 0;
    const totalBlanks = config.blanks.length;

    if (totalBlanks === 0) {
      return { isCorrect: true, score: maxPoints, feedback: 'No hay espacios para rellenar.' };
    }

    for (const blank of config.blanks) {
      const studentText = (studentAnswer.blanks[blank.id] || '').trim();
      
      if (blank.regexMode) {
        try {
          const regex = new RegExp(`^${blank.answer}$`, 'i'); // case-insensitive por defecto
          if (regex.test(studentText)) correctCount++;
        } catch (e) {
          // Fallback exact match si el regex es inválido
          if (studentText === blank.answer.trim()) correctCount++;
        }
      } else {
        if (studentText === blank.answer.trim()) correctCount++;
      }
    }

    const score = (correctCount / totalBlanks) * maxPoints;
    const isCorrect = correctCount === totalBlanks;

    return {
      isCorrect,
      score: Math.round(score),
      feedback: isCorrect ? '¡Todo el código es correcto!' : `Acertaste ${correctCount} de ${totalBlanks} espacios.`,
    };
  }
}
