import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleRequest } from './entities/role-request.entity';
import { RoleRequestsController } from './role-requests.controller';
import { RoleRequestsService } from './role-requests.service';
import { AdminSystemModule } from '../admin-system/admin-system.module';

@Module({
  imports: [TypeOrmModule.forFeature([RoleRequest]), AdminSystemModule],
  controllers: [RoleRequestsController],
  providers: [RoleRequestsService],
  exports: [RoleRequestsService],
})
export class RoleRequestsModule {}
