import { Injectable } from '@nestjs/common';
import { ActivityQuestionsRepository } from './activity-questions.repository';
import { ActivityQuestion } from './entities/activity-question.entity';
import { QuestionType } from '../common/enums/question-type.enum';

export class CreateActivityQuestionDto {
  activityId: number;
  type: QuestionType;
  question: string;
  points?: number;
  order?: number;
  config: Record<string, any>;
}

@Injectable()
export class ActivityQuestionsService {
  constructor(private readonly questionsRepo: ActivityQuestionsRepository) {}

  async create(dto: CreateActivityQuestionDto): Promise<ActivityQuestion> {
    const question = this.questionsRepo.create({
      activityId: dto.activityId,
      type: dto.type,
      question: dto.question,
      points: dto.points ?? 50,
      order: dto.order ?? 0,
      config: dto.config,
    });
    return this.questionsRepo.save(question);
  }

  async findByActivity(activityId: number): Promise<ActivityQuestion[]> {
    return this.questionsRepo.findByActivityId(activityId);
  }
}
