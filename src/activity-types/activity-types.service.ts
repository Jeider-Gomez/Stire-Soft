import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ActivityTypesRepository } from './activity-types.repository';
import { CreateActivityTypeDto } from './dto/create-activity-type.dto';
import { UpdateActivityTypeDto } from './dto/update-activity-type.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ActivityType } from './entities/activity-type.entity';

@Injectable()
export class ActivityTypesService {
  constructor(private readonly activityTypeRepo: ActivityTypesRepository) {}

  async create(createActivityTypeDto: CreateActivityTypeDto): Promise<ActivityType> {
    const existing = await this.activityTypeRepo.findByCode(createActivityTypeDto.code);
    if (existing) {
      throw new ConflictException(`Ya existe un tipo de actividad con el código '${createActivityTypeDto.code}'`);
    }

    const activityType = this.activityTypeRepo.create(createActivityTypeDto);
    return this.activityTypeRepo.save(activityType);
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { skip, limit, search } = paginationQuery;
    const [items, total] = await this.activityTypeRepo.findWithPagination(skip || 0, limit || 10, search);
    return {
      data: items,
      meta: {
        totalItems: total,
        itemsPerPage: limit,
        currentPage: paginationQuery.page || 1,
      },
    };
  }

  async findOne(id: number): Promise<ActivityType> {
    const activityType = await this.activityTypeRepo.findOne({ where: { id } });
    if (!activityType) {
      throw new NotFoundException(`Tipo de actividad con id ${id} no encontrado`);
    }
    return activityType;
  }

  async update(id: number, updateActivityTypeDto: UpdateActivityTypeDto): Promise<ActivityType> {
    const activityType = await this.findOne(id);

    if (updateActivityTypeDto.code && updateActivityTypeDto.code !== activityType.code) {
      const existing = await this.activityTypeRepo.findByCode(updateActivityTypeDto.code);
      if (existing) {
        throw new ConflictException(`Ya existe un tipo de actividad con el código '${updateActivityTypeDto.code}'`);
      }
    }

    this.activityTypeRepo.merge(activityType, updateActivityTypeDto);
    return this.activityTypeRepo.save(activityType);
  }

  async remove(id: number): Promise<void> {
    const activityType = await this.findOne(id);
    await this.activityTypeRepo.softRemove(activityType);
  }
}
