import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningStateService } from './learning-state.service';
import { LearningStateController } from './learning-state.controller';
import { LearningState } from './entities/learning-state.entity';
import { LearningUnitModule } from '../learning-unit/learning-unit.module';
import { AuthModule } from '../auth/auth.module';
import { EvaluationModule } from '../evaluation/evaluation.module';
import { SubmissionModule } from '../submission/submission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LearningState]),
    forwardRef(() => EvaluationModule),
    forwardRef(() => SubmissionModule),
    LearningUnitModule,
    AuthModule,
  ],
  controllers: [LearningStateController],
  providers: [LearningStateService],
  exports: [LearningStateService],
})
export class LearningStateModule {}
