import { computed, reactive, ref, watch, type InjectionKey } from 'vue'
import type { Plantilla } from '~/utils/plantillas'
import {
  aplicarLeccion, aplicarTema, quitarTema, textoImportacion,
  type ClaseDocente, type DatosLeccion, type DatosTema, type ExplicacionResumen, type ModuloDelArbol, type ResumenImportacion, type TemaDelArbol,
} from '~/utils/contenidosCurso'

/**
 * Datos y acciones de «Contenidos del curso» (PAT-01: la vista no habla con la API). Mismo patrón que el panel del
 * admin (useGestionUsuarios) y Mensajes (useMensajes): la página organiza y las ventanas reciben solo lo que necesitan.
 */
export function useContenidosCurso() {
  const api = useApi()
  const { messageOf } = useApiErrorMessage()

  const clases = ref<ClaseDocente[]>([])
  const claseId = ref<number | null>(null)
  const modulos = ref<ModuloDelArbol[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)
  /** Avisos de lo que se hizo («Tema actualizado») y de lo que falló fuera de una ventana. */
  const aviso = ref<string | null>(null)
  const errorAccion = ref<string | null>(null)
  const clase = computed(() => clases.value.find((c) => c.id === claseId.value))
  const otrasClases = computed(() => clases.value.filter((c) => c.id !== claseId.value))

  /** Las clases del docente; abre la pedida (?classId) o la primera. */
  async function cargarClases(pedida?: number) {
    cargando.value = true
    error.value = null
    try {
      const c = await api.get<ClaseDocente[]>('/class/my-classes')
      clases.value = Array.isArray(c) ? c : []
      if (!clases.value.length) { cargando.value = false; return }
      claseId.value = clases.value.find((x) => x.id === pedida)?.id ?? clases.value[0].id
      await cargarModulos()
    } catch (err: unknown) {
      error.value = messageOf(err, 'No se pudieron cargar tus clases.')
      cargando.value = false
    }
  }

  /** Módulos de la clase con sus temas y lecciones. */
  async function cargarModulos() {
    if (!claseId.value) return
    cargando.value = true
    error.value = null
    try {
      const lista = await api.get<ModuloDelArbol[]>(`/sections/class/${claseId.value}`)
      const completos: ModuloDelArbol[] = []
      for (const m of Array.isArray(lista) ? lista : []) {
        const temas = await api.get<TemaDelArbol[]>(`/topic/section/${m.id}`).catch(() => [])
        completos.push({ ...m, topics: Array.isArray(temas) ? temas : [] })
      }
      modulos.value = completos
    } catch (err: unknown) {
      error.value = messageOf(err, 'No se pudieron cargar los contenidos de la clase.')
    } finally {
      cargando.value = false
    }
  }

  async function alternarPublicacion(m: ModuloDelArbol) {
    try {
      const nuevo = !m.isPublished
      await api.patch(`/sections/${m.id}/publish`, { isPublished: nuevo })
      m.isPublished = nuevo
      aviso.value = nuevo ? `«${m.title}» quedó publicado: los estudiantes ya lo ven.` : `«${m.title}» volvió a borrador: los estudiantes ya no lo ven.`
    } catch {
      errorAccion.value = 'No se pudo cambiar la publicación del módulo.'
    }
  }

  /** Guarda un tema; devuelve el mensaje de error o null. */
  async function guardarTema(temaId: number, d: DatosTema): Promise<string | null> {
    if (!d.title.trim()) return 'Ponle un título al tema.'
    try {
      await api.patch(`/topic/${temaId}`, { title: d.title.trim(), description: d.description.trim() || undefined, order: d.order })
      aplicarTema(modulos.value, temaId, d)
      aviso.value = `Tema «${d.title.trim()}» guardado.`
      return null
    } catch (err: unknown) {
      return messageOf(err, 'No se pudo guardar el tema.')
    }
  }

  async function archivarTema(t: TemaDelArbol): Promise<string | null> {
    try {
      await api.del(`/topic/${t.id}`)
      quitarTema(modulos.value, t.id)
      aviso.value = `Tema «${t.title}» archivado.`
      return null
    } catch (err: unknown) {
      return messageOf(err, 'No se pudo archivar el tema.')
    }
  }

  async function guardarLeccion(leccionId: number, d: DatosLeccion): Promise<string | null> {
    if (!d.title.trim()) return 'Ponle un título a la lección.'
    try {
      await api.patch(`/learning-unit/${leccionId}`, { title: d.title.trim(), description: d.description.trim() || undefined, difficulty: d.difficulty, order: d.order })
      aplicarLeccion(modulos.value, leccionId, d)
      aviso.value = `Lección «${d.title.trim()}» guardada.`
      return null
    } catch (err: unknown) {
      return messageOf(err, 'No se pudo guardar la lección.')
    }
  }

  // ─── Lo que tiene cada lección abierta ───
  const explicaciones = reactive<Record<number, ExplicacionResumen[]>>({})
  const ejercicios = reactive<Record<number, number>>({})
  async function cargarExplicaciones(leccionId: number) {
    const l = await api.get<ExplicacionResumen[]>(`/content/unit/${leccionId}/all`).catch(() => [])
    explicaciones[leccionId] = Array.isArray(l) ? l : []
  }

  // ─── Traer de otra clase o de una plantilla ───
  const plantillas = ref<Plantilla[]>([])
  async function cargarPlantillas() {
    const asignaturaId = clase.value?.asignaturaId
    plantillas.value = await api.get<Plantilla[]>(asignaturaId ? `/reuse/plantillas?asignaturaId=${asignaturaId}` : '/reuse/plantillas').catch(() => [])
  }
  watch(claseId, () => { void cargarPlantillas() }, { immediate: true })

  /** Módulos de la clase de origen (sirve para una clase propia y para una plantilla de otro docente). */
  async function modulosDeOrigen(origenId: number): Promise<Array<{ id: number; title: string; order: number }>> {
    const r = await api.get<Array<{ id: number; title: string; order: number }>>(`/reuse/classes/${origenId}/modulos`)
    return Array.isArray(r) ? r : []
  }

  async function importar(origenId: number, moduloIds: number[] | null): Promise<string | null> {
    if (!claseId.value) return 'Elige primero la clase a la que traes el contenido.'
    try {
      const r = await api.post<ResumenImportacion>(`/reuse/classes/${claseId.value}/import`, { sourceClassId: origenId, ...(moduloIds ? { sectionIds: moduloIds } : {}) })
      aviso.value = textoImportacion(r)
      await cargarModulos()
      return null
    } catch (err: unknown) {
      return messageOf(err, 'No se pudo traer el contenido.')
    }
  }

  return {
    clases, claseId, clase, otrasClases, modulos, cargando, error, aviso, errorAccion,
    cargarClases, cargarModulos, alternarPublicacion, guardarTema, archivarTema, guardarLeccion,
    explicaciones, ejercicios, cargarExplicaciones,
    plantillas, modulosDeOrigen, importar,
  }
}

export type EstadoContenidos = ReturnType<typeof useContenidosCurso>
export const CLAVE_CONTENIDOS: InjectionKey<EstadoContenidos> = Symbol('contenidos')
