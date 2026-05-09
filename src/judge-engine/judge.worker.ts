import { Injectable, Logger } from '@nestjs/common';
import { ExecutionResultsRepository } from './judge-engine.repository';
import { DockerSandboxService } from './docker-sandbox.service';

// Mock de Job interface de BullMQ para evitar dependencias fallidas si no está instalado
interface Job<T> { data: T; id: string; }

@Injectable()
export class JudgeWorker {
  private readonly logger = new Logger(JudgeWorker.name);

  constructor(
    private readonly sandbox: DockerSandboxService,
    private readonly resultsRepo: ExecutionResultsRepository,
  ) {}

  // @Processor('judge_queue') en la implementación real de BullMQ
  async process(job: Job<any>): Promise<any> {
    const { submissionAnswerId, code, language, testCases } = job.data;
    
    let totalScore = 0;
    
    for (const testCase of testCases) {
      this.logger.log(`Procesando Test Case ${testCase.label || 'Oculto'}`);
      
      const runResult = await this.sandbox.executeIsolated(code, language, testCase);
      
      await this.resultsRepo.save({
        submissionAnswerId,
        status: runResult.status,
        stdout: runResult.stdout,
        stderr: runResult.stderr,
        executionTimeMs: runResult.timeMs,
        memoryUsedKB: runResult.memoryKb,
        testCaseLabel: testCase.label,
      });

      if (runResult.status === 'accepted') {
        totalScore += testCase.weight || 10;
      }
      
      // Emitir progreso por WebSockets a través de un Gateway
    }

    return { success: true, score: totalScore };
  }
}
