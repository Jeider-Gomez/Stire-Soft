import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityQuestion } from './entities/activity-question.entity';
import { Activity } from '../activities/entities/activity.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { ActivityQuestionsRepository } from './activity-questions.repository';
import { ActivityQuestionsService } from './activity-questions.service';
import { ActivityQuestionsController } from './activity-questions.controller';
import { AuthorizationModule } from '../common/authorization/authorization.module';
import { ContentRenderingModule } from '../content-rendering/content-rendering.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityQuestion, Activity, Submission]),
    AuthorizationModule,
    ContentRenderingModule,
  ],
  controllers: [ActivityQuestionsController],
  providers: [ActivityQuestionsRepository, ActivityQuestionsService],
  exports: [ActivityQuestionsRepository, ActivityQuestionsService],
})
export class ActivityQuestionsModule {}
