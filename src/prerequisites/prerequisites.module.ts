import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prerequisite } from './entities/prerequisite.entity';
import { PrerequisitesService } from './prerequisites.service';

@Module({
  imports: [TypeOrmModule.forFeature([Prerequisite])],
  providers: [PrerequisitesService],
  exports: [PrerequisitesService],
})
export class PrerequisitesModule {}
