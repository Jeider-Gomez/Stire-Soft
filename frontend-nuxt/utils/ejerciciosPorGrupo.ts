// «Ver todos los ejercicios» con el motor del dominio (09/10, Jeider: «tengo un ejercicio y no puedo seguir subiendo mi
// dominio»; «métele más UX y UI a eso de los ejercicios»). Antes era una lista plana con «Sube tu dominio» o «Ya cuenta
// un parecido»; ahora, por nivel y por grupo de parecidos (lo que el servidor llama casilla), cada grupo con cuánto lleva
// y cada ejercicio con CUÁNTO sube si lo resuelves. Así se ve a dónde ir para llegar al 100 %.

export interface EjercicioParaGrupo {
  id: number
  titulo: string
  nivel: string
  tipo: string | null
  estado: 'por-hacer' | 'en-curso' | 'hecho' | 'cuenta-otro' | 'sin-intentos'
  subeDominio: boolean
  ganancia?: number
  casillaPct?: number
  reabreEn?: string | null
  intentosUsados: number
  intentosPermitidos: number
}

/** La etiqueta de la derecha de cada ejercicio: qué pasa si lo haces ahora. */
export type Etiqueta =
  | { tipo: 'sube'; texto: string }
  | { tipo: 'repaso'; texto: string }
  | { tipo: 'hecho'; texto: string }
  | { tipo: 'completo'; texto: string }
  | { tipo: 'reabre'; texto: string }

export function etiquetaDe(e: EjercicioParaGrupo, reabre: (iso: string | null | undefined) => string | null): Etiqueta {
  const g = e.ganancia ?? 0
  if (e.estado === 'sin-intentos') return { tipo: 'reabre', texto: `Se reabre ${reabre(e.reabreEn) ?? 'mañana'}` }
  if (e.subeDominio && e.estado !== 'hecho') return { tipo: 'sube', texto: `+${g} %` }
  if (e.estado === 'hecho') return e.subeDominio ? { tipo: 'repaso', texto: `Repasar · +${g} %` } : { tipo: 'hecho', texto: 'Hecho' }
  return { tipo: 'completo', texto: 'Grupo completo' }
}

export interface Grupo { clave: string; tipo: string | null; casillaPct: number; ejercicios: EjercicioParaGrupo[] }
export interface Nivel { nivel: string; grupos: Grupo[] }

/** Por nivel (en el orden en que llegan, ya pedagógico), y dentro, por grupo de parecidos (mismo tipo). */
export function agruparEjercicios(ejercicios: EjercicioParaGrupo[]): Nivel[] {
  const niveles: Nivel[] = []
  for (const e of ejercicios) {
    let n = niveles.find((x) => x.nivel === e.nivel)
    if (!n) niveles.push((n = { nivel: e.nivel, grupos: [] }))
    const clave = `${e.nivel}|${e.tipo ?? `sin-tipo-${e.id}`}`
    let g = n.grupos.find((x) => x.clave === clave)
    if (!g) n.grupos.push((g = { clave, tipo: e.tipo, casillaPct: e.casillaPct ?? 0, ejercicios: [] }))
    g.ejercicios.push(e)
  }
  return niveles
}

/** El que más sube tu dominio ahora (empate: el primero en el orden pedagógico); null si ninguno suma. */
export function recomendado(ejercicios: EjercicioParaGrupo[]): EjercicioParaGrupo | null {
  return ejercicios.filter((e) => e.subeDominio).reduce<EjercicioParaGrupo | null>((m, e) => (!m || (e.ganancia ?? 0) > (m.ganancia ?? 0) ? e : m), null)
}

/** «3 ejercicios todavía suben tu dominio», o qué hacer si ninguno suma. */
export function resumenEjercicios(ejercicios: EjercicioParaGrupo[], reabre: (iso: string | null | undefined) => string | null): string {
  const suben = ejercicios.filter((e) => e.subeDominio).length
  if (suben > 0) return suben === 1 ? '1 ejercicio todavía sube tu dominio.' : `${suben} ejercicios todavía suben tu dominio.`
  const cerrados = ejercicios.filter((e) => e.estado === 'sin-intentos' && e.reabreEn).map((e) => e.reabreEn!).sort()
  if (cerrados.length) {
    const cuando = reabre(cerrados[0]) ?? 'mañana'
    return `Por ahora ninguno suma: se reabre un intento ${cuando}${cuando.endsWith('.') ? '' : '.'}`
  }
  return 'Llegaste al máximo en esta lección: lo que hagas aquí es repaso.'
}
