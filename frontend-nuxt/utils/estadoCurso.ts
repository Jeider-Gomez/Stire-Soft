/**
 * El estado de cada lección y del curso entero, para Contenido del curso como en el prototipo del panel v2: un punto de
 * color en el árbol (verde lista, naranja le falta algo, gris oculta) y un mapa con «Para completar». Usa lo que trae la
 * estructura de la clase (GET /sections/class/:id, con los conteos de explicaciones). Sin importaciones para probarlo solo.
 */

export type EstadoLeccion = 'lista' | 'falta' | 'oculta'

export interface LeccionConConteos {
  id: number
  title: string
  order?: number | null
  isActive?: boolean
  explicaciones?: number
  explicacionesVisibles?: number
  activities?: Array<{ status?: string | null }>
}
export interface TemaConConteos { id: number; title: string; order?: number | null; isActive?: boolean; learningUnits?: LeccionConConteos[] }
export interface ModuloConConteos { id: number; title: string; order?: number | null; isPublished?: boolean; isActive?: boolean; topics?: TemaConConteos[] }

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

export interface PendienteCurso { id: number; titulo: string; modulo: string; falta: string; pestana: 'leccion' | 'actividades' | 'ajustes' }
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
          r.paraCompletar.push({ id: l.id, titulo: l.title, modulo: m.title, falta: `Falta: ${faltasDeLeccion(l).join(' y ')}`, pestana: pestanaParaCompletar(l) })
        } else listas++
      }
    }
    r.porModulo.push({ id: m.id, titulo: m.title, publicado: m.isPublished !== false, lecciones, listas })
  }
  return r
}

/** Dónde está una lección: «Módulo › Tema», para la ruta del editor. */
export function rutaDeLeccion<L extends LeccionConConteos>(
  modulos: ReadonlyArray<{ id: number; title: string; topics?: ReadonlyArray<{ id: number; title: string; learningUnits?: ReadonlyArray<L> }> }>,
  id: number,
): { modulo: string; tema: string; moduloId: number; temaId: number; leccion: L } | null {
  for (const m of modulos) for (const t of m.topics ?? []) {
    const l = (t.learningUnits ?? []).find((x) => x.id === id)
    if (l) return { modulo: m.title, tema: t.title, moduloId: m.id, temaId: t.id, leccion: l }
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

/** Los tres grupos de la pestaña «Actividades» (prototipo del panel v2), según el tipo de actividad del catálogo. */
export const GRUPOS_ACTIVIDAD = [
  { id: 'practica', titulo: 'Práctica', ayuda: 'Se corrige sola y cuenta para el dominio.' },
  { id: 'taller', titulo: 'Talleres', ayuda: 'Código más largo, con pruebas; pesa más que la práctica.' },
  { id: 'evaluacion', titulo: 'Evaluación', ayuda: 'Parciales y quices; pesan más en el dominio.' },
] as const
export type GrupoActividad = (typeof GRUPOS_ACTIVIDAD)[number]['id']

/** A qué grupo va una actividad: por el código de su tipo (AUTO-EVAL, TALLER, PARCIAL) o, si no llega, por el nombre. */
export function grupoDeActividad(tipo?: { code?: string | null; name?: string | null } | null): GrupoActividad {
  const c = (tipo?.code ?? '').toUpperCase()
  const n = (tipo?.name ?? '').toLowerCase()
  if (c === 'PARCIAL' || /parcial|evaluaci|quiz/.test(n)) return 'evaluacion'
  if (c === 'TALLER' || /taller/.test(n)) return 'taller'
  return 'practica'
}

/** Las actividades por grupo, en el orden de GRUPOS_ACTIVIDAD; los grupos vacíos no aparecen. */
export function agruparActividades<A extends { activityType?: { code?: string | null; name?: string | null } | null }>(
  actividades: ReadonlyArray<A>,
): Array<(typeof GRUPOS_ACTIVIDAD)[number] & { actividades: A[] }> {
  return GRUPOS_ACTIVIDAD.map((g) => ({ ...g, actividades: actividades.filter((a) => grupoDeActividad(a.activityType) === g.id) }))
    .filter((g) => g.actividades.length > 0)
}

/** Las pestañas de una lección abierta; viajan en la dirección (?pestana=) para que otros paneles lleven a la justa. */
export const PESTANAS_LECCION = ['leccion', 'actividades', 'ajustes'] as const
export type PestanaLeccion = (typeof PESTANAS_LECCION)[number]
export const esPestana = (p: unknown): p is PestanaLeccion => typeof p === 'string' && (PESTANAS_LECCION as readonly string[]).includes(p)

/** A qué pestaña llevar una lección a la que le falta algo: a la explicación si falta, si no a la práctica. */
export function pestanaParaCompletar(l: LeccionConConteos): PestanaLeccion {
  const f = faltasDeLeccion(l)
  return f.some((x) => x.includes('explicación')) ? 'leccion' : f.length ? 'actividades' : 'leccion'
}

/**
 * Mueve un elemento de `desde` a `hasta` entre hermanos y numera el orden de nuevo (1, 2, 3…). Devuelve la lista nueva y
 * solo los que cambiaron de número, que son los que hay que guardar.
 */
export function moverEnLista<T extends { id: number; order?: number | null }>(lista: ReadonlyArray<T>, desde: number, hasta: number): { lista: T[]; cambios: Array<{ id: number; order: number }> } {
  const n = lista.length
  if (desde < 0 || desde >= n || hasta < 0 || hasta >= n || desde === hasta) return { lista: [...lista], cambios: [] }
  const copia = [...lista]
  const [x] = copia.splice(desde, 1)
  copia.splice(hasta, 0, x)
  const cambios: Array<{ id: number; order: number }> = []
  copia.forEach((e, i) => {
    if (e.order !== i + 1) cambios.push({ id: e.id, order: i + 1 })
    e.order = i + 1
  })
  return { lista: copia, cambios }
}

/** El enlace a una lección desde cualquier panel: `/docente/contenidos?classId=7&unitId=12&pestana=actividades`. */
export function enlaceALeccion(classId: number, unitId: number, pestana?: PestanaLeccion): string {
  return `/docente/contenidos?classId=${classId}&unitId=${unitId}${pestana && pestana !== 'leccion' ? `&pestana=${pestana}` : ''}`
}
