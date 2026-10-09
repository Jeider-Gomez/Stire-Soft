// Reglas de los ejercicios de una lección en «Contenidos» (antes dentro de components/docente/UnitExercisesPanel.vue):
// nombres de nivel y de tipo, qué casillas tienen un solo ejercicio y cómo se arma la búsqueda en «Mi banco».
import { exerciseTypeInfo, type ExerciseTypeId } from './exerciseTypes'

export interface TipoDeActividad { id: number; name: string; baseWeight: number }

export interface EjercicioDeLaLeccion {
  id: number
  title: string
  difficulty: string
  totalPoints: number
  description?: string | null
  status: 'draft' | 'published' | 'archived'
  activityTypeId?: number
  activityType?: TipoDeActividad
}

export interface EjercicioDelBanco {
  activityId: number
  title: string
  difficulty: string
  questionType: string | null
  status: string
  questionPreview: string
  learningUnitId: number
  learningUnitTitle: string
  classId: number
  className: string
}

export interface FiltrosBanco { type: string; difficulty: string; q: string }

export function nombreNivel(d: string | null | undefined): string {
  return d === 'intermedio' ? 'Intermedio' : d === 'avanzado' ? 'Avanzado' : 'Básico'
}

export function nombreTipo(tipo: string | null | undefined): string {
  if (!tipo) return 'Práctica'
  return exerciseTypeInfo(tipo as ExerciseTypeId)?.name || tipo
}

/**
 * Parecidos (mismo tipo y nivel) que se recomiendan, sin obligar: en opción múltiple, 3, porque con un intento el parecido
 * es la forma de volver a intentarlo sin repetir la misma pregunta (09/10, Jeider; BT-41); en el resto, 2, para que el
 * reintento y el repaso no repitan la misma.
 */
export const PARECIDOS_RECOMENDADOS = (tipo: string | null | undefined): number => (tipo === 'mcq' ? 3 : 2)

/** Las combinaciones tipo + nivel con menos parecidos de los recomendados. Es un aviso: el docente decide. */
export function casillasConPocosEjercicios(banco: EjercicioDelBanco[]): Array<{ level: string; typeName: string; activityId: number; title: string; tiene: number; recomendados: number }> {
  const grupos = new Map<string, EjercicioDelBanco[]>()
  for (const ej of banco) {
    const clave = `${ej.questionType || 'unknown'}_${ej.difficulty || 'basico'}`
    grupos.set(clave, [...(grupos.get(clave) ?? []), ej])
  }
  return [...grupos.values()]
    .filter((lista) => lista.length < PARECIDOS_RECOMENDADOS(lista[0].questionType))
    .map((lista) => {
      const [ej] = lista
      return { level: nombreNivel(ej.difficulty).toLowerCase(), typeName: nombreTipo(ej.questionType), activityId: ej.activityId, title: ej.title, tiene: lista.length, recomendados: PARECIDOS_RECOMENDADOS(ej.questionType) }
    })
}

/** `?type=…&difficulty=…&q=…` con solo los filtros puestos; vacío sin filtros. */
export function consultaBanco(f: FiltrosBanco): string {
  const p = new URLSearchParams()
  if (f.type) p.append('type', f.type)
  if (f.difficulty) p.append('difficulty', f.difficulty)
  if (f.q.trim()) p.append('q', f.q.trim())
  const s = p.toString()
  return s ? `?${s}` : ''
}

export function sinFiltros(f: FiltrosBanco): boolean {
  return !f.type && !f.difficulty && !f.q.trim()
}
