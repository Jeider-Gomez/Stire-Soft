import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ActivityQuestion } from './entities/activity-question.entity';

@Injectable()
export class ActivityQuestionsRepository extends Repository<ActivityQuestion> {
  constructor(private dataSource: DataSource) {
    super(ActivityQuestion, dataSource.createEntityManager());
  }

  async findByActivityId(activityId: number): Promise<ActivityQuestion[]> {
    return this.find({
      where: { activityId },
      order: { order: 'ASC', id: 'ASC' },
    });
  }
}
