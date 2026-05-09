import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityQuestion } from './entities/activity-question.entity';
import { ActivityQuestionsRepository } from './activity-questions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityQuestion])],
  providers: [ActivityQuestionsRepository],
  exports: [ActivityQuestionsRepository],
})
export class ActivityQuestionsModule {}
