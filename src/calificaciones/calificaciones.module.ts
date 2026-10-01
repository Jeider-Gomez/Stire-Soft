import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EsquemaCalificacion } from './entities/esquema-calificacion.entity';
import { NotaRegistrada } from './entities/nota-registrada.entity';
import { NotaHistorial } from './entities/nota-historial.entity';
import { CalificacionesService } from './calificaciones.service';
import { CalificacionesController } from './calificaciones.controller';
import { Entrega } from '../proyectos/entities/entrega.entity';
import { ProyectoEnvio } from '../proyectos/entities/proyecto-envio.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { LearningProgress } from '../learning-progress/entities/learning-progress.entity';
import { AuthorizationModule } from '../common/authorization/authorization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EsquemaCalificacion, NotaRegistrada, NotaHistorial, Entrega, ProyectoEnvio, Enrollment, LearningProgress]),
    AuthorizationModule,
  ],
  controllers: [CalificacionesController],
  providers: [CalificacionesService],
})
export class CalificacionesModule {}
