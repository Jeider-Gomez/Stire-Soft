import 'reflect-metadata';
import { BadRequestException, ForbiddenException, HttpException, NotFoundException } from '@nestjs/common';
import { MAX_BYTES_CAPTURA, validarImagen } from '../media/imagen-subida';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { validarReporte, validarRevision } from './reporte-reglas';
import { User, UserRole } from '../user/entities/user.entity';

type Deps = ConstructorParameters<typeof ReportesService>;
const luisa = { id: 5, role: UserRole.ESTUDIANTE } as User;
const base = { tipo: 'problema', gravedad: 3, texto: 'No me deja enviar el ejercicio', ruta: '/estudiante/evaluacion/12', dispositivo: '375×800 · Android' };

describe('Reportes: reglas', () => {
  it('pide tipo, un texto con algo de detalle y la pantalla; la idea no lleva gravedad', () => {
    expect(validarReporte(base)).toEqual(base);
    expect(validarReporte({ ...base, tipo: 'idea', gravedad: 3 }).gravedad).toBeNull();
    expect(validarReporte({ ...base, gravedad: undefined }).gravedad).toBe(2);
    expect(() => validarReporte({ ...base, tipo: 'queja' })).toThrow('problema');
    expect(() => validarReporte({ ...base, texto: 'mal' })).toThrow('un poco más');
    expect(() => validarReporte({ ...base, gravedad: 7 })).toThrow('gravedad');
    expect(() => validarReporte({ ...base, ruta: 'javascript:alert(1)' })).toThrow('pantalla');
    expect(validarReporte({ ...base, ruta: '/' + 'x'.repeat(500) }).ruta).toHaveLength(300);
  });

  it('el admin lo marca visto, resuelto o descartado, con una nota opcional', () => {
    expect(validarRevision({ estado: 'resuelto', nota: '  Arreglado  ' })).toEqual({ estado: 'resuelto', nota: 'Arreglado' });
    expect(validarRevision({ estado: 'visto' })).toEqual({ estado: 'visto', nota: null });
    expect(() => validarRevision({ estado: 'borrado' })).toThrow('Estado');
  });
});

function crear(enUnDia = 0, reporteGuardado?: Record<string, unknown>) {
  const guardados: Array<Record<string, unknown>> = [];
  const reportes = {
    count: jest.fn(() => Promise.resolve(enUnDia)),
    create: jest.fn((r: object) => r),
    save: jest.fn((r: Record<string, unknown>) => { guardados.push(r); return Promise.resolve({ id: 1, ...r }); }),
    find: jest.fn(() => Promise.resolve([
      { id: 1, userId: 5, gravedad: 1, createdAt: new Date('2026-10-01T10:00:00Z') },
      { id: 2, userId: 6, gravedad: 3, createdAt: new Date('2026-10-01T09:00:00Z') },
      { id: 3, userId: 5, gravedad: null, createdAt: new Date('2026-10-01T11:00:00Z') },
    ])),
    findOne: jest.fn(({ where }: { where: { id: number } }) =>
      Promise.resolve(reporteGuardado ? (where.id === reporteGuardado.id ? reporteGuardado : null) : where.id === 1 ? { id: 1, estado: 'nuevo', nota: null } : null)),
  };
  const usuarios = { find: jest.fn(() => Promise.resolve([{ id: 5, fullName: 'Luisa' }, { id: 6, fullName: 'Julián' }])) };
  const clases = { findOne: jest.fn(({ where }: { where: { id: number } }) => Promise.resolve(where.id === 6 ? { name: 'Fundamentos de Algoritmia', code: 'ALGO-WEB-570' } : null)) };
  const media = {
    subirImagen: jest.fn(() => Promise.resolve({ id: 'nueva-uuid', path: '/media/nueva-uuid', mimeType: 'image/jpeg', sizeBytes: 1000 })),
    eliminar: jest.fn(() => Promise.resolve()),
    obtener: jest.fn(() => Promise.resolve({ mimeType: 'image/jpeg', data: Buffer.from('jpg') })),
  };
  const service = new ReportesService(reportes as unknown as Deps[0], usuarios as unknown as Deps[1], clases as unknown as Deps[2], media as unknown as Deps[3]);
  return { service, guardados, media, reportes };
}

