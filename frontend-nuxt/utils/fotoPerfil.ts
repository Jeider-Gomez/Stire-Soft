// Foto de perfil opcional: iniciales cuando no hay foto, la dirección de la imagen y cómo se reduce antes de subirla.

/** «Laura Martínez Petro» → «LM»; sin nombre, «?». */
export function iniciales(nombre: string | null | undefined): string {
  const partes = (nombre ?? '').trim().split(/\s+/).filter(Boolean)
  if (!partes.length) return '?'
  return partes.slice(0, 2).map((p) => p[0]!.toUpperCase()).join('')
}

/** La foto se sirve desde la API: /media/<uuid>. Cualquier otro valor no es una foto válida. */
export function urlDeFoto(apiBase: string, fotoId: string | null | undefined): string | null {
  if (!fotoId || !/^[0-9a-f-]{36}$/.test(fotoId)) return null
  return `${apiBase.replace(/\/$/, '')}/media/${fotoId}`
}

export const LADO_FOTO = 256

/**
 * Recorte cuadrado del centro de la imagen y reducción a 256 × 256 en JPEG: una foto de celular de 4 MB queda en
 * ~20 KB, cabe de sobra en el límite de 1 MB y carga rápido en cualquier pantalla.
 */
export async function reducirFoto(archivo: Blob): Promise<Blob> {
  const imagen = await createImageBitmap(archivo)
  const lado = Math.min(imagen.width, imagen.height)
  const lienzo = document.createElement('canvas')
  lienzo.width = LADO_FOTO
  lienzo.height = LADO_FOTO
  const ctx = lienzo.getContext('2d')
  if (!ctx) throw new Error('Este navegador no puede preparar la foto.')
  ctx.drawImage(imagen, (imagen.width - lado) / 2, (imagen.height - lado) / 2, lado, lado, 0, 0, LADO_FOTO, LADO_FOTO)
  imagen.close()
  return await new Promise<Blob>((resolve, reject) =>
    lienzo.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo preparar la foto.'))), 'image/jpeg', 0.85),
  )
}
