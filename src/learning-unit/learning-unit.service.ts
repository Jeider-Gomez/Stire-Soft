import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningUnit } from './entities/learning-unit.entity';
import { CreateLearningUnitDto } from './dto/create-learning-unit.dto';
import { UpdateLearningUnitDto } from './dto/update-learning-unit.dto';

@Injectable()
export class LearningUnitService {
  constructor(
    @InjectRepository(LearningUnit)
    private readonly learningUnitRepository: Repository<LearningUnit>,
  ) {}

  /**
   * Crear una nueva unidad de aprendizaje
   */
  async create(createDto: CreateLearningUnitDto): Promise<LearningUnit> {
    const unit = this.learningUnitRepository.create(createDto);
    return await this.learningUnitRepository.save(unit);
  }

  /**
   * Obtener todas las unidades de aprendizaje activas
   */
  async findAll(): Promise<LearningUnit[]> {
    return await this.learningUnitRepository.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });
  }

  /**
   * Obtener todas las unidades (incluyendo inactivas, para admin/docente)
   */
  async findAllIncludingInactive(): Promise<LearningUnit[]> {
    return await this.learningUnitRepository.find({
      order: { order: 'ASC' },
    });
  }

  /**
   * Obtener todas las unidades de una clase
   */
  async findByClass(classId: number): Promise<LearningUnit[]> {
    return await this.learningUnitRepository
      .createQueryBuilder('unit')
      .innerJoin('unit.topic', 'topic')
      .where('topic.classId = :classId', { classId })
      .orderBy('unit.order', 'ASC')
      .getMany();
  }

  /**
   * Obtener una unidad por ID
   */
  async findOne(id: number): Promise<LearningUnit> {
    const unit = await this.learningUnitRepository.findOne({ where: { id } });

    if (!unit) {
      throw new NotFoundException(`Unidad de aprendizaje con ID ${id} no encontrada`);
    }

    return unit;
  }

  /**
   * Actualizar una unidad de aprendizaje
   */
  async update(id: number, updateDto: UpdateLearningUnitDto): Promise<LearningUnit> {
    const unit = await this.findOne(id);
    Object.assign(unit, updateDto);
    return await this.learningUnitRepository.save(unit);
  }

  /**
   * Eliminar una unidad de aprendizaje
   */
  async remove(id: number): Promise<void> {
    const unit = await this.findOne(id);
    await this.learningUnitRepository.remove(unit);
  }
}
