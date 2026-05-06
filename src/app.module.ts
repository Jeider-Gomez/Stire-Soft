import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ClassModule } from './class/class.module';
import { TopicModule } from './topic/topic.module';
import { LearningUnitModule } from './learning-unit/learning-unit.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { SubmissionModule } from './submission/submission.module';
import { LearningStateModule } from './learning-state/learning-state.module';
import { MessageModule } from './message/message.module';
import { TutorModule } from './tutor/tutor.module';

@Module({
  imports: [
    // Configuración de variables de entorno
    // isGlobal: true hace que ConfigModule esté disponible en toda la app
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configurar Passport globalmente
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Configuración de TypeORM con MySQL
    // useFactory permite inyectar ConfigService para leer variables de entorno
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
        synchronize: true, // ⚠️ Solo en desarrollo
      }),
      inject: [ConfigService],
    }),

    // Módulos del sistema
    UserModule,
    AuthModule,
    ClassModule,
    TopicModule,
    LearningUnitModule,
    EvaluationModule,
    SubmissionModule,
    LearningStateModule,
    MessageModule,
    TutorModule,
  ],
})
export class AppModule {}