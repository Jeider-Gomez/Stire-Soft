import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { SubmissionsRepository } from './submissions.repository';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { SubmissionAnswersModule } from '../submission-answers/submission-answers.module';
import { ActivitiesModule } from '../activities/activities.module';
import { ActivityQuestionsModule } from '../activity-questions/activity-questions.module';
import { EvaluationEngineModule } from '../evaluation-engine/evaluation-engine.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission]),
    SubmissionAnswersModule,
    ActivitiesModule,
    ActivityQuestionsModule,
    EvaluationEngineModule,
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, SubmissionsRepository],
  exports: [SubmissionsService, SubmissionsRepository],
})
export class SubmissionsModule {}
