// La mesa de trabajo del ejercicio (14/11, Jeider: «un poquito más de espacio en la parte del código… mover la disposición como si
// fueran ventanas… plegar y desplegar lo de los lados… reglas por cumplir o casos por cumplir a la izquierda»). Los paneles se
// acomodan arrastrando divisores (o con las flechas del teclado), se pliegan a una franja y hay distribuciones listas.

/** Anchos (en % de su fila) de cada panel: lo que se usa la primera vez, y los límites para que nada quede inservible. */
export const MEDIDAS = {
  /** El panel de la izquierda (enunciado, casos o reglas). Antes era fijo en 40 %: el código quedaba apretado. */
  izquierda: { clave: 'stire.ejercicio.anchoIzquierda', inicial: 32, min: 20, max: 55 },
  /** La vista previa (y las reglas) de la página web, a la derecha del código. */
  previa: { clave: 'stire.ejercicio.anchoPrevia', inicial: 40, min: 22, max: 65 },
} as const

export function acotarMedida(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min
  return Math.round(Math.min(max, Math.max(min, v)) * 10) / 10
}

/**
 * El ancho que pide el puntero al arrastrar un divisor, en % de la fila. Si el panel está a la derecha del divisor
 * (`lado: 'derecha'`), crece al arrastrar hacia la izquierda.
 */
export function medidaDesdePuntero(x: number, fila: { left: number; width: number }, lado: 'izquierda' | 'derecha'): number {
  if (fila.width <= 0) return 0
  const desdeIzquierda = ((x - fila.left) / fila.width) * 100
  return lado === 'izquierda' ? desdeIzquierda : 100 - desdeIzquierda
}

/** Con el teclado (divisor enfocado): las flechas mueven de a 2 %, con Mayús de a 10 %; Inicio y Fin van a los límites. */
export function medidaConTecla(tecla: string, actual: number, m: { min: number; max: number }, lado: 'izquierda' | 'derecha', grande = false): number | null {
  const paso = grande ? 10 : 2
  const crece = lado === 'izquierda' ? 'ArrowRight' : 'ArrowLeft'
  const decrece = lado === 'izquierda' ? 'ArrowLeft' : 'ArrowRight'
  if (tecla === crece) return acotarMedida(actual + paso, m.min, m.max)
  if (tecla === decrece) return acotarMedida(actual - paso, m.min, m.max)
  if (tecla === 'Home') return m.min
  if (tecla === 'End') return m.max
  return null
}

// Distribuciones de la página web (HTML y CSS). La del ejercicio de programar sigue en utils/vistaEjercicio.ts; allí los casos ya
// están a la izquierda («Prueba de casos»), y aquí las reglas pueden ir también a la izquierda.
export type IdVistaWeb = 'clasica' | 'reglas' | 'codigo' | 'solo'

export interface VistaWeb {
  id: IdVistaWeb
  nombre: string
  ayuda: string
  /** ¿Se pliega el enunciado (izquierda)? */
  panelPlegado: boolean
  /** ¿Se pliega la vista previa (derecha)? */
  previaPlegada: boolean
  /** ¿Las reglas van a la izquierda, junto al enunciado, y la vista previa ocupa toda la derecha? */
  reglasIzquierda: boolean
}

export const VISTAS_WEB: ReadonlyArray<VistaWeb> = [
  { id: 'clasica', nombre: 'Clásica', ayuda: 'Enunciado a la izquierda; vista previa y reglas a la derecha', panelPlegado: false, previaPlegada: false, reglasIzquierda: false },
  { id: 'reglas', nombre: 'Reglas a la izquierda', ayuda: 'Enunciado y reglas a la izquierda; la vista previa ocupa toda la derecha', panelPlegado: false, previaPlegada: false, reglasIzquierda: true },
  { id: 'codigo', nombre: 'Código y vista previa', ayuda: 'Esconde el enunciado: el código y la vista previa con sus reglas', panelPlegado: true, previaPlegada: false, reglasIzquierda: false },
  { id: 'solo', nombre: 'Solo código', ayuda: 'Solo el editor, con todo el espacio', panelPlegado: true, previaPlegada: true, reglasIzquierda: false },
]

/** La distribución que corresponde a lo que está plegado; null si es una combinación propia. */
export function vistaWebActual(panelPlegado: boolean, previaPlegada: boolean, reglasIzquierda: boolean): IdVistaWeb | null {
  // «Solo código» no depende de dónde estén las reglas: no se ve ninguno de los dos lados.
  if (panelPlegado && previaPlegada) return 'solo'
  return VISTAS_WEB.find((v) => v.panelPlegado === panelPlegado && v.previaPlegada === previaPlegada && v.reglasIzquierda === reglasIzquierda)?.id ?? null
}

export function vistaWebDe(id: IdVistaWeb): VistaWeb {
  return VISTAS_WEB.find((v) => v.id === id) ?? VISTAS_WEB[0]
}
