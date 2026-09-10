import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThanOrEqual, LessThan } from 'typeorm';
import { ReviewSchedulesRepository } from './review-schedules.repository';
import { calculateNextReview } from '../common/utils/spaced-repetition';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/enums/notification-type.enum';

@Injectable()
export class ReviewSchedulesService {
  private readonly logger = new Logger(ReviewSchedulesService.name);

  constructor(
    private readonly reviewRepo: ReviewSchedulesRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async updateSchedule(studentId: number, learningUnitId: number, currentMastery: number) {
    const schedule = await this.reviewRepo.findOrCreate(studentId, learningUnitId);
    
    // Si mastery > 60, consideramos éxito y avanzamos el intervalo
    if (currentMastery >= 60) {
      schedule.repetitions += 1;
    } else {
      schedule.repetitions = 0; // Reseteamos si le va mal
    }

    const { nextReviewDate, intervalDays, easeFactor } = calculateNextReview(schedule.repetitions, currentMastery);

    schedule.nextReviewDate = nextReviewDate;
    schedule.intervalDays = intervalDays;
    schedule.easeFactor = easeFactor;
    schedule.lastReviewedAt = new Date();
    schedule.urgencyLevel = 0; // Reseteado al repasar

    await this.reviewRepo.save(schedule);
  }

  /**
   * Repasos del estudiante con nivel de urgencia calculado en vivo a partir
   * de nextReviewDate (no del urgencyLevel persistido, que solo se
   * actualiza una vez al día vía checkOverdueReviews): >1 día antes → al-dia,
   * mañana → manana, hoy → vencido, ya pasado → critico.
   */
  async getDueReviews(studentId: number) {
    const schedules = await this.reviewRepo.findDueForStudent(studentId);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return schedules.map((schedule) => {
      const reviewDay = new Date(schedule.nextReviewDate);
      reviewDay.setHours(0, 0, 0, 0);
      const daysUntil = Math.round((reviewDay.getTime() - startOfToday.getTime()) / 86400000);

      let urgency: 'al-dia' | 'manana' | 'vencido' | 'critico';
      if (daysUntil < 0) urgency = 'critico';
      else if (daysUntil === 0) urgency = 'vencido';
      else if (daysUntil === 1) urgency = 'manana';
      else urgency = 'al-dia';

      return {
        id: schedule.id,
        learningUnitId: schedule.learningUnitId,
        learningUnitTitle: schedule.learningUnit?.title ?? null,
        nextReviewDate: schedule.nextReviewDate,
        urgency,
        intervalDays: schedule.intervalDays,
        easeFactor: schedule.easeFactor,
        repetitions: schedule.repetitions,
      };
    });
  }

  /**
   * Tarea periódica para detectar repasos programados que han vencido.
   * Se ejecuta diariamente a la medianoche.
   * Actualiza el nivel de urgencia a 3 (vencido) y notifica al estudiante.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkOverdueReviews() {
    this.logger.log('Iniciando verificación programada de repasos vencidos (Cron)...');
    
    const overdueSchedules = await this.reviewRepo.find({
      where: {
        nextReviewDate: LessThanOrEqual(new Date()),
        urgencyLevel: LessThan(3),
      },
      relations: ['learningUnit'],
    });

    if (overdueSchedules.length === 0) {
      this.logger.log('No se encontraron repasos vencidos hoy.');
      return;
    }

    this.logger.log(`Se encontraron ${overdueSchedules.length} repasos vencidos. Actualizando nivel de urgencia...`);

    for (const schedule of overdueSchedules) {
      schedule.urgencyLevel = 3; // Urgente / Vencido
      await this.reviewRepo.save(schedule);

      const unitTitle = schedule.learningUnit?.title || 'la Unidad de Aprendizaje';
      
      try {
        await this.notificationsService.createNotification(
          schedule.studentId,
          'Repaso Vencido ⏰',
          `Tienes un repaso vencido para la Unidad de Aprendizaje "${unitTitle}". ¡Completa tu repaso diario!`,
          NotificationType.REVIEW_SCHEDULE,
        );
        this.logger.log(`Notificación de repaso vencido enviada al estudiante ${schedule.studentId} para unidad ${schedule.learningUnitId}`);
      } catch (error) {
        this.logger.error(`Error enviando notificación al estudiante ${schedule.studentId}: ${error.message}`);
      }
    }

    this.logger.log('Verificación de repasos vencidos finalizada.');
  }
}
