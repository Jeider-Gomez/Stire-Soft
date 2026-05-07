import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { Submission } from './entities/submission.entity';
import { EvaluationModule } from '../evaluation/evaluation.module';
import { LearningStateModule } from '../learning-state/learning-state.module';
import { AuthModule } from '../auth/auth.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission]),
    EvaluationModule,
    forwardRef(() => LearningStateModule),
    EnrollmentModule,
    AuthModule,
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
