import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ClassService } from '../class/class.service';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { User, UserRole } from '../user/entities/user.entity';
import { PublicationStatus } from '../common/enums/status.enum';
import { actividadVisiblePara } from '../activities/visibilidad';
import { ImpactoBorrado, borrarLecciones, exigirQueSePuedaEliminar, impactoDeLecciones } from '../common/contenido/borrado-contenido';

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
      .filter((s) => s.isPublished && s.isActive !== false)
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
                activities: (u.activities ?? []).filter((a) => actividadVisiblePara(a, user.id)),
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
    if (!section.isPublished && section.isActive === false) {
      throw new ConflictException('Este módulo está archivado: restáuralo antes de publicarlo.');
    }
    section.isPublished = !section.isPublished;
    return this.sectionRepository.save(section);
  }

  /**
   * Qué se pierde si se elimina el módulo (Fase 30): temas, lecciones, ejercicios y estudiantes con avance.
   */
  async impacto(id: number, user: User): Promise<ImpactoBorrado> {
    const section = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, section.classId);
    return impactoDeLecciones(this.sectionRepository.manager, leccionesDe(section), { modulos: 1, temas: section.topics?.length ?? 0 });
  }

  /**
   * Eliminar un módulo con sus temas y lecciones. Solo el docente dueño (o admin), y solo si ningún estudiante tiene
   * avance en él (409: se archiva). Antes, con lecciones, fallaba con un 500 (`learning_units → topics` no tiene cascada).
   */
  async remove(id: number, user: User): Promise<void> {
    const section = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, section.classId);
    const unitIds = leccionesDe(section);
    await this.sectionRepository.manager.transaction(async (manager) => {
      exigirQueSePuedaEliminar(await impactoDeLecciones(manager, unitIds, { modulos: 1, temas: section.topics?.length ?? 0 }));
      await borrarLecciones(manager, unitIds);
      // Los temas caen en cascada con el módulo (topics.sectionId ON DELETE CASCADE).
      await manager.delete(Section, { id: section.id });
    });
  }

  /** Archivar: deja de verse para el estudiante (también se despublica) y conserva todo. */
  async archivar(id: number, user: User): Promise<Section> {
    const section = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, section.classId);
    section.isActive = false;
    section.isPublished = false;
    return this.sectionRepository.save(section);
  }

  /** Restaurar: vuelve como borrador; el docente decide cuándo publicarlo otra vez. */
  async restaurar(id: number, user: User): Promise<Section> {
    const section = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, section.classId);
    section.isActive = true;
    return this.sectionRepository.save(section);
  }
}

function leccionesDe(section: Section): number[] {
  return (section.topics ?? []).flatMap((t) => (t.learningUnits ?? []).map((u) => u.id));
}
