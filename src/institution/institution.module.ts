import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionController } from './institution.controller';
import { InstitutionService } from './institution.service';
import { Institution } from './entities/institution.entity';
import { Program } from './entities/program.entity';
import { Asignatura } from './entities/asignatura.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Institution, Program, Asignatura])],
  controllers: [InstitutionController],
  providers: [InstitutionService],
  exports: [InstitutionService],
})
export class InstitutionModule {}
