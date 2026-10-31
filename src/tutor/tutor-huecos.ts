/**
 * El estado de los huecos de un ejercicio de completar, dicho junto al mensaje del estudiante (31/10, prueba con la cuenta
 * de Santiago): con el hueco vacío, el Tutor decía «en el primer hueco tienes const» porque el historial del chat lo
 * había dicho antes, y una regla del prompt no bastó para que mandara la pantalla. Lo último que lee el modelo pesa más.
 *
 * La plantilla viene del navegador (utils/contextoTutor.ts, plantillaConRespuestas): un hueco vacío es ___a___ y uno
 * escrito es ⟦texto⟧. Es texto del cliente, así que se recortan los identificadores y los valores.
 */
const MAX_HUECOS = 12;
const MAX_VALOR = 40;
const MAX_CODIGO = 4000;

export function notaDeHuecos(context: unknown): string {
  if (!context || typeof context !== 'object') return '';
  const { tipoEjercicio, currentCode: crudo } = context as { tipoEjercicio?: unknown; currentCode?: unknown };
  if (tipoEjercicio !== 'completar' || typeof crudo !== 'string') return '';
  const currentCode = crudo.slice(0, MAX_CODIGO);

  const vacios = [...currentCode.matchAll(/___([A-Za-z0-9_-]{1,20})___/g)].map((m) => m[1]).slice(0, MAX_HUECOS);
  const escritos = [...currentCode.matchAll(/⟦([^⟧\n]+)⟧/g)].map((m) => m[1].trim().slice(0, MAX_VALOR)).slice(0, MAX_HUECOS);
  if (vacios.length === 0 && escritos.length === 0) return '';

  const partes = [
    vacios.length > 0 ? `huecos vacíos: ${vacios.join(', ')}` : 'no hay huecos vacíos',
    escritos.length > 0 ? `lo que el estudiante ya escribió: ${escritos.map((e) => `«${e}»`).join(', ')}` : 'el estudiante no ha escrito nada en los huecos',
  ];
  return `\n\n[Dato de la pantalla ahora mismo, no lo escribió el estudiante: ${partes.join('; ')}. Si algo dicho antes en el chat contradice esto, vale esto.]`;
}
