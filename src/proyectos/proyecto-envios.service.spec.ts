import 'reflect-metadata';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProyectoEnviosService } from './proyecto-envios.service';
import { ProyectoEnviosController } from './proyecto-envios.controller';
import { siguienteVersion, validarRevision } from './envio-reglas';
import { User, UserRole } from '../user/entities/user.entity';

type Deps = ConstructorParameters<typeof ProyectoEnviosService>;

const estudiante = { id: 5, role: UserRole.ESTUDIANTE } as User;
const docente = { id: 9, role: UserRole.DOCENTE } as User;
const otroDocente = { id: 10, role: UserRole.DOCENTE } as User;
const archivos = [{ nombre: 'main.js', contenido: 'console.log(1)' }];

function crear(opciones: { anteriores?: object[]; clase?: object | null; envio?: object | null } = {}) {
  const clase = opciones.clase === undefined ? { id: 3, name: 'Algoritmia', teacherId: 9, aceptaProyectos: true, isActive: true } : opciones.clase;
  const envios = {
    find: jest.fn(() => Promise.resolve(opciones.anteriores ?? [])),
    findOne: jest.fn(() => Promise.resolve(opciones.envio ?? null)),
    create: jest.fn((e: object) => e),
    save: jest.fn((e: object) => Promise.resolve({ id: 40, createdAt: new Date(), ...e })),
  };
  const matriculas = {
    find: jest.fn(() => Promise.resolve(clase ? [{ class: clase }] : [])),
    findOne: jest.fn(() => Promise.resolve(clase ? { class: clase } : null)),
  };
  const clases = { findOne: jest.fn(() => Promise.resolve(clase)) };
  const usuarios = { find: jest.fn(() => Promise.resolve([{ id: 5, fullName: 'Luisa Rojas' }])), findOne: jest.fn(() => Promise.resolve({ id: 5, fullName: 'Luisa Rojas' })) };
  const proyectos = { obtener: jest.fn(() => Promise.resolve({ id: 1, ownerId: 5, titulo: 'Calculadora', tipo: 'javascript', archivos })) };
  const autorizacion = {
    assertTeacherOwnsClass: jest.fn((u: User) => (u.id === 9 || u.role === UserRole.ADMIN ? Promise.resolve() : Promise.reject(new ForbiddenException('No dictas esta clase')))),
  };
  const service = new ProyectoEnviosService(
    envios as unknown as Deps[0],
    matriculas as unknown as Deps[1],
    clases as unknown as Deps[2],
    usuarios as unknown as Deps[3],
    proyectos as unknown as Deps[4],
    autorizacion as unknown as Deps[5],
  );
  return { service, envios, proyectos };
}

describe('Reglas de envío', () => {
  it('la nota va de 0,0 a 5,0 con un decimal; acepta coma; vacía es «sin nota»', () => {
    expect(validarRevision({ nota: '4,25' })).toEqual({ nota: 4.3, comentario: null });
    expect(validarRevision({ nota: 5, comentario: '  Muy bien  ' })).toEqual({ nota: 5, comentario: 'Muy bien' });
    expect(validarRevision({ nota: '', comentario: 'Solo comentario' })).toEqual({ nota: null, comentario: 'Solo comentario' });
    expect(() => validarRevision({ nota: 5.1 })).toThrow('0,0 a 5,0');
    expect(() => validarRevision({ nota: 'diez' })).toThrow('0,0 a 5,0');
    expect(() => validarRevision({ comentario: 'x'.repeat(2001) })).toThrow('2000');
  });

  it('cada envío es una versión nueva, hasta 5 por proyecto y clase, y no se reenvía lo mismo', () => {
    expect(siguienteVersion([], { titulo: 'A', archivos })).toBe(1);
    expect(siguienteVersion([{ version: 1, titulo: 'A', archivos: [] }], { titulo: 'A', archivos })).toBe(2);
    expect(() => siguienteVersion([{ version: 1, titulo: 'A', archivos }], { titulo: 'A', archivos })).toThrow('no ha cambiado');
    const cinco = [1, 2, 3, 4, 5].map((version) => ({ version, titulo: 'A', archivos: [] }));
    expect(() => siguienteVersion(cinco, { titulo: 'A', archivos })).toThrow('5 versiones');
  });
});

