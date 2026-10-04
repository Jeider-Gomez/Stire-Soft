// Un algoritmo de la lección en tres formatos (UI-01 de la lista de chequeo de Sistemas Tutores, Caro 2015: adaptación
// multimodal verbal / visual). En vez de diagnosticar un «estilo de aprendizaje» (sin respaldo: Pashler et al., 2008),
// el estudiante elige cómo verlo y STIRE recuerda su preferencia:
//   - pseudocódigo (el texto que escribió el docente, estilo PSeInt),
//   - diagrama de flujo (generado aquí, con las figuras de la lección 2: óvalo, paralelogramo, rectángulo y rombo),
//   - paso a paso en palabras.
// Todos salen del MISMO texto: el docente no escribe nada extra y los tres dicen lo mismo (equidad curricular).

export type Nodo =
  | { tipo: 'inicio'; texto: string }
  | { tipo: 'fin' }
  | { tipo: 'leer'; texto: string }
  | { tipo: 'escribir'; texto: string }
  | { tipo: 'proceso'; texto: string }
  | { tipo: 'si'; condicion: string; entonces: Nodo[]; sino: Nodo[] }
  | { tipo: 'mientras'; condicion: string; cuerpo: Nodo[] }
  | { tipo: 'para'; variable: string; desde: string; hasta: string; paso: string | null; cuerpo: Nodo[] }
  | { tipo: 'repetir'; condicion: string; cuerpo: Nodo[] }

/** Un bloque de código es pseudocódigo de un algoritmo si su primera línea es «Algoritmo …» o «Proceso …». */
export function esPseudocodigo(codigo: string): boolean {
  const primera = codigo.split(/\r?\n/).map((l) => l.trim()).find((l) => l !== '')
  return !!primera && /^(algoritmo|proceso)\b/i.test(primera)
}

const bonito = (t: string) => t.replace(/<-/g, '←').replace(/\s+/g, ' ').trim()

/**
 * Lee el pseudocódigo y arma su estructura. Devuelve null si los bloques no cierran (Si sin FinSi, etc.): en ese caso
 * la lección muestra solo el texto, nunca un diagrama equivocado.
 */
export function leerAlgoritmo(codigo: string): Nodo[] | null {
  const lineas = codigo.split(/\r?\n/).map((l) => l.trim()).filter((l) => l !== '' && !l.startsWith('//'))
  let i = 0
  const arbol: Nodo[] = []

  function bloque(terminan: RegExp): { nodos: Nodo[]; cierre: string } | null {
    const nodos: Nodo[] = []
    while (i < lineas.length) {
      const l = lineas[i]
      if (terminan.test(l)) { i++; return { nodos, cierre: l } }
      i++
      let m: RegExpExecArray | null
      if ((m = /^(?:algoritmo|proceso)\s+(.*)$/i.exec(l))) nodos.push({ tipo: 'inicio', texto: m[1].trim() })
      else if (/^fin\s*(?:algoritmo|proceso)$/i.test(l)) nodos.push({ tipo: 'fin' })
      else if ((m = /^leer\s+(.+)$/i.exec(l))) nodos.push({ tipo: 'leer', texto: bonito(m[1]) })
      else if ((m = /^(?:escribir|imprimir|mostrar)\s+(.+)$/i.exec(l))) nodos.push({ tipo: 'escribir', texto: bonito(m[1]) })
      else if ((m = /^si\s+(.+?)\s+entonces$/i.exec(l))) {
        const entonces = bloque(/^(sino|si\s*no|fin\s*si)$/i)
        if (!entonces) return null
        let sino: Nodo[] = []
        if (/^(sino|si\s*no)$/i.test(entonces.cierre)) {
          const otro = bloque(/^fin\s*si$/i)
          if (!otro) return null
          sino = otro.nodos
        }
        nodos.push({ tipo: 'si', condicion: bonito(m[1]), entonces: entonces.nodos, sino })
      } else if ((m = /^mientras\s+(.+?)\s+hacer$/i.exec(l))) {
        const cuerpo = bloque(/^fin\s*mientras$/i)
        if (!cuerpo) return null
        nodos.push({ tipo: 'mientras', condicion: bonito(m[1]), cuerpo: cuerpo.nodos })
      } else if ((m = /^para\s+(\w+)\s*(?:<-|=)\s*(.+?)\s+hasta\s+(.+?)(?:\s+con\s+paso\s+(.+?))?\s+hacer$/i.exec(l))) {
        const cuerpo = bloque(/^fin\s*para$/i)
        if (!cuerpo) return null
        nodos.push({ tipo: 'para', variable: m[1], desde: bonito(m[2]), hasta: bonito(m[3]), paso: m[4] ? bonito(m[4]) : null, cuerpo: cuerpo.nodos })
      } else if (/^repetir$/i.test(l)) {
        const cuerpo = bloque(/^hasta\s+que\s+.+$/i)
        if (!cuerpo) return null
        nodos.push({ tipo: 'repetir', condicion: bonito(cuerpo.cierre.replace(/^hasta\s+que\s+/i, '')), cuerpo: cuerpo.nodos })
      } else if (/^(sino|si\s*no|fin\s*si|fin\s*mientras|fin\s*para|hasta\s+que\b)/i.test(l)) {
        return null // un cierre que no corresponde
      } else nodos.push({ tipo: 'proceso', texto: bonito(l.replace(/;$/, '')) })
    }
    return terminan.source === '$^' ? { nodos, cierre: '' } : null
  }

  const todo = bloque(/$^/)
  if (!todo) return null
  arbol.push(...todo.nodos)
  return arbol.length ? arbol : null
}

