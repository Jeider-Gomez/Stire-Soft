import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, In } from 'typeorm';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { User } from '../user/entities/user.entity';
import { Class } from '../class/entities/class.entity';
import { Section } from '../section/entities/section.entity';
import { Topic } from '../topic/entities/topic.entity';
import { LearningUnit } from '../learning-unit/entities/learning-unit.entity';
import { Content } from '../content/entities/content.entity';
import { Activity } from '../activities/entities/activity.entity';
import { ActivityQuestion } from '../activity-questions/entities/activity-question.entity';
import { PublicationStatus } from '../common/enums/status.enum';
import { BankQueryDto, CopyActivityDto, ImportClassContentDto } from './dto/reuse.dto';

// Reutilizar lo que ya se hizo (docs/DISENO_PRACTICA_ADAPTATIVA.md §3.5): traer el contenido de otra clase propia
// (dos salones de la misma materia, o el semestre siguiente), el banco de ejercicios del docente y copiar un ejercicio
// a otra unidad o como variante. Siempre se COPIA, nunca se enlaza: si dos salones compartieran el mismo ejercicio,
// corregirlo en uno cambiaría las notas del otro. Nunca se copian estudiantes, matrículas, entregas ni progreso.

export interface ResumenImportacion {
  sections: number;
  topics: number;
  learningUnits: number;
  contents: number;
  activities: number;
  questions: number;
}

export interface EjercicioDelBanco {
  activityId: number;
  title: string;
  difficulty: string;
  questionType: string | null;
  status: string;
  questionPreview: string;
  learningUnitId: number;
  learningUnitTitle: string;
  classId: number;
  className: string;
}

const LARGO_TITULO_ACTIVIDAD = 200;
const MAXIMO_BANCO = 300;

