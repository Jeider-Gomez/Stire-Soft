// Guía para activar el Tutor y el Asistente con la clave gratuita de Google AI Studio (ítem 7 de la evaluación
// heurística, docs/calidad/EVALUACION_HEURISTICA_PLAN_A_5.md; pasos en docs/PLAN_TUTOR_Y_ASISTENTE.md §6d). Revisa la forma
// de la clave antes de enviarla, para decir en palabras sencillas qué pasó sin esperar al servidor.

export const ENLACE_AI_STUDIO = 'https://aistudio.google.com/apikey'

/** null si la clave tiene la forma de una de Google AI Studio; si no, qué revisar. */
export function revisarFormatoClave(texto: string): string | null {
  const clave = texto.trim()
  if (!clave) return null
  if (/\s/.test(clave)) return 'La clave no lleva espacios: cópiala otra vez con el botón de copiar de Google.'
  if (!clave.startsWith('AIza')) return 'Las claves de Google AI Studio empiezan por «AIza». Revisa que copiaste la clave y no el nombre del proyecto.'
  if (clave.length < 35) return 'La clave parece incompleta: tiene unos 39 caracteres. Cópiala otra vez completa.'
  return null
}
