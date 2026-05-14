import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningProgress } from './entities/learning-progress.entity';
import { LearningProgressRepository } from './learning-progress.repository';
import { LearningProgressService } from './learning-progress.service';
import { SubmissionGradedListener } from './listeners/submission-graded.listener';
import { SubmissionsModule } from '../submissions/submissions.module';
import { ActivitiesModule } from '../activities/activities.module';
import { ReviewSchedulesModule } from '../review-schedules/review-schedules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LearningProgress]),
    SubmissionsModule,
    ActivitiesModule,
    ReviewSchedulesModule,
  ],
  providers: [LearningProgressRepository, LearningProgressService, SubmissionGradedListener],
  exports: [LearningProgressService, LearningProgressRepository],
})
export class LearningProgressModule {}
