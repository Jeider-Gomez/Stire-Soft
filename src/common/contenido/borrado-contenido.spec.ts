import { ConflictException, ForbiddenException } from '@nestjs/common';
import { borrarLecciones, exigirQueSePuedaEliminar, impactoDeLecciones, motivoDeBloqueo } from './borrado-contenido';
import { SectionService } from '../../section/section.service';
import { TopicService } from '../../topic/topic.service';
import { LearningUnitService } from '../../learning-unit/learning-unit.service';
import { AuthorizationService } from '../authorization/authorization.service';
import { UserRole } from '../../user/entities/user.entity';

/**
 * Fase 30 (05/10): eliminar un módulo, tema o lección no puede llevarse el trabajo de los estudiantes. Las llaves
 * foráneas reales borran `learning_progress` y `review_schedules` EN CASCADA con la lección, y `activities` no tiene
 * cascada (con ejercicios, el borrado daba 500). El primer intento sin revisar (949c06e) borraba sin mirar.
 */

/** Un EntityManager falso: responde a cada consulta según su texto y anota las que recibe. */
function managerFalso(conteos: { ejercicios?: number; entregas?: number; estudiantes?: number } = {}) {
  const consultas: string[] = [];
  const query = jest.fn(async (sql: string) => {
    consultas.push(sql);
    if (sql.startsWith('SELECT COUNT(DISTINCT')) return [{ n: conteos.estudiantes ?? 0 }];
    if (sql.includes('FROM submissions')) return [{ n: conteos.entregas ?? 0 }];
    if (sql.startsWith('SELECT COUNT(*) AS n FROM activities')) return [{ n: conteos.ejercicios ?? 0 }];
    return [];
  });
  const deleteFn = jest.fn().mockResolvedValue(undefined);
  const manager = { query, delete: deleteFn, transaction: jest.fn(async (fn: (m: unknown) => Promise<unknown>) => fn(manager)) };
  return { manager, consultas, deleteFn };
}

describe('borrado de contenido (Fase 30)', () => {
  it('sin lecciones: se puede eliminar sin consultar nada', async () => {
    const { manager, consultas } = managerFalso();
    const r = await impactoDeLecciones(manager as never, [], { modulos: 1, temas: 2 });
    expect(r).toEqual({ modulos: 1, temas: 2, lecciones: 0, ejercicios: 0, estudiantesConAvance: 0, entregas: 0, sePuedeEliminar: true });
    expect(consultas).toHaveLength(0);
  });

  it('con lecciones y ejercicios pero sin trabajo de estudiantes: se puede, y cuenta lo que se pierde', async () => {
    const { manager } = managerFalso({ ejercicios: 7 });
    const r = await impactoDeLecciones(manager as never, [1, 2, 3], { modulos: 0, temas: 1 });
    expect(r).toMatchObject({ lecciones: 3, ejercicios: 7, estudiantesConAvance: 0, entregas: 0, sePuedeEliminar: true });
    expect(r.motivo).toBeUndefined();
  });

  it('con avance de estudiantes: NO se puede, y el motivo lo dice en términos del docente', async () => {
    const { manager } = managerFalso({ ejercicios: 2, estudiantes: 3 });
    const r = await impactoDeLecciones(manager as never, [1], { modulos: 0, temas: 0 });
    expect(r.sePuedeEliminar).toBe(false);
    expect(r.motivo).toBe('3 estudiantes tienen avance aquí. Archívalo para no perder su trabajo.');
    expect(() => exigirQueSePuedaEliminar(r)).toThrow(ConflictException);
  });

  it('con entregas aunque el conteo de estudiantes diera 0: tampoco se puede', async () => {
    const { manager } = managerFalso({ entregas: 1 });
    expect((await impactoDeLecciones(manager as never, [1], { modulos: 0, temas: 0 })).sePuedeEliminar).toBe(false);
  });

  it('abrir una lección no cuenta como avance: el progreso exige intentos o dominio', async () => {
    const { manager, consultas } = managerFalso();
    await impactoDeLecciones(manager as never, [1], { modulos: 0, temas: 0 });
    const estudiantes = consultas.find((c) => c.startsWith('SELECT COUNT(DISTINCT'))!;
    expect(estudiantes).toContain('attemptsCount > 0 OR mastery > 0');
    // Avance, entregas, repasos y valoraciones cuentan como trabajo del estudiante.
    for (const tabla of ['learning_progress', 'submissions', 'review_schedules', 'valoraciones_leccion']) expect(estudiantes).toContain(tabla);
  });

  it('el motivo en singular', () => {
    expect(motivoDeBloqueo(1)).toBe('1 estudiante tiene avance aquí. Archívalo para no perder su trabajo.');
  });

  it('borra en el orden que exigen las llaves: referencias, ejercicios y por último las lecciones', async () => {
    const { manager, consultas } = managerFalso();
    await borrarLecciones(manager as never, [4, 5]);
    const indice = (fragmento: string) => consultas.findIndex((c) => c.includes(fragmento));
    expect(indice('SET lastActivityId = NULL')).toBeGreaterThanOrEqual(0);
    expect(indice('UPDATE entregas SET learningUnitId = NULL')).toBeGreaterThanOrEqual(0);
    expect(indice('DELETE FROM activities')).toBeGreaterThan(indice('SET lastActivityId = NULL'));
    expect(indice('DELETE FROM learning_units')).toBeGreaterThan(indice('DELETE FROM activities'));
    expect(consultas.at(-1)).toContain('DELETE FROM learning_units WHERE id IN (?)');
  });

  it('sin lecciones no toca la base', async () => {
    const { manager, consultas } = managerFalso();
    await borrarLecciones(manager as never, []);
    expect(consultas).toHaveLength(0);
  });
});

