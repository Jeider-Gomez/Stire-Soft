import 'reflect-metadata';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RefuerzosService } from './refuerzos.service';
import { RefuerzosController } from './refuerzos.controller';
import { asignacionTrasRefuerzo, ordenarSugerencias, pasosHechos, validarRefuerzo } from './refuerzo-reglas';
import { actividadVisiblePara } from '../activities/visibilidad';
import { User, UserRole } from '../user/entities/user.entity';

type Deps = ConstructorParameters<typeof RefuerzosService>;

const docente = { id: 9, role: UserRole.DOCENTE } as User;
const otroDocente = { id: 10, role: UserRole.DOCENTE } as User;
const luisa = { id: 5, role: UserRole.ESTUDIANTE } as User;
const base = { classId: 3, tipo: 'refuerzo', titulo: 'Repasemos el else if', learningUnitIds: [30], estudiantes: [5] };

describe('Refuerzos: reglas', () => {
  it('valida tipo, lecciones, estudiantes y entre 1 y 5 pasos', () => {
    expect(() => validarRefuerzo({ ...base, tipo: 'castigo', pasos: [{ tipo: 'ejercicio', activityId: 1 }] })).toThrow('refuerzo o un reto');
    expect(() => validarRefuerzo({ ...base, estudiantes: [], pasos: [{ tipo: 'ejercicio', activityId: 1 }] })).toThrow('un estudiante');
    expect(() => validarRefuerzo({ ...base, pasos: [] })).toThrow('al menos un paso');
    const seis = Array.from({ length: 6 }, (_, i) => ({ tipo: 'ejercicio', activityId: i + 1 }));
    expect(() => validarRefuerzo({ ...base, pasos: seis })).toThrow('como máximo 5');
  });

  it('un recurso se normaliza como en las lecciones (YouTube sin cookies); un sitio inválido se rechaza', () => {
    const r = validarRefuerzo({ ...base, pasos: [{ tipo: 'recurso', titulo: 'Video', url: 'https://youtu.be/dQw4w9WgXcQ' }] });
    expect(r.pasos[0]).toMatchObject({ tipo: 'recurso', provider: 'youtube', embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' });
    expect(() => validarRefuerzo({ ...base, pasos: [{ tipo: 'recurso', titulo: 'X', url: 'javascript:alert(1)' }] })).toThrow('paso 1');
  });

  it('al sumar un ejercicio a un refuerzo: si era de toda la clase sigue así; si era borrador, queda solo para esos estudiantes', () => {
    expect(asignacionTrasRefuerzo(null, true, [5])).toBeNull();
    expect(asignacionTrasRefuerzo(null, false, [5, 6])).toEqual([5, 6]);
    expect(asignacionTrasRefuerzo([7], true, [5, 7])).toEqual([7, 5]);
  });

  it('pasos hechos: ejercicio intentado, entrega enviada, explicación o recurso marcado', () => {
    const pasos = [
      { tipo: 'explicacion' as const, titulo: 'A', texto: 'x' },
      { tipo: 'ejercicio' as const, activityId: 11 },
      { tipo: 'entrega' as const, entregaId: 4 },
    ];
    expect(pasosHechos(pasos, { intentados: new Set([11]), entregados: new Set(), marcados: new Set([0]) })).toEqual([true, true, false]);
  });

  it('sugerencias: en un refuerzo, primero lo que no aprueban y lo más fácil; en un reto, lo más difícil', () => {
    const lista = [
      { id: 1, nivel: 2, aprobadosPor: 0 },
      { id: 2, nivel: 0, aprobadosPor: 2 },
      { id: 3, nivel: 0, aprobadosPor: 1 },
      { id: 4, nivel: 1, aprobadosPor: 0 },
    ];
    expect(ordenarSugerencias(lista, 'refuerzo', 2).map((x) => x.id)).toEqual([3, 4, 1, 2]);
    expect(ordenarSugerencias(lista, 'reto', 2).map((x) => x.id)).toEqual([1, 4, 3, 2]);
  });

  it('una actividad asignada a algunos no existe para los demás; un borrador no existe para nadie', () => {
    expect(actividadVisiblePara({ status: 'published', asignadaA: null }, 5)).toBe(true);
    expect(actividadVisiblePara({ status: 'published', asignadaA: [5] }, 5)).toBe(true);
    expect(actividadVisiblePara({ status: 'published', asignadaA: [6] }, 5)).toBe(false);
    expect(actividadVisiblePara({ status: 'draft', asignadaA: [5] }, 5)).toBe(false);
  });
});

function crear(opciones: { actividad?: Record<string, unknown>; refuerzo?: Record<string, unknown> | null } = {}) {
  const actividad = { id: 11, learningUnitId: 30, status: 'draft', asignadaA: null, publishedAt: null, ...opciones.actividad };
  const refuerzo = opciones.refuerzo === undefined
    ? { id: 1, classId: 3, estudiantes: [5], archivado: false, pasos: [{ tipo: 'explicacion', titulo: 'A', texto: 'x' }, { tipo: 'ejercicio', activityId: 11 }], learningUnitIds: [30], dominioInicial: { 5: { 30: 40 } }, createdAt: new Date() }
    : opciones.refuerzo;
  const refuerzos = {
    create: jest.fn((r: object) => r),
    save: jest.fn((r: object) => Promise.resolve({ id: 1, createdAt: new Date(), ...r })),
    findOne: jest.fn(() => Promise.resolve(refuerzo)),
    find: jest.fn(() => Promise.resolve(refuerzo ? [refuerzo] : [])),
    manager: { query: jest.fn(() => Promise.resolve([{ id: 30, title: 'Varios caminos con else if' }])), find: jest.fn(() => Promise.resolve([])) },
  };
  const hechos = { find: jest.fn(() => Promise.resolve([])), findOne: jest.fn(() => Promise.resolve(null)), create: jest.fn((h: object) => h), save: jest.fn((h: object) => Promise.resolve(h)) };
  const actividades = { findOne: jest.fn(() => Promise.resolve(actividad)), find: jest.fn(() => Promise.resolve([actividad])), save: jest.fn((a: object) => Promise.resolve(a)) };
  const entregas = { findOne: jest.fn(() => Promise.resolve(null)), find: jest.fn(() => Promise.resolve([])), save: jest.fn() };
  const envios = { find: jest.fn(() => Promise.resolve([])) };
  const matriculas = { find: jest.fn(() => Promise.resolve([{ studentId: 5, classId: 3 }])) };
  const progresos = { find: jest.fn(() => Promise.resolve([{ studentId: 5, learningUnitId: 30, mastery: 42.4 }])) };
  const intentos = { find: jest.fn(() => Promise.resolve([])) };
  const usuarios = { find: jest.fn(() => Promise.resolve([{ id: 5, fullName: 'Luisa' }])) };
  const autorizacion = { assertTeacherOwnsClass: jest.fn((u: User) => (u.id === 9 ? Promise.resolve() : Promise.reject(new ForbiddenException()))) };
  const mensajes = { create: jest.fn(() => Promise.resolve({})) };
  const service = new RefuerzosService(
    refuerzos as unknown as Deps[0], hechos as unknown as Deps[1], actividades as unknown as Deps[2], entregas as unknown as Deps[3],
    envios as unknown as Deps[4], matriculas as unknown as Deps[5], progresos as unknown as Deps[6], intentos as unknown as Deps[7],
    usuarios as unknown as Deps[8], autorizacion as unknown as Deps[9], mensajes as unknown as Deps[10],
  );
  return { service, refuerzos, actividades, hechos, mensajes };
}

describe('RefuerzosService', () => {
  const datos = { ...base, mensaje: 'Hola Luisa, vi que el else if te está costando.', pasos: [{ tipo: 'ejercicio', activityId: 11 }] };

  it('un ejercicio en borrador se publica solo para los estudiantes del refuerzo; se guarda el dominio de partida y se envía el mensaje', async () => {
    const { service, actividades, refuerzos, mensajes } = crear();
    await service.crear(docente, datos);
    expect(actividades.save).toHaveBeenCalledWith(expect.objectContaining({ id: 11, status: 'published', asignadaA: [5] }));
    expect(refuerzos.save).toHaveBeenCalledWith(expect.objectContaining({ dominioInicial: { 5: { 30: 42 } }, createdBy: 9 }));
    expect(mensajes.create).toHaveBeenCalledWith(expect.objectContaining({ receiverId: 5, content: expect.stringContaining('Repasemos el else if') }), docente);
  });

  it('un ejercicio de otra clase, una lección ajena o un estudiante de otra clase se rechazan', async () => {
    await expect(crear({ actividad: { learningUnitId: 99 } }).service.crear(docente, datos)).rejects.toThrow('ejercicio');
    await expect(crear().service.crear(docente, { ...datos, learningUnitIds: [77] })).rejects.toThrow(BadRequestException);
    await expect(crear().service.crear(docente, { ...datos, estudiantes: [8] })).rejects.toThrow('estudiante');
    await expect(crear().service.crear(otroDocente, datos)).rejects.toThrow(ForbiddenException);
  });

  it('¿funcionó?: el docente ve el dominio antes → ahora y los pasos hechos', async () => {
    const lista = await crear().service.deLaClase(docente, 3);
    expect(lista[0].estudiantes[0]).toMatchObject({ nombre: 'Luisa', pasosHechos: 0, dominio: [{ learningUnitId: 30, antes: 40, ahora: 42 }] });
  });

  it('el estudiante solo ve sus refuerzos; marcar «Ya lo vi» solo vale para explicaciones y recursos', async () => {
    const { service, hechos } = crear();
    await expect(service.verComoEstudiante({ id: 6, role: UserRole.ESTUDIANTE } as User, 1)).rejects.toThrow(NotFoundException);
    await service.marcar(luisa, 1, 0);
    expect(hechos.save).toHaveBeenCalledWith(expect.objectContaining({ refuerzoId: 1, studentId: 5, paso: 0 }));
    await expect(service.marcar(luisa, 1, 1)).rejects.toThrow('haciéndolo');
  });
});

describe('RefuerzosController: roles', () => {
  it.each([
    ['mios', ['estudiante']],
    ['ver', ['estudiante']],
    ['marcar', ['estudiante']],
    ['deLaClase', ['docente', 'admin']],
    ['sugerencias', ['docente', 'admin']],
    ['crear', ['docente', 'admin']],
    ['archivar', ['docente', 'admin']],
  ] as const)('%s', (metodo, roles) => {
    expect(Reflect.getMetadata('roles', RefuerzosController.prototype[metodo])).toEqual(roles);
  });
});

describe('intentoDeRefuerzo (sugerencia n.º 11 de José, 10/10)', () => {
  const { intentoDeRefuerzo } = jest.requireActual<typeof import('./refuerzo-reglas')>('./refuerzo-reglas');
  const creado = new Date('2026-10-10T12:00:00Z');
  const r = (extra: object = {}) => ({ createdAt: creado, archivado: false, estudiantes: [7], pasos: [{ tipo: 'ejercicio' as const, activityId: 15 }], ...extra });
  const antes = new Date('2026-10-09T12:00:00Z');
  const despues = new Date('2026-10-10T13:00:00Z');

  it('da un intento propio si el docente le mandó ese ejercicio y no lo ha hecho desde entonces', () => {
    expect(intentoDeRefuerzo([r()], 15, 7, [antes])).toBe(true);
  });
  it('no lo da si ya lo hizo dentro del refuerzo, si es otro ejercicio u otro estudiante, o si está archivado', () => {
    expect(intentoDeRefuerzo([r()], 15, 7, [antes, despues])).toBe(false);
    expect(intentoDeRefuerzo([r()], 16, 7, [antes])).toBe(false);
    expect(intentoDeRefuerzo([r()], 15, 8, [antes])).toBe(false);
    expect(intentoDeRefuerzo([r({ archivado: true })], 15, 7, [antes])).toBe(false);
  });
});
