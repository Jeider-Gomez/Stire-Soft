// Las vistas del ejercicio de programar (31/10/2026, Jeider: «se desplegó y no pude quitarla… quisiera tener diferentes vistas para
// más comodidad»). Una vista es una combinación de dos cosas que ya se podían plegar: el enunciado (panel izquierdo) y la salida
// (bajo el editor). Tres vistas, para que quien programa no tenga que acomodar cada panel por separado.

export type IdVista = 'estandar' | 'codigo' | 'solo'

export interface Vista {
  id: IdVista
  nombre: string
  ayuda: string
  /** ¿Se pliega el enunciado (panel izquierdo)? */
  panelPlegado: boolean
  /** ¿Se pliega la salida (bajo el editor)? */
  salidaPlegada: boolean
}

export const VISTAS_DEL_EJERCICIO: ReadonlyArray<Vista> = [
  { id: 'estandar', nombre: 'Estándar', ayuda: 'Enunciado a la izquierda, código y salida a la derecha', panelPlegado: false, salidaPlegada: false },
  { id: 'codigo', nombre: 'Código grande', ayuda: 'Esconde el enunciado y deja el código con la salida', panelPlegado: true, salidaPlegada: false },
  { id: 'solo', nombre: 'Solo código', ayuda: 'Solo el editor, con todo el espacio', panelPlegado: true, salidaPlegada: true },
]

/** La vista que corresponde a lo que está plegado; null si es una combinación propia (por ejemplo, enunciado a la vista y salida oculta). */
export function vistaActual(panelPlegado: boolean, salidaPlegada: boolean): IdVista | null {
  return VISTAS_DEL_EJERCICIO.find((v) => v.panelPlegado === panelPlegado && v.salidaPlegada === salidaPlegada)?.id ?? null
}

export function plegadosDe(id: IdVista): { panelPlegado: boolean; salidaPlegada: boolean } {
  const v = VISTAS_DEL_EJERCICIO.find((x) => x.id === id) ?? VISTAS_DEL_EJERCICIO[0]
  return { panelPlegado: v.panelPlegado, salidaPlegada: v.salidaPlegada }
}
