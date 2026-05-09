export interface EvaluationResult {
  isCorrect: boolean;
  score: number;
  feedback?: string;
  needsAsyncJudge?: boolean; // Para código que va a BullMQ+Docker
}

export interface IEvaluatorStrategy {
  evaluate(studentAnswer: any, config: any, maxPoints: number): EvaluationResult;
}
