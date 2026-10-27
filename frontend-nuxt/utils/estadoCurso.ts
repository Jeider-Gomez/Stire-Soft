/**
 * El estado de cada lección y del curso entero, para Contenido del curso como en el prototipo del panel v2: un punto de
 * color en el árbol (verde lista, naranja le falta algo, gris oculta) y un mapa con «Para completar». Usa lo que trae la
 * estructura de la clase (GET /sections/class/:id, con los conteos de explicaciones). Sin importaciones para probarlo solo.
 */

export type EstadoLeccion = 'lista' | 'falta' | 'oculta'

export interface LeccionConConteos {
  id: number
  title: string
  isActive?: boolean
  explicaciones?: number
  explicacionesVisibles?: number
  activities?: Array<{ status?: string | null }>
}
export interface TemaConConteos { id: number; title: string; isActive?: boolean; learningUnits?: LeccionConConteos[] }
export interface ModuloConConteos { id: number; title: string; isPublished?: boolean; isActive?: boolean; topics?: TemaConConteos[] }

/** Una actividad cuenta como práctica para el estudiante solo si está publicada. */
const publicadas = (l: LeccionConConteos) => (l.activities ?? []).filter((a) => a.status === 'published' || a.status === 'publicado').length

/** Qué le falta a una lección para estar lista: explicación visible y al menos un ejercicio publicado. */
export function faltasDeLeccion(l: LeccionConConteos): string[] {
  const faltas: string[] = []
  if (!(l.explicacionesVisibles ?? 0)) faltas.push((l.explicaciones ?? 0) > 0 ? 'publicar la explicación' : 'explicación')
  if (!publicadas(l)) faltas.push((l.activities ?? []).length > 0 ? 'publicar la práctica' : 'práctica')
  return faltas
}

export function estadoDeLeccion(l: LeccionConConteos): EstadoLeccion {
  if (l.isActive === false) return 'oculta'
  return faltasDeLeccion(l).length ? 'falta' : 'lista'
}

export const TEXTO_ESTADO: Record<EstadoLeccion, string> = { lista: 'Lista', falta: 'Le falta algo', oculta: 'Oculta' }

export interface PendienteCurso { id: number; titulo: string; modulo: string; falta: string }
export interface ResumenCurso {
  unidades: number
  actividades: number
  conPendientes: number
  ocultas: number
  paraCompletar: PendienteCurso[]
  porModulo: Array<{ id: number; titulo: string; publicado: boolean; lecciones: number; listas: number }>
}

/** Las cifras del mapa y la lista «Para completar», en el orden del curso. */
export function resumenCurso(modulos: ReadonlyArray<ModuloConConteos>): ResumenCurso {
  const r: ResumenCurso = { unidades: 0, actividades: 0, conPendientes: 0, ocultas: 0, paraCompletar: [], porModulo: [] }
  for (const m of modulos) {
    let lecciones = 0
    let listas = 0
    for (const t of m.topics ?? []) {
      for (const l of t.learningUnits ?? []) {
        lecciones++
        r.unidades++
        r.actividades += (l.activities ?? []).length
        const e = estadoDeLeccion(l)
        if (e === 'oculta') r.ocultas++
        else if (e === 'falta') {
          r.conPendientes++
          r.paraCompletar.push({ id: l.id, titulo: l.title, modulo: m.title, falta: `Falta: ${faltasDeLeccion(l).join(' y ')}` })
        } else listas++
      }
    }
    r.porModulo.push({ id: m.id, titulo: m.title, publicado: m.isPublished !== false, lecciones, listas })
  }
  return r
}

/** Dónde está una lección: «Módulo › Tema», para la ruta del editor. */
export function rutaDeLeccion<L extends LeccionConConteos>(
  modulos: ReadonlyArray<{ title: string; topics?: ReadonlyArray<{ title: string; learningUnits?: ReadonlyArray<L> }> }>,
  id: number,
): { modulo: string; tema: string; leccion: L } | null {
  for (const m of modulos) for (const t of m.topics ?? []) {
    const l = (t.learningUnits ?? []).find((x) => x.id === id)
    if (l) return { modulo: m.title, tema: t.title, leccion: l }
  }
  return null
}

/** Cuántas lecciones de un módulo o un tema están listas, les falta algo u ocultas (el panel del grupo). */
export function conteoDeLecciones(lecciones: ReadonlyArray<LeccionConConteos>): Record<EstadoLeccion, number> & { total: number } {
  const c = { total: lecciones.length, lista: 0, falta: 0, oculta: 0 }
  for (const l of lecciones) c[estadoDeLeccion(l)]++
  return c
}

const sinTildes = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/**
 * El árbol con solo lo que coincide con lo buscado (sin importar tildes ni mayúsculas): si coincide el nombre del módulo o
 * del tema se queda entero; si no, solo las lecciones que coinciden. Sin texto, el árbol tal cual.
 */
export function filtrarArbol<M extends ModuloConConteos>(modulos: ReadonlyArray<M>, texto: string): M[] {
  const q = sinTildes(texto.trim())
  if (!q) return [...modulos]
  const out: M[] = []
  for (const m of modulos) {
    if (sinTildes(m.title).includes(q)) { out.push(m); continue }
    const temas = (m.topics ?? []).flatMap((t) => {
      if (sinTildes(t.title).includes(q)) return [t]
      const ls = (t.learningUnits ?? []).filter((l) => sinTildes(l.title).includes(q))
      return ls.length ? [{ ...t, learningUnits: ls }] : []
    })
    if (temas.length) out.push({ ...m, topics: temas })
  }
  return out
}
