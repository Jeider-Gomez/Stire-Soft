// «Escuchar la lección» (UI-01, docs/DISENO_FORMATOS_LECCION.md): la explicación también por el oído, con la voz del
// navegador (sin costo, sin enviar el texto a nadie). No es para el «estudiante auditivo»: adaptar el formato a un
// supuesto estilo no mejora el aprendizaje (Pashler et al., 2008; Rogowsky, Calhoun y Tallal, 2015). Es una vía más que
// cada uno usa cuando le sirve (cansado de leer, en el celular, con baja visión o dislexia) y que deja los ojos libres
// para el diagrama (principio de modalidad, Mayer, 2017). Como el Lector inmersivo de Microsoft o ReadSpeaker, se lee
// lo que está en pantalla y se resalta la frase que suena: leer mientras se escucha ayuda a comprender a quien le
// cuesta leer (Wood, Moxley, Tighe y Wagner, 2018).

import { partirContenido } from './contenidoLeccion'

export interface BloqueLeccion { title?: string | null; body?: string | null }

/** Una frase de un párrafo, con su posición en el texto del párrafo (para resaltarla mientras suena). */
export interface Frase { texto: string; inicio: number; fin: number }

const ES_FIN = /[.!?]/
const CIERRE = /[»)”"']/
const ESPACIO = /\s/

/**
 * Las frases de un texto con su posición. Cada frase es una lectura: el navegador corta las lecturas largas (Chrome se
 * detiene a los ~15 s de una sola locución), así que una frase de más de `max` caracteres se parte por comas o espacios.
 */
export function frasesConPosicion(texto: string, max = 220): Frase[] {
  const cortes: Array<[number, number]> = []
  let ini = 0
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (c === '\n') { cortes.push([ini, i]); ini = i + 1; continue }
    if (!ES_FIN.test(c)) continue
    if (ESPACIO.test(texto[i + 1] ?? ' ')) { cortes.push([ini, i + 1]); ini = i + 1 }
    else if (CIERRE.test(texto[i + 1] ?? '') && ESPACIO.test(texto[i + 2] ?? ' ')) { cortes.push([ini, i + 2]); ini = i + 2; i++ }
  }
  cortes.push([ini, texto.length])

  const frases: Frase[] = []
  const agregar = (a: number, b: number) => {
    while (a < b && ESPACIO.test(texto[a])) a++
    while (b > a && ESPACIO.test(texto[b - 1])) b--
    if (b > a) frases.push({ texto: texto.slice(a, b).replace(/\s+/g, ' '), inicio: a, fin: b })
  }
  for (const [a0, b] of cortes) {
    let a = a0
    while (a < b && ESPACIO.test(texto[a])) a++
    while (b - a > max) {
      const trozo = texto.slice(a, a + max)
      const corte = Math.max(trozo.lastIndexOf(', ') + 1, trozo.lastIndexOf(' '))
      const fin = corte > max / 2 ? a + corte : a + max
      agregar(a, fin)
      a = fin
    }
    agregar(a, b)
  }
  return frases
}

/** Solo el texto de cada frase (lo que se dice). */
export function partirEnFrases(texto: string, max = 220): string[] {
  return frasesConPosicion(texto, max).map((f) => f.texto)
}

/**
 * Lo que la voz diría mal, en palabras: la asignación del pseudocódigo («x <- 5» sonaba «menor que guion») y las
 * comparaciones. El resto se lee tal cual.
 */
export function textoParaVoz(texto: string): string {
  return texto
    .replace(/\s*(?:<-|←)\s*/g, ' recibe ')
    .replace(/\s*<=\s*/g, ' menor o igual que ')
    .replace(/\s*>=\s*/g, ' mayor o igual que ')
    .replace(/\s*(?:!=|<>)\s*/g, ' distinto de ')
    .replace(/\s*==\s*/g, ' igual a ')
    .replace(/\s+/g, ' ')
    .trim()
}

interface VozLike { lang: string; name?: string }

const LATAM = /^es-(CO|419|MX|US|AR|CL|PE|VE|EC|UY|BO|PY|CR|PA|DO|GT|HN|NI|SV|PR|CU)/i
/** Voces neuronales (Edge «Natural», Chrome «Google», Safari «Premium/Mejorada»): suenan mucho mejor que las clásicas. */
const NATURAL = /natural|neural|online|premium|enhanced|mejorada|google/i

