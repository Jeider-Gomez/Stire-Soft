import { useAuthStore } from '~/stores/auth'

/** Formato de una lección que eligió el estudiante (perfil de aprendizaje, MOD-02; src/analytics/perfil-aprendizaje.ts). */
export type FormatoLeccion = 'diagrama' | 'video' | 'vivo' | 'pseudocodigo' | 'pasos' | 'escuchar'

/**
 * Registra en el servidor qué formato eligió el estudiante. Solo para estudiantes y sin esperar: si falla, la lección
 * sigue igual (es un dato del perfil, no algo que el estudiante necesite).
 */
export function useUsoFormatos() {
  const api = useApi()
  const auth = useAuthStore()
  function registrar(formato: FormatoLeccion) {
    if (auth.currentRole !== 'estudiante') return
    api.post('/analytics/formato', { formato }).catch(() => undefined)
  }
  return { registrar }
}
