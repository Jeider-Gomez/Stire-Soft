import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from './entities/proyecto.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { ProyectosService } from './proyectos.service';
import { ProyectosController } from './proyectos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Proyecto, Enrollment])],
  controllers: [ProyectosController],
  providers: [ProyectosService],
})
export class ProyectosModule {}
