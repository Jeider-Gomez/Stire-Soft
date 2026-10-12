// Moverse entre lecciones en el celular (12/10, Jeider: «en el teléfono no hay un botón para la siguiente lección y elegir
// no está tan desarrollado como en el PC»). En computador el plan del curso está en el menú lateral; en el celular, una
// barra abajo con anterior, «Lecciones» y siguiente, y una hoja con el plan entero (components/estudiante/NavegacionLeccion.vue).
// Cada módulo cerrado dice qué lo abre (José, UX-01: «cuánto dominio falta para desbloquear el siguiente módulo»).

import type { EstadoModulo } from '~/utils/bloqueoModulos'
import type { UnitStatus } from '~/types'

interface UnidadPlan { id: number; title: string; status: UnitStatus; masteryPercentage: number }
interface ModuloPlan { id: number; title: string; units: ReadonlyArray<UnidadPlan> }

export interface LeccionNav { id: number; titulo: string; dominio: number; estado: UnitStatus; actual: boolean }
export interface ModuloNav {
  id: number
  titulo: string
  abierto: boolean
  /** Qué lo abre, en palabras, si está cerrado. */
  requiere: string | null
  lecciones: LeccionNav[]
}
export interface NavegacionLeccion {
  anterior: { id: number; titulo: string } | null
  siguiente: { id: number; titulo: string; abierta: boolean } | null
  /** «Lección 3 de 5» dentro de su módulo. */
  posicion: { n: number; total: number; modulo: string } | null
  modulos: ModuloNav[]
}

export function textoRequisito(r: EstadoModulo['requiere']): string | null {
  if (!r) return null
  return `Se abre con ${r.umbral} % de dominio en «${r.titulo}» (llevas ${r.dominio} %).`
}

export function navegacionLeccion(modulos: ReadonlyArray<ModuloPlan>, estados: ReadonlyArray<EstadoModulo>, unitId: number): NavegacionLeccion {
  const abierto = (id: number) => estados.find((e) => e.id === id)?.abierto !== false
  const plan = modulos.flatMap((m) => m.units.map((u) => ({ id: u.id, titulo: u.title, moduloId: m.id })))
  const i = plan.findIndex((l) => l.id === unitId)
  const mod = modulos.find((m) => m.units.some((u) => u.id === unitId))
  return {
    anterior: i > 0 ? { id: plan[i - 1].id, titulo: plan[i - 1].titulo } : null,
    siguiente: i >= 0 && i < plan.length - 1 ? { id: plan[i + 1].id, titulo: plan[i + 1].titulo, abierta: abierto(plan[i + 1].moduloId) } : null,
    posicion: mod ? { n: mod.units.findIndex((u) => u.id === unitId) + 1, total: mod.units.length, modulo: mod.title } : null,
    modulos: modulos.map((m) => ({
      id: m.id,
      titulo: m.title,
      abierto: abierto(m.id),
      requiere: textoRequisito(estados.find((e) => e.id === m.id)?.requiere ?? null),
      lecciones: m.units.map((u) => ({ id: u.id, titulo: u.title, dominio: u.masteryPercentage, estado: u.status, actual: u.id === unitId })),
    })),
  }
}
