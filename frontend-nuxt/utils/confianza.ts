// Juicio de confianza y calibración (META-02 de la lista de chequeo de Sistemas Tutores, Caro 2015: juicios
// metacognitivos). Antes de la PRIMERA entrega de cada ejercicio se pregunta «¿Qué tan seguro estás?» (se puede omitir:
// preguntarlo en cada envío sería fricción). Al calificar, se contrasta lo que dijo con lo que obtuvo, y el Tutor lo usa
// (src/tutor/tutor-senales.ts). Combate la ilusión de saber: creer que se domina algo que todavía no.

export type Confianza = 'seguro' | 'dudo' | 'adivino'

export const OPCIONES_CONFIANZA: ReadonlyArray<{ valor: Confianza; texto: string; ayuda: string }> = [
  { valor: 'seguro', texto: 'Estoy seguro', ayuda: 'Sé por qué funciona' },
  { valor: 'dudo', texto: 'Tengo dudas', ayuda: 'Creo que está bien' },
  { valor: 'adivino', texto: 'Estoy adivinando', ayuda: 'No sé si funciona' },
]

/** Solo en la primera entrega del ejercicio y si todavía no respondió (u omitió) en esta visita. */
export function debePreguntarConfianza(intentosUsados: number, yaDecidio: boolean): boolean {
  return intentosUsados === 0 && !yaDecidio
}

export interface Calibracion { confianza: Confianza; acerto: boolean }

/** Qué se le dice al estudiante al calificar, según lo que dijo y lo que obtuvo. */
export function mensajeCalibracion(c: Calibracion): { texto: string; tono: 'bien' | 'atencion' } {
  if (c.confianza === 'seguro') {
    return c.acerto
      ? { texto: 'Dijiste que estabas seguro y acertaste: tu juicio está bien calibrado.', tono: 'bien' }
      : { texto: 'Dijiste que estabas seguro, pero no acertaste. Pasa a veces: compara lo que esperabas que hiciera tu programa con lo que hizo. El Tutor puede ayudarte a encontrar la diferencia.', tono: 'atencion' }
  }
  if (c.confianza === 'dudo') {
    return c.acerto
      ? { texto: 'Tenías dudas y acertaste: sabes más de lo que creías. Fíjate en qué hiciste bien.', tono: 'bien' }
      : { texto: 'Tenías dudas y no acertaste: tu intuición era buena. Revisa la parte que te hacía dudar.', tono: 'atencion' }
  }
  return c.acerto
    ? { texto: 'Dijiste que adivinabas y acertaste. ¿Sabrías explicar por qué funciona? Si no, vuelve a la explicación.', tono: 'atencion' }
    : { texto: 'Dijiste que adivinabas: antes de otro intento, vuelve a la idea de la lección.', tono: 'atencion' }
}
