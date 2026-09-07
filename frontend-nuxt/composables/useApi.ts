import { useAuthStore } from '~/stores/auth'

export interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // Backend NestJS siempre en puerto 3001 (Nuxt corre en 3000)
  const baseUrl = config.public.apiBase || 'http://localhost:3001'

  async function apiFetch<T>(
    endpoint: string,
    options: {
      method?: HttpMethod
      body?: unknown
      headers?: Record<string, string>
    } = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {})
    }

    try {
      return await $fetch<T>(`${baseUrl}${endpoint}`, {
        method: options.method || 'GET',
        headers,
        body: options.body as Record<string, unknown> | BodyInit | null | undefined
      })
    } catch (error: unknown) {
      const err = error as { response?: { status?: number }; statusCode?: number; data?: { message?: string }; message?: string }
      const status = err?.response?.status || err?.statusCode
      const msg = err?.data?.message || err?.message || 'Error desconocido'
      console.warn(`[STIRE API] ${options.method || 'GET'} ${endpoint} → ${status || 'sin respuesta'}: ${msg}`)
      throw error
    }
  }

  // Conveniencia: GET tipado
  function get<T>(endpoint: string) {
    return apiFetch<T>(endpoint, { method: 'GET' })
  }

  // Conveniencia: POST tipado
  function post<T>(endpoint: string, body: unknown) {
    return apiFetch<T>(endpoint, { method: 'POST', body })
  }

  // Conveniencia: PUT tipado
  function put<T>(endpoint: string, body: unknown) {
    return apiFetch<T>(endpoint, { method: 'PUT', body })
  }

  return {
    apiFetch,
    get,
    post,
    put,
    baseUrl
  }
}
