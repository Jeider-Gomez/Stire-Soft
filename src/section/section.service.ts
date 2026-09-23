import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ClassService } from '../class/class.service';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { User, UserRole } from '../user/entities/user.entity';
import { PublicationStatus } from '../common/enums/status.enum';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    private readonly classService: ClassService,
    private readonly authorizationService: AuthorizationService,
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
    return this.sectionRepository
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.topics', 'topic')
      .leftJoinAndSelect('topic.learningUnits', 'learningUnit')
      .leftJoinAndSelect('learningUnit.activities', 'activity')
      .leftJoinAndSelect('activity.activityType', 'activityType')
      .where('section.classId = :classId', { classId })
      .orderBy('section.order', 'ASC')
      .addOrderBy('topic.order', 'ASC')
      .addOrderBy('learningUnit.order', 'ASC')
      .addOrderBy('activity.order', 'ASC')
      .getMany();
  }

  /**
   * Estructura de una clase según quién pregunta: admin y docente dueño ven todo
   * (borradores incluidos); un estudiante solo si está matriculado y únicamente
   * lo publicado (módulo publicado, tema/unidad activos, actividad publicada).
   * Antes cualquier autenticado —también sin matrícula— recibía todo, incluidos
   * los módulos que el docente aún no publicaba.
   */
  async findByClassFor(classId: number, user: User): Promise<Section[]> {
    const sections = await this.findByClass(classId);
    return this.filterForRequester(sections, classId, user);
  }

  async findOneFor(id: number, user: User): Promise<Section> {
    const section = await this.findOne(id);
    const [visible] = await this.filterForRequester([section], section.classId, user);
    if (!visible) throw new NotFoundException(`Sección con ID ${id} no encontrada`);
    return visible;
  }

  private async filterForRequester(sections: Section[], classId: number, user: User): Promise<Section[]> {
    if (user.role === UserRole.ADMIN) return sections;
    if (user.role === UserRole.DOCENTE) {
      await this.authorizationService.assertTeacherOwnsClass(user, classId);
      return sections;
    }
    await this.authorizationService.assertEnrolledInClass(user, classId);
    return sections
      .filter((s) => s.isPublished)
      .map((s) => ({
        ...s,
        topics: (s.topics ?? [])
          .filter((t) => t.isActive)
          .map((t) => ({
            ...t,
            learningUnits: (t.learningUnits ?? [])
              .filter((u) => u.isActive)
              .map((u) => ({
                ...u,
                activities: (u.activities ?? []).filter((a) => a.status === PublicationStatus.PUBLISHED),
              })),
          })),
      })) as Section[];
  }

  /**
   * Obtener una sección por su ID.
   */
  async findOne(id: number): Promise<Section> {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: {
        topics: {
          learningUnits: {
            activities: {
              activityType: true,
            },
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException(`Sección con ID ${id} no encontrada`);
    }

    return section;
  }

  /**
   * Actualizar una sección. Solo el docente dueño de la clase (o admin).
   */
  async update(id: number, dto: UpdateSectionDto, user: User): Promise<Section> {
    const section = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, section.classId);
    Object.assign(section, dto);
    return this.sectionRepository.save(section);
  }

  /**
   * Publicar o despublicar una sección. Solo el docente dueño de la clase (o admin).
   */
  async togglePublish(id: number, user: User): Promise<Section> {
    const section = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, section.classId);
    section.isPublished = !section.isPublished;
    return this.sectionRepository.save(section);
  }

  /**
   * Eliminar una sección (hard delete — la cascada borra sus topics).
   * Solo el docente dueño de la clase (o admin).
   */
  async remove(id: number, user: User): Promise<void> {
    const section = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, section.classId);
    await this.sectionRepository.remove(section);
  }
}
