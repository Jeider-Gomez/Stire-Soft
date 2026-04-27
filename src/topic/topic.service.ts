import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { ClassService } from '../class/class.service';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    private readonly classService: ClassService,
  ) {}

  /**
   * Crear un topic (valida que la clase exista)
   */
  async create(createDto: CreateTopicDto, teacherId: number): Promise<Topic> {
    // Verificar que la clase existe
    const classEntity = await this.classService.findOne(createDto.classId);

    // Verificar que el docente es dueño de la clase
    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException('No eres el docente de esta clase');
    }

    const topic = this.topicRepository.create(createDto);
    return await this.topicRepository.save(topic);
  }

  /**
   * Obtener topics de una clase
   */
  async findByClass(classId: number): Promise<Topic[]> {
    return await this.topicRepository.find({
      where: { classId, isActive: true },
      relations: ['learningUnits'],
      order: { order: 'ASC' },
    });
  }

  /**
   * Obtener un topic con sus unidades
   */
  async findOne(id: number): Promise<Topic> {
    const topic = await this.topicRepository.findOne({
      where: { id },
      relations: ['learningUnits', 'learningUnits.evaluations'],
    });

    if (!topic) {
      throw new NotFoundException(`Topic con ID ${id} no encontrado`);
    }

    return topic;
  }

  /**
   * Actualizar un topic
   */
  async update(id: number, updateDto: UpdateTopicDto): Promise<Topic> {
    const topic = await this.findOne(id);
    Object.assign(topic, updateDto);
    return await this.topicRepository.save(topic);
  }

  /**
   * Desactivar un topic
   */
  async remove(id: number): Promise<Topic> {
    const topic = await this.findOne(id);
    topic.isActive = false;
    return await this.topicRepository.save(topic);
  }
}
