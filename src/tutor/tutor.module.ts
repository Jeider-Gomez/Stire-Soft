import { Module } from '@nestjs/common';
import { TutorService } from './tutor.service';
import { TutorController } from './tutor.controller';
import { ProgressModule } from '../progress/progress.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ProgressModule,
    UserModule,
    AuthModule,
  ],
  controllers: [TutorController],
  providers: [TutorService],
})
export class TutorModule {}
