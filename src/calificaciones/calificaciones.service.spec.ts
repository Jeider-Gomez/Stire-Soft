import 'reflect-metadata';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CalificacionesService } from './calificaciones.service';
import { CalificacionesController } from './calificaciones.controller';
import { combinar, construirLibro, redondear, validarEsquema, validarMotivo, validarNota, type Esquema, type EntradaLibro } from './calificacion-reglas';
import { User, UserRole } from '../user/entities/user.entity';

type Deps = ConstructorParameters<typeof CalificacionesService>;

const docente = { id: 9, role: UserRole.DOCENTE } as User;
const otroDocente = { id: 10, role: UserRole.DOCENTE } as User;
const luisa = { id: 5, role: UserRole.ESTUDIANTE } as User;
const ahora = new Date('2026-09-30T15:00:00Z');
const ayer = new Date('2026-09-29T15:00:00Z');
const manana = new Date('2026-10-01T15:00:00Z');

/** Una de las formas que el docente puede armar: práctica + entregas + parcial, con porcentajes. */
const esquemaSugerido = (): Esquema => ({
  componentes: [
    { clave: 'practica', nombre: 'Práctica (dominio de las lecciones)', tipo: 'dominio', peso: 40, moduloId: null, lecciones: null, entregas: null },
    { clave: 'entregas', nombre: 'Entregas', tipo: 'entregas', peso: 30, moduloId: null, lecciones: null, entregas: null },
    { clave: 'parcial', nombre: 'Parcial', tipo: 'manual', peso: 30, moduloId: null, lecciones: null, entregas: null },
  ],
  calculo: 'porcentajes',
  grupos: [],
  notaAprobatoria: 3,
  visibleParaEstudiantes: false,
});

