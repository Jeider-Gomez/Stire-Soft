export interface MatriculaEstudiante {
  id: number; classId: number; status: string; joinedAt?: string
  class?: { id: number; name: string; code: string; description?: string; teacher?: { fullName: string } }
}
export function useClasesEstudiante() {
  const api = useApi()
  return {
    listar: () => api.get<MatriculaEstudiante[]>('/enrollment/my'),
    unirse: (codigo: string) => api.post<unknown>('/enrollment/join', { code: codigo }),
  }
}
