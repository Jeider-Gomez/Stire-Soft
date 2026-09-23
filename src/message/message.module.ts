import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message } from './entities/message.entity';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../common/authorization/authorization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    AuthModule,
    AuthorizationModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
