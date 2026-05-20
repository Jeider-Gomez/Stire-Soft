import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubmissionAnswer } from '../submission-answers/entities/submission-answer.entity';
import { Submission } from '../submissions/entities/submission.entity';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    @InjectRepository(SubmissionAnswer) private readonly answersRepo: Repository<SubmissionAnswer>,
    @InjectRepository(Submission) private readonly submissionsRepo: Repository<Submission>,
  ) {}

  /**
   * Ejecuta a medianoche para limpiar respuestas atascadas en limbo (isCorrect = null)
   * donde el intento general ya no está en estado 'submitted' o en cola.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDeadlockCleanup() {
    this.logger.log('🧹 Iniciando limpieza automática de respuestas en limbo y submissions timeout/limbo...');
    const LIMBO_TIMEOUT_MINUTES = 10;
    
    try {
      // 1️⃣ Limpieza de respuestas huérfanas (isCorrect null) cuyo submission no está en estado 'submitted'
      const orphanedAnswers = await this.answersRepo.createQueryBuilder('sa')
        .innerJoinAndSelect('sa.submission', 's')
        .where('sa.isCorrect IS NULL')
        .andWhere('s.status != :status', { status: 'submitted' })
        .getMany();

      if (orphanedAnswers.length > 0) {
        this.logger.warn(`⚠ Detectadas ${orphanedAnswers.length} respuestas en limbo. Corrigiendo...`);
        for (const answer of orphanedAnswers) {
          answer.isCorrect = false;
          answer.score = 0;
          answer.feedback = 'Limpieza automática: Evaluación huérfana detectada.';
          await this.answersRepo.save(answer);
          this.logger.warn(`✔ Respuesta ID ${answer.id} de la entrega ${answer.submission.id} corregida automáticamente.`);
        }
      } else {
        this.logger.log('✅ No se encontraron respuestas en limbo.');
      }

      // 2️⃣ Limpieza de submissions en timeout o limbo que superan el umbral de tiempo
      const cutoff = new Date(Date.now() - LIMBO_TIMEOUT_MINUTES * 60 * 1000);
      const staleSubmissions = await this.submissionsRepo.createQueryBuilder('s')
        .leftJoinAndSelect('s.answers', 'a')
        .where('s.status IN (:...statuses)', { statuses: ['timeout', 'limbo'] })
        .andWhere('s.updatedAt < :cutoff', { cutoff })
        .getMany();

      if (staleSubmissions.length > 0) {
        this.logger.warn(`⚠ Detectados ${staleSubmissions.length} submissions en estado timeout/limbo antiguos. Corrigiendo...`);
        for (const sub of staleSubmissions) {
          for (const answer of sub.answers) {
            answer.isCorrect = false;
            answer.score = 0;
            answer.feedback = 'Error: Tiempo de ejecución excedido - Intente optimizar su algoritmo';
            await this.answersRepo.save(answer);
          }
          // Marcar la submission como 'graded' para permitir reintento
          sub.status = 'graded';
          await this.submissionsRepo.save(sub);
          this.logger.warn(`✔ Submission ID ${sub.id} corregida y marcada como graded.`);
        }
      } else {
        this.logger.log('✅ No se encontraron submissions timeout/limbo antiguos.');
      }

      this.logger.log('✅ Limpieza completa de limbo y timeout/limbo.');
    } catch (error: any) {
      this.logger.error(`❌ Error durante la limpieza de limbo/timeout: ${error.message}`, error.stack);
    }
  }
}
