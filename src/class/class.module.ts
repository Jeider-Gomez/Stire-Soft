import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './entities/class.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { LearningProgress } from '../learning-progress/entities/learning-progress.entity';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../common/authorization/authorization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Class, Enrollment, LearningProgress]),
    UserModule,
    AuthModule,
    AuthorizationModule,
  ],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
})
export class ClassModule {}
