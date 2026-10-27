/**
 * La Biblioteca del docente (prototipo del panel v2): los cursos que otros docentes compartieron, para revisarlos por
 * dentro y copiarlos a una clase nueva. Se copian, nunca se enlazan. Sin importaciones para probarlo solo.
 */

export interface PlantillaBiblioteca {
  classId: number
  nombre: string
  docente: string
  enfoque: string | null
  asignatura: { id: number; nombre: string } | null
  modulos: number
  lecciones: number
  ejercicios: number
  vecesCopiada: number
  valoracion: { utiles: number; total: number } | null
  actualizada: string
  cercania: number
}

export type OrdenBiblioteca = 'cercania' | 'copiadas' | 'utiles' | 'recientes'

export const ORDENES_BIBLIOTECA: Array<{ valor: OrdenBiblioteca; texto: string }> = [
  { valor: 'cercania', texto: 'Más cercanas a tus clases' },
  { valor: 'copiadas', texto: 'Más copiadas' },
  { valor: 'utiles', texto: 'Más útiles para los estudiantes' },
  { valor: 'recientes', texto: 'Actualizadas hace poco' },
]

/** Sin acentos ni mayúsculas: «algoritmia» encuentra «Algoritmía». */
export function normalizarBusqueda(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

/** Porcentaje de estudiantes a los que les sirvió; null con menos de 5 votos (con menos, un porcentaje engaña). */
export function utilidadPlantilla(p: PlantillaBiblioteca): number | null {
  if (!p.valoracion || p.valoracion.total < 5) return null
  return Math.round((100 * p.valoracion.utiles) / p.valoracion.total)
}

/** Busca por tema, enfoque, asignatura o docente; filtra por asignatura y ordena. */
export function filtrarBiblioteca<T extends PlantillaBiblioteca>(
  lista: ReadonlyArray<T>,
  opciones: { texto?: string; asignaturaId?: number | null; orden?: OrdenBiblioteca },
): T[] {
  const q = normalizarBusqueda(opciones.texto ?? '')
  const filtradas = lista.filter((p) => {
    if (opciones.asignaturaId && p.asignatura?.id !== opciones.asignaturaId) return false
    if (!q) return true
    return normalizarBusqueda([p.nombre, p.enfoque ?? '', p.docente, p.asignatura?.nombre ?? ''].join(' ')).includes(q)
  })
  const orden = opciones.orden ?? 'cercania'
  const clave: Record<OrdenBiblioteca, (p: PlantillaBiblioteca) => number> = {
    cercania: (p) => p.cercania,
    copiadas: (p) => -p.vecesCopiada,
    utiles: (p) => -(utilidadPlantilla(p) ?? -1),
    recientes: (p) => -new Date(p.actualizada).getTime(),
  }
  // Estable: a igual clave, se mantiene el orden del servidor.
  return filtradas.map((p, i) => ({ p, i })).sort((a, b) => clave[orden](a.p) - clave[orden](b.p) || a.i - b.i).map((x) => x.p)
}

/** Las asignaturas que aparecen en la biblioteca, para el filtro, sin repetir y en orden alfabético. */
export function asignaturasDeLaBiblioteca(lista: ReadonlyArray<PlantillaBiblioteca>): Array<{ id: number; nombre: string }> {
  const vistas = new Map<number, string>()
  for (const p of lista) if (p.asignatura) vistas.set(p.asignatura.id, p.asignatura.nombre)
  return [...vistas].map(([id, nombre]) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

/** A dónde lleva «Usar en una clase nueva»: el inicio con la ventana de crear abierta y la plantilla ya elegida. */
export function enlaceUsarPlantilla(classId: number): string {
  return `/docente?crear=1&plantilla=${classId}`
}
