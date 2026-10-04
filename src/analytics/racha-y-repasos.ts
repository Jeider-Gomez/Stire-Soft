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

// ─── Gamificación sobria (docs/investigacion/REFERENTES_PLATAFORMAS_Y_STI.md §10; Sailer y Homner, 2020) ───
// Racha SEMANAL y no diaria: en la universidad, la racha diaria castiga a quien estudia tres días fijos. Y en lugar de
// puntos o medallas, el esfuerzo de la semana: días de estudio, ejercicios difíciles resueltos y repasos hechos.

/** El lunes de la semana de un día («2026-10-04», domingo → «2026-09-28»). */
export function lunesDe(dia: string): string {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

function semanaAnterior(lunes: string): string {
  const d = new Date(`${lunes}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 7);
  return d.toISOString().slice(0, 10);
}

/** Semanas seguidas con al menos un día de práctica. Si esta semana aún no practica, la racha de la anterior sigue viva. */
export function rachaDeSemanas(fechas: Date[], ahora: Date): number {
  const semanas = new Set(fechas.map((f) => lunesDe(diaDe(f))));
  let semana = lunesDe(diaDe(ahora));
  if (!semanas.has(semana)) semana = semanaAnterior(semana);
  let racha = 0;
  while (semanas.has(semana)) {
    racha++;
    semana = semanaAnterior(semana);
  }
  return racha;
}

export interface EsfuerzoDeLaSemana {
  /** Días distintos (de lunes a hoy) con al menos una entrega. */
  dias: number;
  /** Ejercicios avanzados aprobados esta semana (distintos). */
  avanzados: number;
  /** Repasos espaciados hechos esta semana. */
  repasos: number;
}

/**
 * Lo que el estudiante hizo esta semana (de lunes a hoy, hora de Colombia). Reconoce el esfuerzo sin tocar el dominio:
 * repetir lo fácil suma días de práctica, no ejercicios avanzados.
 */
export function esfuerzoDeLaSemana(
  entregas: ReadonlyArray<{ fecha: Date; activityId: number; avanzadoAprobado: boolean }>,
  repasosHechos: ReadonlyArray<Date>,
  ahora: Date,
): EsfuerzoDeLaSemana {
  const lunes = lunesDe(diaDe(ahora));
  const hoy = diaDe(ahora);
  const enLaSemana = (f: Date) => {
    const d = diaDe(f);
    return d >= lunes && d <= hoy;
  };
  const deLaSemana = entregas.filter((e) => enLaSemana(e.fecha));
  return {
    dias: new Set(deLaSemana.map((e) => diaDe(e.fecha))).size,
    avanzados: new Set(deLaSemana.filter((e) => e.avanzadoAprobado).map((e) => e.activityId)).size,
    repasos: repasosHechos.filter(enLaSemana).length,
  };
}
