import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionResult } from './entities/execution-result.entity';
import { ExecutionResultsRepository } from './judge-engine.repository';
import { DockerSandboxService } from './docker-sandbox.service';

import { SubmissionsModule } from '../submissions/submissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExecutionResult]),
    SubmissionsModule,
  ],
  providers: [ExecutionResultsRepository, DockerSandboxService],
  exports: [ExecutionResultsRepository],
})
export class JudgeEngineModule {}