// ─── Paso a paso en palabras ────────────────────────────────────────────────────────────────────────────────────────

const lista = (t: string) => {
  const partes = t.split(/\s*,\s*/).filter(Boolean)
  return partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}` : t
}

function frase(n: Nodo): string {
  switch (n.tipo) {
    case 'inicio': return `Empieza el algoritmo «${n.texto}».`
    case 'fin': return 'Termina.'
    case 'leer': return `Pide ${lista(n.texto)} y ${n.texto.includes(',') ? 'los guarda' : 'lo guarda'}.`
    case 'escribir': return `Muestra ${lista(n.texto)}.`
    case 'proceso': {
      const asig = /^(\w+)\s*←\s*(.+)$/.exec(n.texto)
      return asig ? `Calcula ${asig[1]} como ${asig[2]}.` : `${n.texto}.`
    }
    case 'si': return `Pregunta si ${n.condicion}:`
    case 'mientras': return `Mientras ${n.condicion}, repite:`
    case 'para': return `Para ${n.variable} desde ${n.desde} hasta ${n.hasta}${n.paso ? ` de ${n.paso} en ${n.paso}` : ''}, repite:`
    case 'repetir': return 'Repite:'
  }
}

export interface Paso { numero: string; texto: string; hijos: Paso[] }

export function pasoAPaso(nodos: Nodo[], prefijo = ''): Paso[] {
  return nodos.map((n, k) => {
    const numero = `${prefijo}${k + 1}`
    const hijo = (ns: Nodo[], sub: string) => pasoAPaso(ns, `${numero}.${sub}`)
    if (n.tipo === 'si') {
      const hijos: Paso[] = [{ numero: `${numero}.a`, texto: 'Si sí:', hijos: hijo(n.entonces, 'a.') }]
      if (n.sino.length) hijos.push({ numero: `${numero}.b`, texto: 'Si no:', hijos: hijo(n.sino, 'b.') })
      return { numero, texto: frase(n), hijos }
    }
    if (n.tipo === 'mientras' || n.tipo === 'para') return { numero, texto: frase(n), hijos: hijo(n.cuerpo, '') }
    if (n.tipo === 'repetir') {
      return { numero, texto: frase(n), hijos: [...hijo(n.cuerpo, ''), { numero: `${numero}.*`, texto: `…hasta que ${n.condicion}.`, hijos: [] }] }
    }
    return { numero, texto: frase(n), hijos: [] }
  })
}

// ─── Diagrama de flujo (SVG) ────────────────────────────────────────────────────────────────────────────────────────

const ALTO = 38
const SEP = 24
const MAX_TXT = 46
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const corto = (t: string) => (t.length > MAX_TXT ? `${t.slice(0, MAX_TXT - 1)}…` : t)
const ancho = (t: string, extra = 28) => Math.min(340, Math.max(110, Math.round(corto(t).length * 6.6) + extra))

interface Bloque { w: number; h: number; dibujar: (cx: number, y: number) => string }

const flecha = (x1: number, y1: number, x2: number, y2: number) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="fl" marker-end="url(#punta)"/>`
const linea = (pts: Array<[number, number]>, conPunta = false) =>
  `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" class="fl" fill="none"${conPunta ? ' marker-end="url(#punta)"' : ''}/>`
const texto = (cx: number, cy: number, t: string, clase = 'tx') => `<text x="${cx}" y="${cy}" class="${clase}">${esc(corto(t))}</text>`

