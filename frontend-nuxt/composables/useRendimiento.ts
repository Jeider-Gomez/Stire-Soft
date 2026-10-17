export function useRendimiento() {
  const api = useApi()
  return {
    clase: <T,>(classId: number) => api.get<T>(`/analytics/class/${classId}`),
    estudiante: <T,>(studentId: number) => api.get<T>(`/analytics/student/${studentId}`),
    entregas: <T,>(studentId: number, pagina: number) => api.get<T>(`/analytics/student/${studentId}/entregas?pagina=${pagina}`),
  }
}
