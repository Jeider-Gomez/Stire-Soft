import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorConversation } from './entities/tutor-conversation.entity';
import { TutorConversationsRepository } from './tutor-conversations.repository';
import { TutorContextService } from './tutor-context.service';
import { TutorService } from './tutor.service';
import { TutorController } from './tutor.controller';
import { TutorRecommendationService } from './tutor-recommendation.service';
import { LearningProgressModule } from '../learning-progress/learning-progress.module';
import { ContentRenderingModule } from '../content-rendering/content-rendering.module';
import { ReviewSchedulesModule } from '../review-schedules/review-schedules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TutorConversation]),
    LearningProgressModule,
    ContentRenderingModule,
    ReviewSchedulesModule,
  ],
  controllers: [TutorController],
  providers: [TutorConversationsRepository, TutorContextService, TutorService, TutorRecommendationService],
  exports: [TutorService],
})
export class TutorModule {}