describe('Calificaciones: reglas', () => {
  it('la nota va de 0,0 a 5,0 con una cifra; acepta coma; vacía es «sin nota»', () => {
    expect(validarNota('4,5')).toBe(4.5);
    expect(validarNota(3.25)).toBe(3.3);
    expect(validarNota('')).toBeNull();
    expect(() => validarNota(5.1)).toThrow('0,0 a 5,0');
    expect(() => validarNota('abc')).toThrow('0,0 a 5,0');
    expect(redondear(4.25)).toBe(4.3);
  });

  it('conserva las claves, crea las que faltan y no deja usar «final»; valida tipo, lecciones y porcentajes', () => {
    const e = validarEsquema({ componentes: [
      { clave: 'practica', nombre: 'Práctica', tipo: 'dominio', peso: 40 },
      { nombre: 'Entregas', tipo: 'entregas', peso: 30, entregas: [3, 3] },
      { clave: 'final', nombre: 'Parcial', tipo: 'manual', peso: 30 },
    ] });
    expect(e.componentes.map((c) => c.clave)).toEqual(['practica', 'c2', 'c3']);
    expect(e.componentes[1].entregas).toEqual([3]);
    expect(e.componentes[0]).toMatchObject({ lecciones: null, moduloId: null });
    expect(e).toMatchObject({ calculo: 'promedio', grupos: [], notaAprobatoria: 3, visibleParaEstudiantes: false });
    expect(() => validarEsquema({ componentes: [{ nombre: 'A', tipo: 'rubrica' }] })).toThrow('tipo');
    expect(() => validarEsquema({ componentes: [] })).toThrow('al menos una nota');
    expect(() => validarEsquema({ componentes: [{ nombre: 'A', tipo: 'dominio', lecciones: [] }] })).toThrow('al menos una opción');
    expect(() => validarEsquema({ componentes: [{ nombre: 'A', tipo: 'manual', peso: 120 }] })).toThrow('0 a 100');
    expect(() => validarEsquema({ calculo: 'magia', componentes: [{ nombre: 'A', tipo: 'manual' }] })).toThrow('cómo se calcula');
    // la primera versión mandaba usarPesos
    expect(validarEsquema({ usarPesos: true, componentes: [{ nombre: 'A', tipo: 'manual', peso: 100 }] }).calculo).toBe('porcentajes');
  });

  it('práctica + entregas + parcial con porcentajes es válido tal cual', () => {
    const s = esquemaSugerido();
    expect(validarEsquema({ ...s })).toEqual(s);
  });

  it('a su manera: los porcentajes no tienen que sumar 100 (se reparten en proporción) y 0 = se registra pero no cuenta', () => {
    expect(combinar([{ nombre: 'A', nota: 4, peso: 20 }, { nombre: 'B', nota: 2, peso: 20 }], 'porcentajes')).toEqual({ nota: 3, faltan: [] });
    expect(combinar([{ nombre: 'A', nota: 4, peso: 30 }, { nombre: 'Asistencia', nota: 1, peso: 0 }], 'porcentajes')).toEqual({ nota: 4, faltan: [] });
    expect(combinar([{ nombre: 'A', nota: 4, peso: 0 }, { nombre: 'B', nota: 3, peso: 90 }], 'promedio')).toEqual({ nota: 3.5, faltan: [] });
    expect(combinar([{ nombre: 'A', nota: null, peso: 50 }], 'porcentajes')).toEqual({ nota: null, faltan: ['A'] });
  });

  it('cada nota es del curso o de un módulo; cada módulo con notas tiene su grupo (por defecto promedia y no pesa)', () => {
    const e = validarEsquema({
      calculo: 'porcentajes',
      componentes: [
        { nombre: 'Quiz en clase', tipo: 'manual', moduloId: 2, peso: 40 },
        { nombre: 'Taller', tipo: 'manual', moduloId: 2, peso: 60 },
        { nombre: 'Práctica', tipo: 'dominio', moduloId: 3 },
        { nombre: 'Final', tipo: 'manual', moduloId: null, peso: 40 },
      ],
      grupos: [{ moduloId: 2, calculo: 'porcentajes', peso: 30 }, { moduloId: 99, calculo: 'promedio', peso: 50 }],
    });
    expect(e.grupos).toEqual([{ moduloId: 2, calculo: 'porcentajes', peso: 30 }, { moduloId: 3, calculo: 'promedio', peso: 0 }]);
    expect(() => validarEsquema({ componentes: [{ nombre: 'A', tipo: 'manual', moduloId: -1 }] })).toThrow('módulo');
  });

  it('una nota nueva se le avisa al estudiante solo si la clase muestra las notas (07/10)', async () => {
    const oculta = { emit: jest.fn() };
    await crear({ eventEmitter: oculta }).service.registrarNota(docente, 3, 5, { clave: 'parcial', nota: 4 });
    expect(oculta.emit).not.toHaveBeenCalled();
    const visible = { emit: jest.fn() };
    await crear({ eventEmitter: visible, esquema: { id: 1, classId: 3, ...esquemaSugerido(), visibleParaEstudiantes: true, updatedAt: ahora } })
      .service.registrarNota(docente, 3, 5, { clave: 'parcial', nota: 4 });
    expect(visible.emit).toHaveBeenCalledWith('nota.registrada', expect.objectContaining({ classId: 3, studentId: 5, nombre: 'Parcial', nota: 4 }));
  });

  it('el ajuste de la final exige motivo; una nota manual no', () => {
    expect(() => validarMotivo('', true)).toThrow('motivo');
    expect(() => validarMotivo('ok', true)).toThrow('más de detalle');
    expect(validarMotivo('  Presentó el supletorio  ', true)).toBe('Presentó el supletorio');
    expect(validarMotivo('', false)).toBeNull();
  });
});

