/**
 * «Tu semana · sin rachas» del inicio del estudiante (v3, cuadro «E-Inicio»). Los siete días de lunes a domingo y cuántos
 * estudió; la meta es la del logro de Constancia: 3 días distintos en la semana, no seguidos (src/analytics/logros.ts).
 * Nunca castiga un día sin estudiar: no hay racha que perder.
 */
export const DIAS_PARA_CONSTANCIA = 3

const LETRAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const NOMBRES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
const formatoColombia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' })

export type EstadoDia = 'hecho' | 'hoy' | 'falta' | 'paso'
export interface DiaDeLaSemana { letra: string; nombre: string; fecha: string; estado: EstadoDia }

/** Los 7 días de esta semana (en Colombia), con lo que pasó en cada uno. `estudiados` viene del servidor («2026-11-09»). */
export function diasDeEstaSemana(estudiados: ReadonlyArray<string>, ahora: Date = new Date()): DiaDeLaSemana[] {
  const hoy = formatoColombia.format(ahora)
  const base = new Date(`${hoy}T12:00:00Z`)
  base.setUTCDate(base.getUTCDate() - ((base.getUTCDay() + 6) % 7))
  const hechos = new Set(estudiados)
  return LETRAS.map((letra, i) => {
    const d = new Date(base)
    d.setUTCDate(base.getUTCDate() + i)
    const fecha = d.toISOString().slice(0, 10)
    const estado: EstadoDia = hechos.has(fecha) ? 'hecho' : fecha === hoy ? 'hoy' : fecha < hoy ? 'paso' : 'falta'
    return { letra, nombre: NOMBRES[i]!, fecha, estado }
  })
}

/** La frase de la tarjeta, sin culpa: cuántos días van y cuántos faltan para la Constancia de esta semana. */
export function textoDeLaSemana(dias: ReadonlyArray<DiaDeLaSemana>): { estudiados: number; falta: number; texto: string } {
  const estudiados = dias.filter((d) => d.estado === 'hecho').length
  const falta = Math.max(0, DIAS_PARA_CONSTANCIA - estudiados)
  const quedan = dias.filter((d) => d.estado === 'hoy' || d.estado === 'falta').length
  let texto: string
  if (falta === 0) texto = 'Esta semana ya cuenta para tu logro de Constancia.'
  else if (falta > quedan) texto = 'Cualquier día cuenta: la semana que viene empieza de nuevo.'
  else texto = `Con ${falta} ${falta === 1 ? 'día más' : 'días más'} esta semana cuenta para tu logro de Constancia.`
  return { estudiados, falta, texto }
}

/** Para lectores de pantalla: «Esta semana estudiaste 2 días: lunes y miércoles». */
export function resumenDeLaSemana(dias: ReadonlyArray<DiaDeLaSemana>): string {
  const hechos = dias.filter((d) => d.estado === 'hecho').map((d) => d.nombre)
  if (!hechos.length) return 'Esta semana todavía no has estudiado.'
  const lista = hechos.length === 1 ? hechos[0] : `${hechos.slice(0, -1).join(', ')} y ${hechos[hechos.length - 1]}`
  return `Esta semana estudiaste ${hechos.length} ${hechos.length === 1 ? 'día' : 'días'}: ${lista}.`
}
