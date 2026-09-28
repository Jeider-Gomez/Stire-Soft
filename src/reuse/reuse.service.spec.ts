import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ReuseService } from './reuse.service';
import { Section } from '../section/entities/section.entity';
import { Topic } from '../topic/entities/topic.entity';
import { LearningUnit } from '../learning-unit/entities/learning-unit.entity';
import { Content } from '../content/entities/content.entity';
import { Activity } from '../activities/entities/activity.entity';
import { ActivityQuestion } from '../activity-questions/entities/activity-question.entity';
import { PublicationStatus } from '../common/enums/status.enum';

// Base en memoria con lo mínimo del EntityManager que usa ReuseService (create, save, find, findOne). Así la copia se
// ejecuta de verdad y se puede comprobar el árbol resultante, no solo que se llamaron métodos.
type Fila = Record<string, unknown> & { id: number };

function baseEnMemoria() {
  const tablas = new Map<string, Fila[]>();
  let siguienteId = 1000;
  const tabla = (entidad: { name: string }) => {
    if (!tablas.has(entidad.name)) tablas.set(entidad.name, []);
    return tablas.get(entidad.name)!;
  };
  const coincide = (fila: Fila, where: Record<string, unknown> = {}) => Object.entries(where).every(([k, v]) => fila[k] === v);
  const ordenar = (filas: Fila[], order: Record<string, 'ASC' | 'DESC'> = {}) =>
    [...filas].sort((a, b) => {
      for (const [k, dir] of Object.entries(order)) {
        const d = (a[k] as number) - (b[k] as number);
        if (d !== 0) return dir === 'ASC' ? d : -d;
      }
      return 0;
    });
  const manager = {
    create: (_e: unknown, datos: Record<string, unknown>) => ({ ...datos }),
    save: async (entidad: { name: string }, fila: Record<string, unknown>) => {
      const guardada = { ...fila, id: (fila.id as number) ?? siguienteId++ } as Fila;
      tabla(entidad).push(guardada);
      return guardada;
    },
    find: async (entidad: { name: string }, opciones: { where?: Record<string, unknown>; order?: Record<string, 'ASC' | 'DESC'> } = {}) =>
      ordenar(tabla(entidad).filter((f) => coincide(f, opciones.where)), opciones.order),
    findOne: async (entidad: { name: string }, opciones: { where?: Record<string, unknown> } = {}) =>
      tabla(entidad).find((f) => coincide(f, opciones.where)) ?? null,
  };
  const insertar = (entidad: { name: string }, fila: Fila) => tabla(entidad).push(fila);
  return { manager, tabla, insertar };
}

const DOCENTE = { id: 7, role: 'docente' } as never;
const ORIGEN = 1;
const DESTINO = 2;

function sembrarClaseOrigen(insertar: (e: { name: string }, f: Fila) => void) {
  insertar(Section, { id: 10, classId: ORIGEN, title: 'Sección 1', order: 0, isPublished: true });
  insertar(Section, { id: 11, classId: ORIGEN, title: 'Sección 2', order: 1, isPublished: true });
  insertar(Topic, { id: 20, sectionId: 10, title: 'Tema 1', order: 0, isActive: true });
  insertar(Topic, { id: 21, sectionId: 11, title: 'Tema 2', order: 0, isActive: true });
  insertar(LearningUnit, { id: 30, topicId: 20, title: 'Unidad 1', order: 0, isActive: true, difficulty: 'basico' });
  insertar(LearningUnit, { id: 31, topicId: 21, title: 'Unidad 2', order: 0, isActive: true, difficulty: 'basico' });
  insertar(Content, { id: 40, learningUnitId: 30, title: 'Lección', type: 'markdown', body: '## La idea', order: 0, isVisible: true, metadata: { a: 1 } });
  insertar(Activity, { id: 50, learningUnitId: 30, title: 'Ejercicio A', status: PublicationStatus.PUBLISHED, order: 0, activityTypeId: 1, difficulty: 'basico', totalPoints: 100, passingScore: 60, attemptsAllowed: 3 });
  insertar(Activity, { id: 51, learningUnitId: 30, title: 'Archivado', status: PublicationStatus.ARCHIVED, order: 1, activityTypeId: 1 });
  insertar(Activity, { id: 52, learningUnitId: 31, title: 'Ejercicio B', status: PublicationStatus.DRAFT, order: 0, activityTypeId: 1 });
  insertar(ActivityQuestion, { id: 60, activityId: 50, type: 'mcq', question: '¿Qué imprime?', points: 10, order: 0, config: { options: [{ id: 'a' }], correctAnswerId: 'a' } });
}

