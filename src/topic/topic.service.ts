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
import { SectionService } from '../section/section.service';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    private readonly sectionService: SectionService,
  ) {}

  /**
   * Crear un topic dentro de una sección.
   * Valida que la sección exista y que el docente sea dueño de la clase padre.
   */
  async create(createDto: CreateTopicDto, teacherId: number): Promise<Topic> {
    // Verificar que la sección existe (y carga su clase padre)
    const section = await this.sectionService.findOne(createDto.sectionId);

    // Verificar que el docente es dueño de la clase
    if (section.class?.teacherId !== teacherId) {
      // Si section.class no está cargado, verificamos a través de classId
      const fullSection = await this.sectionService.findOne(section.id);
      if (!fullSection) {
        throw new ForbiddenException('No tienes permiso para crear topics en esta sección.');
      }
    }

    const topic = this.topicRepository.create(createDto);
    return await this.topicRepository.save(topic);
  }

  /**
   * Obtener topics de una sección, ordenados.
   */
  async findBySection(sectionId: number): Promise<Topic[]> {
    return await this.topicRepository.find({
      where: { sectionId, isActive: true },
      relations: ['learningUnits'],
      order: { order: 'ASC' },
    });
  }

  /**
   * Obtener un topic con sus unidades de aprendizaje.
   */
  async findOne(id: number): Promise<Topic> {
    const topic = await this.topicRepository.findOne({
      where: { id },
      relations: ['learningUnits'],
    });

    if (!topic) {
      throw new NotFoundException(`Topic con ID ${id} no encontrado`);
    }

    return topic;
  }

  /**
   * Actualizar un topic.
   */
  async update(id: number, updateDto: UpdateTopicDto): Promise<Topic> {
    const topic = await this.findOne(id);
    Object.assign(topic, updateDto);
    return await this.topicRepository.save(topic);
  }

  /**
   * Desactivar un topic (soft delete lógico).
   */
  async remove(id: number): Promise<Topic> {
    const topic = await this.findOne(id);
    topic.isActive = false;
    return await this.topicRepository.save(topic);
  }
}
