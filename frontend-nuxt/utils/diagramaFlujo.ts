// Diagramas de flujo (docs/DISENO_PROYECTOS.md, fase 4): el formato que guarda un proyecto «diagrama» (diagrama.json),
// cómo se valida y cómo se EJECUTA. Cada figura usa las mismas instrucciones que el pseudocódigo (pseudocodigo.ts), así
// lo que el estudiante aprende en un formato le sirve en el otro. El editor visual solo lee y escribe este formato.

import { FallaDeTraduccion, armar, asignacion, condicion, instruccionSimple } from './pseudocodigo'

/** Las figuras de un diagrama de flujo, como las enseña el curso (óvalo, paralelogramo, rectángulo, rombo). */
export type TipoFigura = 'inicio' | 'fin' | 'entrada' | 'proceso' | 'decision' | 'salida'

export interface Figura {
  /** Identificador estable dentro del diagrama (letras, números, - o _). */
  id: string
  tipo: TipoFigura
  /** inicio/fin: se ignora. entrada: «edad» o «a, b». salida: «"Hola, ", nombre». proceso: una instrucción por línea
   *  (x <- valor, Definir…). decision: la condición, «edad >= 18». */
  texto: string
  /** Posición en el lienzo, en píxeles. Solo la usa el editor. */
  x: number
  y: number
  /** A dónde va la flecha que sale. Las figuras que no son rombo ni fin la necesitan. */
  siguiente?: string | null
  /** Rombo: a dónde va si la condición es verdadera y si es falsa. */
  si?: string | null
  no?: string | null
}

export interface Diagrama { version: 1; figuras: Figura[] }

export const LIMITES_DIAGRAMA = { figuras: 80, texto: 200, pasos: 100_000 } as const

export const TIPO_FIGURA: Record<TipoFigura, { nombre: string; forma: 'ovalo' | 'paralelogramo' | 'rectangulo' | 'rombo'; ayuda: string }> = {
  inicio: { nombre: 'Inicio', forma: 'ovalo', ayuda: 'Donde empieza el algoritmo. Solo hay uno.' },
  fin: { nombre: 'Fin', forma: 'ovalo', ayuda: 'Donde termina.' },
  entrada: { nombre: 'Entrada', forma: 'paralelogramo', ayuda: 'Pide datos: escribe las variables, por ejemplo «precio, pago».' },
  proceso: { nombre: 'Proceso', forma: 'rectangulo', ayuda: 'Calcula o guarda: una instrucción por línea, por ejemplo «vueltas <- pago - precio».' },
  decision: { nombre: 'Decisión', forma: 'rombo', ayuda: 'Una pregunta de sí o no, por ejemplo «edad >= 18». Tiene dos salidas: Sí y No.' },
  salida: { nombre: 'Salida', forma: 'paralelogramo', ayuda: 'Muestra un resultado, por ejemplo «"Sus vueltas son: ", vueltas».' },
}

/** Con lo que arranca un diagrama nuevo: Inicio → Entrada → Salida → Fin. */
export function diagramaInicial(): Diagrama {
  return {
    version: 1,
    figuras: [
      { id: 'inicio', tipo: 'inicio', texto: 'Inicio', x: 160, y: 20, siguiente: 'leer' },
      { id: 'leer', tipo: 'entrada', texto: 'nombre', x: 160, y: 110, siguiente: 'saludo' },
      { id: 'saludo', tipo: 'salida', texto: '"Hola, ", nombre', x: 160, y: 200, siguiente: 'fin' },
      { id: 'fin', tipo: 'fin', texto: 'Fin', x: 160, y: 290 },
    ],
  }
}

export type LecturaDiagrama = { ok: true; diagrama: Diagrama } | { ok: false; mensaje: string }

const ID = /^[A-Za-z0-9_-]{1,40}$/
const TIPOS = Object.keys(TIPO_FIGURA)

/** Lee el contenido de diagrama.json. Rechaza lo que no tiene la forma esperada, sin lanzar. */
export function leerDiagrama(json: string): LecturaDiagrama {
  let datos: unknown
  try { datos = JSON.parse(json) } catch { return { ok: false, mensaje: 'El archivo del diagrama está dañado (no es JSON válido).' } }
  const d = datos as { version?: unknown; figuras?: unknown }
  if (!d || d.version !== 1 || !Array.isArray(d.figuras)) return { ok: false, mensaje: 'El archivo no es un diagrama de flujo de STIRE.' }
  if (d.figuras.length > LIMITES_DIAGRAMA.figuras) return { ok: false, mensaje: `Un diagrama admite como máximo ${LIMITES_DIAGRAMA.figuras} figuras.` }
  const figuras: Figura[] = []
  for (const f of d.figuras as Array<Record<string, unknown>>) {
    if (!f || typeof f.id !== 'string' || !ID.test(f.id) || typeof f.tipo !== 'string' || !TIPOS.includes(f.tipo)) {
      return { ok: false, mensaje: 'Hay una figura sin identificador o con un tipo desconocido.' }
    }
    const ref = (v: unknown) => (typeof v === 'string' && ID.test(v) ? v : null)
    figuras.push({
      id: f.id, tipo: f.tipo as TipoFigura,
      texto: typeof f.texto === 'string' ? f.texto.slice(0, LIMITES_DIAGRAMA.texto) : '',
      x: Number.isFinite(f.x) ? Number(f.x) : 0, y: Number.isFinite(f.y) ? Number(f.y) : 0,
      siguiente: ref(f.siguiente), si: ref(f.si), no: ref(f.no),
    })
  }
  return { ok: true, diagrama: { version: 1, figuras } }
}