describe('Calificaciones: el libro', () => {
  const entrada = (cambios: Partial<EntradaLibro> = {}): EntradaLibro => ({
    esquema: esquemaSugerido(),
    estudiantes: [{ id: 5, nombre: 'Luisa', email: 'luisa@x.co' }, { id: 6, nombre: 'Julián', email: 'julian@x.co' }],
    lecciones: [30, 31],
    modulos: [{ id: 2, titulo: 'Módulo 1', lecciones: [30] }, { id: 3, titulo: 'Módulo 2', lecciones: [31] }],
    dominio: new Map([[5, new Map([[30, 90], [31, 70]])]]),
    entregas: [
      { id: 1, titulo: 'Calculadora', conNota: true, publicada: true, asignadaA: null, cierraAt: ayer, aceptaTarde: false },
      { id: 2, titulo: 'Página', conNota: true, publicada: true, asignadaA: null, cierraAt: manana, aceptaTarde: true },
      { id: 3, titulo: 'Formativa', conNota: false, publicada: true, asignadaA: null, cierraAt: null, aceptaTarde: true },
      { id: 4, titulo: 'Solo para Julián', conNota: true, publicada: true, asignadaA: [6], cierraAt: null, aceptaTarde: true },
    ],
    envios: [
      { entregaId: 1, studentId: 5, version: 1, nota: 3, revisadoAt: ayer },
      { entregaId: 1, studentId: 5, version: 2, nota: 4.5, revisadoAt: ahora },
      { entregaId: 2, studentId: 5, version: 1, nota: null, revisadoAt: null },
    ],
    registradas: [{ studentId: 5, clave: 'parcial', nota: 3.8, motivo: null, updatedAt: ahora }],
    ahora,
    ...cambios,
  });

  it('dominio: promedio de las lecciones (lo no empezado cuenta 0) llevado a 0–5', () => {
    const [luisaFila, julian] = construirLibro(entrada()).filas;
    expect(luisaFila.componentes.practica).toEqual({ nota: 4, detalle: '80 % de dominio en 2 lecciones · 1 dominadas' });
    expect(julian.componentes.practica.nota).toBe(0);
  });

  it('entregas: la última versión calificada; por revisar o abierta no cuenta; cerrada sin entregar cuenta 0; las sin nota y las ajenas no entran', () => {
    const [luisaFila, julian] = construirLibro(entrada()).filas;
    expect(luisaFila.componentes.entregas).toEqual({ nota: 4.5, detalle: '1 calificada · 1 por revisar' });
    expect(julian.componentes.entregas).toEqual({ nota: 0, detalle: '0 calificadas · 1 sin entregar (0,0) · 2 abiertas' });
  });

  it('propuesta, ajuste con motivo y aprobación con la nota del esquema', () => {
    const libro = construirLibro(entrada());
    const l = libro.filas[0];
    expect(l.propuesta).toBe(4.1); // (40·4 + 30·4,5 + 30·3,8) / 100 = 4,09
    expect(l).toMatchObject({ faltan: [], ajuste: null, final: 4.1, aprueba: true });
    expect(libro.filas[1]).toMatchObject({ propuesta: 0, faltan: ['Parcial'], aprueba: false });
    expect(libro.resumen).toEqual({ promedio: 2.1, aprueban: 1, reprueban: 1, sinNota: 0 });

    const ajustado = construirLibro(entrada({ registradas: [...entrada().registradas, { studentId: 6, clave: 'final', nota: 3, motivo: 'Supletorio presentado', updatedAt: ahora }] }));
    expect(ajustado.filas[1]).toMatchObject({ propuesta: 0, final: 3, aprueba: true, ajuste: { nota: 3, motivo: 'Supletorio presentado' } });
  });

  it('un componente de dominio con lecciones elegidas solo mira esas', () => {
    const esquema = { ...esquemaSugerido(), componentes: [{ clave: 'corte1', nombre: 'Corte 1', tipo: 'dominio' as const, peso: 100, moduloId: null, lecciones: [31], entregas: null }] };
    expect(construirLibro(entrada({ esquema })).filas[0].componentes.corte1.nota).toBe(3.5);
  });

  it('notas por módulo: el dominio de un módulo mira sus lecciones, el módulo tiene su nota y la final combina módulos y notas del curso', () => {
    const esquema: Esquema = {
      calculo: 'porcentajes',
      componentes: [
        { clave: 'dom1', nombre: 'Práctica', tipo: 'dominio', peso: 50, moduloId: 2, lecciones: null, entregas: null },
        { clave: 'quiz1', nombre: 'Quiz en el salón', tipo: 'manual', peso: 50, moduloId: 2, lecciones: null, entregas: null },
        { clave: 'parcial', nombre: 'Parcial', tipo: 'manual', peso: 40, moduloId: null, lecciones: null, entregas: null },
      ],
      grupos: [{ moduloId: 2, calculo: 'porcentajes', peso: 60 }],
      notaAprobatoria: 3,
      visibleParaEstudiantes: false,
    };
    const registradas = [
      { studentId: 5, clave: 'quiz1', nota: 4, motivo: null, updatedAt: ahora },
      { studentId: 5, clave: 'parcial', nota: 3, motivo: null, updatedAt: ahora },
    ];
    const [l, j] = construirLibro(entrada({ esquema, registradas })).filas;
    expect(l.componentes.dom1).toMatchObject({ nota: 4.5, detalle: '90 % de dominio en 1 lección · 1 dominadas' }); // solo la lección 30 del módulo
    expect(l.modulos['2']).toEqual({ nota: 4.3, faltan: [] }); // (50·4,5 + 50·4) / 100 = 4,25
    expect(l.propuesta).toBe(3.8); // el módulo entra con la nota que se muestra (4,3): (60·4,3 + 40·3) / 100 = 3,78
    expect(j).toMatchObject({ modulos: { 2: { nota: 0, faltan: ['Quiz en el salón'] } }, faltan: ['Parcial'] });
  });

  it('sin nota final: solo se registran las notas; el docente igual puede poner la final a mano', () => {
    const esquema: Esquema = { ...esquemaSugerido(), calculo: 'ninguno' };
    const [l] = construirLibro(entrada({ esquema })).filas;
    expect(l).toMatchObject({ propuesta: null, faltan: [], final: null, aprueba: null });
    expect(l.componentes.parcial.nota).toBe(3.8);
    const conFinal = construirLibro(entrada({ esquema, registradas: [{ studentId: 5, clave: 'final', nota: 4, motivo: 'Nota del semestre', updatedAt: ahora }] })).filas[0];
    expect(conFinal).toMatchObject({ final: 4, aprueba: true });
  });
});

