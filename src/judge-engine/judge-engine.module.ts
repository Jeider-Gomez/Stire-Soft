import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionResult } from './entities/execution-result.entity';
import { ExecutionResultsRepository } from './judge-engine.repository';
import { DockerSandboxService } from './docker-sandbox.service';
import { JudgeWorker } from './judge.worker';

@Module({
  imports: [TypeOrmModule.forFeature([ExecutionResult])],
  providers: [ExecutionResultsRepository, DockerSandboxService, JudgeWorker],
  exports: [ExecutionResultsRepository, JudgeWorker],
})
export class JudgeEngineModule {}
