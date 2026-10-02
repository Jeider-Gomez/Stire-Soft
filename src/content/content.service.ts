import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from './entities/content.entity';
import { ContentRepository } from './content.repository';
import { LearningUnit } from '../learning-unit/entities/learning-unit.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { User, UserRole } from '../user/entities/user.entity';
import { ContentRenderingService, SanitizationProfile } from '../content-rendering/content-rendering.service';
import { ContentType } from '../common/enums/content-type.enum';
import { metadatosDeRecurso } from './recursos/metadatos-recurso';
import { normalizarRecurso, RecursoInvalidoError, type RecursoNormalizado } from './recursos/normalizar-recurso';
import { insertadosDelTexto } from './recursos/insertados';

/** Reconstruye el metadata de una lección multimedia; un recurso inválido es un 400 con el motivo. */
function metadatosValidos(tipo: ContentType, metadata: Record<string, unknown> | undefined | null) {
  try {
    return metadatosDeRecurso(tipo, metadata);
  } catch (e) {
    if (e instanceof RecursoInvalidoError) throw new BadRequestException(e.message);
    throw e;
  }
}

/**
 * El texto de una lección puede llevar imágenes y recursos en su lugar (recursos/insertados.ts). Cómo se inserta cada
 * recurso lo arma SIEMPRE el servidor desde el texto: un `insertados` que llegue del navegador se descarta.
 */
function metadatosDelTexto(body: string | undefined | null, metadata: Record<string, unknown> | undefined | null) {
  const { insertados: _descartado, ...resto } = metadata ?? {};
  let insertados: ReturnType<typeof insertadosDelTexto>;
  try {
    insertados = insertadosDelTexto(body ?? '');
  } catch (e) {
    if (e instanceof RecursoInvalidoError) throw new BadRequestException(e.message);
    throw e;
  }
  const conResto = Object.keys(resto).length ? resto : null;
  return Object.keys(insertados).length ? { ...resto, insertados } : conResto;
}

@Injectable()
export class ContentService {
  constructor(
    private readonly contentRepo: ContentRepository,
    @InjectRepository(LearningUnit)
    private readonly learningUnitRepository: Repository<LearningUnit>,
    private readonly authorizationService: AuthorizationService,
    private readonly contentRenderingService: ContentRenderingService,
  ) {}

  /**
   * Crear un bloque de contenido. Solo el docente dueño de la clase de la
   * unidad de aprendizaje destino (o admin).
   */
  async create(dto: CreateContentDto, user: User): Promise<Content> {
    await this.authorizationService.assertTeacherOwnsClass(
      user,
      await this.resolveClassIdFromUnitId(dto.learningUnitId),
    );

    // ADR 07, perfil RICH: content.body es autoría docente. Se sanea al escribir conservando el Markdown, además del
    // saneamiento al renderizar en la capa de lectura. Los recursos del texto se leen del texto YA saneado.
    const body = dto.body ? this.contentRenderingService.sanitizeRichText(dto.body) : dto.body;
    const content = this.contentRepo.create({
      ...dto,
      metadata: dto.type === ContentType.MARKDOWN ? metadatosDelTexto(body, dto.metadata) ?? undefined : metadatosValidos(dto.type, dto.metadata),
      body,
      order: dto.order ?? 0,
      isVisible: dto.isVisible ?? true,
    });
    return this.contentRepo.save(content);
  }

  /**
   * OLA 3 - PUNTO 3 (P0-R2, docs/REAUDITORIA_OLA2.md): las tres rutas de
   * lectura de este servicio no verificaban NADA — cualquier usuario
   * autenticado, estudiante incluido, leía material docente y bloques
   * ocultos (isVisible:false) de clases ajenas. Mismo patrón de las cuatro
   * cadenas en `ActivitiesService`: admin pasa siempre; docente solo su
   * propia clase (403 si es ajena); estudiante solo si está matriculado
   * (403 si no), y además solo ve contenido visible (404 si pide uno oculto
   * directamente por ID — mismo criterio que un draft para un estudiante en
   * `ActivitiesService.findOneForRequester`).
   */
  private async assertCanReadClass(user: User, classId: number): Promise<void> {
    if (user.role === UserRole.DOCENTE) {
      await this.authorizationService.assertTeacherOwnsClass(user, classId);
    } else if (user.role === UserRole.ESTUDIANTE) {
      await this.authorizationService.assertEnrolledInClass(user, classId);
    }
    // admin: pasa siempre.
  }

  /** Listar bloques visibles de una unidad (para estudiantes matriculados o el docente dueño). */
  async findByUnit(learningUnitId: number, user: User): Promise<Content[]> {
    const classId = await this.resolveClassIdFromUnitId(learningUnitId);
    await this.assertCanReadClass(user, classId);
    return this.contentRepo.findByUnit(learningUnitId);
  }

  /** Listar TODOS los bloques de una unidad, incluyendo ocultos (solo el docente dueño o admin). */
  async findByUnitAll(learningUnitId: number, user: User): Promise<Content[]> {
    const classId = await this.resolveClassIdFromUnitId(learningUnitId);
    if (user.role !== UserRole.ADMIN) {
      await this.authorizationService.assertTeacherOwnsClass(user, classId);
    }
    return this.contentRepo.findByUnitAll(learningUnitId);
  }

