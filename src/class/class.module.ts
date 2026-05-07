import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './entities/class.entity';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { LearningStateModule } from '../learning-state/learning-state.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Class]),
    forwardRef(() => EnrollmentModule),
    forwardRef(() => LearningStateModule),
    UserModule,
    AuthModule,
  ],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
})
export class ClassModule {}
