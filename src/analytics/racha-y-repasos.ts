/**
 * Racha y repasos pendientes del resumen del estudiante, contados por DÍA en hora de Colombia (common/utils/dia-colombia).
 * Antes se contaban en UTC y por instante: después de las 7 p. m. la práctica caía en el día siguiente, y un repaso de
 * hoy no contaba como pendiente hasta su hora exacta, así que el docente veía «0 pendientes» mientras el estudiante
 * veía «5 para hoy».
 */
import { diaDe } from '../common/utils/dia-colombia';

function diaAnterior(dia: string): string {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Días seguidos con al menos una entrega. Si hoy aún no practica, la racha de ayer sigue viva. */
export function rachaDeDias(fechas: Date[], ahora: Date): number {
  const dias = new Set(fechas.map(diaDe));
  let dia = diaDe(ahora);
  if (!dias.has(dia)) dia = diaAnterior(dia);
  let racha = 0;
  while (dias.has(dia)) {
    racha++;
    dia = diaAnterior(dia);
  }
  return racha;
}

/** Repasos que tocan hoy o antes (vencidos), como los ve el estudiante en «Repasos para hoy». */
export function repasosPendientes(fechas: Date[], ahora: Date): number {
  const hoy = diaDe(ahora);
  return fechas.filter((f) => diaDe(f) <= hoy).length;
}
