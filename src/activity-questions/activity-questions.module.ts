import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityQuestion } from './entities/activity-question.entity';
import { ActivityQuestionsRepository } from './activity-questions.repository';
import { ActivityQuestionsService } from './activity-questions.service';
import { ActivityQuestionsController } from './activity-questions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityQuestion])],
  controllers: [ActivityQuestionsController],
  providers: [ActivityQuestionsRepository, ActivityQuestionsService],
  exports: [ActivityQuestionsRepository, ActivityQuestionsService],
})
export class ActivityQuestionsModule {}
