/** Los 7 tipos de ejercicio, en palabras de un docente (no de la base de datos). */
export type ExerciseTypeId = 'coding' | 'mcq' | 'fill_code' | 'drag_drop' | 'matching' | 'ordering' | 'html_css'

export interface ExerciseTypeInfo {
  id: ExerciseTypeId
  name: string
  /** Qué hace el estudiante. */
  student: string
  /** Para qué le sirve al docente. */
  idealFor: string
  /** Cómo se califica, en una frase. */
  grading: string
}

export const EXERCISE_TYPES: ExerciseTypeInfo[] = [
  {
    id: 'mcq',
    name: 'Opción múltiple',
    student: 'Elige la respuesta correcta entre varias opciones.',
    idealFor: 'Comprobar rápido si entendió un concepto.',
    grading: 'Todo o nada.'
  },
  {
    id: 'coding',
    name: 'Programar',
    student: 'Escribe un programa en JavaScript que resuelve el problema.',
    idealFor: 'Practicar algoritmos de verdad.',
    grading: 'Se ejecuta con casos de prueba: los que ve y otros ocultos.'
  },
  {
    id: 'fill_code',
    name: 'Completar código',
    student: 'Rellena los espacios en blanco de un programa ya escrito.',
    idealFor: 'Enfocarse en una línea clave sin empezar desde cero.',
    grading: 'Puntaje proporcional a los espacios correctos.'
  },
  {
    id: 'ordering',
    name: 'Ordenar pasos',
    student: 'Pone en orden las líneas o pasos de un algoritmo.',
    idealFor: 'Trabajar la secuencia lógica antes de programar.',
    grading: 'Todo o nada.'
  },
  {
    id: 'matching',
    name: 'Emparejar',
    student: 'Une cada concepto con su definición o su resultado.',
    idealFor: 'Vocabulario, operadores y qué imprime cada instrucción.',
    grading: 'Puntaje proporcional a las parejas correctas.'
  },
  {
    id: 'drag_drop',
    name: 'Clasificar',
    student: 'Ubica cada elemento en la categoría que le corresponde.',
    idealFor: 'Tipos de datos, valores verdaderos o falsos, errores comunes.',
    grading: 'Puntaje proporcional a los elementos bien ubicados.'
  },
  {
    id: 'html_css',
    name: 'HTML y CSS',
    student: 'Construye una página con HTML y CSS y la ve en vivo.',
    idealFor: 'Maquetar y dar estilo a una página.',
    grading: 'Reglas que tú defines (por ejemplo, «hay un título h1»).'
  }
]

export function exerciseTypeInfo(id: string): ExerciseTypeInfo | undefined {
  return EXERCISE_TYPES.find((t) => t.id === id)
}