describe('ReuseService', () => {
  let db: ReturnType<typeof baseEnMemoria>;
  let authorization: { assertTeacherOwnsClass: jest.Mock };
  let service: ReuseService;

  beforeEach(() => {
    db = baseEnMemoria();
    sembrarClaseOrigen(db.insertar);
    db.insertar(Section, { id: 12, classId: DESTINO, title: 'Ya existía', order: 0, isPublished: true });
    authorization = { assertTeacherOwnsClass: jest.fn().mockResolvedValue(undefined) };
    const dataSource = { transaction: (cb: (m: unknown) => unknown) => cb(db.manager) };
    service = new ReuseService(dataSource as never, authorization as never);
  });

  describe('importClassContent', () => {
    it('copia todo el árbol a la clase destino, después de lo que ya tenía y en borrador', async () => {
      const r = await service.importClassContent(DOCENTE, DESTINO, { sourceClassId: ORIGEN });

      expect(r).toEqual({ sections: 2, topics: 2, learningUnits: 2, contents: 1, activities: 2, questions: 1 });
      const nuevas = db.tabla(Section).filter((s) => s.classId === DESTINO && s.id !== 12);
      expect(nuevas.map((s) => [s.title, s.order, s.isPublished])).toEqual([['Sección 1', 1, false], ['Sección 2', 2, false]]);
    });

    it('no copia actividades archivadas y conserva el estado de las demás', async () => {
      await service.importClassContent(DOCENTE, DESTINO, { sourceClassId: ORIGEN });

      const copias = db.tabla(Activity).filter((a) => a.copiedFromId != null);
      expect(copias.map((a) => [a.copiedFromId, a.status, a.createdBy])).toEqual([
        [50, PublicationStatus.PUBLISHED, 7],
        [52, PublicationStatus.DRAFT, 7],
      ]);
    });

    it('la copia no comparte la configuración con el original: editarla no cambia el original', async () => {
      await service.importClassContent(DOCENTE, DESTINO, { sourceClassId: ORIGEN });

      const original = db.tabla(ActivityQuestion).find((q) => q.id === 60)!;
      const copia = db.tabla(ActivityQuestion).find((q) => q.id !== 60)!;
      (copia.config as { correctAnswerId: string }).correctAnswerId = 'b';
      expect((original.config as { correctAnswerId: string }).correctAnswerId).toBe('a');
      const contenidoCopia = db.tabla(Content).find((c) => c.id !== 40)!;
      expect(contenidoCopia.metadata).not.toBe(db.tabla(Content).find((c) => c.id === 40)!.metadata);
    });

    it('el origen queda intacto', async () => {
      const antes = JSON.stringify(db.tabla(Section).filter((s) => s.classId === ORIGEN));
      await service.importClassContent(DOCENTE, DESTINO, { sourceClassId: ORIGEN });
      expect(JSON.stringify(db.tabla(Section).filter((s) => s.classId === ORIGEN))).toBe(antes);
    });

    it('solo trae las secciones pedidas', async () => {
      const r = await service.importClassContent(DOCENTE, DESTINO, { sourceClassId: ORIGEN, sectionIds: [11] });
      expect(r).toEqual(expect.objectContaining({ sections: 1, learningUnits: 1, activities: 1 }));
    });

    it('rechaza secciones que no son de la clase de origen', async () => {
      await expect(service.importClassContent(DOCENTE, DESTINO, { sourceClassId: ORIGEN, sectionIds: [12] })).rejects.toThrow(BadRequestException);
    });

    it('rechaza traer contenido de la misma clase', async () => {
      await expect(service.importClassContent(DOCENTE, ORIGEN, { sourceClassId: ORIGEN })).rejects.toThrow(BadRequestException);
    });

    it('exige que el docente dicte las dos clases: sin la de origen no copia nada', async () => {
      authorization.assertTeacherOwnsClass.mockImplementation(async (_u: unknown, classId: number) => {
        if (classId === ORIGEN) throw new ForbiddenException('No dictas esta clase');
      });
      const antes = db.tabla(Section).length;

      await expect(service.importClassContent(DOCENTE, DESTINO, { sourceClassId: ORIGEN })).rejects.toThrow(ForbiddenException);
      expect(authorization.assertTeacherOwnsClass).toHaveBeenCalledWith(DOCENTE, DESTINO);
      expect(db.tabla(Section).length).toBe(antes);
    });
  });

  describe('copyActivity', () => {
    it('duplicar como variante: misma unidad, al final, en borrador, con título que lo dice y con sus preguntas', async () => {
      const r = await service.copyActivity(DOCENTE, 50, { learningUnitId: 30, variant: true });

      expect(r).toEqual(expect.objectContaining({ title: 'Ejercicio A (variante)', status: PublicationStatus.DRAFT }));
      const nueva = db.tabla(Activity).find((a) => a.id === r.id)!;
      expect(nueva).toEqual(expect.objectContaining({ learningUnitId: 30, order: 2, copiedFromId: 50, createdBy: 7, difficulty: 'basico' }));
      expect(db.tabla(ActivityQuestion).filter((q) => q.activityId === r.id)).toHaveLength(1);
    });

    it('desde el banco a otra unidad conserva el título', async () => {
      const r = await service.copyActivity(DOCENTE, 50, { learningUnitId: 31 });
      expect(r.title).toBe('Ejercicio A');
      expect(db.tabla(Activity).find((a) => a.id === r.id)!.learningUnitId).toBe(31);
    });

    it('comprueba la clase del ejercicio de origen y la de la unidad destino', async () => {
      await service.copyActivity(DOCENTE, 50, { learningUnitId: 31 });
      expect(authorization.assertTeacherOwnsClass.mock.calls.map((c) => c[1])).toEqual([ORIGEN, ORIGEN]);
    });

    it('no copia un ejercicio de una clase ajena', async () => {
      authorization.assertTeacherOwnsClass.mockRejectedValueOnce(new ForbiddenException());
      const antes = db.tabla(Activity).length;
      await expect(service.copyActivity(DOCENTE, 50, { learningUnitId: 31 })).rejects.toThrow(ForbiddenException);
      expect(db.tabla(Activity).length).toBe(antes);
    });

    it('un ejercicio que no existe da 404', async () => {
      await expect(service.copyActivity(DOCENTE, 999, { learningUnitId: 31 })).rejects.toThrow('Ejercicio no encontrado');
    });
  });

  describe('bank', () => {
    function servicioConConsulta(filas: Array<Record<string, unknown>>) {
      const llamadas: Array<[string, Record<string, unknown> | undefined]> = [];
      const qb: Record<string, jest.Mock> = {};
      for (const m of ['innerJoin', 'select', 'orderBy', 'addOrderBy', 'limit']) qb[m] = jest.fn(() => qb);
      qb.where = jest.fn((cond: string, params?: Record<string, unknown>) => { llamadas.push([cond, params]); return qb; });
      qb.andWhere = jest.fn((cond: string, params?: Record<string, unknown>) => { llamadas.push([cond, params]); return qb; });
      qb.getRawMany = jest.fn().mockResolvedValue(filas);
      const dataSource = {
        getRepository: (entidad: { name: string }) =>
          entidad.name === 'Activity'
            ? { createQueryBuilder: () => qb }
            : { find: jest.fn().mockResolvedValue([{ activityId: 5, type: 'mcq', question: '¿Qué  imprime?' + String.fromCharCode(10) + ' x', order: 0 }]) },
      };
      return { servicio: new ReuseService(dataSource as never, authorization as never), llamadas };
    }

    it('solo busca en las clases del docente y filtra por unidad cuando se pide', async () => {
      const { servicio, llamadas } = servicioConConsulta([]);
      await servicio.bank(DOCENTE, { learningUnitId: 30 });
      expect(llamadas).toContainEqual(['c.teacherId = :teacherId', { teacherId: 7 }]);
      expect(llamadas).toContainEqual(['u.id = :learningUnitId', { learningUnitId: 30 }]);
    });

    it('sin unidad no filtra por unidad', async () => {
      const { servicio, llamadas } = servicioConConsulta([]);
      await servicio.bank(DOCENTE, {});
      expect(llamadas.some(([c]) => c.includes('learningUnitId'))).toBe(false);
    });

    it('agrega el tipo de la primera pregunta y un resumen del enunciado en una línea', async () => {
      const { servicio } = servicioConConsulta([{ activityId: 5, title: 'A', difficulty: 'basico', status: 'draft', learningUnitId: 30, learningUnitTitle: 'U', classId: 1, className: 'C' }]);
      const r = await servicio.bank(DOCENTE, {});
      expect(r[0]).toEqual(expect.objectContaining({ activityId: 5, questionType: 'mcq', questionPreview: '¿Qué imprime? x', status: 'draft' }));
    });
  });
});
