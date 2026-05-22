import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { SubmissionGradedListener } from './listeners/submission-graded.listener';
import { LearningStatusChangedListener } from './listeners/learning-status-changed.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [
    NotificationsRepository,
    NotificationsService,
    SubmissionGradedListener,
    LearningStatusChangedListener,
  ],
  exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}
