// Qué muestra el panel «Salida» bajo el editor (31/10/2026, P48). Jeider, en «Saludo personalizado»: pulsaba «Probar código» y no
// sabía dónde se veía el resultado; lo descubrió al final. freeCodeCamp deja un panel de consola a la vista que, antes de ejecutar
// nada, dice «Your test output will go here» (docs/investigacion/referentes/ENSENANZA_DE_PROGRAMACION.md). Aquí el panel dice lo mismo,
// y además que probar no gasta intentos y entregar sí: lo que más se preguntaba.

export interface CasoDeSalida {
  id: number
  input: string
  expectedOutput: string
  actualOutput?: string
  passed?: boolean
}

export type EstadoSalida = 'sin-probar' | 'ejecutando' | 'coincide' | 'no-coincide'

export interface ResumenSalida {
  estado: EstadoSalida
  /** El caso que se muestra: el primero que no coincide; si todos coinciden, el primero. */
  caso: CasoDeSalida | null
  coinciden: number
  total: number
}

export function resumenDeSalida(casos: ReadonlyArray<CasoDeSalida>, ejecutando: boolean): ResumenSalida {
  const total = casos.length
  const probados = casos.filter((c) => c.passed !== undefined)
  const coinciden = casos.filter((c) => c.passed === true).length
  if (ejecutando) return { estado: 'ejecutando', caso: null, coinciden, total }
  if (probados.length === 0) return { estado: 'sin-probar', caso: null, coinciden: 0, total }
  const falla = casos.find((c) => c.passed === false)
  if (falla) return { estado: 'no-coincide', caso: falla, coinciden, total }
  return { estado: 'coincide', caso: casos[0] ?? null, coinciden, total }
}

/** Una frase corta de lo que sigue, para quien mira el panel. */
export function siguientePaso(r: ResumenSalida): string {
  if (r.estado === 'sin-probar') return 'Escribe tu programa y pulsa «Probar código»: no gasta intentos, pruébalo las veces que quieras.'
  if (r.estado === 'ejecutando') return 'Ejecutando tu programa…'
  if (r.estado === 'coincide') {
    return r.total > 1
      ? `Coinciden los ${r.total} ejemplos. Ya puedes pulsar «Entregar solución»: revisa todos los casos, también los que no ves, y usa un intento.`
      : 'Coincide con el ejemplo. Ya puedes pulsar «Entregar solución»: revisa todos los casos, también los que no ves, y usa un intento.'
  }
  return 'Todavía no coincide. Compara las dos salidas, corrige y vuelve a probar: no gasta intentos.'
}
