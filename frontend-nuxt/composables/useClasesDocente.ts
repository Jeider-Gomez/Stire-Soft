import { computed, ref, type InjectionKey } from 'vue'
import type { AsignaturaInfo } from '~/utils/contextoAcademico'
import type { Plantilla } from '~/utils/plantillas'
import { normalizarCodigo } from '~/utils/codigoClase'

export interface ClaseDelDocente {
  id: number
  code: string
  name: string
  description?: string
  isActive: boolean
  requiresApproval?: boolean
  enrollmentCount?: number
  avgMastery?: number
  atRiskCount?: number
  asignatura?: AsignaturaInfo | null
  grupo?: string | null
  periodo?: string | null
}

export interface DatosClaseNueva {
  name: string
  code: string
  description: string
  requiresApproval: boolean
  sourceClassId: number | null
  asignatura: AsignaturaInfo | null
  grupo: string
  periodo: string
}

/**
 * Datos y acciones del inicio del docente (PAT-01): sus clases con sus cifras, los mensajes sin leer, las plantillas para
 * empezar una clase y crear una. La página organiza y la ventana «Crear clase» usa estas funciones.
 */
export function useClasesDocente() {
  const api = useApi()
  const { messageOf } = useApiErrorMessage()

  const clases = ref<ClaseDelDocente[]>([])
  const cargando = ref(false)
  const noLeidos = ref<number | null>(null)
  const plantillas = ref<Plantilla[]>([])

  async function cargarClases() {
    cargando.value = true
    try {
      const r = await api.get<ClaseDelDocente[]>('/class/my-classes')
      if (Array.isArray(r)) clases.value = r
    } catch {
      /* sin red: se queda con lo que había; el estado vacío lo dice */
    } finally {
      cargando.value = false
    }
  }

  async function cargarNoLeidos() {
    try {
      noLeidos.value = (await api.get<{ count: number }>('/message/unread-count'))?.count ?? 0
    } catch { /* sin dato: la tarjeta muestra «—», nunca un número inventado */ }
  }

  /** Con la asignatura elegida, el servidor ordena por cercanía y muestra lo compartido con esa asignatura o su programa. */
  async function cargarPlantillas(asignaturaId?: number) {
    plantillas.value = await api.get<Plantilla[]>(asignaturaId ? `/reuse/plantillas?asignaturaId=${asignaturaId}` : '/reuse/plantillas').catch(() => [])
  }

  /** ¿Sirve el código y está libre? Dos clases nunca comparten código. */
  async function revisarCodigo(texto: string) {
    return api.get<{ codigo: string; disponible: boolean; motivo: string | null }>(`/class/codigo-disponible?codigo=${encodeURIComponent(texto)}`)
  }

  /**
   * Crea la clase y, si se eligió, copia el contenido de otra. Devuelve el aviso para mostrar o el error. Si la clase se
   * creó pero la copia falló, es un aviso (no un error): volver a pulsar «Crear» crearía otra clase.
   */
  async function crearClase(d: DatosClaseNueva): Promise<{ aviso: string } | { error: string }> {
    if (!d.name.trim() || !d.code.trim()) return { error: 'Escribe el nombre y el código de la clase.' }
    try {
      const nueva = await api.post<ClaseDelDocente>('/class', {
        name: d.name.trim(),
        code: normalizarCodigo(d.code),
        description: d.description.trim() || undefined,
        requiresApproval: d.requiresApproval,
        asignaturaId: d.asignatura?.id,
        grupo: d.grupo.trim() || undefined,
        periodo: d.periodo.trim() || undefined,
      })
      void useContextoDocente().recargar() // la barra superior toma la asignatura nueva
      let aviso = `Clase «${nueva.name}» creada con el código ${nueva.code}.`
      if (d.sourceClassId) {
        try {
          await api.post(`/reuse/classes/${nueva.id}/import`, { sourceClassId: d.sourceClassId })
        } catch (err: unknown) {
          aviso = `Clase «${nueva.name}» creada con el código ${nueva.code}, pero no se pudo copiar el contenido (${messageOf(err, 'error del servidor')}). Tráelo desde Contenidos con «Traer de otra clase».`
        }
      }
      await cargarClases()
      return { aviso }
    } catch (err: unknown) {
      return { error: messageOf(err, 'No se pudo crear la clase.') }
    }
  }

  async function restaurarClase(id: number): Promise<void> {
    await api.patch(`/class/${id}/restaurar`, {})
    const c = clases.value.find((x) => x.id === id)
    if (c) c.isActive = true
    const { avisar } = useAvisos()
    avisar({ tipo: 'exito', texto: 'Clase reactivada.' })
  }

  async function archivarClase(id: number): Promise<void> {
    await api.patch(`/class/${id}/archivar`, {})
    const c = clases.value.find((x) => x.id === id)
    if (c) c.isActive = false
    const { avisar } = useAvisos()
    avisar({ tipo: 'exito', texto: 'Clase archivada.' })
  }

  // Cifras del encabezado, de todas sus clases.
  const totalEstudiantes = computed(() => clases.value.reduce((s, c) => s + (c.enrollmentCount ?? 0), 0))
  const dominioPromedio = computed(() => {
    const con = clases.value.filter((c) => c.avgMastery !== undefined)
    return con.length ? Math.round(con.reduce((s, c) => s + (c.avgMastery ?? 0), 0) / con.length) : 0
  })
  const enRezago = computed(() => clases.value.reduce((s, c) => s + (c.atRiskCount ?? 0), 0))

  return {
    clases, cargando, noLeidos, plantillas,
    cargarClases, cargarNoLeidos, cargarPlantillas, revisarCodigo, crearClase,
    restaurarClase, archivarClase,
    totalEstudiantes, dominioPromedio, enRezago,
  }
}

export type EstadoClasesDocente = ReturnType<typeof useClasesDocente>
export const CLAVE_CLASES_DOCENTE: InjectionKey<EstadoClasesDocente> = Symbol('clases-docente')
