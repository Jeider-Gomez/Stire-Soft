import type { CuandoExplicacion } from '~/utils/explicacionesAlternativas'

/** Cambiar cuándo ve el estudiante una explicación (utils/explicacionesAlternativas.ts). Devuelve el error o null. */
export function useCuandoExplicacion() {
  const api = useApi()
  const { messageOf } = useApiErrorMessage()
  async function guardar(explicacionId: number, cuando: CuandoExplicacion): Promise<string | null> {
    try {
      await api.patch(`/content/${explicacionId}`, { cuando })
      return null
    } catch (err) {
      return messageOf(err, 'No se pudo cambiar cuándo la ve el estudiante.')
    }
  }
  return { guardar }
}
