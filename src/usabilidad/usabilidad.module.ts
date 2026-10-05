import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncuestaSus } from './entities/encuesta-sus.entity';
import { UsabilidadService } from './usabilidad.service';
import { UsabilidadController } from './usabilidad.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EncuestaSus])],
  controllers: [UsabilidadController],
  providers: [UsabilidadService],
})
export class UsabilidadModule {}