  /**
   * Fetch interno SIN autorización — lo usan `update`/`toggleVisibility`/
   * `remove`/`reorder`, que ya hacen su propia verificación de propiedad
   * inmediatamente después. `findOne` (público, más abajo) es la versión
   * CON autorización, para la ruta de lectura.
   */
  private async findOneRaw(id: number): Promise<Content> {
    const content = await this.contentRepo.findOne({ where: { id } });
    if (!content) {
      throw new NotFoundException(`Bloque de contenido con ID ${id} no encontrado`);
    }
    return content;
  }

  /**
   * Ver un bloque específico: docente dueño, estudiante matriculado (solo
   * si visible), o admin.
   *
   * OLA 3 - PUNTO 5 (docs/REAUDITORIA_OLA2.md, hallazgo P1-R4): `?format=html`
   * es ahora el único camino real hacia `renderMarkdownToHtml` — antes esa
   * función (la única que neutraliza sintaxis Markdown peligrosa como
   * `[x](javascript:...)`) existía pero ningún endpoint la invocaba, así que
   * la "capa 2" del saneamiento de ADR 07 era código muerto. Sin `format`
   * (o con `format=markdown`), se devuelve el Markdown saneado en escritura
   * de siempre — comportamiento sin cambios, ver
   * `docs/CONTRATO_CONTENT_RENDERING.md` para el contrato completo.
   */
  async findOne(id: number, user: User, format?: 'markdown' | 'html'): Promise<Content> {
    const content = await this.findOneRaw(id);
    const classId = await this.resolveClassIdFromUnitId(content.learningUnitId);
    await this.assertCanReadClass(user, classId);

    if (user.role === UserRole.ESTUDIANTE && !content.isVisible) {
      // Igual que un draft para un estudiante en ActivitiesService: no
      // existe todavía desde su perspectiva, no es "prohibido".
      throw new NotFoundException(`Bloque de contenido con ID ${id} no encontrado`);
    }

    if (format === 'html' && content.body) {
      return { ...content, body: await this.contentRenderingService.renderMarkdownToHtml(content.body, SanitizationProfile.RICH) };
    }

    return content;
  }

  /** Solo el docente dueño de la clase del bloque (o admin). */
  async update(id: number, dto: UpdateContentDto, user: User): Promise<Content> {
    const content = await this.findOneRaw(id);
    await this.authorizationService.assertTeacherOwnsClass(
      user,
      await this.resolveClassIdFromUnitId(content.learningUnitId),
    );
    const tipoCambia = dto.type !== undefined && dto.type !== content.type;
    Object.assign(content, dto);
    if (dto.metadata !== undefined || tipoCambia) {
      content.metadata = metadatosValidos(content.type, dto.metadata ?? content.metadata);
    }
    if (dto.body) {
      content.body = this.contentRenderingService.sanitizeRichText(dto.body);
    }
    if (content.type === ContentType.MARKDOWN && (dto.body !== undefined || dto.metadata !== undefined || tipoCambia)) {
      content.metadata = metadatosDelTexto(content.body, content.metadata) ?? undefined;
    }
    return this.contentRepo.save(content);
  }

  /**
   * Vista previa de un recurso para el editor de la lección: cómo se va a ver un enlace antes de guardarlo. No guarda
   * nada; aplica las mismas reglas que al guardar.
   */
  vistaPreviaDeRecurso(url: unknown): RecursoNormalizado {
    try {
      return normalizarRecurso(typeof url === 'string' ? url : '');
    } catch (e) {
      if (e instanceof RecursoInvalidoError) throw new BadRequestException(e.message);
      throw e;
    }
  }

  /** Solo el docente dueño de la clase del bloque (o admin). */
  async toggleVisibility(id: number, user: User): Promise<Content> {
    const content = await this.findOneRaw(id);
    await this.authorizationService.assertTeacherOwnsClass(
      user,
      await this.resolveClassIdFromUnitId(content.learningUnitId),
    );
    content.isVisible = !content.isVisible;
    return this.contentRepo.save(content);
  }

  /** Solo el docente dueño de la clase del bloque (o admin). */
  async remove(id: number, user: User): Promise<void> {
    const content = await this.findOneRaw(id);
    await this.authorizationService.assertTeacherOwnsClass(
      user,
      await this.resolveClassIdFromUnitId(content.learningUnitId),
    );
    await this.contentRepo.remove(content);
  }

  /**
   * Reordenar bloques recibiendo array de { id, order }. Verifica que TODOS
   * los bloques referenciados pertenezcan a clases del docente — reordenar
   * es una mutación igual que las demás, y sin esta verificación un docente
   * podría colar el id de un bloque ajeno en el array.
   */
  async reorder(items: { id: number; order: number }[], user: User): Promise<void> {
    for (const { id } of items) {
      const content = await this.findOneRaw(id);
      await this.authorizationService.assertTeacherOwnsClass(
        user,
        await this.resolveClassIdFromUnitId(content.learningUnitId),
      );
    }

    await Promise.all(
      items.map(({ id, order }) =>
        this.contentRepo.update(id, { order }),
      ),
    );
  }

  /**
   * Content -> LearningUnit -> Topic -> Section -> classId. Falla cerrado
   * (mismo patrón que `ActivitiesService.resolveClassId`) si la unidad no
   * tiene topic asignado o la cadena está rota.
   */
  private async resolveClassIdFromUnitId(learningUnitId: number): Promise<number> {
    const unit = await this.learningUnitRepository.findOne({
      where: { id: learningUnitId },
      relations: ['topic', 'topic.section'],
    });
    const classId = unit?.topic?.section?.classId;
    if (!classId) {
      throw new NotFoundException(
        `No se pudo resolver la clase de la unidad de aprendizaje ${learningUnitId} (sin topic/sección asociado).`,
      );
    }
    return classId;
  }
}
