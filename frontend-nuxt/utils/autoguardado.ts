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
    case 'retrying': return 'Sin conexión por un momento: reintentando…'
    case 'error': return 'No se pudo guardar: se reintenta al seguir escribiendo'
    case 'sin-intentos': return 'Ya usaste tus intentos: lo que escribas no se guarda'
    default: return 'Se guarda solo mientras escribes'
  }
}
