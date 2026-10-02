import 'reflect-metadata';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AsistenciaService, porcentajeAsistencia } from './asistencia.service';
import {
  codigoDeAsistencia, fechaDeHoy, leerCodigoDeAsistencia, validarDispositivo, validarEstado, validarFecha, VENTANA_QR_MS,
} from './asistencia-reglas';
import { User, UserRole } from '../user/entities/user.entity';
import type { SesionAsistencia } from './entities/sesion-asistencia.entity';
import type { RegistroAsistencia } from './entities/registro-asistencia.entity';

type Deps = ConstructorParameters<typeof AsistenciaService>;

const docente = { id: 9, role: UserRole.DOCENTE } as User;
const otroDocente = { id: 10, role: UserRole.DOCENTE } as User;
const luisa = { id: 5, role: UserRole.ESTUDIANTE } as User;
const julian = { id: 6, role: UserRole.ESTUDIANTE } as User;
const ajeno = { id: 77, role: UserRole.ESTUDIANTE } as User;
const CELULAR_LUISA = 'cel0luisa01';

describe('Asistencia: reglas del QR', () => {
  const t = 1_790_000_000_000;

  it('el QR lleva quién es y desde qué celular, y se lee de vuelta', () => {
    const { codigo, venceEnMs } = codigoDeAsistencia('s', 5, CELULAR_LUISA, t);
    expect(codigo.startsWith('STIRE-ASIS:5.')).toBe(true);
    expect(venceEnMs).toBeGreaterThan(0);
    expect(venceEnMs).toBeLessThanOrEqual(VENTANA_QR_MS);
    expect(leerCodigoDeAsistencia('s', codigo, t + 1000)).toEqual({ userId: 5, dispositivo: CELULAR_LUISA });
  });

  it('vence: sirve en su ventana y la siguiente (20 a 40 s), no después; una foto mandada más tarde no sirve', () => {
    const { codigo } = codigoDeAsistencia('s', 5, CELULAR_LUISA, t);
    expect(() => leerCodigoDeAsistencia('s', codigo, t + VENTANA_QR_MS)).not.toThrow();
    expect(() => leerCodigoDeAsistencia('s', codigo, t + 3 * VENTANA_QR_MS)).toThrow('venció');
    expect(() => leerCodigoDeAsistencia('s', codigo, t - 2 * VENTANA_QR_MS)).toThrow('venció');
  });

  it('no se puede fabricar: cambiar el estudiante, el celular o usar otra clave invalida la firma', () => {
    const { codigo } = codigoDeAsistencia('s', 5, CELULAR_LUISA, t);
    expect(() => leerCodigoDeAsistencia('s', codigo.replace('STIRE-ASIS:5.', 'STIRE-ASIS:6.'), t)).toThrow('no es válido');
    expect(() => leerCodigoDeAsistencia('s', codigo.replace(CELULAR_LUISA, 'otrocelular1'), t)).toThrow('no es válido');
    expect(() => leerCodigoDeAsistencia('otra', codigo, t)).toThrow('no es válido');
    for (const malo of ['https://stire-soft.vercel.app/estudiante/clases?codigo=ALGO', 'STIRE-ASIS:5.x.y', '', 42]) {
      expect(() => leerCodigoDeAsistencia('s', malo, t)).toThrow('no es un código de asistencia');
    }
  });

  it('valida el celular, el estado y la fecha; «hoy» es la fecha de Colombia', () => {
    expect(() => validarDispositivo('ABC')).toThrow();
    expect(validarDispositivo(CELULAR_LUISA)).toBe(CELULAR_LUISA);
    expect(validarEstado('tarde')).toBe('tarde');
    expect(validarEstado(null)).toBeNull();
    expect(() => validarEstado('fugado')).toThrow();
    expect(() => validarEstado(undefined)).toThrow();
    expect(() => validarFecha('02/10/2026')).toThrow('AAAA-MM-DD');
    // 2 de octubre, 9 p. m. en Bogotá = 3 de octubre en UTC: sigue siendo el 2.
    expect(fechaDeHoy(new Date('2026-10-03T02:00:00Z'))).toBe('2026-10-02');
    expect(validarFecha(undefined, new Date('2026-10-03T02:00:00Z'))).toBe('2026-10-02');
  });

  it('el porcentaje cuenta presente, tarde y excusa; las sesiones aún abiertas sin marcar no cuentan', () => {
    expect(porcentajeAsistencia(['presente', 'tarde', 'excusa', 'ausente'])).toBe(75);
    expect(porcentajeAsistencia([null, 'presente'])).toBe(100);
    expect(porcentajeAsistencia([null])).toBeNull();
  });
});

