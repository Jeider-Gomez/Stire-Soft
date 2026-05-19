import { Module } from '@nestjs/common';
import { SandboxWatchdogService } from './sandbox-watchdog.service';

@Module({
  providers: [SandboxWatchdogService],
  exports: [SandboxWatchdogService],
})
export class WorkersModule {}