describe('servicios que eliminan (Fase 30)', () => {
  const docenteDueno = { id: 10, role: UserRole.DOCENTE } as never;
  const docenteAjeno = { id: 99, role: UserRole.DOCENTE } as never;
  const authService = () => new AuthorizationService({ findOne: jest.fn().mockResolvedValue({ id: 5, teacherId: 10 }) } as never, { findOne: jest.fn() } as never);
  const moduloConLecciones = () => ({ id: 1, classId: 5, isPublished: true, isActive: true, topics: [{ id: 2, learningUnits: [{ id: 3 }, { id: 4 }] }] });

  function seccion(conteos: Parameters<typeof managerFalso>[0]) {
    const f = managerFalso(conteos);
    const repo = { findOne: jest.fn().mockResolvedValue(moduloConLecciones()), save: jest.fn((s) => Promise.resolve(s)), manager: f.manager };
    return { service: new SectionService(repo as never, {} as never, authService()), repo, ...f };
  }

  it('módulo con avance de estudiantes: 409 y no borra nada', async () => {
    const { service, consultas, deleteFn } = seccion({ estudiantes: 2 });
    await expect(service.remove(1, docenteDueno)).rejects.toThrow(ConflictException);
    expect(consultas.some((c) => c.startsWith('DELETE') || c.startsWith('UPDATE'))).toBe(false);
    expect(deleteFn).not.toHaveBeenCalled();
  });

  it('módulo sin trabajo de estudiantes: borra sus lecciones y luego el módulo', async () => {
    const { service, consultas, deleteFn } = seccion({ ejercicios: 3 });
    await service.remove(1, docenteDueno);
    expect(consultas.some((c) => c.includes('DELETE FROM learning_units'))).toBe(true);
    expect(deleteFn).toHaveBeenCalledWith(expect.anything(), { id: 1 });
  });

  it('módulo de otro docente: 403 antes de medir o borrar', async () => {
    const { service, consultas } = seccion({});
    await expect(service.remove(1, docenteAjeno)).rejects.toThrow(ForbiddenException);
    expect(consultas).toHaveLength(0);
  });

  it('impacto de un módulo: cuenta sus temas y lecciones', async () => {
    const { service } = seccion({ ejercicios: 6 });
    await expect(service.impacto(1, docenteDueno)).resolves.toMatchObject({ modulos: 1, temas: 1, lecciones: 2, ejercicios: 6, sePuedeEliminar: true });
  });

  it('archivar un módulo lo despublica; restaurarlo lo deja en borrador; archivado no se publica', async () => {
    const { service, repo } = seccion({});
    const archivado = await service.archivar(1, docenteDueno);
    expect(archivado).toMatchObject({ isActive: false, isPublished: false });
    repo.findOne.mockResolvedValue({ ...moduloConLecciones(), isActive: false, isPublished: false });
    await expect(service.togglePublish(1, docenteDueno)).rejects.toThrow(ConflictException);
    const restaurado = await service.restaurar(1, docenteDueno);
    expect(restaurado).toMatchObject({ isActive: true, isPublished: false });
  });

  it('tema con avance de estudiantes: 409; sin avance: borra lecciones y tema', async () => {
    const conAvance = managerFalso({ estudiantes: 1 });
    const repo = (m: unknown) => ({ findOne: jest.fn().mockResolvedValue({ id: 2, sectionId: 1, learningUnits: [{ id: 3 }] }), manager: m });
    const sectionService = { findOne: jest.fn().mockResolvedValue({ id: 1, classId: 5 }) };
    const bloqueado = new TopicService(repo(conAvance.manager) as never, sectionService as never, authService());
    await expect(bloqueado.deletePermanent(2, docenteDueno)).rejects.toThrow(ConflictException);
    expect(conAvance.deleteFn).not.toHaveBeenCalled();

    const sinAvance = managerFalso();
    const libre = new TopicService(repo(sinAvance.manager) as never, sectionService as never, authService());
    await libre.deletePermanent(2, docenteDueno);
    expect(sinAvance.consultas.some((c) => c.includes('DELETE FROM learning_units'))).toBe(true);
    expect(sinAvance.deleteFn).toHaveBeenCalledWith(expect.anything(), { id: 2 });
  });

  it('lección con avance: 409 y su avance sigue ahí (antes la cascada lo borraba)', async () => {
    const f = managerFalso({ estudiantes: 4 });
    const unitRepo = { findOne: jest.fn().mockResolvedValue({ id: 3, topicId: 2 }), manager: f.manager, save: jest.fn((u) => Promise.resolve(u)) };
    const service = new LearningUnitService(
      unitRepo as never,
      { findOne: jest.fn().mockResolvedValue({ id: 2, sectionId: 1 }) } as never,
      { findOne: jest.fn().mockResolvedValue({ id: 1, classId: 5 }) } as never,
      authService(),
    );
    await expect(service.remove(3, docenteDueno)).rejects.toThrow(ConflictException);
    expect(f.consultas.some((c) => c.startsWith('DELETE'))).toBe(false);
    await expect(service.archivar(3, docenteDueno)).resolves.toMatchObject({ isActive: false });
    await expect(service.restaurar(3, docenteDueno)).resolves.toMatchObject({ isActive: true });
  });
});