function figura(n: Nodo): Bloque {
  const t = n.tipo === 'inicio' ? 'Inicio' : n.tipo === 'fin' ? 'Fin' : n.tipo === 'leer' ? `Leer ${(n as { texto: string }).texto}` : n.tipo === 'escribir' ? `Escribir ${(n as { texto: string }).texto}` : (n as { texto: string }).texto
  const w = ancho(t)
  return {
    w, h: ALTO,
    dibujar: (cx, y) => {
      const x = cx - w / 2
      const forma = n.tipo === 'inicio' || n.tipo === 'fin'
        ? `<rect x="${x}" y="${y}" width="${w}" height="${ALTO}" rx="19" class="fg ov"/>`
        : n.tipo === 'leer' || n.tipo === 'escribir'
          ? `<polygon points="${x + 12},${y} ${x + w},${y} ${x + w - 12},${y + ALTO} ${x},${y + ALTO}" class="fg es"/>`
          : `<rect x="${x}" y="${y}" width="${w}" height="${ALTO}" rx="3" class="fg pr"/>`
      return forma + texto(cx, y + ALTO / 2 + 4, t)
    },
  }
}

function secuencia(nodos: Nodo[]): Bloque {
  const bs = nodos.map(bloqueDe)
  if (!bs.length) return { w: 40, h: 0, dibujar: () => '' }
  const w = Math.max(...bs.map((b) => b.w))
  const h = bs.reduce((s, b) => s + b.h, 0) + SEP * (bs.length - 1)
  return {
    w, h,
    dibujar: (cx, y) => {
      let svg = ''
      let yy = y
      bs.forEach((b, k) => {
        svg += b.dibujar(cx, yy)
        yy += b.h
        if (k < bs.length - 1) { svg += flecha(cx, yy, cx, yy + SEP); yy += SEP }
      })
      return svg
    },
  }
}

const ROMBO_H = 52
function rombo(cx: number, y: number, w: number, t: string) {
  return `<polygon points="${cx},${y} ${cx + w / 2},${y + ROMBO_H / 2} ${cx},${y + ROMBO_H} ${cx - w / 2},${y + ROMBO_H / 2}" class="fg de"/>` +
    texto(cx, y + ROMBO_H / 2 + 4, `¿${t}?`)
}

