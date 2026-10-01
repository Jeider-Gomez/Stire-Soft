import 'reflect-metadata';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EntregasService } from './entregas.service';
import { EntregasController } from './entregas.controller';
import { estadoDeEntrega, siguienteVersionDeEntrega, validarEntrega, visibleParaEstudiante } from './entrega-reglas';
import { User, UserRole } from '../user/entities/user.entity';

type Deps = ConstructorParameters<typeof EntregasService>;

const estudiante = { id: 5, role: UserRole.ESTUDIANTE } as User;
const docente = { id: 9, role: UserRole.DOCENTE } as User;
const otroDocente = { id: 10, role: UserRole.DOCENTE } as User;
const archivos = [{ nombre: 'main.js', contenido: 'console.log(1)' }];
const ahora = new Date('2026-10-01T12:00:00Z');
const base = { abreAt: null, cierraAt: null, aceptaTarde: true, maxVersiones: 3 };

describe('Entregas: reglas', () => {
  it('valores por defecto: 3 versiones, sin nota (comentario primero), no cuenta para el dominio, borrador', () => {
    expect(validarEntrega({ titulo: ' Calculadora ' })).toMatchObject({ titulo: 'Calculadora', maxVersiones: 3, conNota: false, cuentaParaDominio: false, publicada: false, learningUnitId: null, tipoProyecto: 'cualquiera' });
  });

  it('el máximo de versiones es editable entre 1 y 10', () => {
    expect(validarEntrega({ titulo: 'X', maxVersiones: 5 }).maxVersiones).toBe(5);
    expect(() => validarEntrega({ titulo: 'X', maxVersiones: 0 })).toThrow('1 a 10');
    expect(() => validarEntrega({ titulo: 'X', maxVersiones: 11 })).toThrow('1 a 10');
  });

  it('contar para el dominio exige lección y nota; la lección es opcional si no cuenta', () => {
    expect(() => validarEntrega({ titulo: 'X', cuentaParaDominio: true, conNota: true })).toThrow('lección y nota');
    expect(() => validarEntrega({ titulo: 'X', cuentaParaDominio: true, learningUnitId: 30 })).toThrow('lección y nota');
    expect(validarEntrega({ titulo: 'X', cuentaParaDominio: true, conNota: true, learningUnitId: 30 }).cuentaParaDominio).toBe(true);
    expect(validarEntrega({ titulo: 'X', learningUnitId: null }).learningUnitId).toBeNull();
  });

  it('al editar, el resultado completo se vuelve a validar', () => {
    const actual = validarEntrega({ titulo: 'X', cuentaParaDominio: true, conNota: true, learningUnitId: 30 });
    expect(() => validarEntrega({ conNota: false }, actual)).toThrow('lección y nota');
    expect(validarEntrega({ maxVersiones: 4 }, actual)).toMatchObject({ titulo: 'X', maxVersiones: 4, cuentaParaDominio: true });
  });

  it('el cierre debe ser después de la apertura; el código inicial necesita un tipo y se valida como un proyecto', () => {
    expect(() => validarEntrega({ titulo: 'X', abreAt: '2026-10-02', cierraAt: '2026-10-01' })).toThrow('cerrar después');
    expect(() => validarEntrega({ titulo: 'X', plantilla: archivos })).toThrow('tipo de proyecto');
    expect(validarEntrega({ titulo: 'X', tipoProyecto: 'javascript', plantilla: archivos }).plantilla).toEqual(archivos);
    expect(() => validarEntrega({ titulo: 'X', tipoProyecto: 'javascript', plantilla: [{ nombre: 'a.html', contenido: '' }] })).toThrow(/admite archivos/);
  });

  it('solo la ven los estudiantes asignados (o todos), y solo si está publicada', () => {
    expect(visibleParaEstudiante({ publicada: true, asignadaA: null }, 5)).toBe(true);
    expect(visibleParaEstudiante({ publicada: true, asignadaA: [6, 7] }, 5)).toBe(false);
    expect(visibleParaEstudiante({ publicada: false, asignadaA: null }, 5)).toBe(false);
  });

  it('versiones: hasta el máximo más las reaperturas; tarde se marca; sin cambios no se reenvía', () => {
    const una = [{ version: 1, titulo: 'A', archivos: [] }];
    expect(siguienteVersionDeEntrega(base, [], { titulo: 'A', archivos }, 0, ahora)).toEqual({ version: 1, tarde: false });
    expect(siguienteVersionDeEntrega(base, una, { titulo: 'A', archivos }, 0, ahora)).toEqual({ version: 2, tarde: false });
    const tres = [1, 2, 3].map((version) => ({ version, titulo: 'A', archivos: [] }));
    expect(() => siguienteVersionDeEntrega(base, tres, { titulo: 'A', archivos }, 0, ahora)).toThrow('pídesela a tu docente');
    expect(siguienteVersionDeEntrega(base, tres, { titulo: 'A', archivos }, 1, ahora).version).toBe(4);
    expect(() => siguienteVersionDeEntrega(base, [{ version: 1, titulo: 'A', archivos }], { titulo: 'A', archivos }, 0, ahora)).toThrow('no ha cambiado');
    const cerrada = { ...base, cierraAt: new Date('2026-09-30T00:00:00Z') };
    expect(siguienteVersionDeEntrega(cerrada, [], { titulo: 'A', archivos }, 0, ahora)).toEqual({ version: 1, tarde: true });
    expect(() => siguienteVersionDeEntrega({ ...cerrada, aceptaTarde: false }, [], { titulo: 'A', archivos }, 0, ahora)).toThrow('ya cerró');
    expect(() => siguienteVersionDeEntrega({ ...base, abreAt: new Date('2026-10-05') }, [], { titulo: 'A', archivos }, 0, ahora)).toThrow('todavía no está abierta');
  });

  it('el estado sale de la última versión', () => {
    expect(estadoDeEntrega([])).toBe('sin_entregar');
    expect(estadoDeEntrega([{ version: 1, revisadoAt: new Date() }, { version: 2, revisadoAt: null }])).toBe('por_revisar');
    expect(estadoDeEntrega([{ version: 1, revisadoAt: new Date() }])).toBe('revisada');
  });
});

