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

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // Si hay cookie de token pero Pinia todavía no tiene el user en memoria
  // (recarga de página), hidratar ANTES de decidir la ruta. plugins/auth.client.ts
  // hace lo mismo, pero depender de que ese plugin termine antes de que este
  // middleware corra es una carrera real: en una recarga se veía un parpadeo
  // real hacia /auth/login antes de volver al dashboard (verificado con
  // Playwright). hydrateUser() es idempotente -- si ya hay user, no hace nada.
  if (authStore.token && !authStore.user) {
    await authStore.hydrateUser()
  }

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
