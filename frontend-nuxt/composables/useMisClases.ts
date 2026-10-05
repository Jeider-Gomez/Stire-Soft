/** Consultas compartidas de las clases del docente (PAT-01: las páginas no llaman a la API). */
export function useMisClases() {
  const api = useApi()

  async function misClases<T extends unknown[] = Array<{ id: number; name: string; code?: string }>>(): Promise<T> {
    return await api.get<T>('/class/my-classes')
  }

  async function seccionesClase<T extends unknown[] = Array<{ topics?: Array<{ learningUnits?: Array<{ id: number; title: string }> }> }>>(classId: number): Promise<T> {
    return await api.get<T>(`/sections/class/${classId}`)
  }

  return { misClases, seccionesClase }
}
