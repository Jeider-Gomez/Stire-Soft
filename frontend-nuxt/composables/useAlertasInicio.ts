import { ref } from 'vue'
import type { AlertasDeClase } from '~/utils/inicioDocente'
import type { ErroresSemana } from '~/utils/erroresSemana'
import type { MapaHoy } from '~/utils/hoyClase'

/**
 * Las alertas de cada clase activa para «Por revisar» del Inicio: quiénes no pueden avanzar (mapa de calor) y el error
 * de concepto más repetido de la semana. Una clase que no responde no deja sin alertas a las demás.
 */
export function useAlertasInicio() {
  const api = useApi()
  const alertas = ref<AlertasDeClase[]>([])

  async function cargar(clases: ReadonlyArray<{ id: number; name: string }>) {
    const res = await Promise.all(clases.map(async (c): Promise<AlertasDeClase> => {
      const [mapa, errores] = await Promise.all([
        api.get<MapaHoy>(`/analytics/class/${c.id}/heatmap`).catch(() => null),
        api.get<ErroresSemana>(`/analytics/class/${c.id}/errores-semana`).catch(() => null),
      ])
      const bloqueados = new Set((mapa?.bloqueados ?? []).map((b) => b.studentId)).size
      const top = [...(errores?.concepto ?? [])].sort((a, b) => b.estudiantes.length - a.estudiantes.length)[0]
      return { claseId: c.id, clase: c.name, bloqueados, errorMasRepetido: top ? { nombre: top.nombre, estudiantes: top.estudiantes.length } : null }
    }))
    alertas.value = res
  }

  return { alertas, cargar }
}
