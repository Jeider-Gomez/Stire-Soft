import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvisoClase } from './entities/aviso-clase.entity';
import { AvisosClaseService } from './avisos-clase.service';
import { AvisosClaseController } from './avisos-clase.controller';
import { Class } from '../class/entities/class.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { AuthorizationModule } from '../common/authorization/authorization.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([AvisoClase, Class, Enrollment]), AuthorizationModule, NotificationsModule],
  controllers: [AvisosClaseController],
  providers: [AvisosClaseService],
})
export class AvisosClaseModule {}