function crear() {
  const sesiones: SesionAsistencia[] = [];
  const registros: RegistroAsistencia[] = [];
  let siguiente = 1;
  const coincide = <T extends object>(fila: T, where: Record<string, unknown>) =>
    Object.entries(where).every(([k, v]) => {
      const valor = (fila as Record<string, unknown>)[k];
      if (v && typeof v === 'object' && '_value' in v) return (v as { _value: unknown[] })._value.includes(valor);
      return valor === v;
    });
  const repo = <T extends { id: number }>(filas: T[]) => ({
    create: (d: Partial<T>) => ({ ...d }) as T,
    merge: (a: T, b: Partial<T>) => Object.assign(a, b),
    save: jest.fn(async (f: T) => {
      if (!f.id) { f.id = siguiente++; filas.push(f); }
      (f as T & { updatedAt?: Date }).updatedAt = new Date();
      return f;
    }),
    findOne: async ({ where }: { where: Record<string, unknown> }) => filas.filter((f) => coincide(f, where)).pop() ?? null,
    find: async ({ where }: { where: Record<string, unknown> }) => filas.filter((f) => coincide(f, where)),
    delete: jest.fn(async (where: Record<string, unknown>) => {
      for (let i = filas.length - 1; i >= 0; i--) if (coincide(filas[i], where)) filas.splice(i, 1);
    }),
  });
  const matriculas = {
    find: async ({ where }: { where: { classId?: number; studentId?: number } }) =>
      [
        { classId: 3, studentId: 5, student: { fullName: 'Luisa Rojas', email: 'luisa@x.co', fotoId: 'f-luisa' }, class: { name: 'Algoritmia' } },
        { classId: 3, studentId: 6, student: { fullName: 'Julián Ortega', email: 'julian@x.co', fotoId: null }, class: { name: 'Algoritmia' } },
      ].filter((m) => (where.classId === undefined || m.classId === where.classId) && (where.studentId === undefined || m.studentId === where.studentId)),
  };
  const clases = { findOne: async () => ({ id: 3, name: 'Algoritmia' }) };
  const autorizacion = {
    assertTeacherOwnsClass: jest.fn((u: User) => (u.id === 9 ? Promise.resolve() : Promise.reject(new ForbiddenException()))),
  };
  const config = { get: () => 'secreto-de-prueba' };
  const service = new AsistenciaService(
    repo(sesiones) as unknown as Deps[0], repo(registros) as unknown as Deps[1], matriculas as unknown as Deps[2],
    clases as unknown as Deps[3], autorizacion as unknown as Deps[4], config as unknown as Deps[5],
  );
  return { service, sesiones, registros };
}

