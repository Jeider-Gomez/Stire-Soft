export function useRefuerzosDocente() {
  const api = useApi()
  return {
    listar: <T,>(classId: number) => api.get<T>(`/refuerzos/clase/${classId}`),
    archivar: (id: number) => api.patch(`/refuerzos/${id}/archivar`, {}),
    sugerencias: <T,>(classId: number, consulta: string) => api.get<T>(`/refuerzos/clase/${classId}/sugerencias?${consulta}`),
    matriculas: <T,>(classId: number) => api.get<T>(`/enrollment/class/${classId}`),
    crear: (datos: unknown) => api.post('/refuerzos', datos),
  }
}