/** Puntaje de una voz: -1 si no es español; las naturales primero y, entre iguales, Colombia y luego Latinoamérica. */
export function puntajeVoz(v: VozLike): number {
  const lang = v.lang.replace('_', '-')
  if (!/^es\b/i.test(lang)) return -1
  const region = /^es-CO/i.test(lang) ? 3 : LATAM.test(lang) ? 2 : 1
  return (NATURAL.test(v.name ?? '') ? 10 : 0) + region
}

/** Las voces en español, la mejor primero. */
export function vocesEnEspanol<V extends VozLike>(voces: V[]): V[] {
  return voces.filter((v) => puntajeVoz(v) >= 0).sort((a, b) => puntajeVoz(b) - puntajeVoz(a))
}

/** La mejor voz en español (o la que el estudiante eligió, si sigue disponible); sin español, ninguna. */
export function elegirVoz<V extends VozLike & { voiceURI?: string }>(voces: V[], preferida?: string | null): V | null {
  const espanol = vocesEnEspanol(voces)
  return (preferida ? espanol.find((v) => v.voiceURI === preferida) : undefined) ?? espanol[0] ?? null
}

/** Nombre corto de una voz para el selector: «Salome (Colombia)». */
export function nombreVoz(v: VozLike): string {
  const nombre = (v.name ?? 'Voz')
    .replace(/^(Microsoft|Google)\s+/i, '')
    .replace(/\s+Online\s*\(Natural\)/i, '')
    .replace(/\s+-\s+.*$/, '')
    .trim()
  const pais: Record<string, string> = { CO: 'Colombia', MX: 'México', US: 'EE. UU.', ES: 'España', AR: 'Argentina', CL: 'Chile', PE: 'Perú', VE: 'Venezuela', EC: 'Ecuador', '419': 'Latinoamérica' }
  const region = v.lang.replace('_', '-').split('-')[1]?.toUpperCase()
  return region && pais[region] ? `${nombre} (${pais[region]})` : nombre
}

export const VELOCIDADES = [
  { valor: 0.75, texto: 'Lenta' },
  { valor: 1, texto: 'Normal' },
  { valor: 1.25, texto: 'Rápida' },
  { valor: 1.5, texto: 'Muy rápida' },
] as const

/** Qué más trae la lección además del texto: se dice en una línea junto a «Escuchar», como opciones (no como etiqueta). */
export function formatosDeLeccion(bloques: BloqueLeccion[]): { diagrama: boolean; imagenes: boolean; recursos: boolean; enVivo: boolean } {
  const segs = bloques.flatMap((b) => partirContenido(b.body ?? ''))
  return {
    diagrama: segs.some((s) => s.tipo === 'algoritmo'),
    imagenes: segs.some((s) => s.tipo === 'imagen'),
    recursos: segs.some((s) => s.tipo === 'recurso'),
    enVivo: segs.some((s) => s.tipo === 'vivo'),
  }
}

/** «Incluye diagrama de flujo y un ejemplo en vivo»; vacío si solo hay texto. */
export function textoFormatos(f: ReturnType<typeof formatosDeLeccion>): string {
  const partes = [
    f.diagrama && 'el algoritmo en diagrama y paso a paso',
    f.enVivo && 'un ejemplo en vivo',
    f.imagenes && 'imágenes',
    f.recursos && 'videos o recursos',
  ].filter((x): x is string => !!x)
  if (!partes.length) return ''
  return `Incluye ${partes.length === 1 ? partes[0] : `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`}.`
}

/** Preferencias de lectura del estudiante en este navegador (velocidad y voz). */
export const CLAVE_PREFERENCIAS_VOZ = 'stire.escuchar.preferencias'
export interface PreferenciasVoz { velocidad: number; voz: string | null }
export function leerPreferenciasVoz(crudo: string | null): PreferenciasVoz {
  try {
    const p = crudo ? JSON.parse(crudo) : null
    const velocidad = VELOCIDADES.some((v) => v.valor === p?.velocidad) ? (p.velocidad as number) : 1
    return { velocidad, voz: typeof p?.voz === 'string' ? p.voz : null }
  } catch {
    return { velocidad: 1, voz: null }
  }
}

