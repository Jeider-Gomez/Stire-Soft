import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ActivitiesRepository } from './activities.repository';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Activity } from './entities/activity.entity';
import { PublicationStatus } from '../common/enums/status.enum';

@Injectable()
export class ActivitiesService {
  constructor(private readonly activitiesRepo: ActivitiesRepository) {}

  async create(createActivityDto: CreateActivityDto, userId: number): Promise<Activity> {
    const activity = this.activitiesRepo.create({
      ...createActivityDto,
      createdBy: userId,
      status: PublicationStatus.DRAFT,
    });
    return this.activitiesRepo.save(activity);
  }

  async findAll(paginationQuery: PaginationQueryDto, learningUnitId?: number) {
    const { skip, limit, search } = paginationQuery;
    const [items, total] = await this.activitiesRepo.findWithPagination(skip || 0, limit || 10, search, learningUnitId);
    return {
      data: items,
      meta: {
        totalItems: total,
        itemsPerPage: limit || 10,
        currentPage: paginationQuery.page || 1,
      },
    };
  }

  async findOne(id: number): Promise<Activity> {
    const activity = await this.activitiesRepo.findOne({
      where: { id },
      relations: ['activityType', 'creator', 'learningUnit'],
    });
    
    if (!activity) {
      throw new NotFoundException(`Actividad con id ${id} no encontrada`);
    }
    return activity;
  }

  async update(id: number, updateActivityDto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.findOne(id);
    
    if (activity.status === PublicationStatus.ARCHIVED) {
        throw new BadRequestException('No se puede modificar una actividad archivada.');
    }

    this.activitiesRepo.merge(activity, updateActivityDto);
    return this.activitiesRepo.save(activity);
  }

  async changeStatus(id: number, status: PublicationStatus): Promise<Activity> {
    const activity = await this.findOne(id);
    
    let publishedAt = activity.publishedAt;
    if (status === PublicationStatus.PUBLISHED && !activity.publishedAt) {
      publishedAt = new Date();
    }

    await this.activitiesRepo.updateStatus(id, status, publishedAt);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const activity = await this.findOne(id);
    await this.activitiesRepo.softRemove(activity);
  }
}
