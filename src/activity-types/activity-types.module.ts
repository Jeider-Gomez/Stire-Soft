import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityTypesService } from './activity-types.service';
import { ActivityTypesController } from './activity-types.controller';
import { ActivityType } from './entities/activity-type.entity';
import { ActivityTypesRepository } from './activity-types.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityType])],
  controllers: [ActivityTypesController],
  providers: [ActivityTypesService, ActivityTypesRepository],
  exports: [ActivityTypesService, ActivityTypesRepository],
})
export class ActivityTypesModule {}
