/**
 * La mascota del Tutor: la pantalla con gafas del logo (docs/identidad-visual/propuestas/mascota-stire.html). Los ojos
 * son etiquetas de código y cambian según lo que está pasando; el resto del cuerpo no se mueve. Sin importaciones para
 * que la prueba pueda transpilar este archivo solo.
 */

export type ExpresionTutor = 'normal' | 'atento' | 'pensando' | 'hablando' | 'acierto' | 'error' | 'durmiendo'

/** Lo que el Tutor «ve» en la página. */
export interface SenalesMascota {
  /** El docente lo tiene encendido: si lo apagó, duerme. */
  activo: boolean
  /** Esperando la respuesta de la IA. */
  pensando: boolean
  /** El estudiante está escribiendo en el campo del Tutor. */
  escribiendo: boolean
  /** El último mensaje del Tutor fue un error (sin conexión, clave inválida…). */
  ultimoError: boolean
  /** Acaba de llegar una respuesta: mueve la boca un momento. */
  hablando: boolean
  /** Reacción breve al resultado de un ejercicio («Probar» o «Entregar»). */
  reaccion: 'acierto' | 'error' | null
}

/** Una sola expresión a la vez, de la más importante a la menos. */
export function expresionTutor(s: SenalesMascota): ExpresionTutor {
  if (!s.activo) return 'durmiendo'
  if (s.reaccion) return s.reaccion
  if (s.pensando) return 'pensando'
  if (s.ultimoError) return 'error'
  if (s.hablando) return 'hablando'
  if (s.escribiendo) return 'atento'
  return 'normal'
}

/** Qué significa cada expresión, para el lector de pantalla y el manual. */
export const SIGNIFICADO: Record<ExpresionTutor, string> = {
  normal: 'Listo para ayudar',
  atento: 'Te está leyendo',
  pensando: 'Pensando la respuesta',
  hablando: 'Respondiendo',
  acierto: '¡Pasaron las pruebas!',
  error: 'Algo falló',
  durmiendo: 'El Tutor está apagado',
}

// Geometría del logo (viewBox de 200): lentes con centro en (69,80) y (131,80).
export const OJOS: Record<ExpresionTutor, string[] | null> = {
  normal: ['M76 70 L66 80 L76 90', 'M128 70 L138 80 L128 90'],
  atento: ['M76 74 L66 84 L76 94', 'M128 74 L138 84 L128 94'],
  pensando: null,
  hablando: ['M76 70 L66 80 L76 90', 'M128 70 L138 80 L128 90'],
  acierto: ['M59 86 L69 74 L79 86', 'M121 86 L131 74 L141 86'],
  error: ['M62 70 L72 80 L62 90', 'M138 70 L128 80 L138 90'],
  durmiendo: ['M60 82 L78 82', 'M122 82 L140 82'],
}

export const BOCA: Record<ExpresionTutor, string> = {
  normal: 'M82 114 Q100 127 118 114',
  atento: 'M84 115 Q100 125 116 115',
  pensando: 'M88 118 L112 118',
  hablando: 'M86 113 Q100 130 114 113 Q100 120 86 113',
  acierto: 'M78 111 Q100 133 122 111',
  error: 'M82 119 Q91 112 100 119 Q109 126 118 119',
  durmiendo: 'M92 118 L108 118',
}

/** Cuántos milisegundos dura una reacción al resultado de un ejercicio. */
export const DURACION_REACCION = 2600

/** El ejercicio avisa su resultado con este evento; la mascota lo escucha sin acoplarse al store del ejercicio. */
export const EVENTO_RESULTADO = 'stire:resultado-ejercicio'

export function avisarResultado(todoBien: boolean): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(EVENTO_RESULTADO, { detail: { todoBien } }))
}

/** Espera aleatoria entre parpadeos, como una persona: entre 2,5 y 6 segundos. */
export function esperaParpadeo(azar: number): number {
  return Math.round(2500 + Math.min(Math.max(azar, 0), 1) * 3500)
}

/** Hacia dónde miran los ojos: un desplazamiento corto en dirección al puntero, nunca fuera de la lente. */
export function miradaHacia(dx: number, dy: number, maximo = 3): { x: number; y: number } {
  const largo = Math.hypot(dx, dy)
  if (largo < 1) return { x: 0, y: 0 }
  const f = Math.min(largo / 240, 1) * maximo
  return { x: Math.round((dx / largo) * f * 10) / 10, y: Math.round((dy / largo) * f * 10) / 10 }
}
