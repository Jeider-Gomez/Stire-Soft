import { esfuerzoDeLaSemana, lunesDe, rachaDeDias, rachaDeSemanas, repasosPendientes } from './racha-y-repasos';

// 1 de octubre de 2026, 8 p. m. en Colombia (01:00 UTC del 2 de octubre).
const ahora = new Date('2026-10-02T01:00:00Z');

describe('Racha y repasos pendientes en hora de Colombia', () => {
  it('practicar a las 7:30 p. m. cuenta para hoy, no para mañana', () => {
    expect(rachaDeDias([new Date('2026-10-02T00:30:00Z'), new Date('2026-09-30T15:00:00Z')], ahora)).toBe(2);
  });

  it('si hoy aún no practica, la racha de ayer sigue viva; con un día vacío se rompe', () => {
    expect(rachaDeDias([new Date('2026-09-30T15:00:00Z'), new Date('2026-09-29T15:00:00Z')], ahora)).toBe(2);
    expect(rachaDeDias([new Date('2026-09-29T15:00:00Z')], ahora)).toBe(0);
  });

  it('un repaso de hoy, aunque sea más tarde, ya está pendiente (como «Repasos para hoy» del estudiante)', () => {
    const hoyMasTarde = new Date('2026-10-02T04:00:00Z'); // 11 p. m. del 1 de octubre
    const manana = new Date('2026-10-02T15:00:00Z');
    const vencido = new Date('2026-09-20T15:00:00Z');
    expect(repasosPendientes([hoyMasTarde, manana, vencido], ahora)).toBe(2);
  });
});

// Gamificación sobria (REFERENTES_PLATAFORMAS_Y_STI.md §10): racha de semanas y esfuerzo de la semana, en hora de Colombia.
describe('rachaDeSemanas y esfuerzoDeLaSemana', () => {
  // Domingo 04/10/2026, 3:00 p. m. en Colombia (20:00 UTC). La semana va del lunes 28/09 al domingo 04/10.
  const AHORA = new Date('2026-10-04T20:00:00Z');
  const col = (dia: string, hora = '15:00') => new Date(`${dia}T${hora}:00-05:00`);

  it('lunesDe: la semana empieza el lunes', () => {
    expect(lunesDe('2026-10-04')).toBe('2026-09-28');
    expect(lunesDe('2026-09-28')).toBe('2026-09-28');
    expect(lunesDe('2026-10-05')).toBe('2026-10-05');
  });

  it('estudiar martes y jueves cada semana es racha de semanas, aunque la de días se corte', () => {
    const fechas = [col('2026-09-15'), col('2026-09-17'), col('2026-09-22'), col('2026-09-24'), col('2026-09-29'), col('2026-10-01')];
    expect(rachaDeSemanas(fechas, AHORA)).toBe(3);
    expect(rachaDeDias(fechas, AHORA)).toBe(0); // la diaria castiga a quien estudia días fijos
  });

  it('si esta semana aún no practica, la racha de la semana pasada sigue viva; si faltó una semana, se corta', () => {
    expect(rachaDeSemanas([col('2026-09-22'), col('2026-09-15')], AHORA)).toBe(2);
    expect(rachaDeSemanas([col('2026-09-15')], AHORA)).toBe(0);
    expect(rachaDeSemanas([], AHORA)).toBe(0);
  });

  it('la práctica del domingo a las 9 p. m. en Colombia es de esa semana, aunque en UTC ya sea lunes', () => {
    expect(rachaDeSemanas([col('2026-10-04', '21:00')], AHORA)).toBe(1);
  });

  it('esfuerzo: días distintos, ejercicios avanzados aprobados distintos y repasos, solo de esta semana', () => {
    const e = esfuerzoDeLaSemana(
      [
        { fecha: col('2026-09-29'), activityId: 1, avanzadoAprobado: true },
        { fecha: col('2026-09-29', '16:00'), activityId: 1, avanzadoAprobado: true }, // mismo ejercicio: cuenta una vez
        { fecha: col('2026-10-01'), activityId: 2, avanzadoAprobado: false }, // básico: suma día, no avanzado
        { fecha: col('2026-09-27'), activityId: 3, avanzadoAprobado: true }, // semana pasada
      ],
      [col('2026-09-30'), col('2026-10-02'), col('2026-09-20')],
      AHORA,
    );
    expect(e).toEqual({ dias: 2, avanzados: 1, repasos: 2 });
  });
});
