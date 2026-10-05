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

/** Las combinaciones tipo + nivel con un solo ejercicio: sin una variante, el reintento repite la misma pregunta. */
export function casillasConUnEjercicio(banco: EjercicioDelBanco[]): Array<{ level: string; typeName: string; activityId: number; title: string }> {
  const grupos = new Map<string, EjercicioDelBanco[]>()
  for (const ej of banco) {
    const clave = `${ej.questionType || 'unknown'}_${ej.difficulty || 'basico'}`
    grupos.set(clave, [...(grupos.get(clave) ?? []), ej])
  }
  return [...grupos.values()]
    .filter((lista) => lista.length === 1)
    .map(([ej]) => ({ level: nombreNivel(ej.difficulty).toLowerCase(), typeName: nombreTipo(ej.questionType), activityId: ej.activityId, title: ej.title }))
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
