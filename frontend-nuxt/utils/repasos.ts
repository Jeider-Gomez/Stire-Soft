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
  // Ámbar oscuro sobre ámbar claro (el ámbar del token sobre su 15 % daba 4,2:1 a 11 px).
  critico: 'bg-amber-50 text-amber-800 border border-amber-200',
  vencido: 'bg-acento-ambar-fuerte/10 text-acento-ambar-fuerte',
  manana: 'bg-base-bg-secundario text-base-texto-secundario',
  'al-dia': 'bg-semantico-pasa/10 text-semantico-pasa',
}

// Verde oscuro sobre verde claro, con borde, como el ámbar de «critico»: el verde del token sobre su 10 % no llegaba a
// 4,5:1 a 11 px (axe, 17/10).
export const ESTILO_DOMINADA = 'bg-emerald-50 text-emerald-800 border border-emerald-200'

/**
 * Cómo se presenta un repaso según el dominio de la lección. José (S09-JO01) y Jeider (17/10): una lección con 100 %
 * salía como «Atrasado», como si estuviera mal. Una lección dominada sigue dominada (el dominio no baja por esperar;
 * solo si se falla el repaso, motor-dominio.ts): se dice «Dominada ✓» y que el repaso es para no olvidarla.
 */
export function presentarRepaso(urgency: ReviewUrgency, urgencyLabel: string, dominio: number | undefined): { dominada: boolean; etiqueta: string; estilo: string; nota: string | null } {
  if (dominio !== undefined && dominio >= 85) {
    return { dominada: true, etiqueta: `Dominada ✓ · ${dominio} %`, estilo: ESTILO_DOMINADA, nota: 'Repaso corto para no olvidarla' }
  }
  return { dominada: false, etiqueta: urgencyLabel, estilo: ESTILO_URGENCIA[urgency], nota: dominio !== undefined ? `${dominio} % de dominio` : null }
}
