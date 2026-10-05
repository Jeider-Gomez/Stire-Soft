import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { SectionService } from '../section/section.service';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    private readonly sectionService: SectionService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  /**
   * Crear un topic dentro de una sección.
   * Valida que la sección exista y que el docente sea dueño de la clase padre.
   *
   * OLA 2 P3: la version anterior comparaba contra `section.class`, una
   * relacion que `sectionService.findOne` nunca carga (solo carga
   * `topics`/`topics.learningUnits`) — esa comparacion era siempre
   * `undefined !== teacherId`, es decir, siempre verdadera, y el bloque de
   * "verificacion" de respaldo tampoco podia fallar porque `findOne` o
   * devuelve la entidad o lanza, nunca devuelve un valor falsy. Se reemplaza
   * por el mismo patron que ya usa `AuthorizationService` en el resto del
   * sistema: resolver el `classId` real (columna directa en `Section`, sin
   * necesidad de cargar la relacion) y afirmar propiedad contra el.
   */
  async create(createDto: CreateTopicDto, user: User): Promise<Topic> {
    const section = await this.sectionService.findOne(createDto.sectionId);
    await this.authorizationService.assertTeacherOwnsClass(user, section.classId);

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
   * Actualizar un topic. Solo el docente dueño de la clase padre (o admin).
   */
  async update(id: number, updateDto: UpdateTopicDto, user: User): Promise<Topic> {
    const topic = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, await this.resolveClassId(topic));
    Object.assign(topic, updateDto);
    return await this.topicRepository.save(topic);
  }

  /**
   * Desactivar un topic (soft delete lógico). Solo el docente dueño de la
   * clase padre (o admin).
   */
  async remove(id: number, user: User): Promise<Topic> {
    const topic = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, await this.resolveClassId(topic));
    topic.isActive = false;
    return await this.topicRepository.save(topic);
  }

  /**
   * Eliminar definitivamente un topic y sus unidades.
   * Solo el docente dueño de la clase padre (o admin).
   */
  async deletePermanent(id: number, user: User): Promise<void> {
    const topic = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, await this.resolveClassId(topic));
    const learningUnits = topic.learningUnits ?? [];
    if (learningUnits.length > 0) {
      await this.topicRepository.manager.transaction(async (manager) => {
        for (const unit of learningUnits) {
          await manager.delete('learning_units', { id: unit.id });
        }
        await manager.remove(topic);
      });
    } else {
      await this.topicRepository.remove(topic);
    }
  }

  /**
   * Topic -> Section -> classId. `sectionId` es una columna directa del
   * topic (no requiere cargar la relación `section`); `classId` es a su vez
   * una columna directa de `Section` (ver mismo patrón en
   * `SectionService.update`), así que no hace falta relación `class`
   * cargada en ningún punto de la cadena.
   */
  private async resolveClassId(topic: Topic): Promise<number> {
    const section = await this.sectionService.findOne(topic.sectionId);
    return section.classId;
  }
}
