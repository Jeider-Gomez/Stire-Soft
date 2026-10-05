// Repasos del día (pages/estudiante/repasos.vue). Repasar no es una deuda: es repasar justo cuando empiezas a olvidar,
// y eso hace que lo recuerdes más tiempo. Por eso nada sale en rojo de error; lo atrasado va primero, en ámbar.
import type { ReviewUrgency } from '~/types'

const ORDEN: Record<ReviewUrgency, number> = { critico: 0, vencido: 1, manana: 2, 'al-dia': 3 }

/** Primero lo atrasado, luego lo de hoy, luego lo de mañana; dentro de cada grupo, el orden en que llegó. */
export function ordenarRepasos<T extends { urgency: ReviewUrgency }>(repasos: T[]): T[] {
  return repasos.map((r, i) => ({ r, i })).sort((a, b) => ORDEN[a.r.urgency] - ORDEN[b.r.urgency] || a.i - b.i).map((x) => x.r)
}

/** «Unos 30 minutos»; con un solo repaso, «Unos 5 minutos». */
export function tiempoTotal(repasos: Array<{ estimatedTimeMin: number }>): string {
  const min = repasos.reduce((s, r) => s + (r.estimatedTimeMin || 0), 0)
  if (min < 60) return `Unos ${min} minutos`
  const h = Math.floor(min / 60)
  const resto = min % 60
  return `Unas ${h} ${h === 1 ? 'hora' : 'horas'}${resto ? ` y ${resto} minutos` : ''}`
}

export const ESTILO_URGENCIA: Record<ReviewUrgency, string> = {
  critico: 'bg-urgencia-repaso-vencido/15 text-urgencia-repaso-vencido',
  vencido: 'bg-acento-ambar-fuerte/10 text-acento-ambar-fuerte',
  manana: 'bg-base-bg-secundario text-base-texto-secundario',
  'al-dia': 'bg-semantico-pasa/10 text-semantico-pasa',
}
