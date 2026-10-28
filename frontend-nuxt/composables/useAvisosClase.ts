import { ref } from 'vue'
import type { AvisoClase } from '~/utils/avisosClase'

/** Avisos a la clase (utils/avisosClase.ts): los datos y las acciones; la vista no habla con la API (PAT-01). */
export function useAvisosClase() {
  const api = useApi()
  const { messageOf } = useApiErrorMessage()
  const avisos = ref<AvisoClase[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)

  /** Del estudiante: los de todas sus clases. Del docente: los de una clase (o de todas sus clases, si no se elige). */
  async function cargar(rol: 'docente' | 'estudiante', classIds: number[] = []) {
    cargando.value = true
    error.value = null
    try {
      if (rol === 'estudiante') avisos.value = await api.get<AvisoClase[]>('/avisos-clase/mios')
      else {
        const listas = await Promise.all(classIds.map((id) => api.get<AvisoClase[]>(`/avisos-clase/clase/${id}`).catch(() => [] as AvisoClase[])))
        avisos.value = listas.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      }
    } catch (err) {
      error.value = messageOf(err, 'No se pudieron cargar los avisos.')
    } finally {
      cargando.value = false
    }
  }

  async function publicar(classId: number, datos: Record<string, unknown>): Promise<{ avisados: number } | string> {
    try {
      const r = await api.post<AvisoClase & { avisados: number }>(`/avisos-clase/clase/${classId}`, datos)
      avisos.value = [r, ...avisos.value]
      return { avisados: r.avisados }
    } catch (err) {
      return messageOf(err, 'No se pudo publicar el aviso.')
    }
  }

  /** Corrige un aviso publicado; con `avisarCambio`, les llega otra notificación. Devuelve a cuántos avisó, o el error. */
  async function editar(id: number, datos: Record<string, unknown>, avisarCambio: boolean): Promise<{ avisados: number } | string> {
    try {
      const r = await api.patch<AvisoClase & { avisados: number }>(`/avisos-clase/${id}`, { ...datos, avisarCambio })
      avisos.value = avisos.value.map((a) => (a.id === id ? { ...a, ...r } : a))
      return { avisados: r.avisados }
    } catch (err) {
      return messageOf(err, 'No se pudo guardar el cambio.')
    }
  }

  /** Lo quita al instante y lo borra en el servidor cuando se cierra el aviso; devuelve «Deshacer» (ítem 8). */
  function eliminar(id: number, alFallar: (mensaje: string) => void): () => void {
    return borrarConDeshacer({
      ...quitarDeLista(avisos.value, (a) => a.id === id),
      borrar: () => api.del(`/avisos-clase/${id}`),
      alFallar: (err) => alFallar(messageOf(err, 'No se pudo borrar el aviso; volvió a la lista.')),
    }).deshacer
  }

  return { avisos, cargando, error, cargar, publicar, editar, eliminar }
}
