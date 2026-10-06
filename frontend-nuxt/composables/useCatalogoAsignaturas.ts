export function useCatalogoAsignaturas() {
  const api = useApi()
  return {
    revision: <T,>() => api.get<T>('/asignaturas/revision'),
    unir: (origenId: number, destinoId: number) => api.post(`/asignaturas/${origenId}/unir`, { destinoId }),
    distintas: (aId: number, bId: number) => api.post('/asignaturas/distintas', { aId, bId }),
    confirmarOficial: (id: number) => api.patch(`/asignaturas/${id}`, { oficial: true }),
  }
}
