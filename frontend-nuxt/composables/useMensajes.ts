import { computed, ref, type InjectionKey } from 'vue'
import type { Bandeja, Mensaje } from '~/utils/mensajes'

/**
 * Datos y acciones de la bandeja de mensajes, iguales para el estudiante y el docente (PAT-01: la vista no habla con
 * la API). Cada página solo pone cómo se elige el destinatario.
 */
export function useMensajes() {
  const api = useApi()
  const { messageOf } = useApiErrorMessage()

  const bandeja = ref<Bandeja>('recibidos')
  const recibidos = ref<Mensaje[]>([])
  const enviados = ref<Mensaje[]>([])
  const noLeidos = ref(0)
  const cargando = ref(false)
  const error = ref<string | null>(null)
  const visibles = computed(() => (bandeja.value === 'recibidos' ? recibidos.value : enviados.value))

  async function cargar() {
    cargando.value = true
    error.value = null
    try {
      const [r, e, c] = await Promise.all([
        api.get<Mensaje[]>('/message/inbox'),
        api.get<Mensaje[]>('/message/sent'),
        api.get<{ count: number }>('/message/unread-count'),
      ])
      recibidos.value = Array.isArray(r) ? r : []
      enviados.value = Array.isArray(e) ? e : []
      noLeidos.value = c?.count || 0
    } catch (err: unknown) {
      error.value = messageOf(err, 'No se pudieron cargar los mensajes. Revisa tu conexión.')
    } finally {
      cargando.value = false
    }
  }

  async function marcarLeido(m: Mensaje) {
    if (m.isRead || !recibidos.value.includes(m)) return
    try {
      await api.patch(`/message/${m.id}/read`)
      m.isRead = true
      noLeidos.value = Math.max(0, noLeidos.value - 1)
    } catch { /* se reintenta al volver a abrir el mensaje */ }
  }

  async function marcarTodos() {
    await Promise.all(recibidos.value.filter((m) => !m.isRead).map((m) => marcarLeido(m)))
  }

  /** Envía y deja abierta la bandeja de enviados, donde se ve lo que se acaba de mandar. */
  async function enviar(receiverId: number, contenido: string): Promise<string | null> {
    if (!receiverId || !contenido.trim()) return 'Elige a quién escribirle y escribe el mensaje.'
    try {
      await api.post('/message', { receiverId, content: contenido.trim() })
      await cargar()
      bandeja.value = 'enviados'
      return null
    } catch (err: unknown) {
      return messageOf(err, 'No se pudo enviar el mensaje.')
    }
  }

  return { bandeja, recibidos, enviados, noLeidos, cargando, error, visibles, cargar, marcarLeido, marcarTodos, enviar }
}

export type EstadoMensajes = ReturnType<typeof useMensajes>

/** La página crea el estado y lo comparte con la bandeja (components/mensajes/BandejaMensajes.vue). */
export const CLAVE_MENSAJES: InjectionKey<EstadoMensajes> = Symbol('mensajes')

export interface Destinatario { id: number; nombre: string; detalle: string }

/** A quién puede escribirle cada rol: el estudiante, a los docentes de sus clases; el docente, a los estudiantes de una clase. */
export function useDestinatarios() {
  const api = useApi()

  async function docentesDelEstudiante(): Promise<Destinatario[]> {
    const filas = await api.get<Array<{ status: string; class?: { name: string; teacher?: { id: number; fullName: string } } }>>('/enrollment/my').catch(() => [])
    const vistos = new Set<number>()
    return (Array.isArray(filas) ? filas : []).flatMap((e) => {
      const t = e.status === 'active' ? e.class?.teacher : undefined
      if (!t || vistos.has(t.id)) return []
      vistos.add(t.id)
      return [{ id: t.id, nombre: t.fullName, detalle: e.class?.name ?? '' }]
    })
  }

  async function clasesDelDocente(): Promise<Array<{ id: number; name: string; code: string }>> {
    const c = await api.get<Array<{ id: number; name: string; code: string }>>('/class/my-classes').catch(() => [])
    return Array.isArray(c) ? c : []
  }

  async function estudiantesDeClase(classId: number): Promise<Destinatario[]> {
    const filas = await api.get<Array<{ studentId: number; status: string; student?: { fullName?: string; email?: string } }>>(`/enrollment/class/${classId}`).catch(() => [])
    return (Array.isArray(filas) ? filas : [])
      .filter((e) => e.status === 'active' && e.student)
      .map((e) => ({ id: e.studentId, nombre: e.student?.fullName || `Estudiante #${e.studentId}`, detalle: e.student?.email || '' }))
  }

  return { docentesDelEstudiante, clasesDelDocente, estudiantesDeClase }
}
