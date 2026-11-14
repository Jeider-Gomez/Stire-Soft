// Mi progreso v3 (Fase D, paso 4; cuadros «E-Progreso», «E-Progreso-Reflexion», «E-Progreso-Oscuro» y «E-Cel-Progreso»).
// Cómo va, qué ya domina y cómo estudia; nada se compara con los compañeros. Todo sale del plan del curso que ya carga el
// store (estado y dominio de cada lección): no se inventa ningún número.

export type EstadoTarjeta = 'terminada' | 'empezada' | 'sin-empezar'

interface Leccion { id: number; title: string; status: string; empezada?: boolean; masteryPercentage: number }
interface Tema { id: number; title: string; units: Leccion[] }
interface Modulo { id: number; title: string; units: Leccion[]; topics: Tema[] }

/** «Terminada» es dominada (85 % o más); «empezada», trabajada sin dominar; el resto, sin empezar. */
export function estadoTarjeta(l: Leccion): EstadoTarjeta {
  if (l.status === 'dominado') return 'terminada'
  return l.empezada ? 'empezada' : 'sin-empezar'
}

export function resumenCurso(modulos: ReadonlyArray<Modulo>) {
  const lecciones = modulos.flatMap((m) => m.units)
  const cuenta = { terminada: 0, empezada: 0, 'sin-empezar': 0 } as Record<EstadoTarjeta, number>
  for (const l of lecciones) cuenta[estadoTarjeta(l)]++
  const total = lecciones.length
  return { total, terminadas: cuenta.terminada, empezadas: cuenta.empezada, sinEmpezar: cuenta['sin-empezar'], porcentaje: total ? Math.round((cuenta.terminada / total) * 100) : 0 }
}

/** El módulo en que va: el primero con algo empezado sin terminar; si no, el primero con algo sin empezar; si no, el último. */
export function moduloActual<M extends Modulo>(modulos: ReadonlyArray<M>): M | null {
  return modulos.find((m) => m.units.some((l) => estadoTarjeta(l) === 'empezada'))
    ?? modulos.find((m) => m.units.some((l) => estadoTarjeta(l) === 'sin-empezar'))
    ?? modulos[modulos.length - 1] ?? null
}

/**
 * La portada: lo último que ya domina y con qué sigue. «Ya dominas» es verdad sin importar cuándo pasó (no hay fecha de
 * cuándo se dominó cada lección, así que no se dice «hoy» ni «esta semana»).
 */
export function portadaProgreso(modulos: ReadonlyArray<Modulo>): { titulo: string; sigue: string | null; sigueId: number | null } {
  const todas = modulos.flatMap((m) => m.units)
  const siguiente = todas.find((l) => estadoTarjeta(l) === 'empezada') ?? todas.find((l) => estadoTarjeta(l) === 'sin-empezar') ?? null
  const hasta = siguiente ? todas.indexOf(siguiente) : todas.length
  const dominada = [...todas.slice(0, hasta)].reverse().find((l) => estadoTarjeta(l) === 'terminada')
    ?? todas.find((l) => estadoTarjeta(l) === 'terminada')
  const titulo = !todas.length ? 'Tu curso todavía no tiene lecciones'
    : !siguiente ? '¡Terminaste todo el curso!'
      : dominada ? `¡Ya dominas «${dominada.title}»!`
        : estadoTarjeta(siguiente) === 'empezada' ? `Vas en «${siguiente.title}»` : 'Tu curso empieza aquí'
  // «Vas en X» ya nombra la lección: no se repite con «Sigue con X».
  const repetiria = !dominada && siguiente && estadoTarjeta(siguiente) === 'empezada'
  return { titulo, sigue: repetiria ? null : siguiente?.title ?? null, sigueId: siguiente?.id ?? null }
}

/** El anillo de la portada: tres arcos (terminadas, empezadas, sin empezar) sobre una circunferencia de radio `r`. */
export function arcosAnillo(c: { terminadas: number; empezadas: number; total: number }, r = 52) {
  const largo = 2 * Math.PI * r
  const t = c.total ? (c.terminadas / c.total) * largo : 0
  const e = c.total ? (c.empezadas / c.total) * largo : 0
  return { largo, terminadas: { trazo: `${t} ${largo - t}`, inicio: 0 }, empezadas: { trazo: `${e} ${largo - e}`, inicio: -t } }
}

/** «Tu reflexión de la semana» (cuadro «E-Progreso-Reflexion»): una pregunta que sale de lo que tiene pendiente. */
export function reflexionDeLaSemana(d: { repasosHoy: number; empezada: string | null }): { texto: string; destacado: string | null; pregunta: string } {
  if (d.repasosHoy) {
    return {
      destacado: `${d.repasosHoy} ${d.repasosHoy === 1 ? 'repaso pendiente' : 'repasos pendientes'}`,
      texto: '. Repasar justo cuando toca es lo que evita que olvides lo que ya aprendiste.',
      pregunta: `¿En qué momento de hoy puedes dedicarle${d.repasosHoy === 1 ? '' : 's'} ${d.repasosHoy * 5} minutos?`,
    }
  }
  if (d.empezada) {
    return { destacado: `«${d.empezada}»`, texto: ' va a mitad de camino. Nombrar lo que no entiendes es el primer paso para entenderlo.', pregunta: '¿Qué parte de esa lección te cuesta más? Puedes preguntárselo al Tutor.' }
  }
  return { destacado: null, texto: 'Estás al día. Pensar en lo que aprendiste ayuda a que se quede.', pregunta: '¿Qué fue lo más difícil de esta semana y cómo lo resolviste?' }
}