describe('AsistenciaService', () => {
  it('el docente escanea el QR del celular: queda presente y ve el nombre y la foto de quien marcó', async () => {
    const { service } = crear();
    const sesion = await service.crearSesion(docente, 3, {});
    expect(sesion.fecha).toBe(fechaDeHoy());
    const { codigo } = service.miCodigo(luisa, CELULAR_LUISA);
    const r = await service.marcarConQr(docente, sesion.id, codigo);
    expect(r).toMatchObject({ estudiante: { id: 5, nombre: 'Luisa Rojas', fotoId: 'f-luisa' }, estado: 'presente', yaEstaba: false, alerta: null });
    expect((await service.marcarConQr(docente, sesion.id, codigo)).yaEstaba).toBe(true);
    const detalle = await service.detalle(docente, sesion.id);
    expect(detalle.estudiantes.map((e) => [e.nombre, e.estado, e.metodo])).toEqual([['Julián Ortega', null, null], ['Luisa Rojas', 'presente', 'qr']]);
  });

  it('si un mismo celular marca a dos cuentas (alguien entró con la cuenta del compañero), queda la alerta', async () => {
    const { service } = crear();
    const sesion = await service.crearSesion(docente, 3, {});
    await service.marcarConQr(docente, sesion.id, service.miCodigo(luisa, CELULAR_LUISA).codigo);
    const r = await service.marcarConQr(docente, sesion.id, service.miCodigo(julian, CELULAR_LUISA).codigo);
    expect(r.alerta).toBe('Mismo celular que Luisa Rojas');
    const detalle = await service.detalle(docente, sesion.id);
    expect(detalle.estudiantes.find((e) => e.id === 5)?.alerta).toBe('Mismo celular que Julián Ortega');
  });

  it('no marca a quien no está en la clase, ni con la sesión cerrada, ni desde la clase de otro docente', async () => {
    const { service } = crear();
    const sesion = await service.crearSesion(docente, 3, {});
    await expect(service.marcarConQr(docente, sesion.id, service.miCodigo(ajeno, 'celajeno01').codigo)).rejects.toThrow(ForbiddenException);
    await expect(service.marcarConQr(docente, sesion.id, 'STIRE-ASIS:5.1.abcdefgh.xx')).rejects.toThrow(BadRequestException);
    await expect(service.marcarConQr(otroDocente, sesion.id, service.miCodigo(luisa, CELULAR_LUISA).codigo)).rejects.toThrow(ForbiddenException);
    await service.actualizarSesion(docente, sesion.id, { abierta: false });
    await expect(service.marcarConQr(docente, sesion.id, service.miCodigo(luisa, CELULAR_LUISA).codigo)).rejects.toThrow('cerrada');
  });

  it('un doble clic en «Tomar asistencia» no crea dos sesiones; «nueva» sí crea otra el mismo día', async () => {
    const { service, sesiones } = crear();
    const a = await service.crearSesion(docente, 3, {});
    const b = await service.crearSesion(docente, 3, {});
    expect(b.id).toBe(a.id);
    await service.crearSesion(docente, 3, { nueva: true });
    expect(sesiones).toHaveLength(2);
  });

  it('a mano: marcar, corregir y quitar; al cerrar, los que no marcaron quedan ausentes en la planilla', async () => {
    const { service } = crear();
    const sesion = await service.crearSesion(docente, 3, { tema: 'Ciclos' });
    await service.marcarManual(docente, sesion.id, 6, 'tarde');
    await service.marcarManual(docente, sesion.id, 6, 'excusa');
    let resumen = await service.resumen(docente, 3);
    expect(resumen.filas.map((f) => [f.nombre, f.estados[sesion.id]])).toEqual([['Julián Ortega', 'excusa'], ['Luisa Rojas', null]]);
    await service.actualizarSesion(docente, sesion.id, { abierta: false });
    resumen = await service.resumen(docente, 3);
    expect(resumen.filas.map((f) => [f.estados[sesion.id], f.porcentaje])).toEqual([['excusa', 100], ['ausente', 0]]);
    await service.marcarManual(docente, sesion.id, 6, null);
    expect((await service.resumen(docente, 3)).filas[0].estados[sesion.id]).toBe('ausente');
    await expect(service.marcarManual(docente, sesion.id, 77, 'presente')).rejects.toThrow(ForbiddenException);
    await expect(service.marcarManual(docente, sesion.id, 6, 'fugado')).rejects.toThrow(BadRequestException);
  });

  it('el estudiante ve solo su asistencia, por clase y con su porcentaje', async () => {
    const { service } = crear();
    const s1 = await service.crearSesion(docente, 3, { fecha: '2026-10-01' });
    await service.marcarManual(docente, s1.id, 5, 'presente');
    await service.marcarManual(docente, s1.id, 6, 'ausente');
    const mia = await service.mia(luisa);
    expect(mia).toEqual([{ classId: 3, clase: 'Algoritmia', porcentaje: 100, sesiones: [{ id: s1.id, fecha: '2026-10-01', tema: null, estado: 'presente' }] }]);
  });

  it('borrar una sesión creada por error borra sus marcas', async () => {
    const { service, registros, sesiones } = crear();
    const s = await service.crearSesion(docente, 3, {});
    await service.marcarManual(docente, s.id, 5, 'presente');
    await expect(service.eliminarSesion(otroDocente, s.id)).rejects.toThrow(ForbiddenException);
    await service.eliminarSesion(docente, s.id);
    expect(registros).toHaveLength(0);
    expect(sesiones).toHaveLength(0);
  });
});
