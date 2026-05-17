import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Content } from './entities/content.entity';

@Injectable()
export class ContentRepository extends Repository<Content> {
  constructor(private dataSource: DataSource) {
    super(Content, dataSource.createEntityManager());
  }

  async findByUnit(learningUnitId: number): Promise<Content[]> {
    return this.find({
      where: { learningUnitId, isVisible: true },
      order: { order: 'ASC', id: 'ASC' },
    });
  }

  async findByUnitAll(learningUnitId: number): Promise<Content[]> {
    return this.find({
      where: { learningUnitId },
      order: { order: 'ASC', id: 'ASC' },
    });
  }
}
