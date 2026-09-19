import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorConversation } from './entities/tutor-conversation.entity';
import { TutorCredential } from './entities/tutor-credential.entity';
import { TutorSetting } from './entities/tutor-setting.entity';
import { TutorSettingsService } from './tutor-settings.service';
import { TutorSettingsController } from './tutor-settings.controller';
import { Activity } from '../activities/entities/activity.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { AuthorizationModule } from '../common/authorization/authorization.module';
import { TutorCredentialService } from './tutor-credential.service';
import { TutorKeyCryptoService } from './tutor-key-crypto.service';
import { TutorConversationsRepository } from './tutor-conversations.repository';
import { TutorContextService } from './tutor-context.service';
import { TutorService } from './tutor.service';
import { TutorController } from './tutor.controller';
import { TutorRecommendationService } from './tutor-recommendation.service';
import { LearningProgressModule } from '../learning-progress/learning-progress.module';
import { ContentRenderingModule } from '../content-rendering/content-rendering.module';
import { ReviewSchedulesModule } from '../review-schedules/review-schedules.module';
import { LearningUnitModule } from '../learning-unit/learning-unit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TutorConversation, TutorCredential, TutorSetting, Activity, Enrollment]),
    LearningProgressModule,
    ContentRenderingModule,
    ReviewSchedulesModule,
    LearningUnitModule,
    AuthorizationModule,
  ],
  controllers: [TutorController, TutorSettingsController],
  providers: [
    TutorConversationsRepository,
    TutorContextService,
    TutorService,
    TutorRecommendationService,
    TutorCredentialService,
    TutorKeyCryptoService,
    TutorSettingsService,
  ],
  exports: [TutorService],
})
export class TutorModule {}
