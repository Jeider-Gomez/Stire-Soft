import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { useApiErrorMessage } from '~/composables/useApiErrorMessage'
import { useAvisos } from '~/composables/useAvisos'
import type { AsignaturaInfo } from '~/utils/contextoAcademico'
import type { AlcancePlantilla } from '~/utils/plantillas'
import type { CategoriaLogro } from '~/utils/logros'

export interface EnrollmentItem {
  id: string
  status: string
  student?: { fullName?: string; email?: string; fotoId?: string | null }
}

export interface ClassInfo {
  id: number
  name: string
  code?: string
  description?: string
  isActive?: boolean
  requiresApproval?: boolean
  compartidaComoPlantilla?: boolean
  alcancePlantilla?: AlcancePlantilla
  enfoque?: string | null
  logrosActivos?: boolean
  categoriasLogro?: string | null
  dominioParaAvanzar?: number
  /** Motor del dominio: cada cuántas horas se reabre un intento con el límite usado (1 a 168). */
  horasParaReabrir?: number
  /** Si intermedio y avanzado pesan más en el dominio de la lección. */
  nivelesPesanDistinto?: boolean
  asignatura?: AsignaturaInfo | null
  grupo?: string | null
  periodo?: string | null
}

/**
 * Lógica y llamadas API de «Ajustes de clase» (PAT-01: ajustes.vue no llama a api.).
 * Fase 30: archivar/restaurar con rutas dedicadas, eliminar con VentanaEliminarClase y avisos en todas las acciones.
 */
export function useAjustesClase(classId: number) {
  const api = useApi()
  const { messageOf } = useApiErrorMessage()
  const { avisar } = useAvisos()

  const pending = ref<EnrollmentItem[]>([])
  const active = ref<EnrollmentItem[]>([])
  const classInfo = ref<ClassInfo | null>(null)
  const cargando = ref(true)
  const error = ref<string | null>(null)

  async function load() {
    cargando.value = true
    error.value = null
    try {
      const [pendingItems, allItems, classData] = await Promise.all([
        api.get<EnrollmentItem[]>(`/enrollment/class/${classId}/pending`),
        api.get<EnrollmentItem[]>(`/enrollment/class/${classId}`),
        api.get<ClassInfo>(`/class/${classId}`)
      ])
      pending.value = pendingItems
      active.value = allItems.filter((item) => item.status === 'active')
      classInfo.value = classData
      return classData
    } catch (err: unknown) {
      error.value = messageOf(err, 'No se pudieron cargar los datos de la clase.')
      return null
    } finally {
      cargando.value = false
    }
  }

  async function guardarDatos(body: Record<string, string | number | null>): Promise<ClassInfo> {
    const updated = await api.patch<ClassInfo>(`/class/${classId}`, body)
    classInfo.value = updated
    avisar({ tipo: 'exito', texto: 'Ajustes guardados.' })
    return updated
  }

  async function toggleRequiresApproval(): Promise<void> {
    if (!classInfo.value) return
    const nuevo = !classInfo.value.requiresApproval
    const updated = await api.patch<ClassInfo>(`/class/${classId}`, { requiresApproval: nuevo })
    classInfo.value = updated
    avisar({ tipo: 'exito', texto: nuevo ? 'Matrícula con aprobación activada.' : 'Matrícula directa activada.' })
  }

  async function cambiarMatricula(enrollment: EnrollmentItem, action: 'approve' | 'reject'): Promise<void> {
    const path = `/enrollment/${enrollment.id}/${action}`
    await api.patch(path, {})
    const nombre = enrollment.student?.fullName || enrollment.student?.email || 'Estudiante'
    avisar({
      tipo: 'exito',
      texto: action === 'approve'
        ? `Solicitud de «${nombre}» aprobada exitosamente.`
        : `Solicitud de «${nombre}» rechazada.`
    })
    await load()
  }

  async function quitarEstudiante(enrollment: EnrollmentItem): Promise<void> {
    const nombre = enrollment.student?.fullName || enrollment.student?.email || 'Estudiante'
    await api.del(`/enrollment/${enrollment.id}`)
    avisar({
      tipo: 'exito',
      texto: `Quitaste a ${nombre} de la clase.`,
      deshacer: async () => {
        try {
          await api.patch(`/enrollment/${enrollment.id}/approve`, {})
          await load()
          avisar({ tipo: 'exito', texto: `Se volvió a matricular a ${nombre}.` })
        } catch {
          avisar({ tipo: 'error', texto: 'No se pudo revertir: el estudiante debe matricularse de nuevo.' })
        }
      }
    })
    await load()
  }

  async function alternarArchivoClase(): Promise<boolean> {
    if (!classInfo.value) return false
    const archivar = classInfo.value.isActive !== false
    const endpoint = archivar ? `/class/${classId}/archivar` : `/class/${classId}/restaurar`
    const updated = await api.patch<ClassInfo>(endpoint, {})
    classInfo.value = updated
    avisar({
      tipo: 'exito',
      texto: archivar ? 'Clase archivada. Los estudiantes ya no la ven.' : 'Clase reactivada. Los estudiantes ya pueden acceder.'
    })
    return true
  }

  async function eliminarClase(): Promise<void> {
    await api.del(`/class/${classId}`)
    avisar({ tipo: 'exito', texto: 'Clase eliminada.' })
  }

  async function guardarLogros(cambio: { logrosActivos?: boolean; categoriasLogro?: CategoriaLogro[] }): Promise<void> {
    const updated = await api.patch<ClassInfo>(`/class/${classId}`, cambio)
    classInfo.value = updated
    avisar({
      tipo: 'exito',
      texto: cambio.logrosActivos === false ? 'Guardado: esta clase no usa logros.' : 'Logros guardados.'
    })
  }

  async function guardarCompartir(datos: { alcancePlantilla: AlcancePlantilla; enfoque: string | null }, tituloAlcance: string): Promise<void> {
    const updated = await api.patch<ClassInfo>(`/class/${classId}`, {
      alcancePlantilla: datos.alcancePlantilla,
      enfoque: datos.enfoque
    })
    classInfo.value = updated
    avisar({
      tipo: 'exito',
      texto: datos.alcancePlantilla === 'nadie' ? 'Guardado: no se comparte.' : `Guardado: la ven ${tituloAlcance.toLowerCase()}.`
    })
  }

  async function guardarAvance(v: number): Promise<void> {
    const updated = await api.patch<ClassInfo>(`/class/${classId}`, { dominioParaAvanzar: v })
    classInfo.value = updated
    avisar({
      tipo: 'exito',
      texto: v === 0 ? 'Guardado: los módulos ya no se bloquean.' : `Guardado: el siguiente módulo se abre con ${v} %.`
    })
  }

  /** Reglas del dominio de la clase (docs/DISENO_DOMINIO.md): opcionales; el docente decide. */
  async function guardarReglasDominio(r: { horasParaReabrir: number; nivelesPesanDistinto: boolean }): Promise<void> {
    classInfo.value = await api.patch<ClassInfo>(`/class/${classId}`, r)
  }

  return {
    pending,
    active,
    classInfo,
    cargando,
    error,
    load,
    guardarDatos,
    toggleRequiresApproval,
    cambiarMatricula,
    quitarEstudiante,
    alternarArchivoClase,
    eliminarClase,
    guardarLogros,
    guardarCompartir,
    guardarAvance,
    guardarReglasDominio,
  }
}

/** El estado y las acciones de «Ajustes de la clase»; la página lo crea y lo pasa a cada sección. */
export type EstadoAjustesClase = ReturnType<typeof useAjustesClase>
