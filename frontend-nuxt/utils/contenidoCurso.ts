/**
 * «Contenido del curso» de la lección (v3, Fase D, paso 2; cuadros «E-Leccion» y «E-Leccion-Cerrado» del lienzo): el
 * índice del curso al lado de la lección, para estudiar sin el menú. El módulo en el que está va arriba con su avance;
 * sus temas y lecciones con el nombre completo y su estado; los demás módulos, plegados.
 */
import type { EstadoModulo } from '~/utils/bloqueoModulos'
import type { UnitStatus } from '~/types'

interface UnidadCurso { id: number; title: string; status: UnitStatus; masteryPercentage: number; empezada?: boolean }
interface TemaCurso { id: number; title: string; units: ReadonlyArray<UnidadCurso> }
interface ModuloCurso { id: number; title: string; units: ReadonlyArray<UnidadCurso>; topics: ReadonlyArray<TemaCurso> }

/** hecho: dominada · aqui: la que está abierta · sigue: la que toca después · empezada · pendiente. */
export type EstadoEnContenido = 'hecho' | 'aqui' | 'sigue' | 'empezada' | 'pendiente'
export interface LeccionContenido { id: number; titulo: string; estado: EstadoEnContenido; dominio: number }
export interface TemaContenido { id: number; titulo: string; lecciones: LeccionContenido[] }
export interface ModuloContenido {
  id: number
  titulo: string
  dominadas: number
  total: number
  /** Dominio promedio del módulo (0–100). */
  dominio: number
  abierto: boolean
  /** Si está cerrado, qué lo abre, en palabras. */
  requiere: string | null
  temas: TemaContenido[]
}

/** Lo que el estudiante lee en el estado de cada lección (para lectores de pantalla, con el ícono). */
export const TEXTO_ESTADO: Record<EstadoEnContenido, string> = {
  hecho: 'dominada',
  aqui: 'estás aquí',
  sigue: 'sigue después',
  empezada: 'empezada',
  pendiente: 'sin empezar',
}

/** «Módulo 1: Fundamentos» o «Unidad 1 · Introducción» → «Módulo 1 · Fundamentos», «Unidad 1 · Introducción». */
export function tituloModulo(titulo: string): string {
  return titulo.replace(/\s*[:–]\s*|\s-\s/, ' · ')
}

/**
 * Los módulos con sus temas y lecciones. «Sigue» es la primera lección sin dominar después de la abierta (en el orden
 * del curso), para que el estudiante sepa a dónde va sin buscar.
 */
export function contenidoDelCurso(modulos: ReadonlyArray<ModuloCurso>, estados: ReadonlyArray<EstadoModulo>, unitId: number): ModuloContenido[] {
  const orden = modulos.flatMap((m) => m.topics.flatMap((t) => t.units))
  const i = orden.findIndex((u) => u.id === unitId)
  const sigue = i >= 0 ? orden.slice(i + 1).find((u) => u.status !== 'dominado')?.id ?? null : null

  return modulos.map((m) => {
    const estado = estados.find((e) => e.id === m.id)
    const unidades = m.topics.flatMap((t) => t.units)
    const total = unidades.length
    const r = estado?.requiere
    return {
      id: m.id,
      titulo: tituloModulo(m.title),
      dominadas: unidades.filter((u) => u.status === 'dominado').length,
      total,
      dominio: estado?.dominio ?? (total ? Math.round(unidades.reduce((s, u) => s + u.masteryPercentage, 0) / total) : 0),
      abierto: estado?.abierto ?? true,
      requiere: r ? `Se abre con ${r.umbral} % de dominio en «${tituloModulo(r.titulo)}». Vas en ${r.dominio} %.` : null,
      temas: m.topics.filter((t) => t.units.length).map((t) => ({
        id: t.id,
        titulo: t.title,
        lecciones: t.units.map((u) => ({
          id: u.id,
          titulo: u.title,
          dominio: u.masteryPercentage,
          estado: u.id === unitId ? 'aqui' : u.status === 'dominado' ? 'hecho' : u.id === sigue ? 'sigue' : u.empezada || u.status === 'en-progreso' ? 'empezada' : 'pendiente',
        })),
      })),
    }
  })
}

/** Los filtros de «Aprender» (cuadro «E-Aprender»): todas, las que faltan por dominar o las que toca repasar. */
export type FiltroAprender = 'todas' | 'faltan' | 'repasar'
