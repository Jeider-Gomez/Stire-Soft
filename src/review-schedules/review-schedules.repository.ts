import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ReviewSchedule } from './entities/review-schedule.entity';

@Injectable()
export class ReviewSchedulesRepository extends Repository<ReviewSchedule> {
  constructor(private dataSource: DataSource) {
    super(ReviewSchedule, dataSource.createEntityManager());
  }

  async findOrCreate(studentId: number, learningUnitId: number): Promise<ReviewSchedule> {
    let schedule = await this.findOne({ where: { studentId, learningUnitId } });
    if (!schedule) {
      schedule = this.create({ studentId, learningUnitId, nextReviewDate: new Date() });
      schedule = await this.save(schedule);
    }
    return schedule;
  }
}
