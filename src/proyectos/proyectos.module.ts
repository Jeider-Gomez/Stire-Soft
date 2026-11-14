import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from './entities/proyecto.entity';
import { ProyectoEnvio } from './entities/proyecto-envio.entity';
import { Entrega } from './entities/entrega.entity';
import { EntregaEvento } from './entities/entrega-evento.entity';
import { LaboratorioPublicacion } from './entities/laboratorio-publicacion.entity';
import { LaboratorioMeGusta } from './entities/laboratorio-me-gusta.entity';
import { LaboratorioComentario } from './entities/laboratorio-comentario.entity';
import { LaboratorioReporte } from './entities/laboratorio-reporte.entity';
import { LaboratorioService } from './laboratorio.service';
import { LaboratorioController } from './laboratorio.controller';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Class } from '../class/entities/class.entity';
import { User } from '../user/entities/user.entity';
import { AuthorizationModule } from '../common/authorization/authorization.module';
import { ProyectosService } from './proyectos.service';
import { ProyectosController } from './proyectos.controller';
import { ProyectoEnviosService } from './proyecto-envios.service';
import { ProyectoEnviosController } from './proyecto-envios.controller';
import { EntregasService } from './entregas.service';
import { EntregasController } from './entregas.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Proyecto, ProyectoEnvio, Entrega, EntregaEvento, LaboratorioPublicacion, LaboratorioMeGusta, LaboratorioComentario, LaboratorioReporte, Enrollment, Class, User]), AuthorizationModule, NotificationsModule],
  controllers: [ProyectosController, ProyectoEnviosController, EntregasController, LaboratorioController],
  providers: [ProyectosService, ProyectoEnviosService, EntregasService, LaboratorioService],
})
export class ProyectosModule {}
