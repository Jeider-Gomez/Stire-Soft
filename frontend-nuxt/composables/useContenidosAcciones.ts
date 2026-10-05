/** Acciones destructivas del árbol de contenidos (PAT-01: la página no llama a la API). */
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

  return { eliminarModulo, eliminarTema, eliminarLeccion }
}
