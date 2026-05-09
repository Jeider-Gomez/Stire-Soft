import { Injectable, BadRequestException } from '@nestjs/common';
import { IEvaluatorStrategy, EvaluationResult } from './interfaces/evaluator-strategy.interface';
import { McqEvaluator } from './strategies/mcq.evaluator';
import { CodingEvaluator } from './strategies/coding.evaluator';
import { DragDropEvaluator } from './strategies/drag-drop.evaluator';
import { FillCodeEvaluator } from './strategies/fill-code.evaluator';
import { OrderingEvaluator } from './strategies/ordering.evaluator';
import { MatchingEvaluator } from './strategies/matching.evaluator';
import { QuestionType } from '../common/enums/question-type.enum';

@Injectable()
export class EvaluationEngineService {
  private strategies: Map<QuestionType, IEvaluatorStrategy> = new Map();

  constructor() {
    this.strategies.set(QuestionType.MCQ, new McqEvaluator());
    this.strategies.set(QuestionType.CODING, new CodingEvaluator());
    this.strategies.set(QuestionType.DRAG_DROP, new DragDropEvaluator());
    this.strategies.set(QuestionType.FILL_CODE, new FillCodeEvaluator());
    this.strategies.set(QuestionType.ORDERING, new OrderingEvaluator());
    this.strategies.set(QuestionType.MATCHING, new MatchingEvaluator());
  }

  evaluateAnswer(questionType: QuestionType, studentAnswer: any, config: any, maxPoints: number): EvaluationResult {
    const strategy = this.strategies.get(questionType);
    if (!strategy) {
      throw new BadRequestException(`Estrategia de evaluación no implementada para el tipo: ${questionType}`);
    }

    return strategy.evaluate(studentAnswer, config, maxPoints);
  }
}
