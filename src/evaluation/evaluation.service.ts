import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluation } from './entities/evaluation.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
  ) {}

  /**
   * Crear una evaluación
   */
  async create(createDto: CreateEvaluationDto): Promise<Evaluation> {
    const evaluation = this.evaluationRepository.create(createDto);
    return await this.evaluationRepository.save(evaluation);
  }

  /**
   * Obtener evaluaciones de una unidad de aprendizaje
   */
  async findByUnit(unitId: number): Promise<Evaluation[]> {
    return await this.evaluationRepository.find({
      where: { learningUnitId: unitId, isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Obtener evaluaciones activas de una unidad (para cálculo de mastery)
   */
  async findActiveByUnit(unitId: number): Promise<Evaluation[]> {
    return await this.evaluationRepository.find({
      where: { learningUnitId: unitId, isActive: true },
    });
  }

  /**
   * Obtener una evaluación por ID
   */
  async findOne(id: number): Promise<Evaluation> {
    const evaluation = await this.evaluationRepository.findOne({
      where: { id },
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluación con ID ${id} no encontrada`);
    }

    return evaluation;
  }

  /**
   * Actualizar una evaluación
   */
  async update(id: number, updateDto: UpdateEvaluationDto): Promise<Evaluation> {
    const evaluation = await this.findOne(id);
    Object.assign(evaluation, updateDto);
    return await this.evaluationRepository.save(evaluation);
  }

  /**
   * Desactivar una evaluación (no eliminar para preservar submissions)
   */
  async remove(id: number): Promise<Evaluation> {
    const evaluation = await this.findOne(id);
    evaluation.isActive = false;
    return await this.evaluationRepository.save(evaluation);
  }
}
