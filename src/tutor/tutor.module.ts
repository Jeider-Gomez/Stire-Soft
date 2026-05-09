import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorConversation } from './entities/tutor-conversation.entity';
import { TutorConversationsRepository } from './tutor-conversations.repository';
import { TutorContextService } from './tutor-context.service';
import { TutorService } from './tutor.service';
import { TutorController } from './tutor.controller';
import { LearningProgressModule } from '../learning-progress/learning-progress.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TutorConversation]),
    LearningProgressModule,
  ],
  controllers: [TutorController],
  providers: [TutorConversationsRepository, TutorContextService, TutorService],
  exports: [TutorService],
})
export class TutorModule {}
