import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewSchedule } from './entities/review-schedule.entity';
import { ReviewSchedulesRepository } from './review-schedules.repository';
import { ReviewSchedulesService } from './review-schedules.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewSchedule])],
  providers: [ReviewSchedulesRepository, ReviewSchedulesService],
  exports: [ReviewSchedulesService],
})
export class ReviewSchedulesModule {}
