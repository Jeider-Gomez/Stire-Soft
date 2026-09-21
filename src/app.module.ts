import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

import { normalizeSqliteMetadata } from './data-source';
import * as path from 'path';

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
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { GamificationModule } from './gamification/gamification.module';
import { ContentRenderingModule } from './content-rendering/content-rendering.module';
// QuestionBanksModule eliminado del árbol activo de dependencias.
// Las entidades QuestionBank y BankQuestion están definidas en src/question-banks/entities/
// para una implementación futura. Ver README.md sección "Módulos en Pausa".
import { ContentModule } from './content/content.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { PrerequisitesModule } from './prerequisites/prerequisites.module';
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


    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>('DB_TYPE');
        const dbHost = configService.get<string>('DB_HOST');
        const useMysql = dbType === 'mysql' && !!dbHost;

        if (!useMysql) {
          normalizeSqliteMetadata();
          return {
            type: 'sqlite',
            database: configService.get<string>('DB_DATABASE') || path.join(process.cwd(), 'stire.sqlite'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: false,
          };
        }

        return {
          type: 'mysql',
          host: dbHost,
          port: +configService.get('DB_PORT', 3306),
          username: configService.get('DB_USERNAME', 'root'),
          password: configService.get('DB_PASSWORD', 'root'),
          database: configService.get('DB_DATABASE', 'basestire'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
        };
      },
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
    NotificationsModule,
    AnalyticsModule,
    GamificationModule,
    ContentRenderingModule,
    PrerequisitesModule,
    ContentModule,
    ActivityLogModule,
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
    // P1-03: declarado en ThrottlerModule.forRoot pero nunca aplicado —
    // el limite global de 100/min no protegia nada porque este guard
    // jamas se registraba.
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}