import 'reflect-metadata';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { LaboratorioService } from './laboratorio.service';
import { extractoDe, iniciales, nombreCorto, puedeVer, tituloDeCopia, validarComentario } from './laboratorio-reglas';
import { User, UserRole } from '../user/entities/user.entity';

type Deps = ConstructorParameters<typeof LaboratorioService>;

const ana = { id: 5, role: UserRole.ESTUDIANTE, fullName: 'Ana Gómez' } as User;
const beto = { id: 6, role: UserRole.ESTUDIANTE, fullName: 'Beto Ruiz' } as User;
const profe = { id: 9, role: UserRole.DOCENTE, fullName: 'Pedro Pérez' } as User;

function repo<T extends object>(filas: T[] = []) {
  return {
    filas,
    find: jest.fn(() => Promise.resolve(filas)),
    findOne: jest.fn(() => Promise.resolve(filas[0] ?? null)),
    count: jest.fn(() => Promise.resolve(filas.length)),
    create: jest.fn((x: object) => x),
    save: jest.fn((x: object) => Promise.resolve({ id: 77, ...x })),
    delete: jest.fn(() => Promise.resolve()),
  };
}

function crear(o: { pub?: object | null; matriculas?: number[]; clasesDocente?: number[]; reportes?: object[]; disponible?: boolean } = {}) {
  const pub = o.pub === undefined ? { id: 1, proyectoId: 3, autorId: 5, classId: 10, alcance: 'clase', titulo: 'Tarjeta', tipo: 'web', descripcion: '', archivos: [], oculta: false } : o.pub;
  const publicaciones = repo(pub ? [pub] : []);
  const meGusta = repo<{ publicacionId: number; userId: number }>([]);
  const comentarios = repo([]);
  const reportes = repo(o.reportes ?? []);
  reportes.findOne = jest.fn(() => Promise.resolve(null as unknown as object));
  const matriculas = { find: jest.fn(() => Promise.resolve((o.matriculas ?? [10]).map((classId) => ({ classId })))) };
  const clases = {
    find: jest.fn((q: { where: { teacherId?: number } }) => Promise.resolve(q.where.teacherId !== undefined ? (o.clasesDocente ?? [10]).map((id) => ({ id })) : [{ id: 10, name: 'Fundamentos G2', teacherId: 9 }])),
    findOne: jest.fn(() => Promise.resolve({ id: 10, name: 'Fundamentos G2', teacherId: 9 })),
  };
  const usuarios = { find: jest.fn(() => Promise.resolve([ana, beto])) };
  const proyectos = {
    disponible: jest.fn(() => Promise.resolve(o.disponible ?? true)),
    obtener: jest.fn(() => Promise.resolve({ id: 3, titulo: 'Tarjeta', tipo: 'web', archivos: [{ nombre: 'index.html', contenido: '<h1>Hola</h1>' }] })),
    crearConArchivos: jest.fn(() => Promise.resolve({ id: 44 })),
  };
  const avisos = { createNotification: jest.fn(() => Promise.resolve(null)) };
  const service = new LaboratorioService(
    publicaciones as unknown as Deps[0],
    meGusta as unknown as Deps[1],
    comentarios as unknown as Deps[2],
    reportes as unknown as Deps[3],
    matriculas as unknown as Deps[4],
    clases as unknown as Deps[5],
    usuarios as unknown as Deps[6],
    proyectos as unknown as Deps[7],
    avisos as unknown as Deps[8],
  );
  return { service, publicaciones, meGusta, comentarios, reportes, proyectos, avisos };
}

describe('Reglas del Laboratorio', () => {
  it('el autor se muestra con su nombre y la inicial del apellido', () => {
    expect(nombreCorto('Laura Martínez')).toBe('Laura M.');
    expect(nombreCorto('Laura Sofía Martínez Díaz')).toBe('Laura M.');
    expect(iniciales('Laura Martínez')).toBe('LM');
    expect(nombreCorto('')).toBe('Alguien');
  });
  it('la tarjeta trae unas líneas del programa o el título de la página, sin cargar todo', () => {
    expect(extractoDe('web', [{ nombre: 'index.html', contenido: '<h1>¡Feliz <b>cumple</b>!</h1>' }])).toBe('¡Feliz cumple!');
    expect(extractoDe('javascript', [{ nombre: 'main.js', contenido: 'a\n\nb\nc\nd\ne\nf\ng' }])).toBe('a\nb\nc\nd\ne\nf');
    expect(extractoDe('diagrama', [{ nombre: 'diagrama.json', contenido: '{}' }])).toBeNull();
  });
  it('quién ve qué: lo oculto solo su autor, el docente de la clase y un administrador', () => {
    const p = { autorId: 5, classId: 10, alcance: 'clase' as const, oculta: false };
    const otro = { id: 6, esAdmin: false, clasesQueEnsena: [], clasesDondeEstudia: [10] };
    const deOtraClase = { id: 7, esAdmin: false, clasesQueEnsena: [], clasesDondeEstudia: [11] };
    expect(puedeVer(p, otro)).toBe(true);
    expect(puedeVer(p, deOtraClase)).toBe(false);
    expect(puedeVer({ ...p, alcance: 'universidad' }, deOtraClase)).toBe(true);
    expect(puedeVer({ ...p, oculta: true }, otro)).toBe(false);
    expect(puedeVer({ ...p, oculta: true }, { id: 9, esAdmin: false, clasesQueEnsena: [10], clasesDondeEstudia: [] })).toBe(true);
  });
  it('un mensaje vacío no se envía; la copia lleva «Copia de»', () => {
    expect(() => validarComentario('   ')).toThrow('Escribe tu mensaje');
    expect(tituloDeCopia('Tarjeta')).toBe('Copia de Tarjeta');
    expect(tituloDeCopia('x'.repeat(100)).length).toBe(100);
  });
});

