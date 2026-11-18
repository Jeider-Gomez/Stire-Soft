import type { CompetenciasDeLaClase, CompetenciasDelEstudiante, ModoCompetencias, PracticarPrimero } from '~/utils/competencias'

/** Las llamadas de competencias (P39): «Mis competencias», la vista del docente y «Practica esto primero». */
export function useCompetencias() {
  const api = useApi()
  return {
    delEstudiante: (studentId: number, classId: number) =>
      api.get<CompetenciasDelEstudiante>(`/analytics/student/${studentId}/competencias?classId=${classId}`),
    deLaClase: (classId: number) => api.get<CompetenciasDeLaClase>(`/analytics/class/${classId}/competencias`),
    cambiarModo: (classId: number, modo: ModoCompetencias) =>
      api.patch<{ modo: ModoCompetencias }>(`/analytics/class/${classId}/competencias/modo`, { modo }),
    practicarPrimero: (activityId: number) => api.get<PracticarPrimero>(`/analytics/practicar-primero/${activityId}`),
  }
}
