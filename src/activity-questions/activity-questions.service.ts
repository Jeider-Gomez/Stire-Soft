import { Injectable } from '@nestjs/common';
import { ActivityQuestionsRepository } from './activity-questions.repository';
import { ActivityQuestion } from './entities/activity-question.entity';
import { QuestionType } from '../common/enums/question-type.enum';

import { IsInt, IsEnum, IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreateActivityQuestionDto {
  @IsInt()
  activityId: number;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  question: string;

  @IsNumber()
  @IsOptional()
  points?: number;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsObject()
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
