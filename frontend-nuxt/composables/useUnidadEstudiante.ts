/** Consultas y acciones de la lección del estudiante (PAT-01: la página no habla con la API). */
export interface UnidadEstudianteDetalle {
  id: number
  title: string
  description: string
  classId?: number
}

export interface ContenidoUnidadEstudiante {
  id: number
  title: string
  body: string
  type?: string
  metadata?: Record<string, unknown> | null
}

export interface ActividadUnidadEstudiante { id: number; title: string }

export interface RecomendacionActividadEstudiante {
  activityId: number
  title: string
  questionType: string | null
  order: number
  allCompleted: boolean
  level: string
  reason: string
  reasonMessage: string
}

/** Un ejercicio de la lección para el estudiante (src/learning-progress/ejercicios-leccion.ts). */
export type EstadoEjercicioEstudiante = 'por-hacer' | 'en-curso' | 'hecho' | 'cuenta-otro' | 'sin-intentos'
export interface EjercicioLeccionEstudiante {
  id: number
  titulo: string
  nivel: string
  tipo: string | null
  pesoPct: number
  parecidos: number
  estado: EstadoEjercicioEstudiante
  subeDominio: boolean
  /** Puntos que subiría el dominio de la lección si lo resolviera ahora (el mismo motor del dominio, 09/10). */
  ganancia?: number
  /** Cuánto lleva su grupo (él y sus parecidos), de 0 a 100. */
  casillaPct?: number
  /** Sin intentos: cuándo se reabre uno (ISO). */
  reabreEn?: string | null
  intentosUsados: number
  intentosPermitidos: number
  mejorPct: number | null
}

export interface EntregaUnidadEstudiante {
  id: number
  titulo: string
  learningUnitId: number | null
  cierraAt: string | null
  versionesUsadas: number
  limite: number
}

export interface ProgresoUnidadEstudiante {
  entryConfidence: number | null
  mastery?: number
  attemptsCount?: number
}

export function useUnidadEstudiante() {
  const api = useApi()

  function unidad(unitId: number): Promise<UnidadEstudianteDetalle> {
    return api.get<UnidadEstudianteDetalle>(`/learning-unit/${unitId}`)
  }

  function contenidos(unitId: number): Promise<ContenidoUnidadEstudiante[]> {
    return api.get<ContenidoUnidadEstudiante[]>(`/content/unit/${unitId}`)
  }

  function actividades(unitId: number): Promise<{ data: ActividadUnidadEstudiante[] }> {
    return api.get<{ data: ActividadUnidadEstudiante[] }>(`/activities?learningUnitId=${unitId}`)
  }

  function misEjercicios(unitId: number): Promise<EjercicioLeccionEstudiante[]> {
    return api.get<EjercicioLeccionEstudiante[]>(`/learning-progress/unit/${unitId}/mis-ejercicios`)
  }

  function entregasDeClase(classId: number): Promise<EntregaUnidadEstudiante[]> {
    return api.get<EntregaUnidadEstudiante[]>(`/entregas/mias?classId=${classId}`)
  }

  function progreso(studentId: number, unitId: number): Promise<ProgresoUnidadEstudiante | null> {
    return api.get<ProgresoUnidadEstudiante | null>(`/learning-progress/student/${studentId}/unit/${unitId}`)
  }

  function siguienteActividad(studentId: number, unitId: number, reto = false): Promise<RecomendacionActividadEstudiante | null> {
    const sufijo = reto ? '?reto=1' : ''
    return api.get<RecomendacionActividadEstudiante | null>(`/learning-progress/student/${studentId}/unit/${unitId}/next-activity${sufijo}`)
  }

  function registrarConfianza(unitId: number, confianza: number): Promise<void> {
    return api.put(`/learning-progress/unit/${unitId}/confidence`, { confianza })
  }

  return { unidad, contenidos, actividades, misEjercicios, entregasDeClase, progreso, siguienteActividad, registrarConfianza }
}
