import { Logger } from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ExecutionResultsRepository } from './judge-engine.repository';
import { DockerSandboxService } from './docker-sandbox.service';
import { SubmissionsService } from '../submissions/submissions.service';

@Processor('judge')
export class JudgeWorker extends WorkerHost {
  private readonly logger = new Logger(JudgeWorker.name);

  constructor(
    private readonly sandbox: DockerSandboxService,
    private readonly resultsRepo: ExecutionResultsRepository,
    private readonly submissionsService: SubmissionsService,
  ) {
    super();
  }

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

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    this.logger.error(`Trabajo ${job.id} falló con error: ${error.message}`);
    
    if (job.attemptsMade >= (job.opts?.attempts || 1)) {
      this.logger.warn(`Trabajo ${job.id} ha fallado definitivamente (DLQ). Marcando submission como fallida.`);
      const { submissionAnswerId } = job.data;
      if (submissionAnswerId) {
        await this.submissionsService.markAsFailed(submissionAnswerId, error.message);
      }
    }
  }
}
