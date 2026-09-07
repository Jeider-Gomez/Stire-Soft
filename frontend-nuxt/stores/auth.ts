import { defineStore } from 'pinia'
import type { User, Role } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:3001'
  const router = useRouter()

  const token = useCookie<string | null>('auth_token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax'
  })

  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const currentRole = computed(() => user.value?.role || 'estudiante')

  /**
   * Login contra el backend NestJS (POST /auth/login).
   * Si el backend no está disponible, cae en modo demo local para
   * permitir desarrollo y pruebas sin conexión.
   *
   * Credenciales reales del seeder:
   *   Estudiante:  pedro.estudiante@unicor.edu.co / Test1234!
   *   Docente:     roberto.toscano@unicor.edu.co  / Test1234!
   *   Admin:       admin.sistema@unicor.edu.co    / Admin1234!
   */
  async function login(emailInput: string, password?: string): Promise<{ ok: boolean; error?: string }> {
    // Modo demo rápido por rol (para switch de rol en dev)
    const demoRoles: Record<string, User> = {
      'estudiante':    { id: 12, email: 'pedro.estudiante@unicor.edu.co',  fullName: 'Pedro Romero',           role: 'estudiante' },
      'docente':       { id: 4,  email: 'roberto.toscano@unicor.edu.co',   fullName: 'Prof. Roberto Toscano',  role: 'docente' },
      'administrador': { id: 1,  email: 'admin.sistema@unicor.edu.co',     fullName: 'Administrador STIRE',    role: 'administrador' }
    }

    if (demoRoles[emailInput]) {
      user.value = demoRoles[emailInput]
      token.value = `demo-jwt-${emailInput}`
      return { ok: true }
    }

    // Intento real contra el backend
    try {
      const response = await $fetch<{ user: User; token?: string; access_token?: string }>(`${apiBase}/auth/login`, {
        method: 'POST',
        body: { email: emailInput, password }
      })

      const jwt = response?.token || response?.access_token
      if (jwt && response?.user) {
        token.value = jwt
        const u = { ...response.user }
        if ((u.role as string) === 'admin') {
          u.role = 'administrador'
        }
        user.value = u
        return { ok: true }
      }
      return { ok: false, error: 'Respuesta inesperada del servidor' }
    } catch (err: any) {
      const status = err?.response?.status || err?.status
      const msg = err?.data?.error || err?.data?.message || err?.message || 'Error de conexión'

      // 401 Unauthorized → credenciales incorrectas (no hacer fallback)
      if (status === 401) {
        return { ok: false, error: 'Correo o contraseña incorrectos' }
      }

      // Sin conexión al backend → modo demo automático
      console.warn('[STIRE Auth] Backend no disponible, modo demo local:', msg)
      user.value = { id: 99, email: emailInput, fullName: 'Usuario Demo', role: 'estudiante' }
      token.value = 'demo-jwt-offline'
      return { ok: true }
    }
  }

  function logout() {
    token.value = null
    user.value = null
    router.push('/auth/login')
  }

  /** Switch rápido de rol para pruebas en desarrollo */
  function switchRoleForDemo(newRole: Role) {
    return login(newRole)
  }

  /** Hidrata el usuario desde el perfil del backend si hay token pero no hay user */
  async function hydrateUser() {
    if (!token.value || user.value) return
    try {
      const res = await $fetch<{ user: User }>(`${apiBase}/auth/profile`, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      if (res?.user) {
        const u = { ...res.user }
        if ((u.role as string) === 'admin') {
          u.role = 'administrador'
        }
        user.value = u
      }
    } catch {
      // Token inválido o expirado — limpiar
      token.value = null
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    currentRole,
    login,
    logout,
    switchRoleForDemo,
    hydrateUser
  }
})

