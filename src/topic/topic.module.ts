import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { Topic } from './entities/topic.entity';
import { ClassModule } from '../class/class.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Topic]),
    ClassModule,
    AuthModule,
  ],
  controllers: [TopicController],
  providers: [TopicService],
  exports: [TopicService],
})
export class TopicModule {}
