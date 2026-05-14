import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { UserAffiliation } from './entities/user-affiliation.entity';
import { InstitutionModule } from '../institution/institution.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserAffiliation]),
    InstitutionModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  // Exportar el servicio para usarlo en otros módulos (como Auth)
  exports: [UserService],
})
export class UserModule {}