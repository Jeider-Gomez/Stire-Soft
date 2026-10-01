import 'reflect-metadata';
import { BadRequestException, HttpException, NotFoundException } from '@nestjs/common';
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

function crear(enUnDia = 0) {
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
    findOne: jest.fn(({ where }: { where: { id: number } }) => Promise.resolve(where.id === 1 ? { id: 1, estado: 'nuevo', nota: null } : null)),
  };
  const usuarios = { find: jest.fn(() => Promise.resolve([{ id: 5, fullName: 'Luisa' }, { id: 6, fullName: 'Julián' }])) };
  return { service: new ReportesService(reportes as unknown as Deps[0], usuarios as unknown as Deps[1]), guardados };
}

describe('ReportesService', () => {
  it('guarda el reporte con quién lo hizo y su rol, como «nuevo»', async () => {
    const { service, guardados } = crear();
    await service.crear(luisa, base);
    expect(guardados[0]).toMatchObject({ ...base, userId: 5, rol: 'estudiante', estado: 'nuevo' });
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

describe('ReportesController: roles', () => {
  it.each([
    ['crear', ['estudiante', 'docente', 'admin']],
    ['mios', ['estudiante', 'docente', 'admin']],
    ['todos', ['admin']],
    ['revisar', ['admin']],
  ] as const)('%s', (metodo, roles) => {
    expect(Reflect.getMetadata('roles', ReportesController.prototype[metodo])).toEqual(roles);
  });
});
