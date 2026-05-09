import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './entities/class.entity';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { LearningProgressModule } from '../learning-progress/learning-progress.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Class]),
    forwardRef(() => EnrollmentModule),
    forwardRef(() => LearningProgressModule),
    UserModule,
    AuthModule,
  ],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
})
export class ClassModule {}
