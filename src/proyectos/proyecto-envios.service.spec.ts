import 'reflect-metadata';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProyectoEnviosService } from './proyecto-envios.service';
import { ProyectoEnviosController } from './proyecto-envios.controller';
import { eventosDeRevision, validarRevision } from './envio-reglas';
import { User, UserRole } from '../user/entities/user.entity';

type Deps = ConstructorParameters<typeof ProyectoEnviosService>;

const estudiante = { id: 5, role: UserRole.ESTUDIANTE } as User;
const docente = { id: 9, role: UserRole.DOCENTE } as User;
const otroDocente = { id: 10, role: UserRole.DOCENTE } as User;
const archivos = [{ nombre: 'main.js', contenido: 'console.log(1)' }];

function crear(opciones: { envio?: Record<string, unknown> | null; entrega?: Record<string, unknown>; todas?: object[] } = {}) {
  const envio = opciones.envio === undefined
    ? { id: 40, entregaId: 2, studentId: 5, classId: 3, version: 1, archivos, titulo: 'Calculadora', nota: null, comentario: null, revisadoAt: null }
    : opciones.envio;
  const envios = {
    findOne: jest.fn(() => Promise.resolve(envio)),
    find: jest.fn(() => Promise.resolve(opciones.todas ?? (envio ? [envio] : []))),
    save: jest.fn((e: object) => Promise.resolve(e)),
  };
  const entregas = { findOne: jest.fn(() => Promise.resolve({ id: 2, titulo: 'Calculadora', escala: 'nota', conNota: true, maxVersiones: 3, cierraAt: null, cuentaParaDominio: false, learningUnitId: null, ...opciones.entrega })) };
  const eventos = { find: jest.fn(() => Promise.resolve([])), create: jest.fn((e: object) => e), save: jest.fn((e: object) => Promise.resolve(e)) };
  const clases = { findOne: jest.fn(() => Promise.resolve({ id: 3, name: 'Algoritmia', teacherId: 9 })) };
  const usuarios = { findOne: jest.fn(() => Promise.resolve({ id: 5, fullName: 'Luisa Rojas' })) };
  const entregasService = { conNombres: jest.fn((h: object[]) => Promise.resolve(h)) };
  const autorizacion = {
    assertTeacherOwnsClass: jest.fn((u: User) => (u.id === 9 || u.role === UserRole.ADMIN ? Promise.resolve() : Promise.reject(new ForbiddenException('No dictas esta clase')))),
  };
  const eventEmitter = { emit: jest.fn() };
  const service = new ProyectoEnviosService(
    envios as unknown as Deps[0],
    entregas as unknown as Deps[1],
    eventos as unknown as Deps[2],
    clases as unknown as Deps[3],
    usuarios as unknown as Deps[4],
    entregasService as unknown as Deps[5],
    autorizacion as unknown as Deps[6],
    eventEmitter as unknown as Deps[7],
  );
  return { service, envios, eventos, eventEmitter };
}

describe('Revisión: reglas', () => {
  it('la nota va de 0,0 a 5,0 con un decimal; acepta coma; vacía es «sin nota»', () => {
    expect(validarRevision({ nota: '4,25' })).toEqual({ nota: 4.3, valoracion: null, comentario: null });
    expect(validarRevision({ nota: 5, comentario: '  Muy bien  ' })).toEqual({ nota: 5, valoracion: null, comentario: 'Muy bien' });
    expect(() => validarRevision({ nota: 5.1 })).toThrow('0,0 a 5,0');
    expect(() => validarRevision({ comentario: 'x'.repeat(2001) })).toThrow('2000');
  });

  it('en una entrega solo con comentario, solo se acepta el comentario', () => {
    expect(() => validarRevision({ nota: 4, comentario: 'Bien' }, 'comentario')).toThrow('sin nota');
    expect(() => validarRevision({ valoracion: 'aprobado' }, 'comentario')).toThrow('aprobado o desempeño');
    expect(validarRevision({ comentario: 'Bien' }, 'comentario')).toEqual({ nota: null, valoracion: null, comentario: 'Bien' });
  });

  it('cada escala acepta solo sus valoraciones: aprobado o no; Superior, Alto, Básico o Bajo', () => {
    expect(validarRevision({ valoracion: 'aprobado' }, 'aprobacion')).toEqual({ nota: null, valoracion: 'aprobado', comentario: null });
    expect(validarRevision({ valoracion: 'no_aprobado', comentario: 'Falta validar' }, 'aprobacion').valoracion).toBe('no_aprobado');
    expect(() => validarRevision({ valoracion: 'superior' }, 'aprobacion')).toThrow('escala de la entrega');
    expect(validarRevision({ valoracion: 'superior' }, 'desempeno').valoracion).toBe('superior');
    expect(() => validarRevision({ valoracion: 'excelente' }, 'desempeno')).toThrow('escala de la entrega');
    // una escala sin número no recibe nota, y la de nota no recibe valoración
    expect(() => validarRevision({ nota: 4 }, 'desempeno')).toThrow('sin nota');
    expect(() => validarRevision({ valoracion: 'aprobado' }, 'nota')).toThrow('aprobado o desempeño');
  });

  it('el historial guarda qué cambió y el valor anterior', () => {
    const r = (nota: number | null, comentario: string | null, valoracion: 'aprobado' | 'no_aprobado' | null = null) => ({ nota, valoracion, comentario });
    expect(eventosDeRevision({ ...r(null, null), revisadoAt: null }, r(4, 'Bien'))).toEqual([{ tipo: 'revisada', detalle: { nota: 4, comentario: 'Bien' } }]);
    expect(eventosDeRevision({ ...r(4, 'Bien'), revisadoAt: new Date() }, r(4.5, 'Bien'))).toEqual([{ tipo: 'nota_cambiada', detalle: { antes: 4, despues: 4.5 } }]);
    expect(eventosDeRevision({ ...r(4, 'Bien'), revisadoAt: new Date() }, r(4, 'Mejor')).map((e) => e.tipo)).toEqual(['comentario_editado']);
    expect(eventosDeRevision({ ...r(4, null), revisadoAt: new Date() }, r(null, null))).toEqual([{ tipo: 'revision_borrada', detalle: { notaAnterior: 4 } }]);
    expect(eventosDeRevision({ ...r(4, 'Bien'), revisadoAt: new Date() }, r(4, 'Bien'))).toEqual([]);
    // la valoración también queda en el historial
    expect(eventosDeRevision({ ...r(null, null), revisadoAt: null }, r(null, null, 'aprobado'))).toEqual([{ tipo: 'revisada', detalle: { nota: null, comentario: null, valoracion: 'aprobado' } }]);
    expect(eventosDeRevision({ ...r(null, 'x', 'no_aprobado'), revisadoAt: new Date() }, r(null, 'x', 'aprobado'))).toEqual([{ tipo: 'valoracion_cambiada', detalle: { antes: 'no_aprobado', despues: 'aprobado' } }]);
  });
});

