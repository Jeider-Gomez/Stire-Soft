import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubmissionAnswer } from '../submission-answers/entities/submission-answer.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { ExecutionResult } from '../judge-engine/entities/execution-result.entity';
import { SubmissionStatus } from '../common/enums/submission-status.enum';

export interface CleanupSummary {
  orphanedAnswersFixed: number;
  staleSubmissionsClosed: number;
}

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    @InjectRepository(SubmissionAnswer) private readonly answersRepo: Repository<SubmissionAnswer>,
    @InjectRepository(Submission) private readonly submissionsRepo: Repository<Submission>,
    @InjectRepository(ExecutionResult) private readonly executionResultRepo: Repository<ExecutionResult>,
  ) {}

  /**
   * Ejecuta a medianoche. Un error no debe tumbar el planificador: se registra y se sigue.
   * La versión que informa el resultado (y lanza si falla) es `runCleanup`.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDeadlockCleanup(): Promise<void> {
    try {
      await this.runCleanup();
    } catch {
      // runCleanup ya dejó el error en el registro.
    }
  }

  /**
   * Limpia respuestas atascadas en limbo (isCorrect = null) cuyo intento ya no está en 'submitted',
   * y cierra con nota 0 los intentos que llevan más de 10 minutos esperando calificación.
   * Devuelve cuántos registros tocó; si algo falla, lo registra y VUELVE A LANZAR el error
   * para que quien llame (el endpoint de administración) no informe un éxito falso.
   */
  async runCleanup(): Promise<CleanupSummary> {
    this.logger.log('🧹 Iniciando limpieza de respuestas en limbo y submissions timeout/limbo...');
    const LIMBO_TIMEOUT_MINUTES = 10;
    const summary: CleanupSummary = { orphanedAnswersFixed: 0, staleSubmissionsClosed: 0 };

    try {
      // 1️⃣ Limpieza de respuestas huérfanas (isCorrect null) cuyo submission no está en estado 'submitted'
      const orphanedAnswers = await this.answersRepo.createQueryBuilder('sa')
        .innerJoinAndSelect('sa.submission', 's')
        .where('sa.isCorrect IS NULL')
        .andWhere('s.status != :status', { status: SubmissionStatus.SUBMITTED })
        .getMany();

      if (orphanedAnswers.length > 0) {
        this.logger.warn(`⚠ Detectadas ${orphanedAnswers.length} respuestas en limbo. Corrigiendo...`);
        for (const answer of orphanedAnswers) {
          answer.isCorrect = false;
          answer.score = 0;
          answer.feedback = 'Limpieza automática: Evaluación huérfana detectada.';
          await this.answersRepo.save(answer);
          this.logger.warn(`✔ Respuesta ID ${answer.id} de la entrega ${answer.submission.id} corregida automáticamente.`);
          summary.orphanedAnswersFixed++;
        }
      } else {
        this.logger.log('✅ No se encontraron respuestas en limbo.');
      }

      // 2️⃣ Limpieza de submissions en timeout o limbo que superan el umbral de tiempo
      const cutoff = new Date(Date.now() - LIMBO_TIMEOUT_MINUTES * 60 * 1000);
      const staleSubmissions = await this.submissionsRepo.createQueryBuilder('s')
        .leftJoinAndSelect('s.answers', 'a')
        .where('s.status = :status', { status: SubmissionStatus.SUBMITTED })
        .andWhere('s.updatedAt < :cutoff', { cutoff })
        .getMany();

      if (staleSubmissions.length > 0) {
        this.logger.warn(`⚠ Detectados ${staleSubmissions.length} submissions en estado SUBMITTED antiguos. Corrigiendo...`);
        for (const sub of staleSubmissions) {
          for (const answer of sub.answers) {
            answer.isCorrect = false;
            answer.score = 0;
            answer.feedback = 'Error: Tiempo de ejecución excedido - Intente optimizar su algoritmo';
            await this.answersRepo.save(answer);

            // Registrar el resultado de ejecución como time_limit
            const execResult = new ExecutionResult();
            execResult.submissionAnswer = answer;
            execResult.submissionAnswerId = answer.id;
            execResult.status = 'time_limit';
            execResult.stderr = 'Error: Tiempo de ejecución excedido - Intente optimizar su algoritmo';
            execResult.stdout = '';
            execResult.executionTimeMs = LIMBO_TIMEOUT_MINUTES * 60 * 1000;
            execResult.memoryUsedKB = 0;
            execResult.testCaseLabel = 'Timeout Cleanup';
            await this.executionResultRepo.save(execResult);
          }
          // Marcar la submission como 'graded' para permitir reintento
          sub.status = SubmissionStatus.GRADED;
          await this.submissionsRepo.save(sub);
          this.logger.warn(`✔ Submission ID ${sub.id} corregida y marcada como graded.`);
          summary.staleSubmissionsClosed++;
        }
      } else {
        this.logger.log('✅ No se encontraron submissions SUBMITTED antiguos.');
      }

      this.logger.log('✅ Limpieza completa de limbo y timeout/limbo.');
      return summary;
    } catch (error: any) {
      this.logger.error(`❌ Error durante la limpieza de limbo/timeout: ${error.message}`, error.stack);
      throw error;
    }
  }
}
