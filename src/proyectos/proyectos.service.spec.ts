import 'reflect-metadata';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProyectosService } from './proyectos.service';
import { ProyectosController } from './proyectos.controller';
import { User, UserRole } from '../user/entities/user.entity';

type Deps = ConstructorParameters<typeof ProyectosService>;

const estudiante = { id: 5, role: UserRole.ESTUDIANTE } as User;

function crear(opciones: { cuantos?: number; proyecto?: object | null; claseCodigo?: string; modo?: string } = {}) {
  const repo = {
    find: jest.fn(() => Promise.resolve([])),
    count: jest.fn(() => Promise.resolve(opciones.cuantos ?? 0)),
    create: jest.fn((p: object) => p),
    save: jest.fn((p: object) => Promise.resolve({ id: 1, ...p })),
    findOne: jest.fn(() => Promise.resolve(opciones.proyecto === undefined ? null : opciones.proyecto)),
    delete: jest.fn(() => Promise.resolve()),
  };
  const matriculas = { find: jest.fn(() => Promise.resolve([{ class: { code: opciones.claseCodigo ?? 'ALGO-203413-G2' } }])) };
  const config = { get: (k: string) => (k === 'PROYECTOS_MODO' ? opciones.modo : 'ALGO-203413-G2') };
  const service = new ProyectosService(repo as unknown as Deps[0], matriculas as unknown as Deps[1], config as unknown as Deps[2]);
  return { service, repo };
}

describe('ProyectosService', () => {
  it('crea un proyecto web con su plantilla, a nombre de quien lo pide', async () => {
    const { service, repo } = crear();
    const p = await service.crear(estudiante, { titulo: 'Mi página', tipo: 'web' });
    expect(p).toMatchObject({ ownerId: 5, titulo: 'Mi página', tipo: 'web' });
    expect(p.archivos.map((a) => a.nombre)).toEqual(['index.html', 'estilos.css', 'script.js']);
    expect(repo.save).toHaveBeenCalled();
  });

  it('con 20 proyectos no deja crear otro (400 con el motivo)', async () => {
    const { service, repo } = crear({ cuantos: 20 });
    await expect(service.crear(estudiante, { titulo: 'Uno más', tipo: 'web' })).rejects.toThrow('20 proyectos');
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('un tipo que no existe o un título vacío: 400', async () => {
    const { service } = crear();
    await expect(service.crear(estudiante, { titulo: 'X', tipo: 'python' })).rejects.toThrow(BadRequestException);
    await expect(service.crear(estudiante, { titulo: '  ', tipo: 'web' })).rejects.toThrow(BadRequestException);
  });

  it('solo se busca entre los proyectos propios: uno ajeno responde 404, como si no existiera', async () => {
    const { service, repo } = crear({ proyecto: null });
    await expect(service.obtener(estudiante, 99)).rejects.toThrow(NotFoundException);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 99, ownerId: 5 } });
  });

  it('guardar archivos inválidos es un 400 y no toca el proyecto', async () => {
    const proyecto = { id: 1, ownerId: 5, tipo: 'javascript', titulo: 'X', archivos: [{ nombre: 'main.js', contenido: '' }] };
    const { service, repo } = crear({ proyecto });
    await expect(service.actualizar(estudiante, 1, { archivos: [{ nombre: '../x.js', contenido: '' }] })).rejects.toThrow(BadRequestException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('en fase de prueba, un estudiante que no es de una clase piloto recibe 403', async () => {
    const { service } = crear({ claseCodigo: 'ALGO-203413', modo: 'piloto' });
    await expect(service.listar(estudiante)).rejects.toThrow(ForbiddenException);
    expect(await service.estado(estudiante)).toMatchObject({ disponible: false });
  });

  it('borrar solo borra el proyecto propio', async () => {
    const { service, repo } = crear({ proyecto: { id: 1, ownerId: 5, tipo: 'web', titulo: 'X', archivos: [] } });
    await service.eliminar(estudiante, 1);
    expect(repo.delete).toHaveBeenCalledWith({ id: 1, ownerId: 5 });
  });
});

describe('ProyectosController: roles', () => {
  it.each(['estado', 'listar', 'crear', 'obtener', 'actualizar', 'eliminar'] as const)('%s', (metodo) => {
    expect(Reflect.getMetadata('roles', ProyectosController.prototype[metodo])).toEqual(['estudiante', 'docente', 'admin']);
  });
});
