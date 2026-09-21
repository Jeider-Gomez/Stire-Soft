import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleRequest } from './entities/role-request.entity';
import { RoleRequestsController } from './role-requests.controller';
import { RoleRequestsService } from './role-requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoleRequest])],
  controllers: [RoleRequestsController],
  providers: [RoleRequestsService],
  exports: [RoleRequestsService],
})
export class RoleRequestsModule {}
