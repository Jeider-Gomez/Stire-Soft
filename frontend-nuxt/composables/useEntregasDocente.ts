export function useEntregasDocente() {
  const api = useApi()
  return {
    listar: <T,>(classId: number) => api.get<T>(`/entregas/clase/${classId}`),
    detalle: <T,>(id: number) => api.get<T>(`/entregas/${id}/detalle`),
    publicar: (id: number, publicada: boolean) => api.patch(`/entregas/${id}`, { publicada }),
    reabrir: (id: number, studentId: number) => api.post(`/entregas/${id}/reabrir`, { studentId }),
    envio: <T,>(id: number) => api.get<T>(`/proyecto-envios/${id}`),
    revisar: <T,>(id: number, cambios: unknown) => api.patch<T>(`/proyecto-envios/${id}/revision`, cambios),
  }
}
