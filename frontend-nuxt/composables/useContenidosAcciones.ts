/**
 * Acciones destructivas del árbol de contenidos (PAT-01: la página no llama a la API).
 * Fase 30 B3: archivar, restaurar, impacto y eliminar — todo por nivel.
 */
import type { ImpactoEliminacion } from '~/utils/cuentaRegresiva'

type Nivel = 'modulo' | 'tema' | 'leccion'

const RUTA: Record<Nivel, string> = {
  modulo: '/sections',
  tema: '/topic',
  leccion: '/learning-unit',
}

const SUFIJO_ELIMINAR: Record<Nivel, string> = {
  modulo: '',
  tema: '?permanent=true',
  leccion: '',
}

export function useContenidosAcciones() {
  const api = useApi()

  function eliminarModulo(id: number): Promise<void> {
    return api.del(`/sections/${id}`)
  }

  function eliminarTema(id: number): Promise<void> {
    return api.del(`/topic/${id}?permanent=true`)
  }

  function eliminarLeccion(id: number): Promise<void> {
    return api.del(`/learning-unit/${id}`)
  }

  function eliminar(nivel: Nivel, id: number): Promise<void> {
    return api.del(`${RUTA[nivel]}/${id}${SUFIJO_ELIMINAR[nivel]}`)
  }

  function archivar(nivel: Nivel, id: number): Promise<unknown> {
    return api.patch(`${RUTA[nivel]}/${id}/archivar`, {})
  }

  function restaurar(nivel: Nivel, id: number): Promise<unknown> {
    return api.patch(`${RUTA[nivel]}/${id}/restaurar`, {})
  }

  function impacto(nivel: Nivel, id: number): Promise<ImpactoEliminacion> {
    return api.get<ImpactoEliminacion>(`${RUTA[nivel]}/${id}/impacto`)
  }

  /** Qué se pierde si se elimina la clase entera (incluye `matriculados`). */
  function impactoClase(classId: number): Promise<ImpactoEliminacion> {
    return api.get<ImpactoEliminacion>(`/class/${classId}/impacto`)
  }

  return { eliminarModulo, eliminarTema, eliminarLeccion, eliminar, archivar, restaurar, impacto, impactoClase }
}
