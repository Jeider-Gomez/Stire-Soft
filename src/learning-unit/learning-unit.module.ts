import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningUnitService } from './learning-unit.service';
import { LearningUnitController } from './learning-unit.controller';
import { LearningUnit } from './entities/learning-unit.entity';
import { AuthModule } from '../auth/auth.module';
import { PrerequisitesModule } from '../prerequisites/prerequisites.module';
import { LearningProgressModule } from '../learning-progress/learning-progress.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LearningUnit]),
    AuthModule,
    PrerequisitesModule,
    LearningProgressModule,
  ],
  controllers: [LearningUnitController],
  providers: [LearningUnitService],
  exports: [LearningUnitService],
})
export class LearningUnitModule {}