function crear(opciones: { entrega?: Record<string, unknown> | null; anteriores?: object[]; reaperturas?: number; matriculado?: boolean; proyecto?: object; enviosCount?: number } = {}) {
  const entrega = opciones.entrega === undefined
    ? { id: 2, classId: 3, titulo: 'Calculadora', publicada: true, asignadaA: null, tipoProyecto: 'cualquiera', plantilla: null, ...base, conNota: true }
    : opciones.entrega;
  const entregas = {
    findOne: jest.fn(() => Promise.resolve(entrega)),
    find: jest.fn(() => Promise.resolve(entrega ? [entrega] : [])),
    create: jest.fn((e: object) => e),
    save: jest.fn((e: object) => Promise.resolve({ id: 2, ...e })),
    delete: jest.fn(() => Promise.resolve()),
    manager: { findOne: jest.fn((_e: unknown, q: { where: { id: number } }) => Promise.resolve({ id: q.where.id, topicId: 1, sectionId: 1, classId: 3 })) },
  };
  const eventos = {
    count: jest.fn(() => Promise.resolve(opciones.reaperturas ?? 0)),
    find: jest.fn(() => Promise.resolve([])),
    create: jest.fn((e: object) => e),
    save: jest.fn((e: object) => Promise.resolve(e)),
  };
  const envios = {
    find: jest.fn(() => Promise.resolve(opciones.anteriores ?? [])),
    count: jest.fn(() => Promise.resolve(opciones.enviosCount ?? 0)),
    create: jest.fn((e: object) => e),
    save: jest.fn((e: object) => Promise.resolve({ id: 40, createdAt: ahora, ...e })),
  };
  const matriculas = {
    findOne: jest.fn(() => Promise.resolve(opciones.matriculado === false ? null : { studentId: 5, classId: 3 })),
    find: jest.fn(() => Promise.resolve([{ studentId: 5, classId: 3 }, { studentId: 6, classId: 3 }])),
  };
  const usuarios = { find: jest.fn(() => Promise.resolve([{ id: 5, fullName: 'Luisa' }, { id: 6, fullName: 'Julián' }])) };
  const proyectos = {
    obtener: jest.fn(() => Promise.resolve(opciones.proyecto ?? { id: 1, ownerId: 5, titulo: 'Calculadora', tipo: 'javascript', archivos })),
    crearConArchivos: jest.fn(() => Promise.resolve({ id: 77 })),
  };
  const autorizacion = {
    assertTeacherOwnsClass: jest.fn((u: User) => (u.id === 9 ? Promise.resolve() : Promise.reject(new ForbiddenException('No dictas esta clase')))),
  };
  const service = new EntregasService(
    entregas as unknown as Deps[0],
    eventos as unknown as Deps[1],
    envios as unknown as Deps[2],
    matriculas as unknown as Deps[3],
    usuarios as unknown as Deps[4],
    proyectos as unknown as Deps[5],
    autorizacion as unknown as Deps[6],
  );
  return { service, entregas, eventos, envios, proyectos };
}

