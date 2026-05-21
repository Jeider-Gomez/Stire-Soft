import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { SubmissionAnswer } from '../submission-answers/entities/submission-answer.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { ExecutionResult } from '../judge-engine/entities/execution-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubmissionAnswer, Submission, ExecutionResult]),
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
