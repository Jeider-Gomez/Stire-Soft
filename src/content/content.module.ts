import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { ContentRepository } from './content.repository';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { AuthModule } from '../auth/auth.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Content]),
    AuthModule,
    ActivityLogModule,
  ],
  controllers: [ContentController],
  providers: [ContentRepository, ContentService],
  exports: [ContentService, ContentRepository],
})
export class ContentModule {}
