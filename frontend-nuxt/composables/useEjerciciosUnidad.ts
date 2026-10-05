import { computed, ref, type InjectionKey } from 'vue'
import {
  casillasConUnEjercicio, consultaBanco,
  type EjercicioDeLaLeccion, type EjercicioDelBanco, type FiltrosBanco, type TipoDeActividad,
} from '~/utils/ejerciciosUnidad'

export interface DatosEjercicio { title: string; description: string; difficulty: string; totalPoints: number; activityTypeId: number | null }
export interface PreguntaDelDocente { id: number; type: string; config: unknown }

/**
 * Datos y acciones de los ejercicios de una lección (PAT-01: la vista no habla con la API). Lo usa
 * components/docente/UnitExercisesPanel.vue, una vez por lección abierta, y sus ventanas lo reciben con inject.
 * Las acciones devuelven el mensaje de error, o null si salió bien, como useContenidosCurso.
 */
export function useEjerciciosUnidad(unidadId: number, alContar: (n: number) => void) {
  const api = useApi()
  const { messageOf } = useApiErrorMessage()

  const ejercicios = ref<EjercicioDeLaLeccion[]>([])
  const tipos = ref<TipoDeActividad[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)
  const aviso = ref<string | null>(null)
  /** Algo que conviene revisar aunque se guardó (p. ej. una variante igual al original). */
  const advertencia = ref<string | null>(null)
  const duplicando = ref(false)
  const deLaUnidadEnBanco = ref<EjercicioDelBanco[]>([])

  const visibles = computed(() => ejercicios.value.filter((a) => a.status !== 'archived'))
  const casillasSolas = computed(() => casillasConUnEjercicio(deLaUnidadEnBanco.value))

  async function revisarCasillas() {
    try {
      // Solo los de esta unidad (el banco ya excluye los archivados). Cuentan también los borradores: una variante
      // recién duplicada ya resuelve el aviso aunque el docente todavía no la publique.
      const res = await api.get<EjercicioDelBanco[]>(`/reuse/bank?learningUnitId=${unidadId}`)
      deLaUnidadEnBanco.value = Array.isArray(res) ? res : []
    } catch {
      deLaUnidadEnBanco.value = []
    }
  }

  async function cargar() {
    cargando.value = true
    error.value = null
    try {
      const [res, t] = await Promise.all([
        api.get<{ data?: EjercicioDeLaLeccion[] } | EjercicioDeLaLeccion[]>(`/activities?learningUnitId=${unidadId}&limit=50`),
        tipos.value.length ? Promise.resolve(tipos.value) : api.get<TipoDeActividad[] | { data?: TipoDeActividad[] }>('/activity-types'),
        revisarCasillas(),
      ])
      ejercicios.value = Array.isArray(res) ? res : (res?.data ?? [])
      tipos.value = Array.isArray(t) ? t : (t?.data ?? [])
      alContar(visibles.value.length)
    } catch (err) {
      error.value = messageOf(err, 'No se pudieron cargar los ejercicios.')
    } finally {
      cargando.value = false
    }
  }

  async function publicar(ej: EjercicioDeLaLeccion) {
    try {
      await api.patch(`/activities/${ej.id}/publish`)
      ej.status = 'published'
      aviso.value = `«${ej.title}» ya es visible para los estudiantes.`
    } catch (err) {
      error.value = messageOf(err, 'No se pudo publicar el ejercicio.')
    }
  }

  async function archivar(ej: EjercicioDeLaLeccion): Promise<string | null> {
    try {
      await api.patch(`/activities/${ej.id}/archive`)
      ej.status = 'archived'
      aviso.value = `«${ej.title}» archivado.`
      alContar(visibles.value.length)
      return null
    } catch (err) {
      return messageOf(err, 'No se pudo archivar el ejercicio.')
    }
  }

  /** Copia el ejercicio en esta lección como variante (borrador). Devuelve la copia, ya en la lista, para editarla. */
  async function duplicarVariante(id: number): Promise<EjercicioDeLaLeccion | null> {
    duplicando.value = true
    aviso.value = null
    try {
      const res = await api.post<{ id: number }>(`/reuse/activities/${id}/copy`, { learningUnitId: unidadId, variant: true })
      aviso.value = 'Variante creada en borrador.'
      await cargar()
      return ejercicios.value.find((a) => a.id === res.id) ?? null
    } catch (err) {
      error.value = messageOf(err, 'No se pudo duplicar el ejercicio como variante.')
      return null
    } finally {
      duplicando.value = false
    }
  }

  /** La pregunta del ejercicio y si todavía se puede cambiar (no, si ya tiene entregas). */
  async function respuestasDe(id: number) {
    const [preguntas, editable] = await Promise.all([
      api.get<PreguntaDelDocente[]>(`/activity-questions/activity/${id}`),
      api.get<{ editable: boolean; submissions: number }>(`/activity-questions/activity/${id}/editable`),
    ])
    return { pregunta: preguntas[0] ?? null, editable: editable.editable, entregas: editable.submissions }
  }

  /** Guarda los datos del ejercicio y, si el editor de respuestas dio una config, también la pregunta. */
  async function guardar(id: number, d: DatosEjercicio, pregunta: { id: number; config: unknown } | null): Promise<string | null> {
    const datos = { ...d, title: d.title.trim(), description: d.description.trim() }
    try {
      await api.patch(`/activities/${id}`, datos)
      const ej = ejercicios.value.find((a) => a.id === id)
      if (ej) {
        Object.assign(ej, { title: datos.title, description: datos.description, difficulty: datos.difficulty, totalPoints: datos.totalPoints })
        const t = tipos.value.find((x) => x.id === datos.activityTypeId)
        if (t) { ej.activityTypeId = t.id; ej.activityType = t }
      }
      if (pregunta) {
        // El enunciado y los puntos de la pregunta son los de la actividad (así los crea «Crear ejercicio»).
        await api.patch(`/activity-questions/${pregunta.id}`, { question: datos.description, points: datos.totalPoints, config: pregunta.config })
      }
      aviso.value = 'Cambios guardados.'
      return null
    } catch (err) {
      return messageOf(err, 'No se pudieron guardar los cambios.')
    }
  }

  async function buscarEnBanco(f: FiltrosBanco): Promise<{ items: EjercicioDelBanco[]; error: string | null }> {
    try {
      const res = await api.get<EjercicioDelBanco[]>(`/reuse/bank${consultaBanco(f)}`)
      return { items: Array.isArray(res) ? res : [], error: null }
    } catch (err) {
      return { items: [], error: messageOf(err, 'No se pudieron cargar los ejercicios del banco.') }
    }
  }

  async function copiarDelBanco(item: EjercicioDelBanco): Promise<string | null> {
    try {
      await api.post(`/reuse/activities/${item.activityId}/copy`, { learningUnitId: unidadId })
      aviso.value = 'Agregado como borrador. Revísalo y publícalo.'
      await cargar()
      return null
    } catch (err) {
      return messageOf(err, 'No se pudo agregar el ejercicio a esta lección.')
    }
  }

  return {
    unidadId, ejercicios, visibles, tipos, cargando, error, aviso, advertencia, duplicando, casillasSolas,
    cargar, publicar, archivar, duplicarVariante, respuestasDe, guardar, buscarEnBanco, copiarDelBanco,
  }
}

export type EstadoEjerciciosUnidad = ReturnType<typeof useEjerciciosUnidad>
export const CLAVE_EJERCICIOS_UNIDAD: InjectionKey<EstadoEjerciciosUnidad> = Symbol('ejercicios-unidad')
