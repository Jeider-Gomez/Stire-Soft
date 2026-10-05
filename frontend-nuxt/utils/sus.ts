// Encuesta de usabilidad SUS (Brooke, 1996), UX-08 de la lista de interfaz. El puntaje lo calcula el servidor
// (src/usabilidad/sus.ts); aquí están los textos y lo que la pantalla necesita para mostrarlo.
// Redacción: traducción fiel de los 10 ítems de Brooke. Hay versiones validadas en español (Sevilla-Gonzalez et al.,
// 2020; Castilla et al., 2024); si se adopta una, se cambian solo estos textos. docs/DISENO_ENCUESTA_USABILIDAD.md.

export const AFIRMACIONES_SUS: readonly string[] = [
  'Creo que me gustaría usar STIRE con frecuencia.',
  'Encontré STIRE innecesariamente complejo.',
  'Pensé que STIRE era fácil de usar.',
  'Creo que necesitaría ayuda de una persona técnica para poder usar STIRE.',
  'Encontré que las funciones de STIRE están bien integradas.',
  'Pensé que había demasiada inconsistencia en STIRE.',
  'Imagino que la mayoría de las personas aprendería a usar STIRE muy rápido.',
  'Encontré STIRE muy engorroso de usar.',
  'Me sentí muy seguro usando STIRE.',
  'Necesité aprender muchas cosas antes de poder empezar con STIRE.',
]

export const ESCALA_SUS = [
  { valor: 1, texto: 'Muy en desacuerdo' },
  { valor: 2, texto: 'En desacuerdo' },
  { valor: 3, texto: 'Ni de acuerdo ni en desacuerdo' },
  { valor: 4, texto: 'De acuerdo' },
  { valor: 5, texto: 'Muy de acuerdo' },
] as const

export type Aceptabilidad = 'no-aceptable' | 'marginal' | 'aceptable'
export const NOMBRE_ACEPTABILIDAD: Record<Aceptabilidad, string> = {
  'no-aceptable': 'No aceptable (menos de 50)',
  marginal: 'Marginal (50 a 70)',
  aceptable: 'Aceptable (70 o más)',
}

/** Índices (desde 0) de las afirmaciones que faltan por responder. */
export function faltantesSus(respuestas: Array<number | null>): number[] {
  return respuestas.flatMap((r, i) => (r === null ? [i] : []))
}

/** En las impares (positivas) más alto es mejor; en las pares (negativas), más bajo. Para leer el promedio por afirmación. */
export function esPositivaSus(indice: number): boolean {
  return indice % 2 === 0
}

/**
 * Las (hasta) 2 afirmaciones que más le quitan al puntaje: lo que conviene mejorar primero. Cada afirmación aporta hasta
 * 4 puntos; se marca solo si pierde más de 1 en promedio.
 */
export function afirmacionesAMejorar(porPregunta: number[]): number[] {
  return porPregunta
    .map((p, i) => ({ i, pierde: esPositivaSus(i) ? 5 - p : p - 1 }))
    .sort((a, b) => b.pierde - a.pierde)
    .slice(0, 2)
    .filter((x) => x.pierde > 1)
    .map((x) => x.i)
}

/** «Ahora no» oculta la invitación unos días, en este equipo (no es un dato que importe guardar en el servidor). */
export const DIAS_SIN_INVITAR = 7
export const CLAVE_POSPUESTA = 'stire.encuesta.pospuesta'
export function invitacionPospuesta(guardado: string | null, ahora: number): boolean {
  const t = Number(guardado)
  return Number.isFinite(t) && t > 0 && ahora - t < DIAS_SIN_INVITAR * 86_400_000
}

/**
 * Segunda parte, distinta por rol (src/usabilidad/sus.ts, TAREAS_POR_ROL): «¿Qué tan fácil o difícil te resultó…?» de
 * 1 a 7 para las tareas clave de cada rol (Single Ease Question; Sauro y Dumas, 2009). El SUS dice cuánto; esto, dónde.
 */
export const TAREAS_POR_ROL: Record<string, ReadonlyArray<{ clave: string; texto: string }>> = {
  estudiante: [
    { clave: 'entender-leccion', texto: 'Entender una lección (leerla, escucharla o ver su diagrama)' },
    { clave: 'resolver-ejercicio', texto: 'Resolver un ejercicio y entender por qué pasó o falló' },
    { clave: 'pedir-ayuda', texto: 'Pedir ayuda al Tutor cuando te atascas' },
    { clave: 'saber-que-sigue', texto: 'Saber qué estudiar o repasar después' },
    { clave: 'entregar-proyecto', texto: 'Hacer y entregar un proyecto' },
  ],
  docente: [
    { clave: 'crear-leccion', texto: 'Crear o editar una lección' },
    { clave: 'crear-ejercicio', texto: 'Crear un ejercicio con sus casos de prueba' },
    { clave: 'revisar-entregas', texto: 'Revisar y calificar entregas' },
    { clave: 'seguir-clase', texto: 'Ver quién va bien y quién necesita ayuda' },
    { clave: 'configurar-clase', texto: 'Configurar la clase (Tutor, logros, notas)' },
  ],
}
export const ESCALA_FACILIDAD = [1, 2, 3, 4, 5, 6, 7] as const

/** La pregunta abierta de cada rol: lo que más le serviría, en sus palabras. */
export function preguntaAbierta(rol: string | undefined): string {
  if (rol === 'docente') return '¿Qué te quitaría más trabajo en STIRE?'
  if (rol === 'estudiante') return '¿Qué te ayudaría a aprender mejor con STIRE?'
  return '¿Qué cambiarías primero?'
}

/** Solo las tareas respondidas (sin respuesta = «no la he hecho»). */
export function tareasRespondidas(valores: Record<string, number | null>): Record<string, number> {
  return Object.fromEntries(Object.entries(valores).filter((e): e is [string, number] => typeof e[1] === 'number'))
}

export interface FacilidadTarea { clave: string; texto: string; promedio: number | null; n: number }

/** Bajo 5 de 7 una tarea es difícil para lo que debería ser (el promedio de referencia de la SEQ ronda 5,5). */
export const FACILIDAD_ACEPTABLE = 5

export interface EstadoSus { ultima: string | null; puntaje: number | null; puedeResponder: boolean; invitar: boolean }
export interface ResumenSus {
  n: number
  promedio: number | null
  aceptabilidad: Aceptabilidad | null
  porRol: Record<string, { n: number; promedio: number }>
  porPregunta: number[]
  comentarios: Array<{ rol: string; texto: string; fecha: string }>
  /** Por rol, de la tarea más difícil a la más fácil. Ausente en un servidor de antes de la segunda parte. */
  tareas?: Record<string, FacilidadTarea[]>
}
