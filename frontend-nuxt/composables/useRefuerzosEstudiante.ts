export type PasoVistoEstudiante =
  | { tipo: 'explicacion'; titulo: string; texto: string; hecho: boolean }
  | { tipo: 'recurso'; titulo: string; url: string; provider: string; embedUrl: string | null; hecho: boolean }
  | { tipo: 'ejercicio'; activityId: number; titulo: string; hecho: boolean }
  | { tipo: 'entrega'; entregaId: number; titulo: string; hecho: boolean }
export interface RefuerzoEstudiante { id: number; tipo: 'refuerzo' | 'reto'; titulo: string; mensaje: string | null; fechaLimite: string | null; lecciones: Array<{ id: number; titulo: string }>; pasos: PasoVistoEstudiante[] }
export function useRefuerzosEstudiante() {
  const api = useApi()
  return {
    obtener: (id: number) => api.get<RefuerzoEstudiante>(`/refuerzos/${id}`),
    marcarPaso: (id: number, indice: number) => api.post(`/refuerzos/${id}/pasos/${indice}/hecho`, {}),
  }
}
