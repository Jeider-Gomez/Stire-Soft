import type { ResumenSus } from '~/utils/sus'
export function useResultadosSus() {
  const api = useApi()
  return { cargar: () => api.get<ResumenSus>('/usabilidad/sus/resultados') }
}
