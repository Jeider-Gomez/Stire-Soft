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
export function mensajeCalibracion(c: Calibracion, esCodigo = true): { texto: string; tono: 'bien' | 'atencion' } {
  if (c.confianza === 'seguro') {
    if (!c.acerto && !esCodigo) {
      // 07/10: en una pregunta de opción múltiple no hay «casos» ni «programa» (Jeider no lo entendió).
      return { texto: 'Estabas seguro y no acertaste: este es el error que más enseña, porque te sorprende. Busca en qué paso tu razonamiento se separó de la respuesta correcta; esa diferencia es la que se te va a quedar.', tono: 'atencion' }
    }
    return c.acerto
      ? { texto: 'Dijiste que estabas seguro y acertaste: sabes cuándo sabes. Esta lección tardará más en volver a tus repasos.', tono: 'bien' }
      // Efecto de hipercorrección (Butterfield y Metcalfe, 2001): el error cometido con seguridad sorprende, y por eso
      // se corrige y se recuerda mejor si se mira la diferencia. Se invita a mirarla, sin regañar.
      : { texto: 'Estabas seguro y no acertó: este es el error que más enseña, porque te sorprende. Mira caso por caso qué esperabas y qué mostró tu programa; esa diferencia es la que se te va a quedar.', tono: 'atencion' }
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

// ── Calibración con el tiempo (GET /analytics/student/:id/calibracion, src/analytics/calibracion.ts) ──

export type Sesgo = 'pocos-datos' | 'sobreconfianza' | 'subconfianza' | 'calibrado'
export interface ResumenCalibracion {
  total: number
  porNivel: Record<Confianza, { total: number; aciertos: number }>
  sesgo: Sesgo
}

/** Qué significa su calibración y qué hacer con ella: una observación y UNA acción concreta. */
export function lecturaCalibracion(sesgo: Sesgo): { titulo: string; consejo: string } {
  switch (sesgo) {
    case 'sobreconfianza':
      return {
        titulo: 'Cuando dices «Estoy seguro», aciertas menos de lo que crees.',
        consejo: 'Antes de entregar, inventa un caso propio y predice qué debe mostrar tu programa. Si no puedes predecirlo, todavía no estás seguro.',
      }
    case 'subconfianza':
      return {
        titulo: 'Sabes más de lo que crees: cuando dudas, casi siempre aciertas.',
        consejo: 'Fíjate en qué hiciste bien en esos ejercicios: es lo que ya dominas. Puedes pasar a los de nivel más alto.',
      }
    case 'calibrado':
      return {
        titulo: 'Tu seguridad coincide con tus resultados: sabes cuándo sabes.',
        consejo: 'Sigue diciendo qué tan seguro estás: es lo que te deja ver qué repasar y qué ya puedes dejar.',
      }
    default:
      return {
        titulo: 'Todavía hay pocos datos.',
        consejo: 'En cada ejercicio nuevo, antes de entregar, di qué tan seguro estás. Después de 5 verás aquí si tu seguridad coincide con tus resultados.',
      }
  }
}

/** Lo mismo, para el docente que mira a un estudiante: qué significa y cómo ayudarlo. */
export function lecturaParaDocente(sesgo: Sesgo): { titulo: string; consejo: string } {
  switch (sesgo) {
    case 'sobreconfianza':
      return { titulo: 'Se siente seguro más de lo que acierta.', consejo: 'Pídele que prediga la salida de un caso antes de entregar: si no puede, todavía no lo domina.' }
    case 'subconfianza':
      return { titulo: 'Acierta más de lo que cree.', consejo: 'Muéstrale lo que ya hace bien; puede pasar a ejercicios de nivel más alto.' }
    case 'calibrado':
      return { titulo: 'Su seguridad coincide con sus resultados.', consejo: 'Sabe cuándo sabe: no necesita apoyo en esto.' }
    default:
      return { titulo: 'Todavía hay pocos datos.', consejo: 'Se lee después de 5 ejercicios en los que diga qué tan seguro está.' }
  }
}

export const NOMBRE_NIVEL_CONFIANZA: Record<Confianza, string> = { seguro: 'Estoy seguro', dudo: 'Tengo dudas', adivino: 'Estoy adivinando' }
