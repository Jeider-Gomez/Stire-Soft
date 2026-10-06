import type { TipoProyecto, ArchivoProyecto } from '~/utils/proyectoNavegador'
export interface ResumenProyectoEstudiante { id: number; titulo: string; tipo: TipoProyecto; bytes: number; updatedAt: string }
export interface ProyectoEstudiante { id: number; titulo: string; tipo: TipoProyecto; archivos: ArchivoProyecto[] }
export interface EstadoProyectosEstudiante { disponible: boolean; limites: { proyectosPorUsuario: number; archivosPorProyecto: number; bytesPorProyecto: number } }
export function useProyectos() {
  const api = useApi()
  return {
    estado: () => api.get<EstadoProyectosEstudiante>('/proyectos/estado'),
    listar: () => api.get<ResumenProyectoEstudiante[]>('/proyectos'),
    crear: (titulo: string, tipo: TipoProyecto) => api.post<{ id: number }>('/proyectos', { titulo, tipo }),
    borrar: (id: number) => api.del(`/proyectos/${id}`),
    obtener: (id: number) => api.get<ProyectoEstudiante>(`/proyectos/${id}`),
    actualizar: (id: number, cambios: Partial<Pick<ProyectoEstudiante, 'titulo' | 'archivos'>>) => api.patch(`/proyectos/${id}`, cambios),
  }
}
