// El Laboratorio (v3, Fase D, paso 6; src/proyectos/laboratorio.controller.ts): las llamadas en un solo lugar (PAT-01).
import type { ArchivoProyecto, TipoProyecto } from '~/utils/proyectoNavegador'
import type { AlcanceLaboratorio } from '~/utils/laboratorio'

export interface AutorLaboratorio { nombre: string; iniciales: string; fotoId: string | null; esDocente: boolean }
export interface PublicacionLaboratorio {
  id: number
  proyectoId: number | null
  titulo: string
  tipo: TipoProyecto
  descripcion: string
  alcance: AlcanceLaboratorio
  autor: AutorLaboratorio
  clase: string
  classId: number
  esMia: boolean
  puedeModerar: boolean
  oculta: boolean
  meGusta: number
  laMarque: boolean
  mensajes: number
  extracto: string | null
  createdAt: string
  updatedAt: string
}
export interface MensajeLaboratorio { id: number; texto: string; autor: AutorLaboratorio; esMio: boolean; puedoBorrar: boolean; createdAt: string }
export interface DetalleLaboratorio extends PublicacionLaboratorio { archivos: ArchivoProyecto[]; yaReporte: boolean; comentarios: MensajeLaboratorio[] }
export interface MiPublicacion { id: number; proyectoId: number; alcance: AlcanceLaboratorio; classId: number; descripcion: string; oculta: boolean; updatedAt: string }

export function useLaboratorio() {
  const api = useApi()
  return {
    listar: (f: { alcance: AlcanceLaboratorio; classId?: number | null; tipo?: TipoProyecto | null }) => {
      const q = new URLSearchParams({ alcance: f.alcance })
      if (f.classId) q.set('classId', String(f.classId))
      if (f.tipo) q.set('tipo', f.tipo)
      return api.get<PublicacionLaboratorio[]>(`/laboratorio?${q.toString()}`)
    },
    mias: () => api.get<MiPublicacion[]>('/laboratorio/mias'),
    obtener: (id: number) => api.get<DetalleLaboratorio>(`/laboratorio/${id}`),
    publicar: (datos: { proyectoId: number; classId: number; alcance: AlcanceLaboratorio; descripcion: string }) => api.post<{ id: number; actualizada: boolean }>('/laboratorio', datos),
    quitar: (id: number) => api.del(`/laboratorio/${id}`),
    meGusta: (id: number) => api.post<{ laMarque: boolean; meGusta: number }>(`/laboratorio/${id}/me-gusta`),
    comentar: (id: number, texto: string) => api.post<{ id: number }>(`/laboratorio/${id}/comentarios`, { texto }),
    borrarMensaje: (id: number, comentarioId: number) => api.del(`/laboratorio/${id}/comentarios/${comentarioId}`),
    copiar: (id: number) => api.post<{ proyectoId: number }>(`/laboratorio/${id}/copia`),
    reportar: (id: number, motivo: string) => api.post<{ yaReportado: boolean; oculta: boolean }>(`/laboratorio/${id}/reportes`, { motivo }),
    ocultar: (id: number, oculta: boolean) => api.patch<{ oculta: boolean }>(`/laboratorio/${id}/oculta`, { oculta }),
  }
}