describe('ProyectoEnviosService', () => {
  it('un envío lo ven su autor y el docente de la clase; otro docente u otro estudiante recibe 404', async () => {
    const delDocente = await crear().service.obtener(docente, 40);
    expect(delDocente).toMatchObject({ estudiante: 'Luisa Rojas', entrega: { titulo: 'Calculadora', conNota: true } });
    expect((await crear().service.obtener(estudiante, 40)).archivos).toEqual(archivos);
    await expect(crear().service.obtener(otroDocente, 40)).rejects.toThrow(NotFoundException);
    await expect(crear().service.obtener({ id: 6, role: UserRole.ESTUDIANTE } as User, 40)).rejects.toThrow(NotFoundException);
  });

  it('el docente ve el siguiente sin revisar (la última versión de otro estudiante), no el del mismo estudiante', async () => {
    const todas = [
      { id: 40, entregaId: 2, studentId: 5, version: 1, revisadoAt: null },
      { id: 45, entregaId: 2, studentId: 6, version: 2, revisadoAt: null },
      { id: 41, entregaId: 2, studentId: 6, version: 1, revisadoAt: new Date() },
      { id: 42, entregaId: 2, studentId: 7, version: 1, revisadoAt: new Date() },
    ];
    expect((await crear({ todas }).service.obtener(docente, 40)).siguienteSinRevisar).toBe(45);
    expect((await crear({ todas }).service.obtener(estudiante, 40)).siguienteSinRevisar).toBeNull();
  });

  it('revisar guarda la nota, deja el evento en el historial y vaciar todo vuelve a «sin revisar»', async () => {
    const { service, eventos } = crear();
    const r = await service.revisar(docente, 40, { nota: '4.5', comentario: 'Buen uso de funciones' });
    expect(r).toMatchObject({ nota: 4.5, comentario: 'Buen uso de funciones' });
    expect(r.revisadoAt).toBeInstanceOf(Date);
    expect(eventos.save).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'revisada', actorId: 9, envioId: 40, studentId: 5 }));
    expect((await service.revisar(docente, 40, { nota: null, comentario: '' })).revisadoAt).toBeNull();
    expect(eventos.save).toHaveBeenLastCalledWith(expect.objectContaining({ tipo: 'revision_borrada' }));
  });

  it('si la entrega cuenta para el dominio, la revisión recalcula la lección (evento entrega.revisada)', async () => {
    const conDominio = crear({ entrega: { cuentaParaDominio: true, learningUnitId: 30 } });
    await conDominio.service.revisar(docente, 40, { nota: 4 });
    expect(conDominio.eventEmitter.emit).toHaveBeenCalledWith('entrega.revisada', expect.objectContaining({ studentId: 5, learningUnitId: 30 }));
    const sinDominio = crear();
    await sinDominio.service.revisar(docente, 40, { nota: 4 });
    expect(sinDominio.eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('en una entrega sin nota, poner nota es un 400', async () => {
    await expect(crear({ entrega: { conNota: false, escala: 'comentario' } }).service.revisar(docente, 40, { nota: 4 })).rejects.toThrow(BadRequestException);
  });

  it('otro docente no puede revisar (403)', async () => {
    const { service, envios } = crear();
    await expect(service.revisar(otroDocente, 40, { nota: 5 })).rejects.toThrow(ForbiddenException);
    expect(envios.save).not.toHaveBeenCalled();
  });
});

describe('ProyectoEnviosController: roles', () => {
  it.each([
    ['obtener', ['estudiante', 'docente', 'admin']],
    ['revisar', ['docente', 'admin']],
  ] as const)('%s', (metodo, roles) => {
    expect(Reflect.getMetadata('roles', ProyectoEnviosController.prototype[metodo])).toEqual(roles);
  });
});
