import type { ResumenSus } from '~/utils/sus'
export function useResultadosSus() {
  const api = useApi()
  // desde y hasta, AAAA-MM-DD (hora de Colombia, días incluidos); sin ellos, todo.
  return {
    cargar: (periodo: { desde?: string; hasta?: string } = {}) => {
      const q = new URLSearchParams()
      if (periodo.desde) q.set('desde', periodo.desde)
      if (periodo.hasta) q.set('hasta', periodo.hasta)
      const texto = q.toString()
      return api.get<ResumenSus>('/usabilidad/sus/resultados' + (texto ? '?' + texto : ''))
    },
  }
}
