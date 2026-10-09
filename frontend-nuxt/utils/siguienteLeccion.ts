// La lección que sigue en el plan del curso (09/10, Jeider como estudiante: «no me dan la opción de pasar a la siguiente
// lección si lo prefiero»). Practicar más es opcional; el camino recomendado es avanzar, como «Continuar» en Khan Academy.
// Si la siguiente está en un módulo todavía cerrado (bloqueo suave, utils/bloqueoModulos.ts), se dice qué falta.

import type { EstadoModulo } from '~/utils/bloqueoModulos'

export interface SiguienteLeccion {
  id: number
  titulo: string
  /** false si su módulo todavía está cerrado por el bloqueo suave. */
  abierta: boolean
  /** Si está cerrada: el módulo que hay que trabajar, cuánto lleva y cuánto pide. */
  requiere: { titulo: string; dominio: number; umbral: number } | null
}

export function siguienteLeccion(
  modulos: ReadonlyArray<{ id: number; units: ReadonlyArray<{ id: number; title: string }> }>,
  estados: ReadonlyArray<EstadoModulo>,
  unitId: number,
): SiguienteLeccion | null {
  const plan = modulos.flatMap((m) => m.units.map((u) => ({ id: u.id, titulo: u.title, moduloId: m.id })))
  const i = plan.findIndex((l) => l.id === unitId)
  if (i < 0 || i === plan.length - 1) return null
  const sig = plan[i + 1]
  const estado = estados.find((e) => e.id === sig.moduloId)
  const requiere = estado?.requiere ?? null
  return {
    id: sig.id,
    titulo: sig.titulo,
    abierta: estado?.abierto !== false,
    requiere: requiere ? { titulo: requiere.titulo, dominio: requiere.dominio, umbral: requiere.umbral } : null,
  }
}
