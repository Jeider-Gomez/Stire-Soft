// Atajos del Tutor (pedido de Jeider, 03/10: ocupaban mucho y estorbaban). Como en ChatGPT o Gemini, las sugerencias
// sirven para arrancar: se muestran solas solo en un ejercicio y antes de la primera pregunta; después quedan detrás del
// botón del bombillo. «Caso borde» y «condición de parada» solo tienen sentido con código abierto.

export type Atajo = 'conceptual' | 'borde' | 'parada'

const DE_CODIGO = ['coding', 'html_css']

export function enEjercicio(ruta: string): boolean {
  return ruta.startsWith('/estudiante/evaluacion/')
}

export function atajosDisponibles(ruta: string, tipoPregunta: string | null | undefined): Atajo[] {
  return enEjercicio(ruta) && DE_CODIGO.includes(tipoPregunta ?? '') ? ['conceptual', 'borde', 'parada'] : ['conceptual']
}

/** Preguntas que el estudiante hizo en esta visita (las del historial llegan con id «hist-…»). */
export function preguntasNuevas(mensajes: ReadonlyArray<{ id: string; sender: string }>): number {
  return mensajes.filter((m) => m.sender === 'student' && !m.id.startsWith('hist-')).length
}

/** Se muestran solos en un ejercicio hasta que el estudiante pregunta algo en él (`alEntrar`: las que llevaba antes). */
export function atajosASimpleVista(ruta: string, mensajes: ReadonlyArray<{ id: string; sender: string }>, alEntrar: number): boolean {
  return enEjercicio(ruta) && preguntasNuevas(mensajes) <= alEntrar
}