describe('ProyectoEnviosService', () => {
  it('enviar guarda una copia congelada del proyecto (título, tipo y archivos), como versión 1', async () => {
    const { service, envios, proyectos } = crear();
    const r = await service.enviar(estudiante, { proyectoId: 1, classId: 3 });
    expect(proyectos.obtener).toHaveBeenCalledWith(estudiante, 1);
    expect(envios.save).toHaveBeenCalledWith(expect.objectContaining({ proyectoId: 1, studentId: 5, classId: 3, version: 1, titulo: 'Calculadora', archivos, nota: null }));
    expect(r).toMatchObject({ id: 40, version: 1 });
  });

  it('no se puede enviar a una clase que no recibe proyectos ni a una donde no está matriculado', async () => {
    const cerrada = crear({ clase: { id: 3, teacherId: 9, aceptaProyectos: false, isActive: true } });
    await expect(cerrada.service.enviar(estudiante, { proyectoId: 1, classId: 3 })).rejects.toThrow(ForbiddenException);
    const ajena = crear({ clase: null });
    await expect(ajena.service.enviar(estudiante, { proyectoId: 1, classId: 3 })).rejects.toThrow('No estás matriculado');
    expect(cerrada.envios.save).not.toHaveBeenCalled();
  });

  it('reenviar sin cambios es un 400 y no guarda nada', async () => {
    const { service, envios } = crear({ anteriores: [{ version: 1, titulo: 'Calculadora', archivos }] });
    await expect(service.enviar(estudiante, { proyectoId: 1, classId: 3 })).rejects.toThrow(BadRequestException);
    expect(envios.save).not.toHaveBeenCalled();
  });

  it('solo lista como destino las clases que reciben proyectos', async () => {
    const { service } = crear({ clase: { id: 3, name: 'Cerrada', aceptaProyectos: false, isActive: true } });
    expect((await service.delProyecto(estudiante, 1)).destinos).toEqual([]);
  });

  it('un envío lo ven su autor y el docente de la clase; otro docente o estudiante recibe 404', async () => {
    const envio = { id: 40, studentId: 5, classId: 3, archivos, titulo: 'Calculadora' };
    expect((await crear({ envio }).service.obtener(docente, 40)).estudiante).toBe('Luisa Rojas');
    expect((await crear({ envio }).service.obtener(estudiante, 40)).archivos).toEqual(archivos);
    await expect(crear({ envio }).service.obtener(otroDocente, 40)).rejects.toThrow(NotFoundException);
    await expect(crear({ envio }).service.obtener({ id: 6, role: UserRole.ESTUDIANTE } as User, 40)).rejects.toThrow(NotFoundException);
  });

  it('el docente pone nota y comentario; vaciar ambos lo devuelve a «sin revisar»', async () => {
    const envio = { id: 40, studentId: 5, classId: 3, nota: null, comentario: null, revisadoAt: null };
    const { service } = crear({ envio });
    const revisado = await service.revisar(docente, 40, { nota: '4.5', comentario: 'Buen uso de funciones' });
    expect(revisado).toMatchObject({ nota: 4.5, comentario: 'Buen uso de funciones' });
    expect(revisado.revisadoAt).toBeInstanceOf(Date);
    expect((await service.revisar(docente, 40, { nota: null, comentario: '' })).revisadoAt).toBeNull();
  });

  it('otro docente no puede calificar el envío (403)', async () => {
    const { service, envios } = crear({ envio: { id: 40, studentId: 5, classId: 3 } });
    await expect(service.revisar(otroDocente, 40, { nota: 5 })).rejects.toThrow(ForbiddenException);
    expect(envios.save).not.toHaveBeenCalled();
  });
});

describe('ProyectoEnviosController: roles', () => {
  it.each([
    ['delProyecto', ['estudiante']],
    ['enviar', ['estudiante']],
    ['deLaClase', ['docente', 'admin']],
    ['obtener', ['estudiante', 'docente', 'admin']],
    ['revisar', ['docente', 'admin']],
  ] as const)('%s', (metodo, roles) => {
    expect(Reflect.getMetadata('roles', ProyectoEnviosController.prototype[metodo])).toEqual(roles);
  });
});
