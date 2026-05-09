import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ActivityType } from './entities/activity-type.entity';

@Injectable()
export class ActivityTypesRepository extends Repository<ActivityType> {
  constructor(private dataSource: DataSource) {
    super(ActivityType, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<ActivityType | null> {
    return this.findOne({ where: { code } });
  }

  async findWithPagination(skip: number, limit: number, search?: string): Promise<[ActivityType[], number]> {
    const query = this.createQueryBuilder('activityType');

    if (search) {
      query.where('activityType.name ILIKE :search OR activityType.code ILIKE :search', {
        search: `%${search}%`,
      });
    }

    query.skip(skip).take(limit).orderBy('activityType.id', 'ASC');

    return query.getManyAndCount();
  }
}
