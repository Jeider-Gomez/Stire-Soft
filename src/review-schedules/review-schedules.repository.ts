import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ReviewSchedule } from './entities/review-schedule.entity';

@Injectable()
export class ReviewSchedulesRepository extends Repository<ReviewSchedule> {
  constructor(private dataSource: DataSource) {
    super(ReviewSchedule, dataSource.createEntityManager());
  }

  /** Todos los repasos del propio estudiante, del más próximo/vencido al más lejano. */
  async findDueForStudent(studentId: number): Promise<ReviewSchedule[]> {
    return this.find({
      where: { studentId },
      relations: ['learningUnit'],
      order: { nextReviewDate: 'ASC' },
    });
  }
}
