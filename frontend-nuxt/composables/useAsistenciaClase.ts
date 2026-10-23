import type { EstadoAsistencia } from '~/utils/asistencia'

type Api = ReturnType<typeof useApi>

/** Las rutas de asistencia de una clase con un cliente ya creado: la tienda de la asistencia activa las usa fuera de un componente. */
export function accionesAsistencia(api: Api, classId: number) {
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

/** Acciones y consultas de asistencia para una clase docente. */
export function useAsistenciaClase(classId: number) {
  return accionesAsistencia(useApi(), classId)
}
