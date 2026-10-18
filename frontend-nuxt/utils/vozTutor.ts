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
    case 'service-not-allowed':
      return 'El navegador no dio permiso para el micrófono. Actívalo en el candado de la barra de direcciones.'
    case 'audio-capture':
      return 'No encontré un micrófono conectado.'
    case 'network':
      return 'Este navegador no puede convertir la voz en texto. Prueba en Chrome o Edge.'
    default:
      return 'No se pudo escuchar. Intenta de nuevo o escribe tu pregunta.'
  }
}
