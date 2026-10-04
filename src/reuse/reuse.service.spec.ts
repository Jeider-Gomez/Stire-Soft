import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ReuseService } from './reuse.service';
import { Section } from '../section/entities/section.entity';
import { Topic } from '../topic/entities/topic.entity';
import { LearningUnit } from '../learning-unit/entities/learning-unit.entity';
import { Content } from '../content/entities/content.entity';
import { Activity } from '../activities/entities/activity.entity';
import { ActivityQuestion } from '../activity-questions/entities/activity-question.entity';
import { PublicationStatus } from '../common/enums/status.enum';
import { Class } from '../class/entities/class.entity';

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
    // ORIGEN es del docente 7; 3 es de otro docente y la compartió como plantilla; 4 es de otro docente y no.
    db.insertar(Class, { id: ORIGEN, teacherId: 7, compartidaComoPlantilla: false, alcancePlantilla: 'nadie' });
    db.insertar(Class, { id: 3, name: 'ALGO', teacherId: 8, teacher: { fullName: 'Laura' }, compartidaComoPlantilla: true, alcancePlantilla: 'todos', vecesCopiada: 0, updatedAt: new Date() });
    db.insertar(Class, { id: 4, teacherId: 8, compartidaComoPlantilla: false, alcancePlantilla: 'nadie' });
    db.insertar(Section, { id: 13, classId: 3, title: 'Módulo compartido', order: 0, isPublished: true });
    db.insertar(Section, { id: 14, classId: 4, title: 'Módulo privado', order: 0, isPublished: true });
    const dataSource = {
      transaction: (cb: (m: unknown) => unknown) => cb(db.manager),
      getRepository: (e: { name: string }) => ({ findOne: (o: { where: Record<string, unknown> }) => db.manager.findOne(e, o), find: (o: { where: Record<string, unknown> }) => db.manager.find(e, o) }),
      // Conteos de contenido y votos «¿te sirvió?» por clase; el UPDATE del contador de copias no devuelve nada.
      query: jest.fn((sql: string) =>
        Promise.resolve(
          sql.includes('COUNT(DISTINCT')
            ? [{ classId: 3, modulos: '1', lecciones: '6', ejercicios: '20' }]
            : sql.includes('valoraciones_leccion')
              ? [{ classId: 3, utiles: '9', total: '10' }]
              : [],
        ),
      ),
    };
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

    it('de una clase ajena solo copia si su docente la compartió como plantilla; si no, no copia nada', async () => {
      const antes = db.tabla(Section).length;
      await expect(service.importClassContent(DOCENTE, DESTINO, { sourceClassId: 4 })).rejects.toThrow('no la compartió contigo');
      expect(db.tabla(Section).length).toBe(antes);

      const r = await service.importClassContent(DOCENTE, DESTINO, { sourceClassId: 3 });
      expect(r.sections).toBe(1);
      expect(db.tabla(Section).find((x) => x.classId === DESTINO && x.title === 'Módulo compartido')).toMatchObject({ isPublished: false });
      // la clase destino sí tiene que ser propia
      expect(authorization.assertTeacherOwnsClass).toHaveBeenCalledWith(DOCENTE, DESTINO);
      await expect(service.importClassContent(DOCENTE, DESTINO, { sourceClassId: 99 })).rejects.toThrow('Clase no encontrada');
    });

    it('los módulos de una plantilla se pueden ver para elegir; los de una clase ajena sin compartir, no', async () => {
      await expect(service.modulosParaCopiar(DOCENTE, 3)).resolves.toEqual([{ id: 13, title: 'Módulo compartido', order: 0 }]);
      await expect(service.modulosParaCopiar(DOCENTE, 4)).rejects.toThrow(ForbiddenException);
    });

    it('lista las plantillas de otros docentes con cuánto contenido tienen y qué tan útiles fueron, sin el código de ingreso', async () => {
      const [p, ...resto] = await service.plantillas(DOCENTE);
      expect(resto).toEqual([]);
      expect(p).toEqual(expect.objectContaining({ classId: 3, nombre: 'ALGO', docente: 'Laura', modulos: 1, lecciones: 6, ejercicios: 20, valoracion: { utiles: 9, total: 10 }, cercania: 5 }));
      expect(p).not.toHaveProperty('codigo');
    });

    it('copiar la plantilla de otro docente suma una copia; copiar de una clase propia, no', async () => {
      const query = (service as unknown as { dataSource: { query: jest.Mock } }).dataSource.query;
      await service.importClassContent(DOCENTE, DESTINO, { sourceClassId: 3 });
      expect(query).toHaveBeenCalledWith(expect.stringContaining('vecesCopiada'), [3]);
      query.mockClear();
      await service.importClassContent(DOCENTE, DESTINO, { sourceClassId: ORIGEN });
      expect(query).not.toHaveBeenCalledWith(expect.stringContaining('vecesCopiada'), expect.anything());
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

// Alcances y orden de las plantillas (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md §2.3) con asignaturas reales del catálogo.
describe('ReuseService.plantillas — alcance, cercanía y limpieza', () => {
  const EDU = { id: 10, name: 'Licenciatura en Informática', tipo: 'carrera', facultad: 'Educación' };
  const ALGO = { id: 1, nombre: 'Fundamentos de Algoritmia', programId: 10, institutionId: 100, periodoPlan: 3, program: EDU, institution: null };
  const PROG = { id: 2, nombre: 'Fundamentos de Programación', programId: 10, institutionId: 100, periodoPlan: 4, program: EDU, institution: null };
  const IA = { id: 5, nombre: 'Uso de la IA en la Educación', programId: null, institutionId: 100, periodoPlan: null, program: null, institution: null };
  const reciente = new Date();
  const viejo = new Date(Date.now() - 400 * 24 * 3600 * 1000);

  function servicio(clases: Array<Record<string, unknown>>, lecciones: Record<number, number>) {
    const db = baseEnMemoria();
    for (const c of clases) db.insertar(Class, c as Fila);
    db.insertar({ name: 'Asignatura' }, ALGO as Fila);
    const dataSource = {
      getRepository: (e: { name: string }) => ({ find: (o: { where: Record<string, unknown> }) => db.manager.find(e, o), findOne: (o: { where: Record<string, unknown> }) => db.manager.findOne(e, o) }),
      query: jest.fn((sql: string) =>
        Promise.resolve(sql.includes('COUNT(DISTINCT') ? Object.entries(lecciones).map(([id, n]) => ({ classId: Number(id), modulos: '1', lecciones: String(n), ejercicios: '3' })) : []),
      ),
    };
    return new ReuseService(dataSource as never, { assertTeacherOwnsClass: jest.fn() } as never);
  }
  const plantilla = (id: number, extra: Record<string, unknown>) => ({
    id, name: `Clase ${id}`, teacherId: 8, teacher: { fullName: 'Laura' }, compartidaComoPlantilla: true, vecesCopiada: 0, updatedAt: reciente, ...extra,
  });

  it('un docente de Fundamentos de Algoritmia ve lo de su asignatura y su programa, no lo restringido a otra asignatura', async () => {
    const s = servicio(
      [
        { id: 90, teacherId: 7, asignatura: ALGO, compartidaComoPlantilla: false }, // su propia clase: le da contexto
        plantilla(1, { asignatura: ALGO, alcancePlantilla: 'asignatura' }),
        plantilla(2, { asignatura: PROG, alcancePlantilla: 'programa' }),
        plantilla(3, { asignatura: PROG, alcancePlantilla: 'asignatura' }),
        plantilla(4, { asignatura: IA, alcancePlantilla: 'institucion' }),
      ],
      { 1: 5, 2: 5, 3: 5, 4: 5 },
    );
    expect((await s.plantillas(DOCENTE)).map((p) => p.classId).sort()).toEqual([1, 2, 4]);
  });

  it('un docente nuevo, sin clases, ve lo compartido con todos; al elegir la asignatura ve también lo de esa asignatura', async () => {
    const s = servicio([plantilla(1, { asignatura: ALGO, alcancePlantilla: 'asignatura' }), plantilla(2, { asignatura: PROG, alcancePlantilla: 'todos' })], { 1: 5, 2: 5 });
    expect((await s.plantillas(DOCENTE)).map((p) => p.classId)).toEqual([2]);
    expect((await s.plantillas(DOCENTE, 1)).map((p) => p.classId)).toEqual([1, 2]); // la de su asignatura primero
  });

  it('ordena por cercanía y luego por copias; no lista vacías ni abandonadas', async () => {
    const s = servicio(
      [
        plantilla(1, { asignatura: PROG, alcancePlantilla: 'todos', vecesCopiada: 9 }),
        plantilla(2, { asignatura: ALGO, alcancePlantilla: 'todos', vecesCopiada: 0 }),
        plantilla(3, { asignatura: ALGO, alcancePlantilla: 'todos', vecesCopiada: 4 }),
        plantilla(4, { asignatura: ALGO, alcancePlantilla: 'todos' }), // vacía
        plantilla(5, { asignatura: ALGO, alcancePlantilla: 'todos', updatedAt: viejo }), // nadie la copió en un año
        plantilla(6, { asignatura: ALGO, alcancePlantilla: 'todos', updatedAt: viejo, vecesCopiada: 2 }), // vieja pero usada
      ],
      { 1: 5, 2: 5, 3: 5, 4: 0, 5: 5, 6: 5 },
    );
    expect((await s.plantillas(DOCENTE, 1)).map((p) => p.classId)).toEqual([3, 6, 2, 1]);
  });
});