@Injectable()
export class ReuseService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly authorizationService: AuthorizationService,
  ) {}

  /** Copia secciones (con temas, unidades, lecciones y ejercicios) de una clase propia a otra propia. */
  async importClassContent(user: User, targetClassId: number, dto: ImportClassContentDto): Promise<ResumenImportacion> {
    if (dto.sourceClassId === targetClassId) {
      throw new BadRequestException('Elige una clase distinta de esta para traer su contenido.');
    }
    await this.authorizationService.assertTeacherOwnsClass(user, targetClassId);
    await this.authorizationService.assertTeacherOwnsClass(user, dto.sourceClassId);

    return this.dataSource.transaction(async (manager) => {
      let secciones = await manager.find(Section, { where: { classId: dto.sourceClassId }, order: { order: 'ASC', id: 'ASC' } });
      if (dto.sectionIds) {
        const pedidas = new Set(dto.sectionIds);
        const ajenas = [...pedidas].filter((id) => !secciones.some((s) => s.id === id));
        if (ajenas.length > 0) {
          throw new BadRequestException(`Estas secciones no son de la clase de origen: ${ajenas.join(', ')}.`);
        }
        secciones = secciones.filter((s) => pedidas.has(s.id));
      }

      const existentes = await manager.find(Section, { where: { classId: targetClassId } });
      let siguienteOrden = existentes.reduce((max, s) => Math.max(max, s.order + 1), 0);
      const resumen: ResumenImportacion = { sections: 0, topics: 0, learningUnits: 0, contents: 0, activities: 0, questions: 0 };

      for (const seccion of secciones) {
        // En borrador: el docente la revisa y la publica cuando quiera. Publicarla muestra todo lo que contiene.
        const nuevaSeccion = await manager.save(Section, manager.create(Section, {
          title: seccion.title,
          description: seccion.description,
          order: siguienteOrden++,
          isPublished: false,
          classId: targetClassId,
        }));
        resumen.sections++;

        const temas = await manager.find(Topic, { where: { sectionId: seccion.id }, order: { order: 'ASC', id: 'ASC' } });
        for (const tema of temas) {
          const nuevoTema = await manager.save(Topic, manager.create(Topic, {
            title: tema.title,
            description: tema.description,
            order: tema.order,
            isActive: tema.isActive,
            sectionId: nuevaSeccion.id,
          }));
          resumen.topics++;

          const unidades = await manager.find(LearningUnit, { where: { topicId: tema.id }, order: { order: 'ASC', id: 'ASC' } });
          for (const unidad of unidades) {
            const nuevaUnidad = await manager.save(LearningUnit, manager.create(LearningUnit, {
              title: unidad.title,
              description: unidad.description,
              difficulty: unidad.difficulty,
              order: unidad.order,
              isActive: unidad.isActive,
              topicId: nuevoTema.id,
            }));
            resumen.learningUnits++;

            const contenidos = await manager.find(Content, { where: { learningUnitId: unidad.id }, order: { order: 'ASC', id: 'ASC' } });
            for (const contenido of contenidos) {
              await manager.save(Content, manager.create(Content, {
                learningUnitId: nuevaUnidad.id,
                title: contenido.title,
                type: contenido.type,
                body: contenido.body,
                metadata: clonar(contenido.metadata),
                order: contenido.order,
                isVisible: contenido.isVisible,
              }));
              resumen.contents++;
            }

            const actividades = await manager.find(Activity, { where: { learningUnitId: unidad.id }, order: { order: 'ASC', id: 'ASC' } });
            for (const actividad of actividades) {
              if (actividad.status === PublicationStatus.ARCHIVED) continue;
              const copia = await this.copiarActividad(manager, actividad, {
                learningUnitId: nuevaUnidad.id,
                createdBy: user.id,
                status: actividad.status,
                order: actividad.order,
                title: actividad.title,
              });
              resumen.questions += copia.preguntas;
              resumen.activities++;
            }
          }
        }
      }
      return resumen;
    });
  }

  /**
   * Banco del docente: todos los ejercicios de sus clases, con filtros. Es una vista y no una copia aparte, así que
   * siempre está al día con lo que el docente edita y no hay que «guardar en el banco».
   */
  async bank(user: User, query: BankQueryDto): Promise<EjercicioDelBanco[]> {
    const qb = this.dataSource
      .getRepository(Activity)
      .createQueryBuilder('a')
      .innerJoin(LearningUnit, 'u', 'u.id = a.learningUnitId')
      .innerJoin(Topic, 't', 't.id = u.topicId')
      .innerJoin(Section, 's', 's.id = t.sectionId')
      .innerJoin(Class, 'c', 'c.id = s.classId')
      .where('c.teacherId = :teacherId', { teacherId: user.id })
      .andWhere('a.status != :archivada', { archivada: PublicationStatus.ARCHIVED })
      .select([
        'a.id AS activityId',
        'a.title AS title',
        'a.difficulty AS difficulty',
        'a.status AS status',
        'u.id AS learningUnitId',
        'u.title AS learningUnitTitle',
        'c.id AS classId',
        'c.name AS className',
      ])
      .orderBy('c.id', 'DESC')
      .addOrderBy('s.order', 'ASC')
      .addOrderBy('t.order', 'ASC')
      .addOrderBy('u.order', 'ASC')
      .addOrderBy('a.order', 'ASC')
      .limit(MAXIMO_BANCO);
    if (query.difficulty) qb.andWhere('a.difficulty = :difficulty', { difficulty: query.difficulty });
    if (query.q) qb.andWhere('(a.title LIKE :q OR u.title LIKE :q)', { q: `%${escaparLike(query.q)}%` });

    const filas: Array<Record<string, unknown>> = await qb.getRawMany();
    if (filas.length === 0) return [];

    const preguntas = await this.dataSource.getRepository(ActivityQuestion).find({
      where: { activityId: In(filas.map((f) => Number(f.activityId))) },
      order: { order: 'ASC', id: 'ASC' },
    });
    const ejercicios = filas.map((f) => {
      const pregunta = preguntas.find((p) => p.activityId === Number(f.activityId));
      return {
        activityId: Number(f.activityId),
        title: String(f.title),
        difficulty: String(f.difficulty),
        questionType: pregunta?.type ?? null,
        status: String(f.status),
        questionPreview: (pregunta?.question ?? '').replace(/\s+/g, ' ').trim().slice(0, 160),
        learningUnitId: Number(f.learningUnitId),
        learningUnitTitle: String(f.learningUnitTitle),
        classId: Number(f.classId),
        className: String(f.className),
      };
    });
    return query.type ? ejercicios.filter((e) => e.questionType === query.type) : ejercicios;
  }

  /** Copia un ejercicio propio a una unidad propia (desde el banco, o como variante en la misma unidad). En borrador. */
  async copyActivity(user: User, activityId: number, dto: CopyActivityDto): Promise<{ id: number; title: string; status: PublicationStatus }> {
    return this.dataSource.transaction(async (manager) => {
      const origen = await manager.findOne(Activity, { where: { id: activityId } });
      if (!origen) throw new NotFoundException('Ejercicio no encontrado');
      await this.authorizationService.assertTeacherOwnsClass(user, await claseDeUnidad(manager, origen.learningUnitId));
      await this.authorizationService.assertTeacherOwnsClass(user, await claseDeUnidad(manager, dto.learningUnitId));

      const enDestino = await manager.find(Activity, { where: { learningUnitId: dto.learningUnitId } });
      const titulo = dto.variant ? `${origen.title} (variante)`.slice(0, LARGO_TITULO_ACTIVIDAD) : origen.title;
      const datos = {
        learningUnitId: dto.learningUnitId,
        createdBy: user.id,
        status: PublicationStatus.DRAFT,
        order: enDestino.reduce((max, a) => Math.max(max, a.order + 1), 0),
        title: titulo,
      };
      const { actividad } = await this.copiarActividad(manager, origen, datos);
      return { id: actividad.id, title: actividad.title, status: actividad.status };
    });
  }

  /** Copia la actividad y sus preguntas. */
  private async copiarActividad(
    manager: EntityManager,
    origen: Activity,
    datos: { learningUnitId: number; createdBy: number; status: PublicationStatus; order: number; title: string },
  ): Promise<{ actividad: Activity; preguntas: number }> {
    const nueva = await manager.save(Activity, manager.create(Activity, {
      learningUnitId: datos.learningUnitId,
      activityTypeId: origen.activityTypeId,
      createdBy: datos.createdBy,
      title: datos.title,
      description: origen.description,
      difficulty: origen.difficulty,
      totalPoints: origen.totalPoints,
      passingScore: origen.passingScore,
      attemptsAllowed: origen.attemptsAllowed,
      timeLimit: origen.timeLimit,
      order: datos.order,
      status: datos.status,
      isRequired: origen.isRequired,
      adaptiveWeight: origen.adaptiveWeight,
      publishedAt: datos.status === PublicationStatus.PUBLISHED ? new Date() : undefined,
      copiedFromId: origen.id,
    }));

    const preguntas = await manager.find(ActivityQuestion, { where: { activityId: origen.id }, order: { order: 'ASC', id: 'ASC' } });
    for (const pregunta of preguntas) {
      await manager.save(ActivityQuestion, manager.create(ActivityQuestion, {
        activityId: nueva.id,
        type: pregunta.type,
        question: pregunta.question,
        points: pregunta.points,
        order: pregunta.order,
        config: clonar(pregunta.config),
      }));
    }
    return { actividad: nueva, preguntas: preguntas.length };
  }
}

/** LearningUnit → Topic → Section → classId. Falla cerrado si la cadena está rota. */
async function claseDeUnidad(manager: EntityManager, learningUnitId: number): Promise<number> {
  const unidad = await manager.findOne(LearningUnit, { where: { id: learningUnitId } });
  const tema = unidad?.topicId != null ? await manager.findOne(Topic, { where: { id: unidad.topicId } }) : null;
  const seccion = tema ? await manager.findOne(Section, { where: { id: tema.sectionId } }) : null;
  if (!seccion) throw new NotFoundException(`Unidad de aprendizaje ${learningUnitId} no encontrada`);
  return seccion.classId;
}

/** Copia profunda de la configuración JSON: la copia no comparte objetos con el original. */
function clonar<T>(valor: T): T {
  return valor == null ? valor : (JSON.parse(JSON.stringify(valor)) as T);
}

function escaparLike(texto: string): string {
  return texto.replace(/[\\%_]/g, (c) => `\\${c}`);
}