export interface ErrorDiagrama { figura: number; figuraId: string | null; mensaje: string }
export type TraduccionDiagrama = { ok: true; js: string } | { ok: false; error: ErrorDiagrama }

const FEMENINO: TipoFigura[] = ['entrada', 'decision', 'salida']

/** Cómo se nombra una figura en un mensaje: «la Decisión 3 («edad >= 18»)». */
function nombreFigura(f: Figura, n: number): string {
  const texto = f.texto.trim().replace(/\s+/g, ' ')
  const articulo = FEMENINO.includes(f.tipo) ? 'la' : 'el'
  return `${articulo} ${TIPO_FIGURA[f.tipo].nombre} ${n}${texto && f.tipo !== 'inicio' && f.tipo !== 'fin' ? ` («${texto.slice(0, 40)}»)` : ''}`
}
/** «A la Entrada 2», «Al Proceso 3»; «de la…», «del…». */
const a = (quien: string) => (quien.startsWith('el ') ? `Al ${quien.slice(3)}` : `A ${quien}`)
const de = (quien: string) => (quien.startsWith('el ') ? `del ${quien.slice(3)}` : `de ${quien}`)

/**
 * Traduce el diagrama a JavaScript para el mismo Worker que el pseudocódigo: una máquina de estados que va de figura
 * en figura siguiendo las flechas. Los errores dicen la figura y el motivo, sin lanzar.
 */
export function traducirDiagrama(d: Diagrama): TraduccionDiagrama {
  const num = new Map(d.figuras.map((f, i) => [f.id, i + 1]))
  const falla = (f: Figura | null, mensaje: string): TraduccionDiagrama =>
    ({ ok: false, error: { figura: f ? num.get(f.id) ?? 0 : 0, figuraId: f?.id ?? null, mensaje } })

  if (num.size !== d.figuras.length) return falla(null, 'Hay dos figuras con el mismo identificador.')
  const inicios = d.figuras.filter((f) => f.tipo === 'inicio')
  if (inicios.length !== 1) return falla(inicios[1] ?? null, inicios.length ? 'Hay más de un Inicio: deja solo uno.' : 'Falta la figura de Inicio.')
  if (!d.figuras.some((f) => f.tipo === 'fin')) return falla(null, 'Falta la figura de Fin.')

  const casos: string[] = []
  for (const f of d.figuras) {
    const n = num.get(f.id) ?? 0
    const quien = nombreFigura(f, n)
    const destino = (id: string | null | undefined, falta: string): string => {
      if (!id) throw new FallaDeTraduccion(n, falta)
      if (!num.has(id)) throw new FallaDeTraduccion(n, `La flecha ${de(quien)} apunta a una figura que ya no existe.`)
      return JSON.stringify(id)
    }
    try {
      let cuerpo: string
      if (f.tipo === 'fin') cuerpo = '__n = null;'
      else if (f.tipo === 'decision') {
        if (!f.texto.trim()) throw new FallaDeTraduccion(n, `Escribe la pregunta ${de(quien)}, por ejemplo «edad >= 18».`)
        const si = destino(f.si, `${a(quien)} le falta la flecha del «Sí».`)
        const no = destino(f.no, `${a(quien)} le falta la flecha del «No».`)
        cuerpo = `__n = ${condicion(f.texto, n)} ? ${si} : ${no};`
      } else {
        const sig = destino(f.siguiente, `${a(quien)} le falta la flecha que sale.`)
        let instrucciones = ''
        if (f.tipo === 'entrada') {
          if (!f.texto.trim()) throw new FallaDeTraduccion(n, `Escribe en ${quien} qué variables se leen, por ejemplo «edad».`)
          instrucciones = instruccionSimple(`Leer ${f.texto.trim().replace(/^leer\s+/i, '')}`, n) ?? ''
        } else if (f.tipo === 'salida') {
          instrucciones = instruccionSimple(`Escribir ${f.texto.trim().replace(/^(escribir|mostrar|imprimir)\s+/i, '')}`, n) ?? ''
        } else if (f.tipo === 'proceso') {
          const lineas = f.texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
          if (!lineas.length) throw new FallaDeTraduccion(n, `Escribe en ${quien} qué se calcula, por ejemplo «total <- a + b».`)
          instrucciones = lineas.map((l) => {
            const js = instruccionSimple(l, n) ?? asignacion(l, n)
            if (js === null) throw new FallaDeTraduccion(n, `En ${quien} no entiendo «${l.slice(0, 50)}». Un proceso guarda un valor: «x <- valor».`)
            return js
          }).join(' ')
        }
        cuerpo = `${instrucciones} __n = ${sig};`
      }
      casos.push(`case ${JSON.stringify(f.id)}: __l = ${n}; ${cuerpo} break;`)
    } catch (e) {
      if (e instanceof FallaDeTraduccion) return falla(f, e.message)
      throw e
    }
  }

  const js = [
    `let __n = ${JSON.stringify(inicios[0].id)}; let __pasos = 0;`,
    'while (__n !== null) {',
    `  if (++__pasos > ${LIMITES_DIAGRAMA.pasos}) __falla('El diagrama dio más de 100 000 pasos: revisa si una flecha vuelve atrás sin que nada cambie.');`,
    '  switch (__n) {',
    ...casos.map((c) => `    ${c}`),
    '  }',
    '}',
  ]
  // En un error al ejecutar, __l es el número de la figura.
  return { ok: true, js: armar(js, "'Error en la figura ' + __l") }
}
