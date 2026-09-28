import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../common/authorization/authorization.module';
import { ReuseController } from './reuse.controller';
import { ReuseService } from './reuse.service';

@Module({
  imports: [AuthorizationModule],
  controllers: [ReuseController],
  providers: [ReuseService],
})
export class ReuseModule {}
