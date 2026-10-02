import { rachaDeDias, repasosPendientes } from './racha-y-repasos';

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
