import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { LearningProgressModule } from '../learning-progress/learning-progress.module';
import { SubmissionsModule } from '../submissions/submissions.module';

@Module({
  imports: [LearningProgressModule, SubmissionsModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
