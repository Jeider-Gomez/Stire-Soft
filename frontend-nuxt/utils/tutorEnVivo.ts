// La respuesta del Tutor por partes (ítem 2 de la evaluación heurística; servidor: POST /tutor/chat/stream, SSE). Lee los
// eventos `data: {json}` a medida que llegan. Si el servidor no tiene esa ruta (404/405: el frontend se publicó antes que
// el backend), el llamador vuelve a /tutor/chat.

export type EventoTutor =
  | { tipo: 'trozo'; texto: string }
  | { tipo: 'fin'; message: string; suggestedActivity: unknown; guidanceLevel: 1 | 2 | 3 | null }
  | { tipo: 'error'; estado: number; mensaje: string }

/** Separa los eventos completos de lo que llegó y devuelve lo que quedó a medias para el siguiente trozo. */
export function leerEventos(acumulado: string): { eventos: EventoTutor[]; resto: string } {
  const bloques = acumulado.replace(/\r\n/g, '\n').split('\n\n')
  const resto = bloques.pop() ?? ''
  const eventos: EventoTutor[] = []
  for (const bloque of bloques) {
    const datos = bloque.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('')
    if (!datos) continue
    try {
      const e = JSON.parse(datos) as EventoTutor
      if (e && (e.tipo === 'trozo' || e.tipo === 'fin' || e.tipo === 'error')) eventos.push(e)
    } catch { /* un evento roto se ignora */ }
  }
  return { eventos, resto }
}

/** Error con la misma forma que lanza $fetch, para que friendlyTutorError lo traduzca igual. */
export class ErrorDelTutor extends Error {
  constructor(public statusCode: number, public data: { error?: string; message?: string } | null) {
    super(data?.message ?? data?.error ?? `HTTP ${statusCode}`)
  }
}

/**
 * Envía el mensaje y llama a `alRecibir` con cada trozo. Devuelve el evento `fin`, o null si el servidor no tiene la ruta
 * (para volver al chat de siempre). Lanza ErrorDelTutor con el código HTTP si el servidor respondió con un error.
 */
export async function enviarEnVivo(
  url: string,
  headers: Record<string, string>,
  cuerpo: unknown,
  alRecibir: (texto: string) => void,
): Promise<Extract<EventoTutor, { tipo: 'fin' }> | null> {
  const res = await fetch(url, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json', Accept: 'text/event-stream' }, body: JSON.stringify(cuerpo) })
  if (res.status === 404 || res.status === 405) return null
  if (!res.ok) throw new ErrorDelTutor(res.status, await res.json().catch(() => null))
  if (!res.body) return null
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let acumulado = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (value) acumulado += decoder.decode(value, { stream: !done })
    const { eventos, resto } = leerEventos(done ? acumulado + '\n\n' : acumulado)
    acumulado = resto
    for (const e of eventos) {
      if (e.tipo === 'trozo') alRecibir(e.texto)
      else if (e.tipo === 'fin') return e
      else throw new ErrorDelTutor(e.estado, { message: e.mensaje })
    }
    if (done) throw new ErrorDelTutor(503, { message: 'El Tutor se interrumpió. Inténtalo de nuevo.' })
  }
}
