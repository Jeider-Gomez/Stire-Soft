// Contenidos del curso del docente (pages/docente/contenidos.vue): tipos y reglas puras. La página organiza, el composable
// (composables/useContenidosCurso.ts) habla con la API y estas funciones cambian el árbol en memoria sin recargarlo.

export interface ClaseDocente { id: number; code: string; name: string; asignaturaId?: number | null }

export interface LeccionDelArbol {
  id: number
  title: string
  description?: string
  difficulty: string
  order: number
  isActive?: boolean
}

export interface TemaDelArbol {
  id: number
  title: string
  description?: string
  order: number
  learningUnits?: LeccionDelArbol[]
}

export interface ModuloDelArbol {
  id: number
  title: string
  description?: string
  order: number
  isPublished: boolean
  topics?: TemaDelArbol[]
}

/** Una explicación de una lección (lo que el docente escribe en «Explicación»). */
export interface ExplicacionResumen { id: number; title: string; isVisible?: boolean }

export interface ResumenImportacion { sections: number; topics: number; learningUnits: number; contents: number; activities: number; questions: number }

/** El orden más alto entre hermanos: lo nuevo va al final. */
export function mayorOrden(items: ReadonlyArray<{ order?: number | null }> | undefined): number {
  return (items ?? []).reduce((max, x) => Math.max(max, x.order || 0), 0)
}

/** «2 explicaciones · 5 ejercicios», con lo que ya se sepa de la lección. */
export function resumenDeLeccion(explicaciones: number | undefined, ejercicios: number | undefined): string {
  const partes: string[] = []
  if (explicaciones !== undefined) partes.push(`${explicaciones} ${explicaciones === 1 ? 'explicación' : 'explicaciones'}`)
  if (ejercicios !== undefined) partes.push(`${ejercicios} ${ejercicios === 1 ? 'ejercicio' : 'ejercicios'}`)
  return partes.join(' · ')
}

export interface DatosTema { title: string; description: string; order: number }
export interface DatosLeccion { title: string; description: string; difficulty: string; order: number }

/** Aplica la edición de un tema al árbol; devuelve si lo encontró. */
export function aplicarTema(arbol: ModuloDelArbol[], temaId: number, d: DatosTema): boolean {
  for (const m of arbol) {
    const t = m.topics?.find((x) => x.id === temaId)
    if (t) {
      Object.assign(t, { title: d.title.trim(), description: d.description.trim(), order: d.order })
      return true
    }
  }
  return false
}

/** Quita un tema archivado del árbol; devuelve si lo encontró. */
export function quitarTema(arbol: ModuloDelArbol[], temaId: number): boolean {
  for (const m of arbol) {
    const i = m.topics?.findIndex((x) => x.id === temaId) ?? -1
    if (i >= 0) {
      m.topics!.splice(i, 1)
      return true
    }
  }
  return false
}

/** Aplica la edición de una lección al árbol; devuelve si la encontró. */
export function aplicarLeccion(arbol: ModuloDelArbol[], leccionId: number, d: DatosLeccion): boolean {
  for (const m of arbol) {
    for (const t of m.topics ?? []) {
      const u = t.learningUnits?.find((x) => x.id === leccionId)
      if (u) {
        Object.assign(u, { title: d.title.trim(), description: d.description.trim(), difficulty: d.difficulty, order: d.order })
        return true
      }
    }
  }
  return false
}

/** Lo que se trajo de otra clase, en una frase. */
export function textoImportacion(r: Pick<ResumenImportacion, 'sections' | 'learningUnits' | 'activities'>): string {
  const p = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`
  return `Se trajeron ${p(r.sections, 'módulo', 'módulos')}, ${p(r.learningUnits, 'lección', 'lecciones')} y ${p(r.activities, 'ejercicio', 'ejercicios')}. Revísalos y publícalos cuando quieras.`
}
