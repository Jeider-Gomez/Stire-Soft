import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SANDBOX_ADAPTER } from './sandbox-adapter.interface';
import type { SandboxAdapter } from './sandbox-adapter.interface';
import { ExecutionResultsRepository } from './judge-engine.repository';
import { JudgeAnswerGradedEvent } from '../common/events/judge-answer-graded.event';
import { JudgeAnswerFailedEvent } from '../common/events/judge-answer-failed.event';
import type { JudgeJobData } from './judge-queue.interface';

// Logica de calificacion real, extraida de JudgeWorker para que sea
// compartida por los dos modos de cola (ADR 08): JudgeWorker (BullMQ,
// QUEUE_DRIVER=redis) la invoca al recibir un job de Redis; el adaptador
// InlineJudgeQueueAdapter (QUEUE_DRIVER=inline) la invoca directamente,
// sin Redis de por medio.
//
// A proposito NO depende de SubmissionsService: eso creaba una dependencia
// circular real a nivel de instancia (SubmissionsService -> JUDGE_QUEUE ->
// JudgeExecutionService -> SubmissionsService), que ni forwardRef a nivel de
// modulo puede resolver porque no es un ciclo de imports, es un ciclo de
// construccion de objetos. Se rompe emitiendo eventos — coherente ademas con
// el resto del sistema event-driven (submission.graded) y cierra el hallazgo
// de arquitectura de la auditoria: "judge.worker.ts inyecta directamente
// SubmissionsService en vez de emitir un evento".
@Injectable()
export class JudgeExecutionService {
  private readonly logger = new Logger(JudgeExecutionService.name);

  constructor(
    @Inject(SANDBOX_ADAPTER) private readonly sandbox: SandboxAdapter,
    private readonly resultsRepo: ExecutionResultsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async gradeAnswer(data: JudgeJobData): Promise<{ success: boolean; score: number }> {
    const { submissionAnswerId, code, language, testCases } = data;

    let totalScore = 0;
    let allAccepted = true;
    let statusSummary = 'accepted';

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
      } else {
        allAccepted = false;
        statusSummary = runResult.status;
      }
    }

    const feedback = allAccepted
      ? '¡Excelente! Todos los casos pasaron.'
      : `Falló la evaluación: ${statusSummary}.`;

    // emitAsync (no emit): esperamos a que el listener persista la nota
    // antes de dar por terminado el job. Con emit() un fallo del listener
    // (p.ej. timeout de BD) se pierde en silencio — exactamente el defecto
    // P1-08 señalado en la auditoría para submission.graded.
    await this.eventEmitter.emitAsync(
      'judge.answer-graded',
      new JudgeAnswerGradedEvent(submissionAnswerId, allAccepted, totalScore, feedback),
    );

    return { success: true, score: totalScore };
  }

  async handleFailure(submissionAnswerId: number, errorMessage: string): Promise<void> {
    this.logger.warn(`Calificacion fallida para respuesta ${submissionAnswerId}: ${errorMessage}`);
    await this.eventEmitter.emitAsync(
      'judge.answer-failed',
      new JudgeAnswerFailedEvent(submissionAnswerId, errorMessage),
    );
  }

  // "Probar código" (EST-V03, Insumo 15 §7.1): ejecuta SOLO contra casos
  // públicos, reutilizando el mismo sandbox que gradeAnswer(), pero a
  // propósito NO persiste en ExecutionResultsRepository ni emite
  // 'judge.answer-graded' — no es una calificación, es un ensayo efímero
  // que no debe dejar rastro ni disparar el listener de submissions.
  async runPublicCases(
    code: string,
    language: string,
    testCases: Array<{ label?: string; input?: string; expected?: string; isPublic?: boolean }>,
  ): Promise<Array<{ label: string; passed: boolean; actualOutput: string; expectedOutput: string }>> {
    const publicCases = testCases.filter((tc) => tc.isPublic === true);

    const results: Array<{ label: string; passed: boolean; actualOutput: string; expectedOutput: string }> = [];
    for (const testCase of publicCases) {
      const runResult = await this.sandbox.executeIsolated(code, language, testCase);
      results.push({
        label: testCase.label || 'Caso público',
        passed: runResult.status === 'accepted',
        actualOutput: runResult.status === 'runtime_error' || runResult.status === 'time_limit'
          ? runResult.stderr || runResult.stdout
          : runResult.stdout,
        expectedOutput: testCase.expected ?? '',
      });
    }
    return results;
  }
}