function crear(opciones: { esquema?: Record<string, unknown> | null; registrada?: Record<string, unknown> | null; matriculas?: Array<Record<string, unknown>>; eventEmitter?: { emit: jest.Mock } } = {}) {
  const guardado = opciones.esquema === undefined ? { id: 1, classId: 3, ...esquemaSugerido(), updatedAt: ahora } : opciones.esquema;
  const esquemas = {
    findOne: jest.fn(() => Promise.resolve(guardado)),
    create: jest.fn((e: object) => e),
    save: jest.fn((e: object) => Promise.resolve(e)),
    delete: jest.fn(() => Promise.resolve({})),
    manager: { query: jest.fn((sql: string) => Promise.resolve(sql.startsWith('SELECT s.id') ? [{ id: 2, title: 'Módulo 1' }] : [{ id: 30, title: 'Else if', moduloId: 2, modulo: 'Módulo 1' }])) },
  };
  const registradas = {
    find: jest.fn(() => Promise.resolve([])),
    findOne: jest.fn(() => Promise.resolve(opciones.registrada ?? null)),
    create: jest.fn((r: object) => r),
    save: jest.fn((r: object) => Promise.resolve(r)),
    delete: jest.fn(() => Promise.resolve({})),
  };
  const historial = { find: jest.fn(() => Promise.resolve([])), create: jest.fn((h: object) => h), save: jest.fn((h: object) => Promise.resolve(h)) };
  const entregas = { find: jest.fn(() => Promise.resolve([{ id: 7, classId: 3, titulo: 'Calculadora', conNota: true, publicada: true, asignadaA: null, cierraAt: null, aceptaTarde: true }])) };
  const envios = { find: jest.fn(() => Promise.resolve([])) };
  const matriculas = { find: jest.fn((q: { where: { studentId?: number } }) => {
    const todas = opciones.matriculas ?? [{ studentId: 5, student: { fullName: 'Luisa', email: 'luisa@x.co' } }];
    return Promise.resolve(q.where.studentId ? todas.filter((m) => m.studentId === q.where.studentId) : todas);
  }) };
  const progresos = { find: jest.fn(() => Promise.resolve([{ studentId: 5, learningUnitId: 30, mastery: 80 }])) };
  const autorizacion = {
    assertTeacherOwnsClass: jest.fn((u: User) => (u.id === 9 ? Promise.resolve() : Promise.reject(new ForbiddenException()))),
    assertEnrolledInClass: jest.fn((u: User) => (u.id === 5 ? Promise.resolve() : Promise.reject(new ForbiddenException()))),
  };
  const service = new CalificacionesService(
    esquemas as unknown as Deps[0], registradas as unknown as Deps[1], historial as unknown as Deps[2], entregas as unknown as Deps[3],
    envios as unknown as Deps[4], matriculas as unknown as Deps[5], progresos as unknown as Deps[6], autorizacion as unknown as Deps[7],
    opciones.eventEmitter as unknown as Deps[8],
  );
  return { service, esquemas, registradas, historial };
}