function bloqueDe(n: Nodo): Bloque {
  if (n.tipo === 'si') {
    const a = secuencia(n.entonces)
    const b = secuencia(n.sino)
    const wr = ancho(`¿${n.condicion}?`, 46)
    const gap = 30
    const w = Math.max(wr, a.w + b.w + gap)
    const h = ROMBO_H + SEP + Math.max(a.h, b.h) + SEP
    return {
      w, h,
      dibujar: (cx, y) => {
        const xa = cx - gap / 2 - a.w / 2
        const xb = cx + gap / 2 + b.w / 2
        const yb = y + ROMBO_H + SEP
        const yfin = y + h
        let svg = rombo(cx, y, wr, n.condicion)
        svg += linea([[cx - wr / 2, y + ROMBO_H / 2], [xa, y + ROMBO_H / 2], [xa, yb]], a.h > 0) + texto(cx - wr / 2 - 12, y + ROMBO_H / 2 - 6, 'Sí', 'et')
        svg += linea([[cx + wr / 2, y + ROMBO_H / 2], [xb, y + ROMBO_H / 2], [xb, yb]], b.h > 0) + texto(cx + wr / 2 + 12, y + ROMBO_H / 2 - 6, 'No', 'et')
        svg += a.dibujar(xa, yb) + b.dibujar(xb, yb)
        svg += linea([[xa, yb + a.h], [xa, yfin], [xb, yfin], [xb, yb + b.h]])
        return svg
      },
    }
  }
  if (n.tipo === 'mientras' || n.tipo === 'para') {
    const cuerpo = secuencia(n.cuerpo)
    const cond = n.tipo === 'para' ? `${n.variable} ≤ ${n.hasta}` : n.condicion
    const wr = ancho(`¿${cond}?`, 46)
    const lado = 26
    const pre = n.tipo === 'para' ? ALTO + SEP : 0 // «i ← desde» antes del rombo
    const w = Math.max(wr, cuerpo.w) + lado * 2 + 20
    const h = pre + ROMBO_H + SEP + cuerpo.h + (n.tipo === 'para' ? SEP + ALTO : 0) + SEP
    return {
      w, h,
      dibujar: (cx, y) => {
        let svg = ''
        let yr = y
        if (n.tipo === 'para') {
          svg += figura({ tipo: 'proceso', texto: `${n.variable} ← ${n.desde}` }).dibujar(cx, y) + flecha(cx, y + ALTO, cx, y + ALTO + SEP)
          yr = y + pre
        }
        svg += rombo(cx, yr, wr, cond)
        const yc = yr + ROMBO_H + SEP
        svg += flecha(cx, yr + ROMBO_H, cx, yc) + texto(cx + 14, yr + ROMBO_H + 14, 'Sí', 'et')
        svg += cuerpo.dibujar(cx, yc)
        let yfinCuerpo = yc + cuerpo.h
        if (n.tipo === 'para') {
          svg += flecha(cx, yfinCuerpo, cx, yfinCuerpo + SEP)
          svg += figura({ tipo: 'proceso', texto: `${n.variable} ← ${n.variable} + ${n.paso ?? 1}` }).dibujar(cx, yfinCuerpo + SEP)
          yfinCuerpo += SEP + ALTO
        }
        const xi = cx - Math.max(wr, cuerpo.w) / 2 - lado
        const xd = cx + Math.max(wr, cuerpo.w) / 2 + lado
        // vuelta: del final del cuerpo, por la izquierda, al rombo
        svg += linea([[cx, yfinCuerpo], [cx, yfinCuerpo + 10], [xi, yfinCuerpo + 10], [xi, yr + ROMBO_H / 2], [cx - wr / 2, yr + ROMBO_H / 2]], true)
        // salida «No»: por la derecha, hasta abajo
        svg += linea([[cx + wr / 2, yr + ROMBO_H / 2], [xd, yr + ROMBO_H / 2], [xd, y + h], [cx, y + h]]) + texto(cx + wr / 2 + 12, yr + ROMBO_H / 2 - 6, 'No', 'et')
        return svg
      },
    }
  }
  if (n.tipo === 'repetir') {
    const cuerpo = secuencia(n.cuerpo)
    const wr = ancho(`¿${n.condicion}?`, 46)
    const lado = 26
    const w = Math.max(wr, cuerpo.w) + lado * 2 + 20
    const h = cuerpo.h + SEP + ROMBO_H
    return {
      w, h,
      dibujar: (cx, y) => {
        let svg = cuerpo.dibujar(cx, y)
        const yr = y + cuerpo.h + SEP
        svg += flecha(cx, y + cuerpo.h, cx, yr) + rombo(cx, yr, wr, n.condicion)
        const xi = cx - Math.max(wr, cuerpo.w) / 2 - lado
        // «No»: vuelve a repetir desde arriba
        svg += linea([[cx - wr / 2, yr + ROMBO_H / 2], [xi, yr + ROMBO_H / 2], [xi, y - 10], [cx, y - 10], [cx, y]], true) + texto(cx - wr / 2 - 12, yr + ROMBO_H / 2 - 6, 'No', 'et')
        svg += texto(cx + 14, yr + ROMBO_H + 14, 'Sí', 'et')
        return svg
      },
    }
  }
  return figura(n)
}

/** SVG del diagrama de flujo. Los textos van escapados: es seguro mostrarlo con v-html. */
export function diagramaDeFlujo(nodos: Nodo[]): { svg: string; ancho: number; alto: number } {
  const conInicioYFin: Nodo[] = [
    ...(nodos[0]?.tipo === 'inicio' ? [] : [{ tipo: 'inicio', texto: '' } as Nodo]),
    ...nodos,
    ...(nodos[nodos.length - 1]?.tipo === 'fin' ? [] : [{ tipo: 'fin' } as Nodo]),
  ]
  const b = secuencia(conInicioYFin)
  const margen = 24
  const W = b.w + margen * 2
  const H = b.h + margen * 2 + 14
  const estilos = '<style>.fg{stroke:#334155;stroke-width:1.5}.ov{fill:#e0f2fe}.es{fill:#fef3c7}.pr{fill:#f1f5f9}.de{fill:#ede9fe}' +
    '.fl{stroke:#475569;stroke-width:1.5}.tx{font:600 11px system-ui,sans-serif;fill:#0f172a;text-anchor:middle}.et{font:700 10px system-ui,sans-serif;fill:#475569;text-anchor:middle}</style>'
  const defs = '<defs><marker id="punta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#475569"/></marker></defs>'
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">${estilos}${defs}${b.dibujar(W / 2, margen)}</svg>`,
    ancho: W,
    alto: H,
  }
}
