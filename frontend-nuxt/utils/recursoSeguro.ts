// Segunda barrera de los recursos multimedia de una lección. El servidor ya arma la dirección de inserción desde una
// lista cerrada de sitios (src/content/recursos/normalizar-recurso.ts); aquí se vuelve a comprobar antes de ponerla en
// un iframe, por si un dato viejo o manipulado llegara a la pantalla.

/** Sitios que se pueden mostrar dentro de la lección. Debe coincidir con los que arma el servidor. */
const SITIOS_INSERTABLES = [
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'drive.google.com',
  'docs.google.com',
  'view.genial.ly',
  'www.canva.com',
  'scratch.mit.edu',
  'phet.colorado.edu',
  'view.officeapps.live.com',
  'onedrive.live.com',
]

/** La dirección para el iframe si es https y de un sitio permitido; si no, null (se muestra solo como enlace). */
export function urlInsertable(embedUrl: unknown): string | null {
  if (typeof embedUrl !== 'string') return null
  try {
    const url = new URL(embedUrl)
    return url.protocol === 'https:' && SITIOS_INSERTABLES.includes(url.hostname) ? url.toString() : null
  } catch {
    return null
  }
}

/** Un enlace para abrir en otra pestaña: solo http(s); cualquier otra cosa (javascript:, data:) no se enlaza. */
export function urlEnlace(url: unknown): string | null {
  if (typeof url !== 'string') return null
  try {
    const u = new URL(url)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null
  } catch {
    return null
  }
}

const IMAGEN_SUBIDA = /^\/media\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

/** Dirección de una imagen: una subida a STIRE (se le antepone la API) o una https de la web. */
export function urlImagen(url: unknown, apiBase: string): string | null {
  if (typeof url !== 'string') return null
  if (IMAGEN_SUBIDA.test(url)) return `${apiBase.replace(/\/$/, '')}${url}`
  try {
    const u = new URL(url)
    return u.protocol === 'https:' ? u.toString() : null
  } catch {
    return null
  }
}

/** Nombre del proveedor, en palabras del docente. */
export const NOMBRE_PROVEEDOR: Record<string, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  google_drive: 'Google Drive',
  google_docs: 'Documento de Google',
  google_slides: 'Presentación de Google',
  google_sheets: 'Hoja de cálculo de Google',
  google_forms: 'Formulario de Google',
  genially: 'Genially',
  canva: 'Canva',
  scratch: 'Scratch',
  phet: 'Simulación PhET',
  office: 'Documento de Office',
  pdf: 'PDF',
  enlace: 'Enlace'
}
