export interface AccionAdminVista { id: number; createdAt: string; adminId: number; accion: string; objetivoId: number | null; detalle: string | null }
export function useAccionesAdmin() {
  const api = useApi()
  return { cargar: () => api.get<AccionAdminVista[]>('/admin/system/acciones?limit=50') }
}
