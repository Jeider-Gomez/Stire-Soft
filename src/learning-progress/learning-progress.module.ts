import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningProgress } from './entities/learning-progress.entity';
import { LearningProgressRepository } from './learning-progress.repository';
import { LearningProgressService } from './learning-progress.service';
import { LearningProgressController } from './learning-progress.controller';
import { SubmissionGradedListener } from './listeners/submission-graded.listener';
import { EntregaRevisadaListener } from './listeners/entrega-revisada.listener';
import { SubmissionsModule } from '../submissions/submissions.module';
import { ActivitiesModule } from '../activities/activities.module';
import { ReviewSchedulesModule } from '../review-schedules/review-schedules.module';
import { AuthorizationModule } from '../common/authorization/authorization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LearningProgress]),
    SubmissionsModule,
    ActivitiesModule,
    ReviewSchedulesModule,
    AuthorizationModule,
  ],
  controllers: [LearningProgressController],
  providers: [LearningProgressRepository, LearningProgressService, SubmissionGradedListener, EntregaRevisadaListener],
  exports: [LearningProgressService, LearningProgressRepository],
})
export class LearningProgressModule {}
