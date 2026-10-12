// Arrastrar y soltar: cómo se ve cada zona mientras se mueve una pieza (hallazgo de José, 09/10: «las zonas de destino no
// reaccionan al pasar la pieza»). Tres estados, con borde, fondo y texto, no solo color (WCAG 1.4.1):
// - «encima»: la pieza está sobre esta zona; al soltar, cae aquí.
// - «disponible»: hay una pieza en la mano (arrastrándola o tocada en el celular) y esta zona puede recibirla.
// - «normal»: nada en la mano.

export type EstadoZona = 'encima' | 'disponible' | 'normal'

export function estadoZona(zona: string, e: { sobre: string | null; arrastrando: string | null; seleccionado: string | null }): EstadoZona {
  if (e.arrastrando && e.sobre === zona) return 'encima'
  if (e.arrastrando || e.seleccionado) return 'disponible'
  return 'normal'
}

/**
 * `dragleave` también salta al pasar sobre un hijo de la zona (el título o una pieza ya puesta): el resaltado parpadeaba
 * y se apagaba con la pieza todavía encima. Solo se sale de verdad si el puntero va a algo que no está dentro de la zona.
 */
export function saleDeLaZona(zona: { contains(otro: unknown): boolean } | null, haciaDonde: unknown): boolean {
  if (!zona || !haciaDonde) return true
  return !zona.contains(haciaDonde)
}
