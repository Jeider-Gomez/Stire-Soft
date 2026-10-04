import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValoracionLeccion } from './entities/valoracion-leccion.entity';
import { ValoracionesService } from './valoraciones.service';
import { ValoracionesController } from './valoraciones.controller';
import { LearningUnitModule } from '../learning-unit/learning-unit.module';
import { AuthorizationModule } from '../common/authorization/authorization.module';

@Module({
  imports: [TypeOrmModule.forFeature([ValoracionLeccion]), LearningUnitModule, AuthorizationModule],
  controllers: [ValoracionesController],
  providers: [ValoracionesService],
})
export class ValoracionesModule {}
