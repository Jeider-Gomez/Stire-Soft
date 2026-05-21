import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExecutionResult } from './entities/execution-result.entity';
import { ExecutionResultsRepository } from './judge-engine.repository';
import { DockerSandboxAdapter } from './docker-sandbox.service';
import { LocalProcessSandboxAdapter } from './local-process-sandbox.adapter';
import { SANDBOX_ADAPTER } from './sandbox-adapter.interface';
import { JudgeWorker } from './judge.worker';

import { SubmissionsModule } from '../submissions/submissions.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ExecutionResult]),
    SubmissionsModule,
  ],
  providers: [
    ExecutionResultsRepository,
    JudgeWorker,
    {
      provide: SANDBOX_ADAPTER,
      useFactory: (configService: ConfigService) => {
        const type = configService.get('SANDBOX_TYPE', 'docker');
        return type === 'local'
          ? new LocalProcessSandboxAdapter()
          : new DockerSandboxAdapter();
      },
      inject: [ConfigService],
    },
  ],
  exports: [ExecutionResultsRepository],
})
export class JudgeEngineModule {}
