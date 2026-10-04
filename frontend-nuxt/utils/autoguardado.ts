// Autoguardado del código mientras el estudiante escribe (QA-07 del reporte de Jorge, 02/10).
// Antes, con los intentos ya usados, cada tecla pedía abrir un intento nuevo, el servidor lo negaba y salía en rojo
// «No se pudo autoguardar»; y un fallo pasajero de red tampoco se volvía a intentar.

export type EstadoAutoguardado = 'idle' | 'saving' | 'saved' | 'retrying' | 'error' | 'sin-intentos'

// Con un intento abierto se guarda siempre; sin él, solo si todavía queda un intento por abrir (0 = sin límite).
export function puedeAutoguardar(o: { hayIntentoAbierto: boolean; usados: number; permitidos: number }): boolean {
  return o.hayIntentoAbierto || o.permitidos <= 0 || o.usados < o.permitidos
}

export const ESPERAS_REINTENTO_MS = [2000, 5000, 10000]

// Milisegundos antes del siguiente reintento, o null si no se reintenta. Un error 4xx (salvo 408 y 429) es una
// respuesta del servidor que no cambia al repetir; sin respuesta, 5xx, 408 o 429 sí se reintentan.
export function esperaReintento(intento: number, status: number | undefined): number | null {
  if (status !== undefined && status >= 400 && status < 500 && status !== 408 && status !== 429) return null
  return ESPERAS_REINTENTO_MS[intento] ?? null
}

export function textoAutoguardado(estado: EstadoAutoguardado, hora: string): string {
  switch (estado) {
    case 'saving': return 'Guardando…'
    case 'saved': return `Guardado a las ${hora} ✔`
    case 'retrying': return 'Sin conexión: tu código queda en este equipo; reintentando…'
    case 'error': return 'No se pudo guardar: se reintenta al seguir escribiendo'
    case 'sin-intentos': return 'Ya usaste tus intentos: tu código queda solo en este equipo'
    default: return 'Se guarda solo mientras escribes'
  }
}

// Copia local del código (UX-06 y MOB-04 de la lista de chequeo). El autoguardado del servidor no se leía al volver a
// abrir el ejercicio: con un F5, un corte de red o el celular sin señal se perdía lo escrito. La copia vive en este
// navegador, por estudiante y por ejercicio, y se recupera al abrirlo de nuevo.
export interface Borrador { code?: string; html?: string; css?: string; at: number }

type Almacen = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function claveBorrador(userId: number | string, activityId: number): string {
  return `stire:borrador:${userId}:${activityId}`
}

export function guardarBorrador(almacen: Almacen | null, clave: string, datos: Omit<Borrador, 'at'>, ahora = Date.now()): void {
  try { almacen?.setItem(clave, JSON.stringify({ ...datos, at: ahora })) } catch { /* almacenamiento lleno o bloqueado: no es crítico */ }
}

export function leerBorrador(almacen: Almacen | null, clave: string): Borrador | null {
  try {
    const crudo = almacen?.getItem(clave)
    if (!crudo) return null
    const b = JSON.parse(crudo) as Borrador
    const texto = (v: unknown) => v === undefined || typeof v === 'string'
    return typeof b.at === 'number' && texto(b.code) && texto(b.html) && texto(b.css) ? b : null
  } catch {
    return null
  }
}

export function borrarBorrador(almacen: Almacen | null, clave: string): void {
  try { almacen?.removeItem(clave) } catch { /* nada que hacer */ }
}

/** Solo se recupera si el borrador trae algo distinto de la plantilla: si no, no hay nada que avisar. */
export function borradorDistinto(b: Borrador | null, plantilla: { code?: string; html?: string; css?: string }): boolean {
  if (!b) return false
  return (b.code !== undefined && b.code !== plantilla.code) || (b.html !== undefined && b.html !== plantilla.html) || (b.css !== undefined && b.css !== plantilla.css)
}
