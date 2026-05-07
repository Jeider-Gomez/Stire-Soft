import { Module } from '@nestjs/common';
import { TutorService } from './tutor.service';
import { TutorController } from './tutor.controller';
import { LearningStateModule } from '../learning-state/learning-state.module';
import { EvaluationModule } from '../evaluation/evaluation.module';
import { LearningUnitModule } from '../learning-unit/learning-unit.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';

@Module({
  imports: [
    LearningStateModule,
    EvaluationModule,
    LearningUnitModule,
    UserModule,
    AuthModule,
    EnrollmentModule,
  ],
  controllers: [TutorController],
  providers: [TutorService],
})
export class TutorModule {}
