import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reporte } from './entities/reporte.entity';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { User } from '../user/entities/user.entity';
import { Class } from '../class/entities/class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reporte, User, Class])],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
