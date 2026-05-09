import { Injectable } from '@nestjs/common';
import { ReviewSchedulesRepository } from './review-schedules.repository';
import { calculateNextReview } from '../common/utils/spaced-repetition';

@Injectable()
export class ReviewSchedulesService {
  constructor(private readonly reviewRepo: ReviewSchedulesRepository) {}

  async updateSchedule(studentId: number, learningUnitId: number, currentMastery: number) {
    const schedule = await this.reviewRepo.findOrCreate(studentId, learningUnitId);
    
    // Si mastery > 60, consideramos éxito y avanzamos el intervalo
    if (currentMastery >= 60) {
      schedule.repetitions += 1;
    } else {
      schedule.repetitions = 0; // Reseteamos si le va mal
    }

    const { nextReviewDate, intervalDays } = calculateNextReview(schedule.repetitions, currentMastery);

    schedule.nextReviewDate = nextReviewDate;
    schedule.intervalDays = intervalDays;
    schedule.lastReviewedAt = new Date();
    schedule.urgencyLevel = 0; // Reseteado al repasar

    await this.reviewRepo.save(schedule);
  }
}
