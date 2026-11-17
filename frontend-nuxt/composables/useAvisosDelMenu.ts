import { useAuthStore } from '~/stores/auth'

/**
 * P-2 y P-4 (17/11): lo que el menú avisa sin entrar a cada pantalla.
 *  · Estudiante: «Abierta» en Mi asistencia mientras el profe toma asistencia y aún no la marcó (una sesión abierta
 *    sin registro llega de /asistencia/mia con `estado: null`).
 *  · Administrador: cuántas solicitudes de rol esperan y cuántas sugerencias son nuevas.
 * Se pregunta al abrir y al cambiar de pantalla, como mucho una vez por minuto: así no pesa en el servidor.
 */
const CADA_MS = 60_000

export function avisosDeAsistencia(clases: Array<{ sesiones?: Array<{ estado: string | null }> }>): boolean {
  return clases.some((c) => (c.sesiones ?? []).some((s) => s.estado === null))
}

export function useAvisosDelMenu() {
  const api = useApi()
  const authStore = useAuthStore()
  const route = useRoute()
  const asistenciaAbierta = useState('menu-asistencia-abierta', () => false)
  const solicitudesRol = useState('menu-solicitudes-rol', () => 0)
  const sugerenciasNuevas = useState('menu-sugerencias-nuevas', () => 0)
  const ultima = useState('menu-avisos-ultima', () => 0)

  async function actualizar(forzar = false) {
    if (!authStore.token || (!forzar && Date.now() - ultima.value < CADA_MS)) return
    ultima.value = Date.now()
    if (authStore.currentRole === 'estudiante') {
      const clases = await api.get<Array<{ sesiones?: Array<{ estado: string | null }> }>>('/asistencia/mia').catch(() => null)
      if (Array.isArray(clases)) asistenciaAbierta.value = avisosDeAsistencia(clases)
    } else if (authStore.currentRole === 'admin') {
      const [roles, sugerencias] = await Promise.all([
        api.get<unknown[]>('/role-requests?status=pending').catch(() => null),
        api.get<unknown[]>('/reportes?estado=nuevo').catch(() => null),
      ])
      if (Array.isArray(roles)) solicitudesRol.value = roles.length
      if (Array.isArray(sugerencias)) sugerenciasNuevas.value = sugerencias.length
    }
  }

  /** Para el menú: empieza a preguntar y vuelve a hacerlo al cambiar de pantalla (o enseguida, al salir de la que lo resuelve). */
  function seguir() {
    onMounted(() => actualizar(true))
    watch(() => route.path, (nueva, antes) => {
      const resuelve = ['/estudiante/asistencia', '/admin', '/admin/sugerencias'].includes(antes ?? '')
      actualizar(resuelve)
    })
  }

  return { asistenciaAbierta, solicitudesRol, sugerenciasNuevas, actualizar, seguir }
}
