export function useSugerencias() {
  const api = useApi()
  return {
    captura: (id: number) => api.apiFetch<Blob>(`/reportes/${id}/captura`, { responseType: 'blob' }),
    listar: <T,>(estado: string | null) => api.get<T>(estado ? `/reportes?estado=${estado}` : '/reportes'),
    actualizar: (id: number, cambios: { estado: string; nota: string | undefined }) => api.patch(`/reportes/${id}`, cambios),
  }
}
