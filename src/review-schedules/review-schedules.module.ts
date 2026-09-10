import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewSchedule } from './entities/review-schedule.entity';
import { ReviewSchedulesRepository } from './review-schedules.repository';
import { ReviewSchedulesService } from './review-schedules.service';
import { ReviewSchedulesController } from './review-schedules.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewSchedule]),
    NotificationsModule,
  ],
  controllers: [ReviewSchedulesController],
  providers: [ReviewSchedulesRepository, ReviewSchedulesService],
  exports: [ReviewSchedulesService],
})
export class ReviewSchedulesModule {}
