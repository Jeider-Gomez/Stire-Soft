/**
 * Días del calendario en la hora de Colombia. El servidor corre en UTC: si se cortan los días en UTC, a partir de las
 * 7 p. m. en Colombia los repasos de mañana aparecían «para hoy» (visto el 30/09 a las 10:18 p. m.).
 */
export const ZONA_COLOMBIA = 'America/Bogota';

const formato = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_COLOMBIA, year: 'numeric', month: '2-digit', day: '2-digit' });

/** «2026-10-01»: el día de esa fecha en Colombia. */
export const diaDe = (fecha: Date): string => formato.format(fecha);

/** Días de calendario (en Colombia) que van de `desde` a `hasta`: 0 = el mismo día, 1 = mañana, -1 = ayer. */
export function diasEntre(desde: Date, hasta: Date): number {
  const a = Date.parse(`${diaDe(desde)}T00:00:00Z`);
  const b = Date.parse(`${diaDe(hasta)}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}
