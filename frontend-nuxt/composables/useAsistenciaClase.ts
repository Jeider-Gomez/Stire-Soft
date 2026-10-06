import type { EstadoAsistencia } from '~/utils/asistencia'

/** Acciones y consultas de asistencia para una clase docente. */
export function useAsistenciaClase(classId: number) {
  const api = useApi()
  return {
    clase: <T,>() => api.get<T>(`/class/${classId}`),
    sesiones: <T,>() => api.get<T>(`/asistencia/clase/${classId}/sesiones`),
    detalle: <T,>(id: number) => api.get<T>(`/asistencia/sesiones/${id}`),
    crearSesion: <T,>() => api.post<T>(`/asistencia/clase/${classId}/sesiones`, {}),
    marcar: (sesionId: number, studentId: number, estado: EstadoAsistencia | null) => api.put(`/asistencia/sesiones/${sesionId}/estudiantes/${studentId}`, { estado }),
    escanear: <T,>(sesionId: number, codigo: string) => api.post<T>(`/asistencia/sesiones/${sesionId}/escanear`, { codigo }),
    actualizar: (sesionId: number, datos: { abierta?: boolean; tema?: string }) => api.patch(`/asistencia/sesiones/${sesionId}`, datos),
    borrar: (sesionId: number) => api.del(`/asistencia/sesiones/${sesionId}`),
    resumen: <T,>() => api.get<T>(`/asistencia/clase/${classId}/resumen`),
  }
}
