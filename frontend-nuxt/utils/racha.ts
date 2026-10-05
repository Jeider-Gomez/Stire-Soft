// La racha y la semana (BT-21): lo que se ve sin abrir «Ver más estadísticas». El servidor ya cuenta los días en hora de
// Colombia (src/learning-progress/estadisticas.ts); aquí solo se arma lo que se muestra.

const LETRA_DIA = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

export interface DiaSemana { dia: string; letra: string; practico: boolean; esHoy: boolean }

/** Los últimos 7 días del calendario (el último es hoy), con la inicial del día. */
export function ultimaSemana(calendario: Array<{ dia: string; ejercicios: number }>): DiaSemana[] {
  const ultimos = calendario.slice(-7)
  return ultimos.map((c, i) => ({
    dia: c.dia,
    letra: LETRA_DIA[new Date(`${c.dia}T12:00:00Z`).getUTCDay()],
    practico: c.ejercicios > 0,
    esHoy: i === ultimos.length - 1,
  }))
}

/**
 * Una frase corta y amable debajo de la racha. Si hoy no ha practicado y tiene racha, se avisa (sin culpa) que se
 * pierde mañana; nunca se regaña por un 0.
 */
export function avisoDeRacha(racha: number, practicoHoy: boolean, docente = false): { texto: string; urgente: boolean } {
  if (docente) {
    if (racha === 0) return { texto: 'Sin práctica ayer ni hoy.', urgente: false }
    return { texto: practicoHoy ? 'Practicó hoy.' : 'Aún no practica hoy.', urgente: false }
  }
  if (racha === 0) return { texto: 'Haz un ejercicio hoy y empiezas una racha.', urgente: false }
  if (practicoHoy) return { texto: 'Hoy ya sumaste. ¡Vuelve mañana!', urgente: false }
  return { texto: 'Haz un ejercicio hoy para no perderla.', urgente: true }
}

// ── La semana de estudio (05/10): lo mismo que pide el logro «Semana de estudio» (src/analytics/logros.ts): al menos
// 3 días distintos de lunes a domingo, sin exigir días seguidos. Antes el titular era la racha de días seguidos y
// contradecía a los logros («No tienen que ser seguidos»), según la crítica de diseño.
export const META_DIAS_SEMANA = 3

export interface DiaDeLaSemana { dia: string; letra: string; practico: boolean; esHoy: boolean; futuro: boolean }

/** Lunes a domingo de la semana de `hoy` (AAAA-MM-DD, en hora de Colombia): practicado, hoy o todavía por venir. */
export function semanaActual(calendario: Array<{ dia: string; ejercicios: number }>, hoy: string): DiaDeLaSemana[] {
  const conPractica = new Set(calendario.filter((c) => c.ejercicios > 0).map((c) => c.dia))
  const base = new Date(`${hoy}T12:00:00Z`)
  const lunes = new Date(base)
  lunes.setUTCDate(base.getUTCDate() - ((base.getUTCDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes)
    d.setUTCDate(lunes.getUTCDate() + i)
    const dia = d.toISOString().slice(0, 10)
    return { dia, letra: 'LMMJVSD'[i], practico: conPractica.has(dia), esHoy: dia === hoy, futuro: dia > hoy }
  })
}

/** «2 de 3 días esta semana» y qué falta, sin culpa. */
export function textoSemana(dias: number, docente = false): { titulo: string; ayuda: string } {
  const titulo = `${Math.min(dias, 7)} de ${META_DIAS_SEMANA} días esta semana`
  if (dias >= META_DIAS_SEMANA) return { titulo, ayuda: docente ? 'Cumplió la semana de estudio.' : '¡Semana de estudio cumplida!' }
  const faltan = META_DIAS_SEMANA - dias
  if (docente) return { titulo, ayuda: `Le ${faltan === 1 ? 'falta 1 día' : `faltan ${faltan} días`} para la meta de la semana.` }
  return { titulo, ayuda: `Te ${faltan === 1 ? 'falta 1 día' : `faltan ${faltan} días`}. No tienen que ser seguidos.` }
}
