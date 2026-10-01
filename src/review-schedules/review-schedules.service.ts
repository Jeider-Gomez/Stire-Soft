import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThanOrEqual, LessThan } from 'typeorm';
import { ReviewSchedulesRepository } from './review-schedules.repository';
import { calculateNextReview, CalidadRepaso } from '../common/utils/spaced-repetition';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/enums/notification-type.enum';
import { diasEntre } from '../common/utils/dia-colombia';

@Injectable()
export class ReviewSchedulesService {
  private readonly logger = new Logger(ReviewSchedulesService.name);

  constructor(
    private readonly reviewRepo: ReviewSchedulesRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  /** ¿La unidad tiene un repaso que ya tocaba? Un intento calificado ahora cuenta como repaso. */
  async estaVencido(studentId: number, learningUnitId: number, ahora: Date = new Date()): Promise<boolean> {
    const schedule = await this.reviewRepo.findOne({ where: { studentId, learningUnitId } });
    return !!schedule && schedule.nextReviewDate.getTime() <= ahora.getTime();
  }

  /**
   * Registra el resultado de un intento calificado en el calendario de repasos de la unidad.
   * - Primer intento de la unidad: crea el calendario (primer repaso al día siguiente si le fue bien).
   * - Repaso vencido: un paso de SM-2 con la calidad del resultado; si falló, el intervalo vuelve a empezar.
   * - Práctica antes de la fecha: no mueve el calendario. Antes cada ejercicio del mismo día contaba como un repaso
   *   más y el intervalo crecía sin que el estudiante hubiera dejado pasar tiempo.
   */
  async registrarResultado(
    studentId: number,
    learningUnitId: number,
    calidad: CalidadRepaso,
    ahora: Date = new Date(),
  ): Promise<{ esRepaso: boolean }> {
    const existente = await this.reviewRepo.findOne({ where: { studentId, learningUnitId } });
    if (existente && existente.nextReviewDate.getTime() > ahora.getTime()) return { esRepaso: false };

    const schedule =
      existente ?? this.reviewRepo.create({ studentId, learningUnitId, repetitions: 0, intervalDays: 1, easeFactor: 2.5 });
    const siguiente = calculateNextReview(
      { repetitions: schedule.repetitions, intervalDays: schedule.intervalDays, easeFactor: schedule.easeFactor },
      calidad,
      ahora,
    );

    schedule.repetitions = siguiente.repetitions;
    schedule.intervalDays = siguiente.intervalDays;
    schedule.easeFactor = siguiente.easeFactor;
    schedule.nextReviewDate = siguiente.nextReviewDate;
    schedule.lastReviewedAt = ahora;
    schedule.urgencyLevel = 0;

    await this.reviewRepo.save(schedule);
    return { esRepaso: !!existente };
  }

  /**
   * Repasos del estudiante con nivel de urgencia calculado en vivo a partir
   * de nextReviewDate (no del urgencyLevel persistido, que solo se
   * actualiza una vez al día vía checkOverdueReviews): >1 día antes → al-dia,
   * mañana → manana, hoy → vencido, ya pasado → critico. Los días son los de Colombia, no los del servidor (UTC).
   */
  async getDueReviews(studentId: number, ahora: Date = new Date()) {
    const schedules = await this.reviewRepo.findDueForStudent(studentId);

    return schedules.map((schedule) => {
      const daysUntil = diasEntre(ahora, new Date(schedule.nextReviewDate));

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
