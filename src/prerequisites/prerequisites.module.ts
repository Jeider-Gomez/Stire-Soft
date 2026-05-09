import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prerequisite } from './entities/prerequisite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prerequisite])],
})
export class PrerequisitesModule {}
