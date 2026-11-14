// Repasos v3 (Fase D, paso 4; cuadros «E-Repasos», «E-Repasos-Oculto», «E-Repasos-Oscuro» y «E-Cel-Repasos»). Sin rachas y
// sin rojo: lo que vence hoy va primero, lo de la semana y lo de más adelante en sus pestañas, y cada tema dice qué tan firme
// está su recuerdo (repasos bien hechos seguidos, del SM-2 de review-schedules) y cuándo toca, en palabras.

export interface RepasoV3 {
  id: number
  learningUnitId: number
  conceptTitle: string
  diasHasta?: number
  diaRepaso?: string
  repeticiones?: number
  estimatedTimeMin: number
}

export type GrupoRepaso = 'hoy' | 'semana' | 'adelante'

/** Hoy (incluye lo que ya tocaba), esta semana (de mañana a 6 días) o más adelante. */
export function grupoDe(r: { diasHasta?: number }): GrupoRepaso {
  const d = r.diasHasta ?? 0
  return d <= 0 ? 'hoy' : d <= 6 ? 'semana' : 'adelante'
}

export function agruparRepasos<T extends { diasHasta?: number }>(lista: ReadonlyArray<T>): Record<GrupoRepaso, T[]> {
  const g: Record<GrupoRepaso, T[]> = { hoy: [], semana: [], adelante: [] }
  // Dentro de cada grupo, lo que toca antes va primero (lo que ya tocaba hace más, más arriba).
  for (const r of [...lista].sort((a, b) => (a.diasHasta ?? 0) - (b.diasHasta ?? 0))) g[grupoDe(r)].push(r)
  return g
}

/** Las casillas: cada repaso bien hecho suma una, hasta cuatro. */
export const CASILLAS = 4
export function firmeza(repeticiones: number | undefined): number {
  return Math.max(0, Math.min(CASILLAS, repeticiones ?? 0))
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const diaDeLaSemana = (dia: string) => DIAS[new Date(`${dia}T12:00:00Z`).getUTCDay()]

/** Cuándo toca, en palabras y sin alarma: «Vence hoy», «Tocaba el lunes», «Mañana», «El jueves», «En 12 días». */
export function cuandoToca(diasHasta: number | undefined, diaRepaso?: string): string {
  const d = diasHasta ?? 0
  if (d === 0) return 'Vence hoy'
  if (d < 0) return diaRepaso && d >= -6 ? `Tocaba el ${diaDeLaSemana(diaRepaso)}` : `Tocaba hace ${-d} ${d === -1 ? 'día' : 'días'}`
  if (d === 1) return 'Mañana'
  if (d <= 6 && diaRepaso) return `El ${diaDeLaSemana(diaRepaso)}`
  return `En ${d} días`
}

/** «Variables · Leer datos · 2 más» para un grupo recogido. */
export function resumenNombres(nombres: ReadonlyArray<string>, max = 2): string {
  const vistos = nombres.slice(0, max)
  const resto = nombres.length - vistos.length
  return resto > 0 ? `${vistos.join(' · ')} · ${resto} más` : vistos.join(' · ')
}

/** «unos 15 minutos» (5 por repaso, como calcula el store). */
export function minutosDe(lista: ReadonlyArray<{ estimatedTimeMin: number }>): string {
  const min = lista.reduce((s, r) => s + (r.estimatedTimeMin || 0), 0)
  return min < 60 ? `unos ${min} minutos` : `algo más de ${Math.floor(min / 60)} ${min >= 120 ? 'horas' : 'hora'}`
}

/** El título y lo que dice la mascota en la portada. Nada inventado: solo lo que hay en la agenda de repasos. */
export function portadaRepasos(g: Record<GrupoRepaso, ReadonlyArray<{ estimatedTimeMin: number }>>): { titulo: string; frase: string; destacado: string | null } {
  const semana = g.hoy.length + g.semana.length
  const titulo = semana
    ? `${semana} ${semana === 1 ? 'tema vuelve' : 'temas vuelven'} esta semana`
    : g.adelante.length ? 'Esta semana no vuelve ningún tema' : 'Todavía no tienes repasos'
  if (g.hoy.length) {
    const n = g.hoy.length
    return { titulo, destacado: n === 1 ? 'el que estás por olvidar' : `los ${n} que estás por olvidar`, frase: `: ${minutosDe(g.hoy)}.` }
  }
  if (g.semana.length) return { titulo, destacado: null, frase: 'Hoy no te toca ninguno. Si quieres adelantar, elige uno de la semana.' }
  if (g.adelante.length) return { titulo, destacado: null, frase: 'Lo que practicaste ya quedó firme por ahora: volverá cuando toque.' }
  return { titulo, destacado: null, frase: 'Cuando practiques una lección, sus temas volverán aquí justo antes de que empieces a olvidarlos.' }
}

/** Los temas en que «Repasar los N seguidos» lleva al siguiente; el estudiante sale cuando quiera. */
export const CLAVE_COLA = 'stire-cola-repasos'

/** En la cola [3, 8, 5], estando en la lección 8: es la 2 de 3 y la siguiente es la 5. */
export function enLaCola(cola: ReadonlyArray<number>, actual: number): { posicion: number; total: number; siguiente: number | null } | null {
  const i = cola.indexOf(actual)
  if (i < 0) return null
  return { posicion: i + 1, total: cola.length, siguiente: cola[i + 1] ?? null }
}
