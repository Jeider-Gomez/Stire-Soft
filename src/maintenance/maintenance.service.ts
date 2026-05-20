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
    this.logger.log('🧹 Iniciando limpieza automática de respuestas en limbo...');
    
    try {
      const orphanedAnswers = await this.answersRepo.createQueryBuilder('sa')
        .innerJoinAndSelect('sa.submission', 's')
        .where('sa.isCorrect IS NULL')
        .andWhere('s.status != :status', { status: 'submitted' })
        .getMany();

      if (orphanedAnswers.length === 0) {
        this.logger.log('✅ No se encontraron respuestas en limbo.');
        return;
      }

      this.logger.warn(`⚠ Detectadas ${orphanedAnswers.length} respuestas en limbo. Corrigiendo...`);

      for (const answer of orphanedAnswers) {
        answer.isCorrect = false;
        answer.score = 0;
        answer.feedback = 'Limpieza automática: Evaluación huérfana detectada.';
        await this.answersRepo.save(answer);
        
        this.logger.warn(`✔ Respuesta ID ${answer.id} de la entrega ${answer.submission.id} corregida automáticamente.`);
      }

      this.logger.log('✅ Limpieza de limbo de base de datos finalizada.');
    } catch (error: any) {
      this.logger.error(`❌ Error durante la limpieza de limbo de base de datos: ${error.message}`, error.stack);
    }
  }
}
