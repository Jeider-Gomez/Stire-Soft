import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prerequisite } from './entities/prerequisite.entity';

@Injectable()
export class PrerequisitesService {
  constructor(
    @InjectRepository(Prerequisite)
    private readonly prerequisiteRepo: Repository<Prerequisite>,
  ) { }

  async getPrerequisitesForUnit(targetUnitId: number): Promise<Prerequisite[]> {
    return this.prerequisiteRepo.find({
      where: { targetUnitId },
      relations: ['requiredUnit'],
    });
  }
}
