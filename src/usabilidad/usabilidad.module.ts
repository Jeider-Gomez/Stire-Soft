import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncuestaSus } from './entities/encuesta-sus.entity';
import { UsabilidadService } from './usabilidad.service';
import { UsabilidadController } from './usabilidad.controller';
import { InvestigacionService } from './investigacion.service';
import { User } from '../user/entities/user.entity';
import { LearningProgress } from '../learning-progress/entities/learning-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EncuestaSus, User, LearningProgress])],
  controllers: [UsabilidadController],
  providers: [UsabilidadService, InvestigacionService],
})
export class UsabilidadModule {}
