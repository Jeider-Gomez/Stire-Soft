import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesionAsistencia } from './entities/sesion-asistencia.entity';
import { RegistroAsistencia } from './entities/registro-asistencia.entity';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaController } from './asistencia.controller';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Class } from '../class/entities/class.entity';
import { AuthorizationModule } from '../common/authorization/authorization.module';

@Module({
  imports: [TypeOrmModule.forFeature([SesionAsistencia, RegistroAsistencia, Enrollment, Class]), AuthorizationModule],
  controllers: [AsistenciaController],
  providers: [AsistenciaService],
})
export class AsistenciaModule {}