describe('LaboratorioService', () => {
  it('publica una copia de los archivos en una clase propia', async () => {
    const { service, publicaciones } = crear({ pub: null });
    const r = await service.publicar(ana, { proyectoId: 3, classId: 10, alcance: 'clase', descripcion: 'Me costó centrar' });
    expect(r).toEqual({ id: 77, actualizada: false });
    expect(publicaciones.save).toHaveBeenCalledWith(expect.objectContaining({ autorId: 5, classId: 10, alcance: 'clase', titulo: 'Tarjeta', archivos: [{ nombre: 'index.html', contenido: '<h1>Hola</h1>' }] }));
  });

  it('no deja publicar en una clase ajena ni con un alcance inventado', async () => {
    const { service } = crear({ pub: null });
    await expect(service.publicar(ana, { proyectoId: 3, classId: 99, alcance: 'clase' })).rejects.toThrow(BadRequestException);
    await expect(service.publicar(ana, { proyectoId: 3, classId: 10, alcance: 'mundo' })).rejects.toThrow(BadRequestException);
  });

  it('lo de otra clase, mostrado solo a esa clase, responde 404', async () => {
    const { service } = crear({ matriculas: [11] });
    await expect(service.obtener(beto, 1)).rejects.toThrow(NotFoundException);
  });

  it('sin acceso a Proyectos, tampoco al Laboratorio (403)', async () => {
    const { service } = crear({ disponible: false });
    await expect(service.listar(ana)).rejects.toThrow(ForbiddenException);
  });

  it('un mensaje le avisa al autor, con el enlace a su proyecto', async () => {
    const { service, avisos } = crear();
    await service.comentar(beto, 1, { texto: '¡Quedó muy bonita!' });
    expect(avisos.createNotification).toHaveBeenCalledWith(5, 'Un mensaje en tu proyecto', 'Beto R. escribió en «Tarjeta».', expect.anything(), { enlace: '/estudiante/proyectos/laboratorio/1' });
  });

  it('«Hacer mi copia» crea un proyecto propio con los archivos publicados', async () => {
    const { service, proyectos } = crear();
    expect(await service.copiar(beto, 1)).toEqual({ proyectoId: 44 });
    expect(proyectos.crearConArchivos).toHaveBeenCalledWith(beto, 'Copia de Tarjeta', 'web', []);
  });

  it('un reporte avisa al docente; con tres de personas distintas se oculta sola', async () => {
    const { service, avisos, publicaciones } = crear({ reportes: [{}, {}, {}] });
    const r = await service.reportar(beto, 1, { motivo: 'Tiene groserías' });
    expect(r.oculta).toBe(true);
    expect(publicaciones.save).toHaveBeenCalledWith(expect.objectContaining({ oculta: true }));
    expect(avisos.createNotification).toHaveBeenCalledWith(9, 'Reportaron algo en el Laboratorio', expect.stringContaining('Motivo: Tiene groserías'), expect.anything());
  });

  it('nadie reporta lo propio; ocultar es solo del docente de la clase', async () => {
    const { service } = crear();
    await expect(service.reportar(ana, 1, {})).rejects.toThrow(BadRequestException);
    await expect(service.ocultar(beto, 1, { oculta: true })).rejects.toThrow(ForbiddenException);
    expect(await service.ocultar(profe, 1, { oculta: true })).toEqual({ oculta: true });
  });

  it('quitar del Laboratorio es de su autor y borra también los me gusta y los mensajes', async () => {
    const { service, meGusta, comentarios, publicaciones } = crear();
    await expect(service.quitar(beto, 1)).rejects.toThrow(ForbiddenException);
    await service.quitar(ana, 1);
    expect(meGusta.delete).toHaveBeenCalledWith({ publicacionId: 1 });
    expect(comentarios.delete).toHaveBeenCalledWith({ publicacionId: 1 });
    expect(publicaciones.delete).toHaveBeenCalledWith({ id: 1 });
  });
});
