import { useAuthStore } from '~/stores/auth'

export interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// P-6 (17/11): al abrir una pantalla, el menú, la barra y la página piden a veces lo mismo al mismo tiempo (las clases del
// docente salían 3 veces; en una lección, 4 pedidos salían dos veces). Un GET igual que ya está en camino no se repite:
// se espera el mismo y cada quien recibe su propia copia (así nadie cambia los datos del otro). Solo mientras está en
// camino: al terminar se olvida, y el siguiente pedido trae datos frescos.
const getsEnCamino = new Map<string, Promise<unknown>>()

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
      /** «blob» para pedir una imagen con el token (p. ej. el pantallazo de una sugerencia). */
      responseType?: 'blob'
      /** Para cancelar la espera (p. ej. «Detener» en el ejercicio). */
      signal?: AbortSignal
    } = {}
  ): Promise<T> {
    // Con un archivo (FormData) el navegador pone el Content-Type con su «boundary»; forzar JSON rompería la subida.
    const esArchivo = typeof FormData !== 'undefined' && options.body instanceof FormData
    const headers: Record<string, string> = {
      ...(esArchivo ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
      ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {})
    }

    try {
      return await $fetch<T>(`${baseUrl}${endpoint}`, {
        method: options.method || 'GET',
        headers,
        body: options.body as Record<string, unknown> | BodyInit | null | undefined,
        ...(options.responseType ? { responseType: options.responseType } : {}),
        ...(options.signal ? { signal: options.signal } : {})
      })
    } catch (error: unknown) {
      const err = error as { response?: { status?: number }; statusCode?: number; data?: { error?: string | string[]; message?: string }; message?: string }
      const status = err?.response?.status || err?.statusCode
      const msg = err?.data?.error || err?.data?.message || err?.message || 'Error desconocido'
      console.warn(`[STIRE API] ${options.method || 'GET'} ${endpoint} → ${status || 'sin respuesta'}: ${msg}`)
      throw error
    }
  }

  // Conveniencia: GET tipado
  function get<T>(endpoint: string): Promise<T> {
    const clave = `${authStore.token ?? ''} ${endpoint}`
    let enCamino = getsEnCamino.get(clave)
    if (!enCamino) {
      enCamino = apiFetch<T>(endpoint, { method: 'GET' }).finally(() => getsEnCamino.delete(clave))
      getsEnCamino.set(clave, enCamino)
    }
    return enCamino.then((r) => copiar(r as T))
  }

  // Conveniencia: POST tipado
  function post<T>(endpoint: string, body?: unknown, opciones: { signal?: AbortSignal } = {}) {
    return apiFetch<T>(endpoint, { method: 'POST', body, ...opciones })
  }

  // Conveniencia: PUT tipado
  function put<T>(endpoint: string, body?: unknown) {
    return apiFetch<T>(endpoint, { method: 'PUT', body })
  }

  // Conveniencia: PATCH tipado
  function patch<T>(endpoint: string, body?: unknown) {
    return apiFetch<T>(endpoint, { method: 'PATCH', body })
  }

  // Conveniencia: DELETE tipado
  function del<T>(endpoint: string) {
    return apiFetch<T>(endpoint, { method: 'DELETE' })
  }

  return {
    apiFetch,
    get,
    post,
    put,
    patch,
    del,
    baseUrl
  }
}

/** Copia de una respuesta JSON para que cada quien que la pidió tenga la suya. */
function copiar<T>(r: T): T {
  return r === null || typeof r !== 'object' ? r : structuredClone(r)
}