describe('ReportesService', () => {
  it('guarda el reporte con quién lo hizo y su rol, como «nuevo»', async () => {
    const { service, guardados } = crear();
    await service.crear(luisa, base);
    expect(guardados[0]).toMatchObject({ ...base, userId: 5, rol: 'estudiante', estado: 'nuevo', clase: '' });
    // con dos cursos cruzados, la clase separa los resultados
    await service.crear(luisa, { ...base, classId: 6 });
    expect(guardados[1].clase).toBe('Fundamentos de Algoritmia (ALGO-WEB-570)');
    await expect(service.crear(luisa, { ...base, texto: '' })).rejects.toThrow(BadRequestException);
  });

  it('máximo 30 por día por persona', async () => {
    await expect(crear(30).service.crear(luisa, base)).rejects.toThrow(HttpException);
  });

  it('la bandeja del admin pone primero lo más grave y nombra a quien lo reportó', async () => {
    const lista = await crear().service.todos();
    expect(lista.map((r) => [r.id, r.autor])).toEqual([[2, 'Julián'], [1, 'Luisa'], [3, 'Luisa']]);
    await expect(crear().service.todos('raro')).rejects.toThrow(BadRequestException);
  });

  it('revisar un reporte que no existe da 404', async () => {
    await expect(crear().service.revisar(9, { estado: 'visto' })).rejects.toThrow(NotFoundException);
    await expect(crear().service.revisar(1, { estado: 'resuelto', nota: 'Listo' })).resolves.toEqual({ id: 1, estado: 'resuelto', nota: 'Listo' });
  });
});

describe('Pantallazo en una sugerencia', () => {
  const julian = { id: 6, role: UserRole.ESTUDIANTE } as User;
  const admin = { id: 1, role: UserRole.ADMIN } as User;
  const datos = Buffer.from('imagen');

  it('quien envió la sugerencia adjunta su pantallazo (hasta 3 MB); si ya tenía uno, el viejo se borra', async () => {
    const { service, media, guardados } = crear(0, { id: 7, userId: 5, capturaId: 'vieja-uuid' });
    await expect(service.adjuntarCaptura(luisa, 7, datos)).resolves.toEqual({ tieneCaptura: true });
    expect(media.subirImagen).toHaveBeenCalledWith(luisa, datos, MAX_BYTES_CAPTURA);
    expect(guardados[0]).toMatchObject({ id: 7, capturaId: 'nueva-uuid' });
    expect(media.eliminar).toHaveBeenCalledWith(luisa, 'vieja-uuid');
  });

  it('nadie más puede adjuntarlo ni verlo: otro estudiante recibe «no encontrado»; el admin lo ve pero no lo cambia', async () => {
    const { service, media } = crear(0, { id: 7, userId: 5, capturaId: 'uuid' });
    await expect(service.adjuntarCaptura(julian, 7, datos)).rejects.toThrow(NotFoundException);
    await expect(service.captura(julian, 7)).rejects.toThrow(NotFoundException);
    await expect(service.adjuntarCaptura(admin, 7, datos)).rejects.toThrow(ForbiddenException);
    await expect(service.captura(admin, 7)).resolves.toMatchObject({ mimeType: 'image/jpeg' });
    await expect(service.captura(luisa, 7)).resolves.toMatchObject({ mimeType: 'image/jpeg' });
    expect(media.obtener).toHaveBeenCalledWith('uuid');
    expect(media.subirImagen).not.toHaveBeenCalled();
  });

  it('sin pantallazo, verlo responde «no encontrado»; la bandeja dice si hay uno pero nunca su id', async () => {
    const { service, reportes } = crear(0, { id: 7, userId: 5, capturaId: null });
    await expect(service.captura(luisa, 7)).rejects.toThrow('no tiene pantallazo');
    reportes.find.mockResolvedValueOnce([{ id: 8, userId: 5, gravedad: 2, capturaId: 'secreto-uuid', createdAt: new Date() }] as never);
    const [fila] = await service.todos();
    expect(fila).toMatchObject({ id: 8, tieneCaptura: true });
    expect(JSON.stringify(fila)).not.toContain('secreto-uuid');
  });

  it('el límite de 3 MB de un pantallazo se dice en el mensaje (la imagen de una lección sigue en 1 MB)', () => {
    const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(2 * 1024 * 1024)]);
    expect(validarImagen(png, 0, MAX_BYTES_CAPTURA)).toBe('image/png');
    expect(() => validarImagen(png, 0)).toThrow('más de 1 MB');
    expect(() => validarImagen(Buffer.concat([png, Buffer.alloc(2 * 1024 * 1024)]), 0, MAX_BYTES_CAPTURA)).toThrow('más de 3 MB');
  });
});

describe('ReportesController: roles', () => {
  it.each([
    ['crear', ['estudiante', 'docente', 'admin']],
    ['mios', ['estudiante', 'docente', 'admin']],
    ['todos', ['admin']],
    ['revisar', ['admin']],
    ['adjuntarCaptura', ['estudiante', 'docente', 'admin']],
    ['verCaptura', ['estudiante', 'docente', 'admin']],
  ] as const)('%s', (metodo, roles) => {
    expect(Reflect.getMetadata('roles', ReportesController.prototype[metodo])).toEqual(roles);
  });
});
