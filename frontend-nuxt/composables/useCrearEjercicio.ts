import type { ExerciseTypeId } from '~/utils/exerciseTypes'

export interface ClaseDelDocente { id: number; code: string; name: string }
export interface LeccionParaEjercicio { id: number; title: string; difficulty: string }
export interface TipoDeActividadCrear { id: number; name: string; code: string; baseWeight: number }

export interface EjercicioNuevo {
  learningUnitId: number
  activityTypeId: number | null
  title: string
  description: string
  difficulty: string
  totalPoints: number
  attemptsAllowed: number
}

/**
 * Las llamadas de «Crear ejercicio» (PAT-01: la página no habla con la API). Las lecciones de una clase se piden en
 * paralelo, un pedido por módulo (antes uno tras otro: una clase con 8 módulos hacía 9 pedidos en fila).
 */
export function useCrearEjercicio() {
  const api = useApi()

  async function cargarInicio(): Promise<{ clases: ClaseDelDocente[]; tipos: TipoDeActividadCrear[] }> {
    const [clases, tipos] = await Promise.all([
      api.get<ClaseDelDocente[]>('/class/my-classes'),
      api.get<TipoDeActividadCrear[] | { data?: TipoDeActividadCrear[] }>('/activity-types'),
    ])
    return { clases: Array.isArray(clases) ? clases : [], tipos: Array.isArray(tipos) ? tipos : (tipos?.data ?? []) }
  }

  async function leccionesDeClase(classId: number): Promise<LeccionParaEjercicio[]> {
    const modulos = await api.get<Array<{ id: number }>>(`/sections/class/${classId}`)
    const temasPorModulo = await Promise.all(
      (Array.isArray(modulos) ? modulos : []).map((m) => api.get<Array<{ learningUnits?: LeccionParaEjercicio[] }>>(`/topic/section/${m.id}`)),
    )
    return temasPorModulo.flatMap((temas) => (Array.isArray(temas) ? temas : []).flatMap((t) => t.learningUnits ?? []))
  }

  /**
   * Crea la actividad y su pregunta. Si la pregunta falla no queda un ejercicio vacío: se borra la actividad. Publicar
   * es aparte: si falla, el ejercicio queda en borrador y se dice.
   */
  async function crear(datos: EjercicioNuevo, tipo: ExerciseTypeId, config: Record<string, unknown>, publicar: boolean): Promise<{ publicado: boolean }> {
    const act = await api.post<{ id: number }>('/activities', {
      ...datos,
      activityTypeId: datos.activityTypeId ?? undefined,
      passingScore: 60,
      isRequired: true,
      adaptiveWeight: 0.4,
    })
    if (!act?.id) throw new Error('El servidor no devolvió el ejercicio creado.')
    try {
      await api.post('/activity-questions', { activityId: act.id, type: tipo, question: datos.description, points: datos.totalPoints, order: 0, config })
    } catch (err) {
      await api.del(`/activities/${act.id}`).catch(() => undefined)
      throw err
    }
    const publicado = publicar ? await api.patch(`/activities/${act.id}/publish`).then(() => true, () => false) : false
    return { publicado }
  }

  return { cargarInicio, leccionesDeClase, crear }
}
