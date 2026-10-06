import type { EstadoAsistencia } from '~/utils/asistencia'
export interface ClaseAsistenciaEstudiante {
  classId: number; clase: string; porcentaje: number | null
  sesiones: Array<{ id: number; fecha: string; tema: string | null; estado: EstadoAsistencia | null }>
}
export function useAsistenciaEstudiante() {
  const api = useApi()
  return {
    codigo: (dispositivo: string) => api.get<{ codigo: string; venceEnMs: number; ventanaMs: number }>(`/asistencia/mi-codigo?dispositivo=${dispositivo}`),
    historial: () => api.get<ClaseAsistenciaEstudiante[]>('/asistencia/mia'),
  }
}
