// Repetición espaciada SM-2 (Woźniak y Gorzelańczyk, 1994 — matriz bibliográfica #2) con la calidad de respuesta
// derivada del RESULTADO de cada repaso, como los botones de Anki (docs/DISENO_PRACTICA_ADAPTATIVA.md §3.4). Antes la
// calidad salía del dominio acumulado de la unidad, que usa la mejor nota y nunca baja: un repaso fallado no reiniciaba
// el intervalo.

/** Calidad de respuesta SM-2 (0-5). Por debajo de 3 el repaso cuenta como olvidado. */
export type CalidadRepaso = 1 | 3 | 4 | 5;

export const INTERVALO_MAXIMO_DIAS = 60;
const EASE_MINIMO = 1.3;

/**
 * Traducción del resultado a la calidad SM-2, sin preguntarle nada extra al estudiante:
 * falló → 1 (Again) · acertó tras varios intentos → 3 (Hard) · al primer intento → 4 (Good) ·
 * al primer intento habiendo dicho «Me siento seguro» → 5 (Easy).
 */
export function calidadDeRepaso(resultado: { aprobado: boolean; primerIntento: boolean; seSentiaSeguro: boolean }): CalidadRepaso {
  if (!resultado.aprobado) return 1;
  if (!resultado.primerIntento) return 3;
  return resultado.seSentiaSeguro ? 5 : 4;
}

export interface EstadoRepaso {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
}

/**
 * Un paso de SM-2. Diferencia deliberada con el original: el segundo intervalo es de 3 días en vez de 6, para que en un
 * semestre universitario el primer repaso real llegue antes (decisión previa del proyecto, se conserva).
 */
export function calculateNextReview(
  anterior: EstadoRepaso,
  calidad: CalidadRepaso,
  ahora: Date = new Date(),
): EstadoRepaso & { nextReviewDate: Date } {
  let { repetitions, intervalDays, easeFactor } = anterior;

  if (calidad < 3) {
    // Olvidado: se vuelve a empezar sin tocar el factor de facilidad (SM-2 original).
    repetitions = 0;
    intervalDays = 1;
  } else {
    easeFactor = Math.max(EASE_MINIMO, easeFactor + (0.1 - (5 - calidad) * (0.08 + (5 - calidad) * 0.02)));
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * easeFactor);
  }

  intervalDays = Math.min(intervalDays, INTERVALO_MAXIMO_DIAS);
  const nextReviewDate = new Date(ahora);
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  return { repetitions, intervalDays, easeFactor: Math.round(easeFactor * 100) / 100, nextReviewDate };
}
