/** Consultas independientes del panel «Hoy» de una clase docente. */
export function useResumenClase(classId: number) {
  const api = useApi()
  return {
    clase: <T,>() => api.get<T>(`/class/${classId}`),
    solicitudes: <T,>() => api.get<T>(`/enrollment/class/${classId}/pending`),
    entregas: <T,>() => api.get<T>(`/entregas/clase/${classId}`),
    mapa: <T,>() => api.get<T>(`/analytics/class/${classId}/heatmap`),
    refuerzos: <T,>() => api.get<T>(`/refuerzos/clase/${classId}`),
    semana: <T,>() => api.get<T>(`/analytics/class/${classId}/semana`),
    resolverSolicitud: (id: string, accion: 'approve' | 'reject') => api.apiFetch(`/enrollment/${id}/${accion}`, { method: 'PATCH' }),
  }
}
