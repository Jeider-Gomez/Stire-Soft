import { construirResumenSemanal, DIAS_SIN_ACTIVIDAD } from './resumen-semanal';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

// Resumen de la semana para «Hoy» (docs/DISENO_INTERVENCION_DOCENTE.md §4.4; BASE_TEORICA.md BT-17).
// 1 de octubre de 2026, 10:00 a. m. en Colombia (15:00 UTC).
const ahora = new Date('2026-10-01T15:00:00Z');
const haceDias = (d: number, hora = 15) => new Date(Date.UTC(2026, 9, 1 - d, hora));

describe('Resumen de la semana', () => {
  const estudiantes = [{ id: 1, nombre: 'Luisa' }, { id: 2, nombre: 'Julián' }, { id: 3, nombre: 'Camila' }, { id: 4, nombre: 'Andrés' }];

  it('compara esta semana con la anterior: estudiantes activos, ejercicios y aprobados', () => {
    const r = construirResumenSemanal({
      estudiantes, ahora,
      intentos: [
        { studentId: 1, aprobado: true, fecha: haceDias(0) },
        { studentId: 1, aprobado: false, fecha: haceDias(2) },
        { studentId: 2, aprobado: true, fecha: haceDias(6) },
        { studentId: 2, aprobado: true, fecha: haceDias(7) },
        { studentId: 3, aprobado: false, fecha: haceDias(13) },
        { studentId: 3, aprobado: false, fecha: haceDias(14) },
      ],
      ultimaActividad: new Map([[1, haceDias(0)], [2, haceDias(6)], [3, haceDias(13)]]),
    });
    expect(r.total).toBe(4);
    expect(r.estaSemana).toEqual({ estudiantesActivos: 2, ejercicios: 3, aprobados: 2 });
    expect(r.semanaAnterior).toEqual({ estudiantesActivos: 2, ejercicios: 2, aprobados: 1 });
  });

  it(`sin actividad: ${DIAS_SIN_ACTIVIDAD} días o más, primero quien lleva más tiempo y al final quien nunca ha practicado`, () => {
    const r = construirResumenSemanal({
      estudiantes, ahora, intentos: [],
      ultimaActividad: new Map([[1, haceDias(6)], [2, haceDias(7)], [3, haceDias(20)]]),
    });
    expect(r.sinActividad).toEqual([
      { studentId: 3, nombre: 'Camila', dias: 20 },
      { studentId: 2, nombre: 'Julián', dias: 7 },
      { studentId: 4, nombre: 'Andrés', dias: null },
    ]);
  });

  it('los días se cuentan en Colombia: las 9 p. m. de ayer en Colombia (2 a. m. UTC de hoy) son «hace 1 día»', () => {
    const r = construirResumenSemanal({ estudiantes: [estudiantes[0]], ahora, intentos: [{ studentId: 1, aprobado: true, fecha: new Date('2026-10-01T02:00:00Z') }], ultimaActividad: new Map() });
    expect(r.estaSemana.ejercicios).toBe(1);
  });
});

describe('AnalyticsService.getResumenSemanal — permisos', () => {
  type Deps = ConstructorParameters<typeof AnalyticsService>;
  const vacio = {
    createQueryBuilder: () => {
      const qb = { innerJoin: () => qb, where: () => qb, andWhere: () => qb, select: () => qb, orderBy: () => qb, addOrderBy: () => qb, getRawMany: () => Promise.resolve([]) };
      return qb;
    },
    find: () => Promise.resolve([]),
    findOne: ({ where }: { where: { id: number } }) => Promise.resolve(where.id === 7 ? { id: 7, teacherId: 10 } : null),
  };
  const service = new AnalyticsService({ getRepository: () => vacio } as unknown as Deps[0], {} as unknown as Deps[1]);

  it('el docente de la clase lo ve; otro docente o un estudiante no', async () => {
    await expect(service.getResumenSemanal(7, { id: 10, role: 'docente' }, ahora)).resolves.toMatchObject({ total: 0, sinActividad: [] });
    await expect(service.getResumenSemanal(7, { id: 11, role: 'docente' })).rejects.toThrow('No tienes acceso');
    await expect(service.getResumenSemanal(7, { id: 3, role: 'estudiante' })).rejects.toThrow('Los estudiantes no tienen permiso');
    await expect(service.getResumenSemanal(99, { id: 10, role: 'admin' })).rejects.toThrow('La clase no existe');
  });

  it('la ruta exige rol de docente o admin', () => {
    expect(Reflect.getMetadata('roles', AnalyticsController.prototype.getResumenSemanal)).toEqual(['docente', 'admin']);
  });
});
