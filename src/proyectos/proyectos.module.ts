import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from './entities/proyecto.entity';
import { ProyectoEnvio } from './entities/proyecto-envio.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Class } from '../class/entities/class.entity';
import { User } from '../user/entities/user.entity';
import { AuthorizationModule } from '../common/authorization/authorization.module';
import { ProyectosService } from './proyectos.service';
import { ProyectosController } from './proyectos.controller';
import { ProyectoEnviosService } from './proyecto-envios.service';
import { ProyectoEnviosController } from './proyecto-envios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Proyecto, ProyectoEnvio, Enrollment, Class, User]), AuthorizationModule],
  controllers: [ProyectosController, ProyectoEnviosController],
  providers: [ProyectosService, ProyectoEnviosService],
})
export class ProyectosModule {}
