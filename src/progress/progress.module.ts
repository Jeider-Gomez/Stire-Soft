import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { Progress } from './entities/progress.entity';
import { Evaluation } from '../evaluation/entities/evaluation.entity';
import { Submission } from '../submission/entities/submission.entity';
import { LearningUnitModule } from '../learning-unit/learning-unit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Progress, Evaluation, Submission]),
    LearningUnitModule,
    AuthModule,
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