describe('CalificacionesService', () => {
  it('las notas son opcionales: sin esquema no hay tabla, solo los módulos y entregas para armarlo', async () => {
    const libro = await crear({ esquema: null }).service.libro(docente, 3);
    expect(libro.esquema).toBeNull();
    expect(libro.filas).toEqual([]);
    expect(libro.modulos).toEqual([{ id: 2, titulo: 'Módulo 1', lecciones: [30] }]);
    expect(libro.entregas).toEqual([{ id: 7, titulo: 'Calculadora', publicada: true }]);
  });

  it('con esquema, calcula; y el docente puede dejar de usar notas (se borra el esquema, no las notas puestas)', async () => {
    const { service, esquemas, registradas } = crear();
    const libro = await service.libro(docente, 3);
    expect(libro.filas[0]).toMatchObject({ nombre: 'Luisa', email: 'luisa@x.co', componentes: { practica: { nota: 4 } } });
    await service.quitarEsquema(docente, 3);
    expect(esquemas.delete).toHaveBeenCalledWith({ classId: 3 });
    expect(registradas.delete).not.toHaveBeenCalled();
    await expect(crear().service.quitarEsquema(otroDocente, 3)).rejects.toThrow(ForbiddenException);
  });

  it('solo el docente de la clase ve y cambia las notas', async () => {
    await expect(crear().service.libro(otroDocente, 3)).rejects.toThrow(ForbiddenException);
    await expect(crear().service.registrarNota(otroDocente, 3, 5, { clave: 'parcial', nota: 4 })).rejects.toThrow(ForbiddenException);
  });

  it('guardar el esquema rechaza lecciones o entregas de otra clase', async () => {
    const { service, esquemas } = crear();
    await expect(service.guardarEsquema(docente, 3, { componentes: [{ nombre: 'P', tipo: 'dominio', peso: 100, lecciones: [99] }] })).rejects.toThrow('lección');
    await expect(service.guardarEsquema(docente, 3, { componentes: [{ nombre: 'E', tipo: 'entregas', peso: 100, entregas: [8] }] })).rejects.toThrow('entrega');
    await expect(service.guardarEsquema(docente, 3, { componentes: [{ nombre: 'Q', tipo: 'manual', moduloId: 77 }] })).rejects.toThrow('módulo');
    await service.guardarEsquema(docente, 3, { componentes: [{ nombre: 'P', tipo: 'dominio', peso: 100, lecciones: [30] }], notaAprobatoria: '3,5' });
    expect(esquemas.save).toHaveBeenCalledWith(expect.objectContaining({ classId: 3, notaAprobatoria: 3.5, updatedBy: 9 }));
  });

  it('una nota manual se guarda y deja historial antes → después', async () => {
    const { service, registradas, historial } = crear({ registrada: { id: 4, classId: 3, studentId: 5, clave: 'parcial', nota: 3, motivo: null } });
    await service.registrarNota(docente, 3, 5, { clave: 'parcial', nota: '3,8' });
    expect(registradas.save).toHaveBeenCalledWith(expect.objectContaining({ id: 4, nota: 3.8 }));
    expect(historial.save).toHaveBeenCalledWith(expect.objectContaining({ clave: 'parcial', nombre: 'Parcial', antes: 3, despues: 3.8, actorId: 9 }));
  });

  it('el ajuste de la final exige motivo; quitarlo borra la nota y también queda en el historial', async () => {
    const { service } = crear();
    await expect(service.registrarNota(docente, 3, 5, { clave: 'final', nota: 3 })).rejects.toThrow(BadRequestException);
    const conAjuste = crear({ registrada: { id: 8, classId: 3, studentId: 5, clave: 'final', nota: 3, motivo: 'Supletorio' } });
    await conAjuste.service.registrarNota(docente, 3, 5, { clave: 'final', nota: null });
    expect(conAjuste.registradas.delete).toHaveBeenCalledWith(8);
    expect(conAjuste.historial.save).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Nota final', antes: 3, despues: null }));
  });

  it('no se pone a mano una nota calculada, ni sin esquema, ni a quien no está en la clase', async () => {
    await expect(crear().service.registrarNota(docente, 3, 5, { clave: 'practica', nota: 5 })).rejects.toThrow('componentes manuales');
    await expect(crear({ esquema: null }).service.registrarNota(docente, 3, 5, { clave: 'parcial', nota: 4 })).rejects.toThrow('esquema');
    await expect(crear().service.registrarNota(docente, 3, 77, { clave: 'parcial', nota: 4 })).rejects.toThrow(NotFoundException);
  });

  it('el estudiante ve su nota solo si el docente la hizo visible, y sin el motivo del ajuste', async () => {
    expect(await crear().service.mia(luisa, 3)).toEqual({ visible: false });
    const visible = await crear({ esquema: { id: 1, classId: 3, ...esquemaSugerido(), visibleParaEstudiantes: true } }).service.mia(luisa, 3);
    expect(visible).toMatchObject({ visible: true, notaAprobatoria: 3, ajustada: false, faltan: ['Entregas', 'Parcial'] });
    expect(JSON.stringify(visible)).not.toContain('motivo');
    await expect(crear().service.mia({ id: 6, role: UserRole.ESTUDIANTE } as User, 3)).rejects.toThrow(ForbiddenException);
  });
});

describe('CalificacionesController: roles', () => {
  it.each([
    ['libro', ['docente', 'admin']],
    ['guardarEsquema', ['docente', 'admin']],
    ['quitarEsquema', ['docente', 'admin']],
    ['registrarNota', ['docente', 'admin']],
    ['historial', ['docente', 'admin']],
    ['mia', ['estudiante']],
  ] as const)('%s', (metodo, roles) => {
    expect(Reflect.getMetadata('roles', CalificacionesController.prototype[metodo])).toEqual(roles);
  });
});
