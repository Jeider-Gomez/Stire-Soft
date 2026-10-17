// Qué hacer cuando una lección «No me quedó claro» (UI-01, revisión de Jeider 17/10: «que el estudiante siempre tenga
// opciones, no solo el chatbot, y no se quede estancado»). Antes se ofrecían el diagrama y «Escuchar», que ya estaban en
// la misma lección y no cambiaban nada. Ahora son caminos distintos, como «¿Atascado?» en Khan Academy o «Ver una
// explicación» en Duolingo: aprender haciéndolo, reforzar la base, otra voz que lo explique y una persona.
// Siempre hay al menos tres: un video que lo explique, el docente y el Tutor.

export type TipoAyuda = 'practicar' | 'anterior' | 'vivo' | 'recurso' | 'video' | 'docente' | 'tutor'

export interface OpcionAyuda {
  tipo: TipoAyuda
  titulo: string
  detalle: string
  /** A dónde lleva: una ruta de STIRE, un enlace externo o un selector de la misma página. */
  destino: string
}

export interface EjercicioParaAyuda { id: number; titulo: string; nivel: string; estado: string }

const ORDEN_NIVEL: Record<string, number> = { basico: 0, intermedio: 1, avanzado: 2 }

/** El ejercicio más sencillo que todavía puede hacer (no resuelto y con intentos), del nivel más bajo. */
export function ejercicioSencillo(ejercicios: EjercicioParaAyuda[]): EjercicioParaAyuda | null {
  return [...ejercicios]
    .filter((e) => e.estado !== 'hecho' && e.estado !== 'sin-intentos')
    .sort((a, b) => (ORDEN_NIVEL[a.nivel] ?? 9) - (ORDEN_NIVEL[b.nivel] ?? 9))[0] ?? null
}

/** La lección anterior en el plan del curso (la base que a veces falta), o null si es la primera. */
export function leccionAnterior(
  modulos: ReadonlyArray<{ units: ReadonlyArray<{ id: number; title: string }> }>,
  unitId: number,
): { id: number; titulo: string } | null {
  const plan = modulos.flatMap((m) => m.units)
  const i = plan.findIndex((u) => u.id === unitId)
  return i > 0 ? { id: plan[i - 1].id, titulo: plan[i - 1].title } : null
}

/** Una búsqueda de videos en YouTube con el tema de la lección: otra persona que lo explica de otra forma. */
export function busquedaDeVideo(tituloLeccion: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${tituloLeccion} explicación`)}`
}

export function opcionesDeAyuda(e: {
  tituloLeccion: string
  sencillo: EjercicioParaAyuda | null
  anterior: { id: number; titulo: string } | null
  hayVivo: boolean
  hayRecurso: boolean
}): OpcionAyuda[] {
  const o: OpcionAyuda[] = []
  if (e.sencillo) o.push({ tipo: 'practicar', titulo: 'Aprenderlo haciéndolo', detalle: `Un ejercicio sencillo, «${e.sencillo.titulo}»: te dice al instante qué falla.`, destino: `/estudiante/evaluacion/${e.sencillo.id}` })
  if (e.hayVivo) o.push({ tipo: 'vivo', titulo: 'Tocar el ejemplo en vivo', detalle: 'Cambia los valores y mira qué pasa.', destino: '[data-forma="vivo"]' })
  if (e.anterior) o.push({ tipo: 'anterior', titulo: 'Repasar la base', detalle: `La lección anterior, «${e.anterior.titulo}»: a veces lo que falta está ahí.`, destino: `/estudiante/unidad/${e.anterior.id}` })
  if (e.hayRecurso) o.push({ tipo: 'recurso', titulo: 'Ver el video de la lección', detalle: 'El recurso que dejó tu docente.', destino: '[data-forma="recurso"]' })
  o.push({ tipo: 'video', titulo: 'Buscar otro video que lo explique', detalle: 'Otra persona, otra forma de decirlo (se abre YouTube).', destino: busquedaDeVideo(e.tituloLeccion) })
  o.push({ tipo: 'docente', titulo: 'Preguntarle a tu docente', detalle: 'Le escribes tu duda; también ve qué no quedó claro.', destino: '/estudiante/mensajes?redactar=1' })
  o.push({ tipo: 'tutor', titulo: 'Que el Tutor te lo explique', detalle: 'Con otra analogía y otro ejemplo, sobre lo que no entendiste.', destino: '' })
  return o
}
