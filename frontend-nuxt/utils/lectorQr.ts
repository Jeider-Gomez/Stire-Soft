// Leer un QR desde la cámara. Usa el lector del navegador (BarcodeDetector: Chrome en Android y Mac) y, donde no
// existe (Chrome en Windows, iPhone, Firefox), jsQR, que se descarga solo la primera vez que se abre la cámara.

export interface LectorQr {
  /** Los textos de los QR que se ven en este cuadro del video (vacío si ninguno). */
  leer(video: HTMLVideoElement): Promise<string[]>
}

interface Detector { detect(fuente: HTMLVideoElement): Promise<Array<{ rawValue: string }>> }
interface ConstructorDetector {
  new (opciones: { formats: string[] }): Detector
  getSupportedFormats?: () => Promise<string[]>
}

async function lectorNativo(): Promise<LectorQr | null> {
  const Nativo = (globalThis as unknown as { BarcodeDetector?: ConstructorDetector }).BarcodeDetector
  if (!Nativo) return null
  try {
    const formatos = await Nativo.getSupportedFormats?.()
    if (formatos && !formatos.includes('qr_code')) return null
    const lector = new Nativo({ formats: ['qr_code'] })
    return { leer: async (video) => (await lector.detect(video).catch(() => [])).map((h) => h.rawValue) }
  } catch {
    return null
  }
}

async function lectorJsQr(): Promise<LectorQr> {
  const { default: jsQR } = await import('jsqr')
  const lienzo = document.createElement('canvas')
  const ctx = lienzo.getContext('2d', { willReadFrequently: true })
  return {
    leer: async (video) => {
      if (!ctx || !video.videoWidth) return []
      // Reducido a 640 px de ancho: suficiente para un QR a un brazo de distancia y rápido en un celular sencillo.
      const escala = Math.min(1, 640 / video.videoWidth)
      lienzo.width = Math.round(video.videoWidth * escala)
      lienzo.height = Math.round(video.videoHeight * escala)
      ctx.drawImage(video, 0, 0, lienzo.width, lienzo.height)
      const imagen = ctx.getImageData(0, 0, lienzo.width, lienzo.height)
      const hallado = jsQR(imagen.data, lienzo.width, lienzo.height, { inversionAttempts: 'dontInvert' })
      return hallado?.data ? [hallado.data] : []
    },
  }
}

export async function crearLectorQr(): Promise<LectorQr> {
  return (await lectorNativo()) ?? (await lectorJsQr())
}

/** Si el navegador puede abrir la cámara (en http sin candado, o en navegadores muy viejos, no). */
export function hayCamara(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
}
