import { Difficulty } from '../enums/difficulty.enum';

// Visión funcional (docs/00_VISION_FUNCIONAL.md, pausa técnica 2026-09-15): el avance debe ser
// proporcional al esfuerzo y la complejidad, no a la cantidad de clics. Repetir un ejercicio BASICO
// varias veces hasta acertarlo no debe pesar igual que acertar uno difícil al primer intento — pero
// repetir un ejercicio difícil sí es aprendizaje real y no se penaliza.
const EASY_REPEAT_FREE_ATTEMPTS = 2;
const EASY_REPEAT_DECAY_STEP = 0.15;
const EASY_REPEAT_MIN_FACTOR = 0.5;

function easyRepeatDecayFactor(activity: any, attemptsOnActivity: number): number {
  if (activity.difficulty !== Difficulty.BASICO) return 1;
  const excessAttempts = attemptsOnActivity - EASY_REPEAT_FREE_ATTEMPTS;
  if (excessAttempts <= 0) return 1;
  return Math.max(EASY_REPEAT_MIN_FACTOR, 1 - excessAttempts * EASY_REPEAT_DECAY_STEP);
}

export function calculateUnitMastery(
  allSubmissions: any[],
  activities: any[]
): number {
  let totalAchieved = 0;
  let totalMaxWeight = 0;

  for (const activity of activities) {
    const actSubmissions = allSubmissions.filter(s => s.activityId === activity.id);
    const bestScore = actSubmissions.length > 0
      ? Math.max(...actSubmissions.map(s => s.score))
      : 0;

    const weight = activity.adaptiveWeight * (activity.activityType?.baseWeight || 1);
    const decayFactor = easyRepeatDecayFactor(activity, actSubmissions.length);

    totalAchieved += (bestScore / activity.totalPoints) * weight * decayFactor;
    totalMaxWeight += weight;
  }

  if (totalMaxWeight === 0) return 0;
  return Math.min(100, Math.round((totalAchieved / totalMaxWeight) * 100));
}
