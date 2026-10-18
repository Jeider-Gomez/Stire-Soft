// La voz del Tutor (UI-05, Jeider 17/10: «poder escuchar lo que dice el Tutor y mandarle un audio, con una voz más
// humana»). Escuchar y dictar usan las voces del navegador (Web Speech API): sin costo y sin claves. Las más humanas son
// las «Natural» de Microsoft Edge y las de Google en Chrome; utils/escucharLeccion.ts ya las pone primero.

import { textoParaVoz } from '~/utils/escucharLeccion'

/** Lo que se lee de una respuesta del Tutor: sin código (se avisa que está en el chat) ni marcas de formato. */
export function textoDeMensaje(markdown: string): string {
  const sinCodigo = markdown
    .replace(/```[\s\S]*?```/g, ' (te dejé un código en el chat) ')
    .replace(/`([^`]+)`/g, '$1')
  const sinMarcas = sinCodigo
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/[*_~]+/g, '')
  return textoParaVoz(sinMarcas)
}

/** Si el navegador tiene alguna voz en español que suene humana (para sugerir Edge cuando no la hay). */
export function hayVozNatural(voces: ReadonlyArray<{ lang: string; name?: string }>): boolean {
  return voces.some((v) => /^es\b/i.test(v.lang.replace('_', '-')) && /natural|neural|online|premium|enhanced|mejorada|google/i.test(v.name ?? ''))
}

/** Lo dictado hasta ahora: lo que ya estaba escrito más lo que va reconociendo, con un espacio entre ambos. */
export function unirDictado(escrito: string, dictado: string): string {
  const a = escrito.trimEnd()
  const b = dictado.trim()
  return a && b ? `${a} ${b}` : a || b
}

/**
 * Qué decirle al estudiante cuando el dictado falla (Jeider, 17/10: «no he podido hablar con el chatbot con la voz»).
 * Antes el aviso solo lo oía un lector de pantalla: en la pantalla no pasaba nada y parecía que el botón no servía.
 */
export function mensajeErrorVoz(error: string): string | null {
  switch (error) {
    case 'aborted':
      return null
    case 'no-speech':
      return 'No te escuché. Toca el micrófono y habla cerca de él.'
    case 'not-allowed':
    case 'NotAllowedError':
      return 'El navegador no dio permiso para el micrófono. Actívalo en el candado de la barra de direcciones.'
    case 'audio-capture':
    case 'NotFoundError':
      return 'No encontré un micrófono conectado.'
    case 'network':
      return 'Este navegador no puede convertir la voz en texto. Prueba en Chrome o Edge.'
    default:
      return 'No se pudo escuchar. Intenta de nuevo o escribe tu pregunta.'
  }
}

/**
 * Cómo se dicta (17/10): primero el dictado del navegador, que escribe mientras se habla (en el celular funciona, porque
 * usa el reconocimiento del teléfono). Si en ese navegador no sirve (Brave no trae el servicio de Google y da error de
 * red), se graba el audio y Gemini lo pasa a texto con la clave del estudiante (POST /tutor/transcribir).
 */
export function modoDeVoz(hayDictado: boolean, hayGrabadora: boolean, dictadoFallo = false): 'dictado' | 'grabacion' | null {
  if (hayDictado && (!dictadoFallo || !hayGrabadora)) return 'dictado'
  return hayGrabadora ? 'grabacion' : null
}

/** Errores que dicen que el dictado no existe en este navegador (no que el estudiante no habló o negó el permiso). */
export function dictadoNoSirve(error: string): boolean {
  return ['network', 'service-not-allowed', 'language-not-supported'].includes(error)
}

/** Baja el audio a 16 kHz (lo que necesita el reconocimiento de voz) promediando las muestras de cada tramo. */
export function remuestrear(muestras: Float32Array, desde: number, hasta = 16000): Float32Array {
  if (desde <= hasta) return muestras
  const razon = desde / hasta
  const salida = new Float32Array(Math.floor(muestras.length / razon))
  for (let i = 0; i < salida.length; i++) {
    const inicio = Math.floor(i * razon)
    const fin = Math.min(muestras.length, Math.floor((i + 1) * razon))
    let suma = 0
    for (let j = inicio; j < fin; j++) suma += muestras[j]
    salida[i] = suma / Math.max(1, fin - inicio)
  }
  return salida
}

/** WAV mono de 16 bits: el formato que el servidor acepta y que Gemini entiende, grabe lo que grabe cada navegador. */
export function codificarWav(muestras: Float32Array, frecuencia: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + muestras.length * 2)
  const v = new DataView(buffer)
  const texto = (pos: number, t: string) => { for (let i = 0; i < t.length; i++) v.setUint8(pos + i, t.charCodeAt(i)) }
  texto(0, 'RIFF')
  v.setUint32(4, 36 + muestras.length * 2, true)
  texto(8, 'WAVE')
  texto(12, 'fmt ')
  v.setUint32(16, 16, true)
  v.setUint16(20, 1, true)
  v.setUint16(22, 1, true)
  v.setUint32(24, frecuencia, true)
  v.setUint32(28, frecuencia * 2, true)
  v.setUint16(32, 2, true)
  v.setUint16(34, 16, true)
  texto(36, 'data')
  v.setUint32(40, muestras.length * 2, true)
  muestras.forEach((m, i) => {
    const x = Math.max(-1, Math.min(1, m))
    v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true)
  })
  return buffer
}
