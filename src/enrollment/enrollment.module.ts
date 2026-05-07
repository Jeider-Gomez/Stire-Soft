import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { EnrollmentService } from './enrollment.service';
import { ClassModule } from '../class/class.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment]),
    forwardRef(() => ClassModule),
    forwardRef(() => UserModule),
  ],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
