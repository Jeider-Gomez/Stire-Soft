import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsRepository } from './notifications.repository';
import { AtascoListener } from './listeners/atasco.listener';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { RevisionDocenteListener } from './listeners/revision-docente.listener';
import { LearningStatusChangedListener } from './listeners/learning-status-changed.listener';
import { MessageCreatedListener } from './listeners/message-created.listener';

// Ya no hay aviso por cada ejercicio calificado: la pantalla del ejercicio lo dice (notificacion-reglas.ts).
@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [
    NotificationsRepository,
    NotificationsService,
    RevisionDocenteListener,
    LearningStatusChangedListener,
    MessageCreatedListener,
    AtascoListener,
  ],
  exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}
