// Textos del panel del Tutor (components/tutor/TutorChatDrawer.vue), sacados del componente para que no crezca.

export interface RepasosVencidos {
  overdueCount: number
  oldest?: { daysOverdue: number; learningUnitTitle?: string | null } | null
}

/** La franja corta: «Tienes N repasos vencidos». */
export function avisoRepasosCorto(r: RepasosVencidos | null | undefined): string {
  const n = r?.overdueCount ?? 0
  return n === 1 ? 'Tienes 1 repaso vencido' : `Tienes ${n} repasos vencidos`
}

/** El detalle (va en el título de la franja): cuántos y cuál es el más atrasado. */
export function avisoRepasosLargo(r: RepasosVencidos | null | undefined): string | null {
  if (!r || r.overdueCount <= 0) return null
  const cuantos = r.overdueCount === 1 ? 'Tienes 1 repaso vencido.' : `Tienes ${r.overdueCount} repasos vencidos.`
  if (!r.oldest) return cuantos
  const d = r.oldest.daysOverdue
  const cuando = d === 0 ? 'toca hoy' : `hace ${d} ${d === 1 ? 'día' : 'días'}`
  return r.oldest.learningUnitTitle
    ? `${cuantos} El más atrasado: «${r.oldest.learningUnitTitle}» (${cuando}).`
    : `${cuantos} El más atrasado: ${cuando}.`
}

/** Mientras piensa: el texto cambia si tarda (§18.6). */
export function textoPensando(segundos: number): string {
  if (segundos >= 20) return 'Está tardando más de lo normal. Puedes seguir esperando.'
  if (segundos >= 8) return 'Sigo trabajando en tu respuesta…'
  return 'El tutor está analizando tu contexto de código...'
}

const NIVELES: Record<number, string> = { 1: 'pista', 2: 'pregunta guía', 3: 'dónde está el error' }
export const nombreNivelAyuda = (nivel: number | null | undefined): string => NIVELES[nivel ?? 0] ?? ''
