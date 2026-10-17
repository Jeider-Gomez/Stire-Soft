// El plan del curso en la barra lateral y las lecciones sin empezar de «Mi progreso» (MOD-01, revisión de Jeider 17/10:
// los nombres se cortaban, varios módulos abiertos empujaban el menú hacia abajo y «Mi progreso» solo mostraba lo tocado).
// Como el temario de Coursera o Udemy: un módulo abierto a la vez, el de la lección donde está el estudiante.

export interface LeccionPlan { id: number; title: string; status: string; empezada?: boolean }
export interface ModuloPlan { id: number; title: string; units: LeccionPlan[] }

/** El módulo que se abre solo: el de la lección abierta; si no hay, el primero con algo sin dominar; si no, el primero. */
export function moduloInicial(modulos: ModuloPlan[], leccionActual: number | null): number | null {
  if (leccionActual !== null) {
    const conLeccion = modulos.find((m) => m.units.some((u) => u.id === leccionActual))
    if (conLeccion) return conLeccion.id
  }
  return (modulos.find((m) => m.units.some((u) => u.status !== 'dominado')) ?? modulos[0])?.id ?? null
}

/** «3 de 6» lecciones dominadas del módulo. */
export function conteoModulo(m: ModuloPlan): { dominadas: number; total: number } {
  return { dominadas: m.units.filter((u) => u.status === 'dominado').length, total: m.units.length }
}

/** El id de la lección de la ruta («/estudiante/unidad/42» → 42), o null fuera de una lección. */
export function leccionDeLaRuta(ruta: string): number | null {
  const m = /^\/estudiante\/unidad\/(\d+)/.exec(ruta)
  return m ? Number(m[1]) : null
}

/** Las lecciones del curso que todavía no ha empezado, agrupadas por módulo (sin los módulos que ya empezó todas). */
export function sinEmpezarPorModulo(modulos: ModuloPlan[]): Array<{ id: number; titulo: string; lecciones: LeccionPlan[] }> {
  return modulos
    .map((m) => ({ id: m.id, titulo: m.title, lecciones: m.units.filter((u) => !u.empezada && u.status !== 'dominado') }))
    .filter((g) => g.lecciones.length > 0)
}
