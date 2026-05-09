import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LearningProgress } from './entities/learning-progress.entity';

@Injectable()
export class LearningProgressRepository extends Repository<LearningProgress> {
  constructor(private dataSource: DataSource) {
    super(LearningProgress, dataSource.createEntityManager());
  }

  async findOrCreate(studentId: number, learningUnitId: number): Promise<LearningProgress> {
    let progress = await this.findOne({ where: { studentId, learningUnitId } });
    if (!progress) {
      progress = this.create({ studentId, learningUnitId });
      progress = await this.save(progress);
    }
    return progress;
  }
}
