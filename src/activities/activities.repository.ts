import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { PublicationStatus } from '../common/enums/status.enum';

@Injectable()
export class ActivitiesRepository extends Repository<Activity> {
  constructor(private dataSource: DataSource) {
    super(Activity, dataSource.createEntityManager());
  }

  async findWithPagination(skip: number, limit: number, search?: string, learningUnitId?: number): Promise<[Activity[], number]> {
    const query = this.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.activityType', 'activityType')
      .leftJoinAndSelect('activity.creator', 'creator')
      .leftJoinAndSelect('activity.learningUnit', 'learningUnit');

    if (search) {
      query.andWhere('activity.title ILIKE :search', { search: `%${search}%` });
    }

    if (learningUnitId) {
      query.andWhere('activity.learningUnitId = :learningUnitId', { learningUnitId });
    }

    query.skip(skip).take(limit).orderBy('activity.order', 'ASC').addOrderBy('activity.id', 'ASC');

    return query.getManyAndCount();
  }

  async updateStatus(id: number, status: PublicationStatus, publishedAt?: Date): Promise<void> {
    const updateData: Partial<Activity> = { status };
    if (publishedAt) updateData.publishedAt = publishedAt;
    
    await this.update(id, updateData);
  }
}
