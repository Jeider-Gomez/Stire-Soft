import { defineStore } from 'pinia'
import type { User } from '~/types'

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
   * Login real contra el backend NestJS (POST /auth/login). Sin fallback:
   * un fallo de red, timeout o error del servidor se reporta como fallo —
   * nunca se disfraza de éxito con un token falso. La autenticación real
   * solo puede terminar en dos estados: autenticado con un JWT que el
   * backend firmó, o no autenticado con un error explicado.
   */
  async function login(emailInput: string, password?: string): Promise<{ ok: boolean; error?: string }> {
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

      if (status === 401) {
        return { ok: false, error: 'Correo o contraseña incorrectos' }
      }

      console.warn('[STIRE Auth] Login falló:', msg)
      return { ok: false, error: 'No se pudo conectar con el servidor. Intenta de nuevo en unos segundos.' }
    }
  }

  function logout() {
    token.value = null
    user.value = null
    router.push('/auth/login')
  }

  // Acceso rápido de demostración: SIEMPRE hace un login real contra el
  // backend con credenciales institucionales sembradas — nunca fabrica un
  // token. Solo se muestra en la UI cuando NUXT_PUBLIC_DEMO_MODE=true
  // (ver pages/auth/login.vue y components/layout/HeaderNav.vue); fuera de
  // ese modo esta función existe pero ningún botón la invoca.
  const DEMO_ACCOUNTS: Record<'estudiante' | 'docente' | 'administrador', { email: string; password: string }> = {
    'estudiante':    { email: 'pedro.estudiante@unicor.edu.co', password: 'Test1234!' },
    'docente':       { email: 'roberto.toscano@unicor.edu.co',  password: 'Test1234!' },
    'administrador': { email: 'admin.sistema@unicor.edu.co',    password: 'Admin1234!' }
  }

  function switchRoleForDemo(role: 'estudiante' | 'docente' | 'administrador') {
    const account = DEMO_ACCOUNTS[role]
    return login(account.email, account.password)
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

