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

  async function eliminar(id: number): Promise<string | null> {
    try {
      await api.del(`/avisos-clase/${id}`)
      avisos.value = avisos.value.filter((a) => a.id !== id)
      return null
    } catch (err) {
      return messageOf(err, 'No se pudo borrar el aviso.')
    }
  }

  return { avisos, cargando, error, cargar, publicar, eliminar }
}
