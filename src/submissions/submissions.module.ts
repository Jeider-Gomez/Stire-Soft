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
import { JudgeEngineModule } from '../judge-engine/judge-engine.module';
import { JudgeGradedListener } from './listeners/judge-graded.listener';
import { ContentRenderingModule } from '../content-rendering/content-rendering.module';
import { Enrollment } from '../enrollment/entities/enrollment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, Enrollment]),
    SubmissionAnswersModule,
    ActivitiesModule,
    ActivityQuestionsModule,
    EvaluationEngineModule,
    // Import normal: JudgeEngineModule ya no depende de SubmissionsModule
    // (ver la nota de diseño en judge-engine.module.ts), así que no hay
    // ciclo que resolver con forwardRef.
    JudgeEngineModule,
    ContentRenderingModule,
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, SubmissionsRepository, JudgeGradedListener],
  exports: [SubmissionsService, SubmissionsRepository],
})
export class SubmissionsModule {}
