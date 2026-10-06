import type { Valoracion } from '~/utils/entregas'

/** Datos remotos del inicio del estudiante (PAT-01: la página organiza y presenta). */
export interface SolicitudRolEstudiante {
  id: number
  status: 'pending' | 'approved' | 'rejected'
  reason?: string | null
  reviewNote?: string | null
}

export interface RefuerzoInicioEstudiante {
  id: number
  classId: number
  tipo: 'refuerzo' | 'reto'
  titulo: string
  mensaje: string | null
  fechaLimite: string | null
  totalPasos: number
  pasosHechos: number
}

export interface EntregaInicioEstudiante {
  id: number
  titulo: string
  cierraAt: string | null
  estado: 'sin_entregar' | 'revisada' | 'por_revisar'
  versionesUsadas: number
  limite: number
  ultima: { nota: number | null; valoracion?: Valoracion | null } | null
}

export interface ActividadRecomendadaInicio {
  activityId: number
  reason?: string
  reasonMessage?: string
  level?: string
}

export function useInicioEstudiante() {
  const api = useApi()

  function solicitudRol(): Promise<{ request: SolicitudRolEstudiante } | null> {
    return api.get<{ request: SolicitudRolEstudiante } | null>('/role-requests/me')
  }

  function actividadRecomendada(studentId: number, unitId: number): Promise<ActividadRecomendadaInicio | null> {
    return api.get<ActividadRecomendadaInicio | null>(`/learning-progress/student/${studentId}/unit/${unitId}/next-activity`)
  }

  function refuerzos(): Promise<RefuerzoInicioEstudiante[]> {
    return api.get<RefuerzoInicioEstudiante[]>('/refuerzos/mios')
  }

  function entregas(classId: number): Promise<EntregaInicioEstudiante[]> {
    return api.get<EntregaInicioEstudiante[]>(`/entregas/mias?classId=${classId}`)
  }

  return { solicitudRol, actividadRecomendada, refuerzos, entregas }
}