/** Una lectura: el elemento que se resalta y la frase que suena. */
export interface Lectura { el: Element; frase: Frase }

// Lo que se lee de la pantalla. Lo que solo se puede ver (el algoritmo, un ejemplo en vivo, un video) se anuncia con su
// `data-leer-aviso`. `dt`, `dd`, `summary` y `h6` también: antes un docente que los usaba veía partes calladas.
const SELECTOR_LECTURA = 'h1,h2,h3,h4,h5,h6,p,li,dt,dd,summary,figcaption,blockquote,img,pre,table,[data-leer-aviso]'
const CONTENEDORES_LECTURA = 'p,li,dt,dd,figcaption,blockquote,pre,table'
/** Más líneas que esto en un bloque de código: se anuncia en vez de leerse línea por línea. */
export const MAX_LINEAS_CODIGO = 25

const una = (texto: string): Frase[] => [{ texto, inicio: -1, fin: -1 }]
const limpio = (t: string | null | undefined) => (t ?? '').replace(/\s+/g, ' ').trim()

/** Una tabla, fila por fila: «Columnas: Figura, Significado.» y «Óvalo; Inicio o fin.». Cada fila se resalta sola. */
function lecturasDeTabla(tabla: Element): Lectura[] {
  const filas = Array.from(tabla.querySelectorAll('tr'))
  const out: Lectura[] = [{ el: tabla, frase: una(`Tabla de ${filas.length} filas.`)[0] }]
  for (const tr of filas) {
    const celdas = Array.from(tr.children).map((c) => limpio(c.textContent)).filter(Boolean)
    if (!celdas.length) continue
    const encabezado = tr.parentElement?.tagName === 'THEAD' || Array.from(tr.children).every((c) => c.tagName === 'TH')
    out.push({ el: tr, frase: una(encabezado ? `Columnas: ${celdas.join(', ')}.` : `${celdas.join('; ')}.`)[0] })
  }
  return out
}

/** Un bloque de código o pseudocódigo: corto, línea por línea (con `textoParaVoz` al decirlo); largo, se anuncia. */
function lecturasDeCodigo(pre: Element): Lectura[] {
  const lineas = (pre.textContent ?? '').split('\n').map((l) => l.trim()).filter(Boolean)
  if (!lineas.length) return []
  if (lineas.length > MAX_LINEAS_CODIGO) return [{ el: pre, frase: una(`Hay un fragmento de código de ${lineas.length} líneas en la pantalla.`)[0] }]
  return [{ el: pre, frase: una('Código:')[0] }, ...lineas.map((l) => ({ el: pre, frase: una(l)[0] }))]
}

/**
 * Todas las lecturas de la lección, en el orden de la pantalla: primero `antes` (el título y la descripción, que están
 * fuera de la explicación) y luego lo que hay en `raiz`. Se salta lo oculto a los lectores (`aria-hidden`).
 */
export function lecturasDeLeccion(raiz: Element | null, antes: Array<Element | null> = []): Lectura[] {
  const out: Lectura[] = []
  for (const el of antes) {
    if (el && limpio(el.textContent)) for (const frase of frasesConPosicion(el.textContent ?? '')) out.push({ el, frase })
  }
  if (!raiz) return out
  for (const el of Array.from(raiz.querySelectorAll(SELECTOR_LECTURA))) {
    if (el.closest('[aria-hidden="true"]')) continue
    const anuncio = el.closest('[data-leer-aviso]')
    if (anuncio && anuncio !== el) continue
    const padre = el.parentElement?.closest(CONTENEDORES_LECTURA)
    if (padre && raiz.contains(padre)) continue
    const aviso = el.getAttribute('data-leer-aviso')
    if (aviso !== null) out.push({ el, frase: una(aviso)[0] })
    else if (el.tagName === 'IMG') { const alt = limpio(el.getAttribute('alt')); if (alt) out.push({ el, frase: una(`Imagen: ${alt}.`)[0] }) }
    else if (el.tagName === 'PRE') out.push(...lecturasDeCodigo(el))
    else if (el.tagName === 'TABLE') out.push(...lecturasDeTabla(el))
    else for (const frase of frasesConPosicion(el.textContent ?? '')) out.push({ el, frase })
  }
  return out
}
