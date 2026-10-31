import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { useApiErrorMessage } from '~/composables/useApiErrorMessage'
import { useWorkspaceStore } from '~/stores/workspace'

/**
 * «Probar con mis datos» (P49, 31/10/2026, Jeider: «que funcione en la consola de verdad»): el estudiante escribe lo que entra
 * y ve lo que mostró su programa, sin casos, sin comparar y sin gastar intentos. Usa el mismo juez que califica
 * (POST /submissions/:id/run con `input`), así lo que ve aquí es lo que verá al entregar.
 */
export interface ResultadoPropio {
  input: string
  output: string
  error: string
  status: 'ok' | 'error' | 'time_limit'
  timeMs: number
}

export function useProbarConMisDatos() {
  const ws = useWorkspaceStore()
  const api = useApi()
  const entrada = ref('')
  const resultado = ref<ResultadoPropio | null>(null)
  const ejecutando = ref(false)
  const fallo = ref('')

  async function ejecutar() {
    if (ejecutando.value) return
    ejecutando.value = true
    fallo.value = ''
    try {
      const id = await ws.ensureActiveSubmission()
      const res = await api.post<{ custom?: ResultadoPropio }>(`/submissions/${id}/run`, { code: ws.code, input: entrada.value })
      resultado.value = res?.custom ?? null
      if (!resultado.value) fallo.value = 'No llegó el resultado. Intenta de nuevo.'
    } catch (err) {
      const { status } = useApiErrorMessage().extract(err)
      fallo.value = status === 429
        ? 'Probaste muchas veces seguidas. Espera un momento y vuelve a intentar.'
        : 'No se pudo ejecutar ahora. Intenta de nuevo en un momento.'
    } finally {
      ejecutando.value = false
    }
  }

  return { entrada, resultado, ejecutando, fallo, ejecutar }
}
