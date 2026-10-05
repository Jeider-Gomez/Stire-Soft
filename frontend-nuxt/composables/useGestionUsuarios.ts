// Datos y acciones de la gestión de usuarios del admin, fuera de la vista (PAT-01: la pantalla muestra; el composable
// habla con la API). Lo crea la página y lo comparten sus componentes con provide/inject, así cada ventana trae su
// propio formulario pero todas actualizan la misma lista. docs/DISENO_ARQUITECTURA_FRONTEND.md.

import { inject, ref, type InjectionKey } from 'vue'
import { useApi } from '~/composables/useApi'
import { normalizarRol, type Rol, type SolicitudRol, type UsuarioAdmin } from '~/utils/adminUsuarios'

export function useGestionUsuarios() {
  const api = useApi()
  const { messageOf } = useApiErrorMessage()

  const usuarios = ref<UsuarioAdmin[]>([])
  const solicitudes = ref<SolicitudRol[]>([])
  const cargandoUsuarios = ref(false)
  const cargandoSolicitudes = ref(false)
  /** Mensajes de la última acción, arriba de la página. */
  const error = ref('')
  const exito = ref('')

  const mensajeDe = (e: unknown, porDefecto: string) => {
    const m = messageOf(e, porDefecto)
    return Array.isArray(m) ? m.join('. ') : m
  }
  const limpiarAvisos = () => { error.value = ''; exito.value = '' }
  const buscar = (id: number) => usuarios.value.find((u) => u.id === id)

  async function cargarUsuarios() {
    cargandoUsuarios.value = true
    error.value = ''
    try {
      const data = await api.get<UsuarioAdmin[]>('/users')
      if (Array.isArray(data)) usuarios.value = data
    } catch {
      error.value = 'No se pudieron cargar los usuarios de la base de datos.'
    } finally {
      cargandoUsuarios.value = false
    }
  }

  async function cargarSolicitudes() {
    cargandoSolicitudes.value = true
    try {
      const data = await api.get<SolicitudRol[]>('/role-requests')
      if (Array.isArray(data)) solicitudes.value = data
    } catch (e) {
      error.value = mensajeDe(e, 'Error al cargar las solicitudes de rol docente.')
    } finally {
      cargandoSolicitudes.value = false
    }
  }

  /** Cambia el rol; el resultado (bien o mal) queda en los avisos de la página. */
  async function cambiarRol(u: UsuarioAdmin, rol: Rol) {
    limpiarAvisos()
    try {
      const res = await api.patch<{ message: string }>(`/users/${u.id}/role`, { role: rol })
      const enLista = buscar(u.id)
      if (enLista) enLista.role = rol
      exito.value = res?.message || `Rol de ${u.fullName || u.email} actualizado a ${rol}.`
    } catch (e) {
      error.value = mensajeDe(e, 'Error al actualizar el rol del usuario.')
    }
  }

  async function decidirSolicitud(s: SolicitudRol, decision: 'approve' | 'reject', nota: string) {
    limpiarAvisos()
    try {
      await api.patch(`/role-requests/${s.id}`, { decision, ...(nota.trim() ? { note: nota.trim() } : {}) })
      s.status = decision === 'approve' ? 'approved' : 'rejected'
      s.reviewNote = nota.trim() || null
      s.reviewedAt = new Date().toISOString()
      if (decision === 'approve') {
        const u = buscar(s.user.id)
        if (u) u.role = 'docente'
      }
      exito.value = `Solicitud de ${s.user.fullName || s.user.email} ${decision === 'approve' ? 'aprobada' : 'rechazada'} exitosamente.`
    } catch (e) {
      error.value = mensajeDe(e, 'Error al procesar la decisión sobre la solicitud.')
    }
  }

  /** Registra a alguien; devuelve el error para mostrarlo dentro de la ventana (o null si salió bien). */
  async function registrarUsuario(f: { fullName: string; email: string; password: string; role: string }): Promise<string | null> {
    try {
      const nuevo = await api.post<UsuarioAdmin>('/users', { fullName: f.fullName.trim(), email: f.email.trim(), password: f.password })
      if (f.role && f.role !== 'estudiante') {
        await api.patch(`/users/${nuevo.id}/role`, { role: f.role })
        nuevo.role = f.role
      }
      nuevo.isActive = true
      nuevo.role = normalizarRol(nuevo.role)
      usuarios.value.unshift(nuevo)
      exito.value = `Usuario ${nuevo.fullName} (${nuevo.email}) registrado exitosamente.`
      return null
    } catch (e) {
      return mensajeDe(e, 'Error al registrar el usuario.')
    }
  }

  async function cambiarActivo(u: UsuarioAdmin): Promise<string | null> {
    const activo = u.isActive === false
    try {
      await api.patch(`/users/${u.id}`, { isActive: activo })
      u.isActive = activo
      const enLista = buscar(u.id)
      if (enLista) enLista.isActive = activo
      exito.value = `Usuario ${u.fullName || u.email} ${activo ? 'reactivado' : 'desactivado'} exitosamente.`
      return null
    } catch (e) {
      return mensajeDe(e, 'Error al actualizar el estado del usuario.')
    }
  }

  async function restablecerClave(u: UsuarioAdmin, clave: string): Promise<string | null> {
    try {
      await api.patch(`/users/${u.id}`, { password: clave })
      return null
    } catch (e) {
      return mensajeDe(e, 'Error al restablecer la contraseña.')
    }
  }

  return {
    usuarios, solicitudes, cargandoUsuarios, cargandoSolicitudes, error, exito, limpiarAvisos,
    cargarUsuarios, cargarSolicitudes, cambiarRol, decidirSolicitud, registrarUsuario, cambiarActivo, restablecerClave,
  }
}

export type GestionUsuarios = ReturnType<typeof useGestionUsuarios>
export const CLAVE_GESTION_USUARIOS: InjectionKey<GestionUsuarios> = Symbol('gestion-usuarios')

/** Para los componentes del panel: la gestión que creó la página. */
export function useGestionUsuariosDeLaPagina(): GestionUsuarios {
  const g = inject(CLAVE_GESTION_USUARIOS)
  if (!g) throw new Error('Este componente va dentro de la página de usuarios del admin.')
  return g
}
