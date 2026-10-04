// El inicio del docente cuando pasan los semestres (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md, fase 3): sin abrumar.
// - A la vista, las clases del periodo vigente y las que no tienen periodo; las de periodos anteriores, plegadas.
// - Un filtro por programa solo si enseña en más de uno (con uno solo, el filtro sobra).
// - Al buscar se busca en todo, también en lo plegado.

import { periodoActual, programaCorto, type ClaseConAsignatura } from './contextoAcademico'

export interface ClaseOrganizable extends ClaseConAsignatura {
  id: number
  name: string
  code: string
  periodo?: string | null
}

/** El periodo que se muestra de entrada: el actual si alguna clase lo tiene; si no, el más reciente que tengan. */
export function periodoVigente(clases: ReadonlyArray<ClaseOrganizable>, ahora = new Date()): string | null {
  const periodos = [...new Set(clases.map((c) => c.periodo).filter((p): p is string => !!p))].sort().reverse()
  if (!periodos.length) return null
  const actual = periodoActual(ahora)
  return periodos.includes(actual) ? actual : periodos[0]
}

/** Programas distintos de sus clases, para el filtro. Con menos de dos, no hace falta filtro. */
export function programasDeLasClases(clases: ReadonlyArray<ClaseOrganizable>): Array<{ id: number; nombre: string }> {
  const vistos = new Map<number, string>()
  for (const c of clases) {
    const p = c.asignatura?.program
    if (p && !vistos.has(p.id)) vistos.set(p.id, programaCorto(p.name))
  }
  return [...vistos.entries()].map(([id, nombre]) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

export interface FiltroClases { texto: string; programaId: number | null; verAnteriores: boolean }

/**
 * Qué clases mostrar y cuántas quedan plegadas. Orden: periodo más reciente primero (sin periodo al final de su grupo),
 * luego por nombre.
 */
export function organizarClases<T extends ClaseOrganizable>(
  clases: ReadonlyArray<T>,
  filtro: FiltroClases,
  ahora = new Date(),
): { visibles: T[]; anteriores: number; vigente: string | null } {
  const vigente = periodoVigente(clases, ahora)
  const q = filtro.texto.trim().toLowerCase()
  const delPrograma = clases.filter((c) => !filtro.programaId || c.asignatura?.program?.id === filtro.programaId)
  const coincide = delPrograma.filter((c) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || !!c.asignatura?.nombre.toLowerCase().includes(q))
  const esAnterior = (c: T) => !!vigente && !!c.periodo && c.periodo < vigente
  const visibles = q || filtro.verAnteriores ? coincide : coincide.filter((c) => !esAnterior(c))
  const orden = (c: T) => c.periodo ?? '0000'
  return {
    visibles: [...visibles].sort((a, b) => orden(b).localeCompare(orden(a)) || a.name.localeCompare(b.name, 'es')),
    anteriores: q ? 0 : coincide.filter(esAnterior).length,
    vigente,
  }
}
