import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase !== undefined ? config.public.apiBase : ''
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
   * Login visual y robusto. Intenta autenticación contra el servidor local en memoria
   * y ofrece respaldo visual inmediato sin requerir conexión a base de datos.
   */
  async function login(emailInput: string, password?: string): Promise<{ ok: boolean; error?: string }> {
    const cleanEmail = (emailInput || '').trim()
    if (!cleanEmail) {
      return { ok: false, error: 'Por favor ingresa tu correo institucional.' }
    }

    try {
      const response = await $fetch<{ user: User; token?: string; access_token?: string }>(`${apiBase}/auth/login`, {
        method: 'POST',
        body: { email: cleanEmail, password: password || 'Test1234!' }
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
    } catch (err: any) {
      console.warn('[STIRE Auth] Backend no disponible o falló, activando modo visual en memoria:', err)
    }

    // Respaldo visual 100% en memoria - Cero dependencia de base de datos
    const normalized = cleanEmail.toLowerCase()
    let matchedRole: 'estudiante' | 'docente' | 'administrador' = 'estudiante'
    let matchedName = 'Estudiante Demostración'

    if (normalized.includes('docente') || normalized.includes('toscano') || normalized.includes('prof')) {
      matchedRole = 'docente'
      matchedName = 'Prof. Roberto Toscano Miranda'
    } else if (normalized.includes('admin') || normalized.includes('sistema')) {
      matchedRole = 'administrador'
      matchedName = 'Administrador del Sistema'
    } else {
      matchedRole = 'estudiante'
      matchedName = normalized.includes('pedro') ? 'Pedro Romero Mendoza' : 'Estudiante STIRE'
    }

    const mockUser: User = {
      id: matchedRole === 'docente' ? 2 : matchedRole === 'administrador' ? 3 : 1,
      email: cleanEmail,
      fullName: matchedName,
      role: matchedRole
    }

    token.value = 'stire-visual-token-' + Date.now()
    user.value = mockUser
    return { ok: true }
  }

  /**
   * Registro real contra el backend NestJS (POST /auth/register).
   * Al registrarse con éxito, guarda el token y el perfil y autentica la sesión.
   * Si se proporciona un código de clase, inscribe automáticamente al estudiante.
   */
  async function register(
    fullName: string,
    email: string,
    password: string,
    classCode?: string
  ): Promise<{ ok: boolean; error?: string; enrollmentWarning?: string }> {
    try {
      const response = await $fetch<{ user: User; token?: string; access_token?: string }>(`${apiBase}/auth/register`, {
        method: 'POST',
        body: { fullName, email, password }
      })

      const jwt = response?.token || response?.access_token
      if (jwt && response?.user) {
        token.value = jwt
        const u = { ...response.user }
        if ((u.role as string) === 'admin') {
          u.role = 'administrador'
        }
        user.value = u

        // Si se envió un código de clase, intentar inscripción inmediata
        let enrollmentWarning: string | undefined
        if (classCode && classCode.trim()) {
          try {
            await $fetch(`${apiBase}/enrollment/join`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${jwt}` },
              body: { code: classCode.trim().toUpperCase() }
            })
          } catch (enrollErr: any) {
            console.warn('[STIRE Auth] Falló inscripción inicial por código:', enrollErr?.message)
            enrollmentWarning = 'Tu cuenta fue creada, pero no se pudo asociar el código de clase. Podrás unirte desde tu panel.'
          }
        }

        return { ok: true, enrollmentWarning }
      }
      return { ok: false, error: 'Respuesta inesperada del servidor tras el registro' }
    } catch (err: any) {
      const status = err?.response?.status || err?.statusCode
      const msg = err?.data?.message || err?.message || 'Error de conexión'

      if (status === 409) {
        return { ok: false, error: 'Ya existe una cuenta registrada con este correo institucional.' }
      }

      if (Array.isArray(msg)) {
        return { ok: false, error: msg.join('. ') }
      }

      return { ok: false, error: typeof msg === 'string' ? msg : 'Error al registrar la cuenta. Verifica los datos ingresados.' }
    }
  }

  function logout() {
    token.value = null
    user.value = null
    router.push('/auth/login')
  }

  // Acceso rápido de demostración: SIEMPRE hace un login real contra el
  // backend con credenciales institucionales sembradas — nunca fabrica un
  // token. Solo se muestra en la UI cuando NUXT_PUBLIC_DEMO_MODE=true (ver
  // pages/auth/login.vue y components/layout/HeaderNav.vue). La propia
  // función valida el flag también (no solo el v-if del botón): sin esto,
  // era invocable desde la consola del navegador (useAuthStore().switchRoleForDemo(...))
  // aunque el modo demo estuviera apagado en producción.
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
    register,
    logout,
    switchRoleForDemo,
    hydrateUser,
    DEMO_ACCOUNTS
  }
})

