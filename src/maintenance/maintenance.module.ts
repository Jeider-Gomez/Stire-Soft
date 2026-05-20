import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { SubmissionAnswer } from '../submission-answers/entities/submission-answer.entity';
import { Submission } from '../submissions/entities/submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubmissionAnswer, Submission]),
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
