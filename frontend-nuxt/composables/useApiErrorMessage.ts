/**
 * useApiErrorMessage — extrae { status, detail } de un error capturado por ofetch.
 *
 * El backend de STIRE responde con { statusCode, timestamp, path, error }
 * (ver src/common/filters/http-exception.filter.ts). El texto va en `error`,
 * no en `message`. Patrón correcto ya en uso: stores/auth.ts:47.
 *
 * `detail` nunca contiene URLs, mensajes crudos de ofetch ni `err.message`.
 */
export function useApiErrorMessage() {
  function extract(err: any): { status: number; detail: string } {
    const status: number =
      err?.response?.status ?? err?.statusCode ?? err?.status ?? 0

    // El backend manda 'error' como string o string[]
    const raw = err?.data?.error ?? err?.data?.message ?? null
    let detail = ''

    if (Array.isArray(raw)) {
      detail = raw.join('. ')
    } else if (typeof raw === 'string' && raw.trim()) {
      detail = raw.trim()
    }

    return { status, detail }
  }

  /**
   * Texto para mostrar cuando falla una acción: el motivo que dio el servidor (`error`/`message`) o, si no
   * hay, `fallback`. Nunca devuelve el texto crudo de ofetch (`[POST] "http://…": 409 Conflict`).
   */
  function messageOf(err: any, fallback: string): string {
    const { status, detail } = extract(err)
    if (detail) return detail
    if (status === 0) return 'No pude conectarme con el servidor. Revisa tu conexión e inténtalo de nuevo.'
    return fallback
  }

  /**
   * Devuelve el mensaje amigable para el estudiante según el código HTTP.
   * Los textos para 422, 428, 429 y 503 vienen del backend (field `error`);
   * si no existen, se usa el texto de la tabla del §18.1.
   */
  function friendlyTutorError(err: any): {
    status: number
    text: string
    /** true si el error es 428 o 422 (abrir panel de clave) */
    needsKey: boolean
    /** true si el error es 403 (Tutor desactivado: no mostrar Reintentar) */
    is403: boolean
  } {
    const { status, detail } = extract(err)

    const needsKey = status === 428 || status === 422
    const is403 = status === 403

    let text: string
    switch (status) {
      case 428:
        text = detail || 'Necesitas configurar tu clave de Google AI Studio para usar el Tutor.'
        break
      case 422:
        text = detail || 'Tu clave de Google AI Studio es inválida o fue revocada. Cámbiala para continuar.'
        break
      case 403:
        text = detail || 'Tu docente desactivó el Tutor en esta parte del curso.'
        break
      case 429:
        text = detail || 'Llegaste al límite gratuito por ahora. Espera un momento e inténtalo de nuevo.'
        break
      case 503:
        text = detail || 'El tutor no está disponible en este momento. Inténtalo de nuevo en un minuto.'
        break
      case 0:
        // Sin respuesta (red caída)
        text = 'No pude conectarme. Revisa tu conexión e inténtalo de nuevo.'
        break
      default:
        text = 'Algo salió mal al consultar al tutor. Inténtalo de nuevo.'
    }

    return { status, text, needsKey, is403 }
  }

  return { extract, messageOf, friendlyTutorError }
}
