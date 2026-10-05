// «Escuchar la lección» (UI-01, docs/DISENO_FORMATOS_LECCION.md): la explicación también por el oído, con la voz del
// navegador (sin costo, sin enviar el texto a nadie). No es para el «estudiante auditivo»: adaptar el formato a un
// supuesto estilo no mejora el aprendizaje (Pashler et al., 2008; Rogowsky, Calhoun y Tallal, 2015). Es una vía más que
// cada uno usa cuando le sirve (cansado de leer, en el celular, con baja visión) y que deja los ojos libres para el
// diagrama: palabras habladas con imagen aprenden mejor que texto en pantalla con imagen (principio de modalidad,
// Mayer, 2017).

import { partirContenido } from './contenidoLeccion'

export interface BloqueLeccion { title?: string | null; body?: string | null }

/** Markdown → texto que se puede decir en voz alta: sin símbolos, los enlaces por su texto, el código anunciado. */
export function markdownParaVoz(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' Hay un fragmento de código en la pantalla. ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, (_, alt: string) => (alt.trim() ? ` Imagen: ${alt.trim()}. ` : ' '))
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s*(.+)$/gm, '$1.')
    .replace(/^\s*(?:[-*+]|\d+[.)])\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/(\*\*|__|\*|_|~~)(?=\S)([\s\S]*?\S)\1/g, '$2')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, 'y')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim()
}

/** Lo que se dice de cada bloque: el texto, y un aviso corto de lo que solo se puede ver. */
export function textoParaEscuchar(bloques: BloqueLeccion[]): string {
  const partes: string[] = []
  for (const b of bloques) {
    if (b.title?.trim()) partes.push(`${b.title.trim().replace(/[.:]$/, '')}.`)
    for (const s of partirContenido(b.body ?? '')) {
      if (s.tipo === 'texto') partes.push(markdownParaVoz(s.markdown))
      else if (s.tipo === 'imagen') partes.push(s.alt ? `Imagen: ${s.alt}.` : '')
      else if (s.tipo === 'recurso') partes.push(`Recurso: ${s.titulo}. Ábrelo en la pantalla.`)
      else if (s.tipo === 'vivo') partes.push('Aquí hay un ejemplo en vivo: pruébalo en la pantalla.')
      else partes.push('Aquí está el algoritmo: míralo como diagrama de flujo o paso a paso mientras escuchas.')
    }
  }
  return partes.filter(Boolean).join('\n')
}

/**
 * Frases de hasta `max` caracteres. El navegador corta las lecturas largas (Chrome se detiene a los ~15 s de una sola
 * locución), así que se leen por partes, y así también se sabe por dónde va.
 */
export function partirEnFrases(texto: string, max = 220): string[] {
  const frases = texto
    .split(/\n+/)
    .flatMap((p) => p.split(/(?<=[.!?»)])\s+/))
    .map((f) => f.trim())
    .filter(Boolean)
  const trozos: string[] = []
  for (const f of frases) {
    if (f.length <= max) {
      const ultimo = trozos[trozos.length - 1]
      if (ultimo && ultimo.length + 1 + f.length <= max) trozos[trozos.length - 1] = `${ultimo} ${f}`
      else trozos.push(f)
      continue
    }
    // Una frase muy larga se parte por comas o espacios.
    let resto = f
    while (resto.length > max) {
      const corte = Math.max(resto.lastIndexOf(', ', max), resto.lastIndexOf(' ', max))
      const i = corte > max / 2 ? corte + 1 : max
      trozos.push(resto.slice(0, i).trim())
      resto = resto.slice(i).trim()
    }
    if (resto) trozos.push(resto)
  }
  return trozos
}

/** La voz en español más cercana: Colombia, luego Latinoamérica, luego cualquier español. */
export function elegirVoz<V extends { lang: string }>(voces: V[]): V | null {
  const por = (re: RegExp) => voces.find((v) => re.test(v.lang.replace('_', '-')))
  return por(/^es-CO/i) ?? por(/^es-(419|MX|US|AR|CL|PE|VE|EC)/i) ?? por(/^es\b/i) ?? null
}

export const VELOCIDADES = [
  { valor: 0.85, texto: 'Lenta' },
  { valor: 1, texto: 'Normal' },
  { valor: 1.2, texto: 'Rápida' },
] as const

/** Qué más trae la lección además del texto: para decírselo al estudiante arriba, como opciones (no como etiqueta). */
export function formatosDeLeccion(bloques: BloqueLeccion[]): { diagrama: boolean; imagenes: boolean; recursos: boolean; enVivo: boolean } {
  const segs = bloques.flatMap((b) => partirContenido(b.body ?? ''))
  return {
    diagrama: segs.some((s) => s.tipo === 'algoritmo'),
    imagenes: segs.some((s) => s.tipo === 'imagen'),
    recursos: segs.some((s) => s.tipo === 'recurso'),
    enVivo: segs.some((s) => s.tipo === 'vivo'),
  }
}
