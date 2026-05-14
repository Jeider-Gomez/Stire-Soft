import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institution } from './entities/institution.entity';
import { Program } from './entities/program.entity';

@Injectable()
export class InstitutionService {
  constructor(
    @InjectRepository(Institution)
    private readonly institutionRepo: Repository<Institution>,
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
  ) {}

  async findAllInstitutions() {
    return this.institutionRepo.find();
  }

  async createInstitution(data: { name: string }) {
    const institution = this.institutionRepo.create(data);
    return this.institutionRepo.save(institution);
  }

  async findAllPrograms(institutionId?: number) {
    const query = this.programRepo.createQueryBuilder('program');
    if (institutionId) {
      query.where('program.institutionId = :institutionId', { institutionId });
    }
    return query.getMany();
  }

  async createProgram(data: { name: string; maxSemesters: number; institutionId: number }) {
    const program = this.programRepo.create(data);
    return this.programRepo.save(program);
  }

  async findProgramById(id: number) {
    const program = await this.programRepo.findOne({ where: { id } });
    if (!program) {
      throw new NotFoundException(`Programa con ID ${id} no encontrado`);
    }
    return program;
  }
}