describe('EntregasService', () => {
  it('el docente crea una entrega en su clase; otro docente recibe 403', async () => {
    const { service, entregas } = crear();
    await service.crear(docente, { classId: 3, titulo: 'Calculadora' });
    expect(entregas.save).toHaveBeenCalledWith(expect.objectContaining({ classId: 3, titulo: 'Calculadora', createdBy: 9, maxVersiones: 3 }));
    await expect(crear().service.crear(otroDocente, { classId: 3, titulo: 'X' })).rejects.toThrow(ForbiddenException);
  });

  it('una lección de otra clase se rechaza', async () => {
    const { service, entregas } = crear();
    entregas.manager.findOne.mockImplementation((_e: unknown, q: { where: { id: number } }) => Promise.resolve({ id: q.where.id, topicId: 1, sectionId: 1, classId: 99 }));
    await expect(service.crear(docente, { classId: 3, titulo: 'X', learningUnitId: 30 })).rejects.toThrow('no es de esta clase');
  });

  it('no se borra una entrega con envíos: lo enviado no se pierde', async () => {
    await expect(crear({ enviosCount: 1 }).service.eliminar(docente, 2)).rejects.toThrow(ConflictException);
  });

  it('enviar guarda la copia congelada como versión 1 y deja «enviada» en el historial', async () => {
    const { service, envios, eventos } = crear();
    const r = await service.enviar(estudiante, 2, 1);
    expect(envios.save).toHaveBeenCalledWith(expect.objectContaining({ entregaId: 2, classId: 3, studentId: 5, version: 1, tarde: false, archivos, titulo: 'Calculadora' }));
    expect(r).toMatchObject({ id: 40, version: 1 });
    expect(eventos.save).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'enviada', actorId: 5, detalle: { version: 1, tarde: false } }));
  });

  it('con 3 versiones no deja enviar otra, salvo que el docente reabra', async () => {
    const anteriores = [1, 2, 3].map((version) => ({ version, titulo: 'Otro', archivos: [] }));
    await expect(crear({ anteriores }).service.enviar(estudiante, 2, 1)).rejects.toThrow(BadRequestException);
    expect((await crear({ anteriores, reaperturas: 1 }).service.enviar(estudiante, 2, 1)).version).toBe(4);
  });

  it('una entrega de JavaScript no acepta una página web', async () => {
    const { service } = crear({ entrega: { id: 2, classId: 3, titulo: 'X', publicada: true, asignadaA: null, tipoProyecto: 'javascript', ...base }, proyecto: { id: 1, titulo: 'Web', tipo: 'web', archivos } });
    await expect(service.enviar(estudiante, 2, 1)).rejects.toThrow('JavaScript');
  });

  it('una entrega sin publicar, asignada a otros o de una clase ajena responde 404', async () => {
    await expect(crear({ entrega: { id: 2, classId: 3, publicada: false, asignadaA: null, ...base } }).service.verComoEstudiante(estudiante, 2)).rejects.toThrow(NotFoundException);
    await expect(crear({ entrega: { id: 2, classId: 3, publicada: true, asignadaA: [6], ...base } }).service.verComoEstudiante(estudiante, 2)).rejects.toThrow(NotFoundException);
    await expect(crear({ matriculado: false }).service.verComoEstudiante(estudiante, 2)).rejects.toThrow(NotFoundException);
  });

  it('«empezar» crea un proyecto propio con el código inicial de la entrega', async () => {
    const { service, proyectos } = crear({ entrega: { id: 2, classId: 3, titulo: 'Calculadora', publicada: true, asignadaA: null, tipoProyecto: 'javascript', plantilla: archivos, ...base } });
    expect(await service.empezar(estudiante, 2)).toEqual({ id: 77 });
    expect(proyectos.crearConArchivos).toHaveBeenCalledWith(estudiante, 'Calculadora', 'javascript', archivos);
  });

  it('reabrir: solo a un estudiante que tiene la entrega, y queda en el historial', async () => {
    const { service, eventos } = crear();
    await service.reabrir(docente, 2, 6);
    expect(eventos.save).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'reabierta', studentId: 6, actorId: 9 }));
    await expect(service.reabrir(docente, 2, 99)).rejects.toThrow('no tiene esta entrega');
  });

  it('el detalle cuenta el estado de cada estudiante de la clase', async () => {
    const anteriores = [{ id: 40, entregaId: 2, studentId: 5, version: 1, revisadoAt: null, titulo: 'A', tarde: false, nota: null, comentario: null, createdAt: ahora }];
    const d = await crear({ anteriores }).service.detalle(docente, 2);
    expect(d.filas.map((f) => [f.estudiante, f.estado])).toEqual([['Luisa', 'por_revisar'], ['Julián', 'sin_entregar']]);
  });
});

describe('EntregasController: roles', () => {
  it.each([
    ['mias', ['estudiante']],
    ['abiertasPara', ['estudiante']],
    ['ver', ['estudiante']],
    ['enviar', ['estudiante']],
    ['empezar', ['estudiante']],
    ['deLaClase', ['docente', 'admin']],
    ['crear', ['docente', 'admin']],
    ['detalle', ['docente', 'admin']],
    ['actualizar', ['docente', 'admin']],
    ['eliminar', ['docente', 'admin']],
    ['reabrir', ['docente', 'admin']],
  ] as const)('%s', (metodo, roles) => {
    expect(Reflect.getMetadata('roles', EntregasController.prototype[metodo])).toEqual(roles);
  });
});
