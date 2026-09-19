/**
 * Andamiaje progresivo (principio P03): el Tutor da la ayuda mínima necesaria y solo escala cuando el
 * estudiante sigue sin lograrlo. El nivel lo decide el sistema con datos reales (intentos fallidos
 * de la actividad), no el estudiante.
 *
 *   1 · Pista conceptual   2 · Pregunta guía   3 · Localizar la falla   (nunca se entrega la solución)
 */
export type GuidanceLevel = 1 | 2 | 3;

export const MAX_GUIDANCE_LEVEL: GuidanceLevel = 3;

/** Umbrales: 0-1 intentos fallidos → 1; 2-3 → 2; 4 o más → 3. */
export function guidanceLevelForFailedAttempts(failedAttempts: number): GuidanceLevel {
  if (failedAttempts >= 4) return 3;
  if (failedAttempts >= 2) return 2;
  return 1;
}

const GUIDANCE_INSTRUCTIONS: Record<GuidanceLevel, string> = {
  1: 'NIVEL 1 · PISTA CONCEPTUAL: da solo una pista conceptual o una metáfora sobre la idea clave. No menciones líneas concretas de código ni la solución.',
  2: 'NIVEL 2 · PREGUNTA GUÍA: haz una o dos preguntas guía que lleven al estudiante a descubrir dónde está el error. No escribas la corrección.',
  3: 'NIVEL 3 · LOCALIZAR LA FALLA: indica en qué parte del código o del razonamiento está la falla (qué línea o condición revisar) y por qué, pero NO escribas el código corregido ni la solución completa.',
};

export function guidanceInstruction(level: GuidanceLevel): string {
  return GUIDANCE_INSTRUCTIONS[level];
}
