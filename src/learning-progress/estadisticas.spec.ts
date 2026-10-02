import { construirEstadisticas, diaDe } from './estadisticas';

// 1 de octubre de 2026, 10:00 en Colombia (15:00 UTC).
const ahora = new Date('2026-10-01T15:00:00Z');
const vacio = { envios: [], repasos: [], progresos: [], lecciones: [] as number[], ahora };

describe('Estadísticas al estilo de Anki', () => {
  it('los días se cuentan en la hora de Colombia: las 11 p. m. del 30 de septiembre no son el 1 de octubre', () => {
    expect(diaDe(new Date('2026-10-01T04:00:00Z'))).toBe('2026-09-30');
    expect(diaDe(ahora)).toBe('2026-10-01');
  });

  it('calendario de 16 semanas que termina hoy, con los ejercicios de cada día', () => {
    const r = construirEstadisticas({
      ...vacio,
      envios: [
        { fecha: new Date('2026-10-01T13:00:00Z'), aprobado: true, esRepaso: false },
        { fecha: new Date('2026-10-01T14:00:00Z'), aprobado: false, esRepaso: false },
        { fecha: new Date('2026-09-28T20:00:00Z'), aprobado: true, esRepaso: false },
        { fecha: new Date('2026-01-01T20:00:00Z'), aprobado: true, esRepaso: false },
      ],
    });
    expect(r.calendario).toHaveLength(112);
    expect(r.calendario[111]).toEqual({ dia: '2026-10-01', ejercicios: 2 });
    expect(r.calendario.find((c) => c.dia === '2026-09-28')?.ejercicios).toBe(1);
    expect(r.diasActivos).toBe(2);
  });

  it('racha en días seguidos, en hora de Colombia; si hoy aún no practicó, la de ayer sigue viva', () => {
    const dia = (d: string, h = '20:00') => ({ fecha: new Date(`${d}T${h}:00Z`), aprobado: true, esRepaso: false });
    // 28, 29 y 30 de septiembre; el 30 a las 11 p. m. de Colombia (04:00 UTC del 1) sigue siendo el 30.
    const sinHoy = construirEstadisticas({ ...vacio, envios: [dia('2026-09-28'), dia('2026-09-29'), dia('2026-10-01', '04:00'), dia('2026-09-20'), dia('2026-09-21'), dia('2026-09-22'), dia('2026-09-23')] });
    expect(sinHoy).toMatchObject({ racha: 3, practicoHoy: false, rachaMaxima: 4 });
    const conHoy = construirEstadisticas({ ...vacio, envios: [dia('2026-09-30'), dia('2026-10-01', '13:00')] });
    expect(conHoy).toMatchObject({ racha: 2, practicoHoy: true });
    // Un hueco ayer y nada hoy: la racha se perdió.
    expect(construirEstadisticas({ ...vacio, envios: [dia('2026-09-29')] })).toMatchObject({ racha: 0, practicoHoy: false, rachaMaxima: 1 });
  });

  it('pronóstico de 14 días: lo vencido se suma a hoy; solo cuentan las lecciones de la clase', () => {
    const r = construirEstadisticas({
      ...vacio,
      lecciones: [1, 2, 3],
      repasos: [
        { learningUnitId: 1, nextReviewDate: new Date('2026-09-25T12:00:00Z'), intervalDays: 3 },
        { learningUnitId: 2, nextReviewDate: new Date('2026-10-03T12:00:00Z'), intervalDays: 6 },
        { learningUnitId: 3, nextReviewDate: new Date('2026-11-30T12:00:00Z'), intervalDays: 40 },
        { learningUnitId: 99, nextReviewDate: new Date('2026-10-01T12:00:00Z'), intervalDays: 1 },
      ],
    });
    expect(r.vencidos).toBe(1);
    expect(r.pronostico[0]).toEqual({ dia: '2026-10-01', repasos: 1 });
    expect(r.pronostico[2]).toEqual({ dia: '2026-10-03', repasos: 1 });
    expect(r.pronostico.reduce((s, p) => s + p.repasos, 0)).toBe(2);
  });

  it('estado de las lecciones: dominio firme = 85 % o más y repaso a 21 días o más', () => {
    const r = construirEstadisticas({
      ...vacio,
      lecciones: [1, 2, 3, 4],
      progresos: [{ learningUnitId: 1, mastery: 100 }, { learningUnitId: 2, mastery: 90 }, { learningUnitId: 3, mastery: 40 }],
      repasos: [
        { learningUnitId: 1, nextReviewDate: new Date('2026-11-01T12:00:00Z'), intervalDays: 25 },
        { learningUnitId: 2, nextReviewDate: new Date('2026-10-05T12:00:00Z'), intervalDays: 6 },
      ],
    });
    expect(r.lecciones).toEqual({ total: 4, sinEmpezar: 1, enPractica: 1, dominadaReciente: 1, dominadaFirme: 1 });
  });

  it('retención: repasos aprobados de los últimos 30 días; sin repasos es null, no 0 %', () => {
    const r = construirEstadisticas({
      ...vacio,
      envios: [
        { fecha: new Date('2026-09-30T15:00:00Z'), aprobado: true, esRepaso: true },
        { fecha: new Date('2026-09-29T15:00:00Z'), aprobado: false, esRepaso: true },
        { fecha: new Date('2026-09-29T16:00:00Z'), aprobado: true, esRepaso: true },
        { fecha: new Date('2026-08-01T15:00:00Z'), aprobado: false, esRepaso: true },
        { fecha: new Date('2026-09-30T15:00:00Z'), aprobado: false, esRepaso: false },
      ],
    });
    expect(r.retencion).toEqual({ repasos: 3, aprobados: 2, porcentaje: 67 });
    expect(construirEstadisticas(vacio).retencion.porcentaje).toBeNull();
  });
});
