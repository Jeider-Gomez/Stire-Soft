import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ClassService } from '../class/class.service';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    private readonly classService: ClassService,
  ) {}

  /**
   * Crear una sección dentro de una clase.
   * Valida que el docente sea dueño de la clase.
   */
  async create(dto: CreateSectionDto, teacherId: number): Promise<Section> {
    const classEntity = await this.classService.findOne(dto.classId);

    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException('No eres el docente de esta clase.');
    }

    const section = this.sectionRepository.create({
      ...dto,
      order: dto.order ?? 0,
      isPublished: dto.isPublished ?? false,
    });

    return this.sectionRepository.save(section);
  }

  /**
   * Listar todas las secciones de una clase, ordenadas por su campo order.
   */
  async findByClass(classId: number): Promise<Section[]> {
    return this.sectionRepository.find({
      where: { classId },
      relations: ['topics', 'topics.learningUnits'],
      order: { order: 'ASC' },
    });
  }

  /**
   * Obtener una sección por su ID.
   */
  async findOne(id: number): Promise<Section> {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: ['topics', 'topics.learningUnits'],
    });

    if (!section) {
      throw new NotFoundException(`Sección con ID ${id} no encontrada`);
    }

    return section;
  }

  /**
   * Actualizar una sección.
   */
  async update(id: number, dto: UpdateSectionDto): Promise<Section> {
    const section = await this.findOne(id);
    Object.assign(section, dto);
    return this.sectionRepository.save(section);
  }

  /**
   * Publicar o despublicar una sección.
   */
  async togglePublish(id: number): Promise<Section> {
    const section = await this.findOne(id);
    section.isPublished = !section.isPublished;
    return this.sectionRepository.save(section);
  }

  /**
   * Eliminar una sección (hard delete — la cascada borra sus topics).
   */
  async remove(id: number): Promise<void> {
    const section = await this.findOne(id);
    await this.sectionRepository.remove(section);
  }
}
