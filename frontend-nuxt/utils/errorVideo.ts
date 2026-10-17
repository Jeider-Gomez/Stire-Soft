// Saber si un video de YouTube insertado no se puede ver (17/10, Jeider: «si un recurso no funciona, que muestre una
// alternativa»). El reproductor de YouTube avisa a la página con postMessage («onError» 2, 5, 100, 101 o 150: no existe,
// es privado o el autor no deja verlo fuera de YouTube) si la URL lleva enablejsapi=1 y la página le dice que escucha.
// Probado el 17/10 con un video inexistente: llega «onError: 150». Otros sitios (Drive, Docs, Vimeo…) no avisan:
// el navegador no deja ver qué pasa dentro de su recuadro, así que ahí quedan los enlaces «¿No carga?» y el Tutor.

const ORIGEN_YOUTUBE = /^https:\/\/www\.youtube(-nocookie)?\.com$/

/** Mensaje con el que la página le dice al reproductor que quiere sus avisos. */
export const MENSAJE_ESCUCHO = JSON.stringify({ event: 'listening', id: 1, channel: 'widget' })

/** La URL del video con los avisos activados; las que no son de YouTube quedan igual. */
export function conAvisoDeErrores(src: string, origenPagina: string): string {
  try {
    const url = new URL(src)
    if (!ORIGEN_YOUTUBE.test(url.origin) || !url.pathname.startsWith('/embed/')) return src
    url.searchParams.set('enablejsapi', '1')
    url.searchParams.set('origin', origenPagina)
    return url.toString()
  } catch {
    return src
  }
}

/** El código de error si el mensaje es un «onError» del reproductor de YouTube; si no, null. */
export function errorDelReproductor(datos: unknown, origen: string): number | null {
  if (!ORIGEN_YOUTUBE.test(origen) || typeof datos !== 'string') return null
  try {
    const d = JSON.parse(datos) as { event?: unknown; info?: unknown }
    return d.event === 'onError' && Number.isFinite(Number(d.info)) ? Number(d.info) : null
  } catch {
    return null
  }
}
