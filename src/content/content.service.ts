import { Injectable, NotFoundException } from '@nestjs/common';
import { Content } from './entities/content.entity';
import { ContentRepository } from './content.repository';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';

@Injectable()
export class ContentService {
  constructor(private readonly contentRepo: ContentRepository) {}

  async create(dto: CreateContentDto): Promise<Content> {
    const content = this.contentRepo.create({
      ...dto,
      order: dto.order ?? 0,
      isVisible: dto.isVisible ?? true,
    });
    return this.contentRepo.save(content);
  }

  /** Listar bloques visibles de una unidad (para estudiantes) */
  async findByUnit(learningUnitId: number): Promise<Content[]> {
    return this.contentRepo.findByUnit(learningUnitId);
  }

  /** Listar TODOS los bloques de una unidad, incluyendo ocultos (para docentes) */
  async findByUnitAll(learningUnitId: number): Promise<Content[]> {
    return this.contentRepo.findByUnitAll(learningUnitId);
  }

  async findOne(id: number): Promise<Content> {
    const content = await this.contentRepo.findOne({ where: { id } });
    if (!content) {
      throw new NotFoundException(`Bloque de contenido con ID ${id} no encontrado`);
    }
    return content;
  }

  async update(id: number, dto: UpdateContentDto): Promise<Content> {
    const content = await this.findOne(id);
    Object.assign(content, dto);
    return this.contentRepo.save(content);
  }

  async toggleVisibility(id: number): Promise<Content> {
    const content = await this.findOne(id);
    content.isVisible = !content.isVisible;
    return this.contentRepo.save(content);
  }

  async remove(id: number): Promise<void> {
    const content = await this.findOne(id);
    await this.contentRepo.remove(content);
  }

  /** Reordenar bloques recibiendo array de { id, order } */
  async reorder(items: { id: number; order: number }[]): Promise<void> {
    await Promise.all(
      items.map(({ id, order }) =>
        this.contentRepo.update(id, { order }),
      ),
    );
  }
}
