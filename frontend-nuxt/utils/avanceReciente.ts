// Cuánto avanzaste hoy o esta semana, sin calcularlo tú (08/10, Jeider: «sé que avancé, pero tengo que calcularlo yo; no
// tengo esa memoria para recordar todo esto»). Sale del dominio que cada entrega guarda antes y después
// (migración DominioPorEntrega). Referentes: «puntos de dominio de esta semana» de Khan Academy y el «hoy» de Anki.
// Regla: si practicaste hoy, se muestra hoy (la señal más cercana a lo que hiciste); si no, la semana (lunes a domingo,
// igual que la meta de 3 días), para no poner un «0 hoy» que desanima. Los días son de Colombia, como la racha.

export interface CambioDominio {
  fecha: string
  learningUnitId: number
  titulo: string
  antes: number
  despues: number
}

export interface LeccionQueCambio { learningUnitId: number; titulo: string; puntos: number }
export interface ResumenPeriodo { puntos: number; entregas: number; lecciones: LeccionQueCambio[] }
export interface AvanceReciente { periodo: 'hoy' | 'semana'; resumen: ResumenPeriodo }

const ZONA = 'America/Bogota'

/** AAAA-MM-DD en hora de Colombia. */
export function diaColombia(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

/** El lunes (AAAA-MM-DD) de la semana de un día. */
export function lunesDe(dia: string): string {
  const d = new Date(`${dia}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}

function resumir(cambios: CambioDominio[]): ResumenPeriodo | null {
  if (!cambios.length) return null
  const porLeccion = new Map<number, LeccionQueCambio>()
  for (const c of cambios) {
    const l = porLeccion.get(c.learningUnitId) ?? { learningUnitId: c.learningUnitId, titulo: c.titulo, puntos: 0 }
    l.puntos += Math.round(c.despues - c.antes)
    porLeccion.set(c.learningUnitId, l)
  }
  const lecciones = [...porLeccion.values()].filter((l) => l.puntos !== 0).sort((a, b) => b.puntos - a.puntos)
  return { puntos: lecciones.reduce((s, l) => s + l.puntos, 0), entregas: cambios.length, lecciones }
}

/**
 * Hoy si practicó hoy; si no, esta semana; null si esta semana no ha entregado nada. `unidades` deja solo las lecciones
 * de la clase que está viendo (el servidor manda las de todas sus clases).
 */
export function avanceReciente(cambios: CambioDominio[], ahora: Date, unidades?: ReadonlySet<number>): AvanceReciente | null {
  const hoy = diaColombia(ahora)
  const lunes = lunesDe(hoy)
  const deLaClase = unidades ? cambios.filter((c) => unidades.has(c.learningUnitId)) : cambios
  const conDia = deLaClase.map((c) => ({ c, dia: diaColombia(new Date(c.fecha)) }))
  const deHoy = resumir(conDia.filter((x) => x.dia === hoy).map((x) => x.c))
  if (deHoy) return { periodo: 'hoy', resumen: deHoy }
  const deLaSemana = resumir(conDia.filter((x) => x.dia >= lunes && x.dia <= hoy).map((x) => x.c))
  return deLaSemana ? { periodo: 'semana', resumen: deLaSemana } : null
}

/** La frase principal: «+25 puntos de dominio hoy», «Hoy tu dominio se mantuvo»… */
export function textoAvance(a: AvanceReciente | null): { titulo: string; detalle: string; tono: 'sube' | 'baja' | 'igual' | 'nada' } {
  if (!a) return { titulo: 'Esta semana aún no practicas', detalle: 'Haz un ejercicio y aquí ves cuánto subes.', tono: 'nada' }
  const cuando = a.periodo === 'hoy' ? 'hoy' : 'esta semana'
  const { puntos, lecciones, entregas } = a.resumen
  const enCuantas = lecciones.length === 1 ? 'en 1 lección' : `en ${lecciones.length} lecciones`
  if (puntos > 0) return { titulo: `+${puntos} puntos de dominio ${cuando}`, detalle: `Subiste ${enCuantas}.`, tono: 'sube' }
  if (puntos < 0) return { titulo: `${puntos} puntos de dominio ${cuando}`, detalle: 'Un repaso no salió: vuelve a la lección y lo recuperas.', tono: 'baja' }
  return { titulo: `${cuando === 'hoy' ? 'Hoy' : 'Esta semana'} tu dominio se mantuvo`, detalle: `${entregas === 1 ? '1 entrega' : `${entregas} entregas`}: practicar lo que ya dominas lo afianza.`, tono: 'igual' }
}
