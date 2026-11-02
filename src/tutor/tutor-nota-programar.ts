/**
 * Recordatorio junto al mensaje del estudiante en un ejercicio de programar (02/11, prueba con la cuenta de Santiago): con la
 * regla 1 del prompt, el Tutor seguía diciendo «une con + el texto "Vivo en ", la variable ciudad y el punto». Como con los
 * huecos (tutor-huecos.ts), lo último que lee el modelo pesa más que el historial, y ahí estaban sus respuestas anteriores.
 */
export function notaDeProgramar(context: unknown): string {
  if (!context || typeof context !== 'object') return '';
  const { activityId, currentCode, tipoEjercicio, proyectoTitulo } = context as Record<string, unknown>;
  if (!activityId || typeof currentCode !== 'string' || tipoEjercicio === 'completar') return '';
  if (typeof proyectoTitulo === 'string' && proyectoTitulo.trim()) return '';
  return '\n\n[Recordatorio de STIRE, no lo escribió el estudiante: este ejercicio se califica. Aunque pregunte qué poner, nombra solo la idea que le falta. No digas ni enumeres los textos, las variables y los operadores exactos de SU solución. Si das un ejemplo, que sea de otro problema y con otra forma, no el mismo molde con otros nombres. Si antes en el chat se los diste, no los repitas: que él lo arme.]';
}
