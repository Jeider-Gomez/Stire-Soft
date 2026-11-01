// El chat del Tutor es uno solo por estudiante y sus mensajes no guardan a qué ejercicio pertenecen (P43, memoria del Tutor).
// 01/11, probando como Santiago: en «¿Dónde vive?», sin haber escrito nada, se leía «Tu código ya quedó perfecto» sobre otro ejercicio.
// Mientras no se guarde el ejercicio de cada mensaje, una línea separa lo anterior de lo que se habla aquí.

/** El texto de la línea que marca dónde empieza este ejercicio en el chat. */
export function textoDelTema(titulo: string): string {
  return `Ahora en «${titulo}». Lo de arriba es de antes.`
}

/**
 * ¿Hace falta marcar este ejercicio? No si el chat está vacío (no hay nada con qué confundirlo), ni si la última marca
 * ya es la suya: lo que viene después de ella es de este ejercicio.
 */
export function faltaMarcarTema(mensajes: ReadonlyArray<{ text: string; separador?: boolean }>, titulo: string): boolean {
  if (mensajes.length === 0) return false
  const marcas = mensajes.filter((m) => m.separador)
  return marcas[marcas.length - 1]?.text !== textoDelTema(titulo)
}
