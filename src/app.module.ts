import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ClassModule } from './class/class.module';
import { TopicModule } from './topic/topic.module';
import { SectionModule } from './section/section.module';
import { LearningUnitModule } from './learning-unit/learning-unit.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { MessageModule } from './message/message.module';
import { InstitutionModule } from './institution/institution.module';

// New Architecture Modules
import { ActivityTypesModule } from './activity-types/activity-types.module';
import { ActivitiesModule } from './activities/activities.module';
import { ActivityQuestionsModule } from './activity-questions/activity-questions.module';
import { EvaluationEngineModule } from './evaluation-engine/evaluation-engine.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { SubmissionAnswersModule } from './submission-answers/submission-answers.module';
import { JudgeEngineModule } from './judge-engine/judge-engine.module';
import { TutorModule } from './tutor/tutor.module';
import { LearningProgressModule } from './learning-progress/learning-progress.module';
import { ReviewSchedulesModule } from './review-schedules/review-schedules.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { GamificationModule } from './gamification/gamification.module';
import { ContentRenderingModule } from './content-rendering/content-rendering.module';
import { QuestionBanksModule } from './question-banks/question-banks.module';
import { ContentModule } from './content/content.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { PrerequisitesModule } from './prerequisites/prerequisites.module';
import { WorkersModule } from './common/workers/workers.module';
import { MaintenanceModule } from './maintenance/maintenance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutes
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          enableOfflineQueue: false, // Evita encolar comandos cuando Redis está caído (previene cuelgues indefinidos)
          connectTimeout: 5000,      // Timeout de conexión de 5 segundos
          retryStrategy(times) {
            // Reintentar un máximo de 3 veces si Redis está caído al inicio, con delay de 1s
            if (times > 3) {
              return null; // Deja de reintentar y lanza error
            }
            return 1000;
          }
        },
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),

    // Legacy Modules
    UserModule,
    InstitutionModule,
    AuthModule,
    ClassModule,
    SectionModule,
    TopicModule,
    LearningUnitModule,
    EnrollmentModule,
    MessageModule,

    // New Modules
    ActivityTypesModule,
    ActivitiesModule,
    ActivityQuestionsModule,
    EvaluationEngineModule,
    SubmissionsModule,
    SubmissionAnswersModule,
    JudgeEngineModule,
    TutorModule,
    LearningProgressModule,
    ReviewSchedulesModule,
    AnalyticsModule,
    GamificationModule,
    ContentRenderingModule,
    QuestionBanksModule,
    PrerequisitesModule,
    ContentModule,
    ActivityLogModule,
    WorkersModule,
    MaintenanceModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}