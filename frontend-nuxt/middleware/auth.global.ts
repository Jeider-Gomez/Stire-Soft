/**
 * middleware/auth.ts
 * Protección de rutas y redirección por rol (Insumo 15 §5).
 *
 * Reglas:
 *  - Rutas públicas (/auth/*): accesibles sin token
 *  - Rutas /estudiante/*: solo rol 'estudiante'
 *  - Rutas /docente/*:    solo rol 'docente'
 *  - Rutas /admin/*:      solo rol 'administrador'
 *  - Raíz (/):            redirige automáticamente al dashboard del rol activo
 */
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  const isPublicRoute = to.path.startsWith('/auth')

  // 1. Ruta pública — siempre permitida
  if (isPublicRoute) {
    // Si ya está autenticado y va al login, redirigir al dashboard del rol
    if (authStore.isAuthenticated && to.path === '/auth/login') {
      return navigateTo(getDashboardForRole(authStore.currentRole))
    }
    return
  }

  // 2. Sin token → redirigir al login
  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }

  const role = authStore.currentRole

  // 3. Redirigir la raíz al dashboard correspondiente al rol
  if (to.path === '/') {
    return navigateTo(getDashboardForRole(role))
  }

  // 4. Protección por rol: verificar que el rol tiene acceso a la ruta
  if (to.path.startsWith('/estudiante') && role !== 'estudiante') {
    return navigateTo(getDashboardForRole(role))
  }
  if (to.path.startsWith('/docente') && role !== 'docente') {
    return navigateTo(getDashboardForRole(role))
  }
  if (to.path.startsWith('/admin') && role !== 'administrador') {
    return navigateTo(getDashboardForRole(role))
  }
})

/**
 * Retorna la ruta de inicio según el rol del usuario.
 */
function getDashboardForRole(role: string): string {
  switch (role) {
    case 'docente':       return '/docente'
    case 'administrador': return '/admin'
    default:              return '/estudiante'
  }
}
