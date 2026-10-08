import { Difficulty } from '../enums/difficulty.enum';
import { claveCasilla, rangoNivel } from './casilla';

// Visión funcional (docs/00_VISION_FUNCIONAL.md, pausa técnica 2026-09-15): el avance debe ser
// proporcional al esfuerzo y la complejidad, no a la cantidad de clics. Repetir un ejercicio BASICO
// varias veces hasta acertarlo no debe pesar igual que acertar uno difícil al primer intento — pero
// repetir un ejercicio difícil sí es aprendizaje real y no se penaliza.
// Cuentan los intentos HASTA lograr la mejor nota: volver a resolver bien un ejercicio ya resuelto es práctica y no
// puede bajar el dominio (07/10, Jeider: falló, acertó con +20 % y al acertar otra vez el dominio quedó en 17 %).
const EASY_REPEAT_FREE_ATTEMPTS = 2;
const EASY_REPEAT_DECAY_STEP = 0.15;
const EASY_REPEAT_MIN_FACTOR = 0.5;

function easyRepeatDecayFactor(activity: any, attemptsOnActivity: number): number {
  if (activity.difficulty !== Difficulty.BASICO) return 1;
  const excessAttempts = attemptsOnActivity - EASY_REPEAT_FREE_ATTEMPTS;
  if (excessAttempts <= 0) return 1;
  return Math.max(EASY_REPEAT_MIN_FACTOR, 1 - excessAttempts * EASY_REPEAT_DECAY_STEP);
}

function momento(submission: any): number {
  const fecha = submission.submittedAt ?? submission.createdAt;
  return fecha ? new Date(fecha).getTime() : 0;
}

/** Cuántos intentos le tomó llegar a su mejor nota; los de después no cuentan para la penalización. */
function intentosHastaLaMejor(intentos: any[], mejor: number): number {
  const enOrden = [...intentos].sort((a, b) => momento(a) - momento(b));
  return enOrden.findIndex((s) => s.score === mejor) + 1;
}

/**
 * Dominio de la unidad, por casillas (docs/DISENO_PRACTICA_ADAPTATIVA.md §3.2 y §3.4):
 * - Las actividades hermanas (mismo tipo de pregunta y dificultad) son una sola casilla: cuenta la mejor de ellas.
 *   Si contaran por separado, agregar variantes para los repasos bajaría el dominio de todos.
 * - Si lo último que pasó en una casilla fue un repaso fallado, la casilla cuenta con esa nota: el dominio baja,
 *   como el nivel de una habilidad en Khan Academy.
 * Las actividades sin tipo de pregunta conocido son cada una su propia casilla (comportamiento anterior).
 * - `nivelSaltadoHasta` (reto de salto, §3.3): las casillas de niveles inferiores que el estudiante nunca intentó no
 *   cuentan, porque el recomendador ya no las exige. Sin esto, acertar el reto daba «Completaste la unidad» con un
 *   dominio del 30 % (simulación del segundo salón, 30/09). Las que sí intentó cuentan con su nota, como siempre.
 */
export function calculateUnitMastery(
  allSubmissions: any[],
  activities: any[],
  nivelSaltadoHasta = -1,
): number {
  const casillas = new Map<string, any[]>();
  for (const activity of activities) {
    const clave = claveCasilla(activity);
    casillas.set(clave, [...(casillas.get(clave) ?? []), activity]);
  }

  let totalAchieved = 0;
  let totalMaxWeight = 0;

  for (const hermanas of casillas.values()) {
    let ratio = 0;
    let weight = 0;
    const enCasilla: any[] = [];

    for (const activity of hermanas) {
      const actSubmissions = allSubmissions.filter(s => s.activityId === activity.id);
      enCasilla.push(...actSubmissions.map(s => ({ s, activity })));
      const bestScore = actSubmissions.length > 0
        ? Math.max(...actSubmissions.map(s => s.score))
        : 0;
      const decayFactor = easyRepeatDecayFactor(activity, intentosHastaLaMejor(actSubmissions, bestScore));
      ratio = Math.max(ratio, (bestScore / activity.totalPoints) * decayFactor);
      weight = Math.max(weight, activity.adaptiveWeight * (activity.activityType?.baseWeight || 1));
    }

    if (enCasilla.length === 0 && rangoNivel(hermanas[0].difficulty) < nivelSaltadoHasta) continue;

    const ultimo = enCasilla.sort((a, b) => momento(a.s) - momento(b.s))[enCasilla.length - 1];
    if (ultimo?.s.isReview) {
      const notaRepaso = ultimo.s.score / ultimo.activity.totalPoints;
      if (notaRepaso * 100 < ultimo.activity.passingScore) ratio = Math.min(ratio, notaRepaso);
    }

    totalAchieved += ratio * weight;
    totalMaxWeight += weight;
  }

  if (totalMaxWeight === 0) return 0;
  return Math.min(100, Math.round((totalAchieved / totalMaxWeight) * 100));
}
