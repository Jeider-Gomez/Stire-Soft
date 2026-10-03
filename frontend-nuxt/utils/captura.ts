// Pantallazo adjunto a una sugerencia: se toma del portapapeles (Ctrl+V), de un arrastre o de un archivo, y se reduce en
// el navegador antes de subirlo. Un pantallazo de 1920×1080 en PNG pesa 1 a 3 MB; reducido a 1600 px de ancho en JPG
// queda en unos 150 a 400 KB y el texto se sigue leyendo.

export const ANCHO_MAX_CAPTURA = 1600
export const MAX_BYTES_CAPTURA = 3 * 1024 * 1024
const TIPOS = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

export function esImagenAceptada(archivo: { type: string }): boolean {
  return TIPOS.includes(archivo.type)
}

/** La primera imagen de lo que se pegó o se soltó (un pantallazo copiado llega como archivo «image/png»). */
export function imagenDe(datos: DataTransfer | null | undefined): File | null {
  if (!datos) return null
  for (const item of Array.from(datos.items ?? [])) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const archivo = item.getAsFile()
      if (archivo) return archivo
    }
  }
  return Array.from(datos.files ?? []).find((f) => f.type.startsWith('image/')) ?? null
}

/** Tamaño final conservando la proporción: nunca más ancho que ANCHO_MAX_CAPTURA ni más grande que el original. */
export function medidaReducida(ancho: number, alto: number, max: number = ANCHO_MAX_CAPTURA): { ancho: number; alto: number } {
  if (ancho <= max) return { ancho, alto }
  return { ancho: max, alto: Math.round((alto * max) / ancho) }
}

export async function reducirCaptura(archivo: Blob): Promise<Blob> {
  const imagen = await createImageBitmap(archivo)
  const { ancho, alto } = medidaReducida(imagen.width, imagen.height)
  const lienzo = document.createElement('canvas')
  lienzo.width = ancho
  lienzo.height = alto
  const ctx = lienzo.getContext('2d')
  if (!ctx) throw new Error('Este navegador no puede preparar la imagen.')
  // Fondo blanco: un PNG con transparencia se vería negro en JPG.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, ancho, alto)
  ctx.drawImage(imagen, 0, 0, ancho, alto)
  imagen.close()
  return await new Promise<Blob>((resolve, reject) =>
    lienzo.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo preparar la imagen.'))), 'image/jpeg', 0.85),
  )
}

/** «Win + Shift + S» en Windows, «Cmd + Shift + 4» en Mac; en el celular, el botón de captura del teléfono. */
export function atajoDeCaptura(plataforma: string): string {
  if (/mac|iphone|ipad/i.test(plataforma)) return 'Cmd + Shift + 4'
  if (/android/i.test(plataforma)) return 'el botón de captura del celular'
  return 'Win + Shift + S'
}
