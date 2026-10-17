import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValoracionLeccion } from './entities/valoracion-leccion.entity';
import { ValoracionesService } from './valoraciones.service';
import { ValoracionesController } from './valoraciones.controller';
import { LearningUnitModule } from '../learning-unit/learning-unit.module';
import { AuthorizationModule } from '../common/authorization/authorization.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RecursoFallaService } from './recurso-falla.service';

@Module({
  imports: [TypeOrmModule.forFeature([ValoracionLeccion]), LearningUnitModule, AuthorizationModule, NotificationsModule],
  controllers: [ValoracionesController],
  providers: [ValoracionesService, RecursoFallaService],
})
export class ValoracionesModule {}
