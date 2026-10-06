import type { TipoProyecto, ArchivoProyecto } from '~/utils/proyectoNavegador'
import type { EscalaEntrega, EventoHistorial, TipoEntrega, Valoracion } from '~/utils/entregas'

export interface VersionEntregaEstudiante { id: number; version: number; titulo: string; tarde: boolean; nota: number | null; valoracion?: Valoracion | null; comentario: string | null; revisadoAt: string | null; createdAt: string }
export interface EntregaEstudiante {
  id: number; classId: number; titulo: string; consigna: string; tipoProyecto: TipoEntrega; tienePlantilla: boolean
  abreAt: string | null; cierraAt: string | null; aceptaTarde: boolean; conNota: boolean; escala?: EscalaEntrega; limite: number
  versiones: VersionEntregaEstudiante[]; historial: EventoHistorial[]
}
export interface ProyectoEntregaEstudiante { id: number; titulo: string; tipo: TipoProyecto; updatedAt: string }
export function useEntregasEstudiante() {
  const api = useApi()
  return {
    cargar: (id: number) => Promise.all([api.get<EntregaEstudiante>(`/entregas/${id}`), api.get<ProyectoEntregaEstudiante[]>('/proyectos').catch(() => [] as ProyectoEntregaEstudiante[])]),
    enviar: (id: number, proyectoId: number) => api.post<{ version: number }>(`/entregas/${id}/enviar`, { proyectoId }),
    empezar: (id: number) => api.post<{ id: number }>(`/entregas/${id}/empezar`),
    version: (id: number) => api.get<{ titulo: string; version: number; archivos: ArchivoProyecto[] }>(`/proyecto-envios/${id}`),
  }
}
