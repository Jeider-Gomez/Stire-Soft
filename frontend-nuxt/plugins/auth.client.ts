/**
 * plugins/auth.client.ts
 * Plugin del lado cliente que hidrata el usuario desde el backend
 * cuando hay una cookie auth_token pero no hay datos de usuario en memoria.
 *
 * Esto cubre el caso de recarga de página (F5): la cookie persiste,
 * Pinia se reinicia vacío → este plugin llama a GET /auth/profile para
 * recuperar el perfil del usuario antes de que el middleware auth.ts evalúe.
 */
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  await authStore.hydrateUser()
})
