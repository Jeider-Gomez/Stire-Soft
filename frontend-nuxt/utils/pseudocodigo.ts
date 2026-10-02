// Pseudocódigo ejecutable (docs/DISENO_PROYECTOS.md, fase 4): el curso «Pensamiento algorítmico» escribe algoritmos al
// estilo PSeInt. Aquí se traducen a JavaScript para correrlos en el mismo Worker con tiempo límite que los programas de
// los proyectos (proyectoNavegador.ts). Es un subconjunto: lo que usa el curso y lo más común de PSeInt.
//
// Cada «Leer» toma la siguiente línea de la Entrada. Los errores dicen la línea y están en palabras del estudiante.

export interface ErrorPseudocodigo { linea: number; mensaje: string }
export type Traduccion = { ok: true; js: string } | { ok: false; error: ErrorPseudocodigo }

/** Palabras que se resaltan en el editor y que no pueden ser nombres de variable. */
export const PALABRAS_CLAVE = [
  'algoritmo', 'finalgoritmo', 'proceso', 'finproceso', 'inicio', 'fin', 'definir', 'como', 'dimension', 'leer', 'escribir',
  'mostrar', 'imprimir', 'sin', 'saltar', 'bajar', 'si', 'entonces', 'sino', 'finsi', 'mientras', 'hacer', 'finmientras',
  'para', 'hasta', 'con', 'paso', 'finpara', 'repetir', 'que', 'segun', 'finsegun', 'de', 'otro', 'modo',
] as const
export const OPERADORES_PALABRA = ['y', 'o', 'no', 'mod', 'verdadero', 'falso'] as const

/** Funciones de PSeInt que se pueden usar en las expresiones, con su traducción. */
const FUNCIONES: Record<string, string> = {
  trunc: '__f.trunc', redon: '__f.redon', abs: '__f.abs', raiz: '__f.raiz', rc: '__f.raiz', sen: '__f.sen', cos: '__f.cos',
  tan: '__f.tan', ln: '__f.ln', exp: '__f.exp', azar: '__f.azar', aleatorio: '__f.aleatorio', longitud: '__f.longitud',
  mayusculas: '__f.mayusculas', minusculas: '__f.minusculas', subcadena: '__f.subcadena', concatenar: '__f.concatenar',
  convertiranumero: '__f.convertiranumero', convertiratexto: '__f.convertiratexto',
}
export const NOMBRES_FUNCIONES = Object.keys(FUNCIONES)

const TIPOS: Record<string, 'numero' | 'entero' | 'texto' | 'logico'> = {
  entero: 'entero', real: 'numero', numero: 'numero', numerico: 'numero', caracter: 'texto', texto: 'texto', cadena: 'texto', logico: 'logico',
}

const sinTildes = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '')
const clave = (t: string) => sinTildes(t).toLowerCase()

export class FallaDeTraduccion extends Error {
  constructor(public linea: number, mensaje: string) { super(mensaje) }
}

// ─── Expresiones ────────────────────────────────────────────────────────────────────────────────────────────────────
type Token = { t: 'num' | 'txt' | 'id' | 'op'; v: string }

const IDENT = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü_][A-Za-z0-9ÁÉÍÓÚáéíóúÑñÜü_]*/

function tokenizar(texto: string, linea: number): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < texto.length) {
    const resto = texto.slice(i)
    const c = texto[i]
    if (/\s/.test(c)) { i++; continue }
    if (c === '"' || c === "'" || c === '“' || c === '”') {
      const cierre = c === '“' ? '”' : c
      const fin = texto.indexOf(cierre, i + 1)
      if (fin < 0) throw new FallaDeTraduccion(linea, 'Falta cerrar las comillas de un texto.')
      tokens.push({ t: 'txt', v: texto.slice(i + 1, fin) })
      i = fin + 1
      continue
    }
    const num = /^\d+(\.\d+)?/.exec(resto)
    if (num) { tokens.push({ t: 'num', v: num[0] }); i += num[0].length; continue }
    const id = IDENT.exec(resto)
    if (id) { tokens.push({ t: 'id', v: id[0] }); i += id[0].length; continue }
    const op = /^(<-|←|:=|<=|>=|<>|==|!=|&&|\|\||[-+*/^%()[\],<>=&|~!])/.exec(resto)
    if (op) { tokens.push({ t: 'op', v: op[0] }); i += op[0].length; continue }
    throw new FallaDeTraduccion(linea, `No entiendo el símbolo «${c}».`)
  }
  return tokens
}

/** Traduce una expresión de pseudocódigo a JavaScript. Las variables se leen con __g, que avisa si aún no tienen valor. */
function expresion(texto: string, linea: number): string {
  const tokens = tokenizar(texto, linea)
  if (tokens.length === 0) throw new FallaDeTraduccion(linea, 'Falta una expresión.')
  const salida: string[] = []
  const pila: string[] = []
  // «NO e > 120» niega toda la comparación, como se lee, no solo «e»: el NO se cierra en el siguiente Y, O, coma,
  // paréntesis que cierra o al final.
  const noAbiertos: number[] = []
  const cerrarNo = () => { while (noAbiertos.length && noAbiertos[noAbiertos.length - 1] === pila.length) { noAbiertos.pop(); salida.push(')') } }
  const abrirNo = () => { salida.push('!('); noAbiertos.push(pila.length) }
  for (let k = 0; k < tokens.length; k++) {
    const { t, v } = tokens[k]
    const sig = tokens[k + 1]
    if (t === 'num') salida.push(v)
    else if (t === 'txt') salida.push(JSON.stringify(v))
    else if (t === 'id') {
      const c = clave(v)
      if (c === 'y') { cerrarNo(); salida.push('&&') }
      else if (c === 'o') { cerrarNo(); salida.push('||') }
      else if (c === 'no') abrirNo()
      else if (c === 'mod') salida.push('%')
      else if (c === 'verdadero') salida.push('true')
      else if (c === 'falso') salida.push('false')
      else if (c === 'pi') salida.push('Math.PI')
      else if (sig?.v === '(') {
        if (!FUNCIONES[c]) throw new FallaDeTraduccion(linea, `No conozco la función «${v}». Puedes usar: ${NOMBRES_FUNCIONES.join(', ')}.`)
        salida.push(FUNCIONES[c])
      } else if ((PALABRAS_CLAVE as readonly string[]).includes(c)) {
        throw new FallaDeTraduccion(linea, `«${v}» es una palabra del pseudocódigo y no puede ir dentro de una expresión.`)
      } else if (sig?.v === '[') {
        salida.push(`__idx(__g(${JSON.stringify(c)}), [`)
        pila.push('[')
        k++
      } else salida.push(`__g(${JSON.stringify(c)})`)
    } else {
      if (v === '<-' || v === '←' || v === ':=') throw new FallaDeTraduccion(linea, 'La flecha «<-» guarda un valor: no puede ir dentro de una comparación. Para comparar usa «=».')
      if (v === '(' ) pila.push('(')
      if (v === ')' || v === ']' || v === ',' || v === '&' || v === '|' || v === '&&' || v === '||') cerrarNo()
      if (v === ')') { if (pila.pop() !== '(') throw new FallaDeTraduccion(linea, 'Los paréntesis no están parejos.') }
      if (v === ']') { if (pila.pop() !== '[') throw new FallaDeTraduccion(linea, 'Los corchetes no están parejos.'); salida.push('])'); continue }
      if (v === '~' || v === '!') { abrirNo(); continue }
      const mapa: Record<string, string> = { '=': '==', '<>': '!=', '^': '**', '&': '&&', '|': '||' }
      salida.push(mapa[v] ?? v)
    }
  }
  if (pila.length) throw new FallaDeTraduccion(linea, pila[pila.length - 1] === '(' ? 'Falta cerrar un paréntesis.' : 'Falta cerrar un corchete.')
  cerrarNo()
  return salida.join(' ')
}

/** Parte un texto por las comas que no están dentro de paréntesis, corchetes ni comillas. */
function partirPorComas(texto: string): string[] {
  const partes: string[] = []
  let nivel = 0
  let comilla = ''
  let actual = ''
  for (const c of texto) {
    if (comilla) { if (c === comilla || (comilla === '“' && c === '”')) comilla = ''; actual += c; continue }
    if (c === '"' || c === "'" || c === '“') { comilla = c; actual += c; continue }
    if (c === '(' || c === '[') nivel++
    if (c === ')' || c === ']') nivel--
    if (c === ',' && nivel === 0) { partes.push(actual.trim()); actual = ''; continue }
    actual += c
  }
  if (actual.trim() || partes.length) partes.push(actual.trim())
  return partes
}

/** Un destino de «<-» o de «Leer»: una variable o una posición de un arreglo. */
function destino(texto: string, linea: number): { nombre: string; indices: string | null } {
  const m = /^([A-Za-zÁÉÍÓÚáéíóúÑñÜü_][A-Za-z0-9ÁÉÍÓÚáéíóúÑñÜü_]*)\s*(?:\[(.*)\])?$/.exec(texto.trim())
  if (!m) throw new FallaDeTraduccion(linea, `«${texto.trim()}» no es un nombre de variable válido.`)
  const nombre = clave(m[1])
  if ((PALABRAS_CLAVE as readonly string[]).includes(nombre) || (OPERADORES_PALABRA as readonly string[]).includes(nombre)) {
    throw new FallaDeTraduccion(linea, `«${m[1]}» es una palabra del pseudocódigo: elige otro nombre para la variable.`)
  }
  return { nombre, indices: m[2] !== undefined ? partirPorComas(m[2]).map((e) => expresion(e, linea)).join(', ') : null }
}

/** Quita el comentario (// …) que no está dentro de un texto. */
function sinComentario(linea: string): string {
  let comilla = ''
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i]
    if (comilla) { if (c === comilla || (comilla === '“' && c === '”')) comilla = ''; continue }
    if (c === '"' || c === "'" || c === '“') comilla = c
    else if (c === '/' && linea[i + 1] === '/') return linea.slice(0, i)
  }
  return linea
}

// ─── Instrucciones ──────────────────────────────────────────────────────────────────────────────────────────────────
type Bloque = { tipo: 'si' | 'sino' | 'mientras' | 'para' | 'repetir' | 'segun'; linea: number; casos?: number; k?: number }
const NOMBRE_BLOQUE: Record<Bloque['tipo'], string> = { si: 'Si', sino: 'Si', mientras: 'Mientras', para: 'Para', repetir: 'Repetir', segun: 'Segun' }
const CIERRE_BLOQUE: Record<Bloque['tipo'], string> = { si: 'FinSi', sino: 'FinSi', mientras: 'FinMientras', para: 'FinPara', repetir: 'Hasta Que', segun: 'FinSegun' }

const ASIGNA = /^(.+?)\s*(<-|←|:=)\s*(.+)$/

/**
 * Traduce un algoritmo completo. Si algo no se entiende, devuelve la línea y el motivo en vez de lanzar.
 */
export function traducirPseudocodigo(fuente: string): Traduccion {
  try {
    return { ok: true, js: traducir(fuente) }
  } catch (e) {
    if (e instanceof FallaDeTraduccion) return { ok: false, error: { linea: e.linea, mensaje: e.message } }
    throw e
  }
}

function traducir(fuente: string): string {
  const lineas = fuente.split(/\r?\n/)
  const js: string[] = []
  const pila: Bloque[] = []
  let empezo = false
  let termino = false
  let tmp = 0

  const cierre = (esperado: Bloque['tipo'][], palabra: string, n: number): Bloque => {
    const b = pila.pop()
    if (!b) throw new FallaDeTraduccion(n, `Hay un «${palabra}» sin el bloque que cierra.`)
    if (!esperado.includes(b.tipo)) {
      throw new FallaDeTraduccion(n, `Este «${palabra}» no corresponde: el ${NOMBRE_BLOQUE[b.tipo]} de la línea ${b.linea} se cierra con «${CIERRE_BLOQUE[b.tipo]}».`)
    }
    return b
  }

  for (let i = 0; i < lineas.length; i++) {
    const n = i + 1
    let l = sinComentario(lineas[i]).trim().replace(/;\s*$/, '').trim()
    if (!l) continue
    const c = clave(l)

    if (/^(algoritmo|proceso)\b/.test(c)) {
      if (empezo) throw new FallaDeTraduccion(n, 'Ya hay un «Algoritmo» abierto: un archivo tiene un solo algoritmo.')
      empezo = true
      continue
    }
    if (/^(finalgoritmo|finproceso|fin)$/.test(c)) {
      if (!empezo) throw new FallaDeTraduccion(n, '«FinAlgoritmo» sin «Algoritmo»: empieza con «Algoritmo Nombre».')
      if (pila.length) { const b = pila[pila.length - 1]; throw new FallaDeTraduccion(b.linea, `Falta «${CIERRE_BLOQUE[b.tipo]}» para el ${NOMBRE_BLOQUE[b.tipo]} de esta línea.`) }
      termino = true
      continue
    }
    if (c === 'inicio') continue
    if (!empezo) throw new FallaDeTraduccion(n, 'Todo algoritmo empieza con «Algoritmo Nombre».')
    if (termino) throw new FallaDeTraduccion(n, 'Hay instrucciones después de «FinAlgoritmo».')

    // Un caso de «Segun»: «1, 2:», «"a":» o «De Otro Modo:», con instrucciones opcionales después de los dos puntos.
    const tope = pila[pila.length - 1]
    if (tope?.tipo === 'segun') {
      const otro = /^de\s+otro\s+modo\s*:?\s*(.*)$/i.exec(sinTildes(l))
      const caso = otro ? null : /^([^:]+?):(?!=)\s*(.*)$/.exec(l)
      // «Escribir "Total: "» no es un caso: un caso no empieza con una instrucción.
      const esInstruccion = caso && /^(escribir|mostrar|imprimir|leer|si|mientras|para|repetir|definir|dimension|segun|hasta)\b/.test(clave(caso[1]))
      if (otro || (caso && !esInstruccion && !ASIGNA.test(caso[1]))) {
        const prefijo = tope.casos ? '} else ' : ''
        if (otro) js.push(`${prefijo}{`)
        else {
          const valores = partirPorComas(caso![1]).map((v) => `__s${tope.k} == (${expresion(v, n)})`)
          js.push(`${prefijo}if (${valores.join(' || ')}) {`)
        }
        tope.casos = (tope.casos ?? 0) + 1
        l = (otro ? otro[1] : caso![2]).trim()
        if (!l) continue
      }
    }
    js.push(`__l = ${n};`)
    js.push(instruccion(l, n))
  }
  if (!empezo) throw new FallaDeTraduccion(1, 'Todo algoritmo empieza con «Algoritmo Nombre» y termina con «FinAlgoritmo».')
  if (pila.length) { const b = pila[pila.length - 1]; throw new FallaDeTraduccion(b.linea, `Falta «${CIERRE_BLOQUE[b.tipo]}» para el ${NOMBRE_BLOQUE[b.tipo]} de esta línea.`) }
  if (!termino) throw new FallaDeTraduccion(lineas.length, 'Falta «FinAlgoritmo» al final.')

  function instruccion(l: string, n: number): string {
    const c = clave(l)
    let m: RegExpExecArray | null

    const simple = instruccionSimple(l, n)
    if (simple !== null) return simple
    if ((m = /^si\s+(.+)$/i.exec(l))) {
      const e = /^(.+?)\s+entonces$/i.exec(m[1])
      if (!e) throw new FallaDeTraduccion(n, 'Falta «Entonces» al final del Si: Si condición Entonces.')
      pila.push({ tipo: 'si', linea: n })
      return `if (__cond(${expresion(e[1], n)})) {`
    }
    if (c === 'sino') {
      const b = cierre(['si'], 'SiNo', n)
      pila.push({ tipo: 'sino', linea: b.linea })
      return '} else {'
    }
    if (c === 'finsi') { cierre(['si', 'sino'], 'FinSi', n); return '}' }
    if ((m = /^mientras\s+(.+)$/i.exec(l)) && !/^mientras\s+que\b/i.test(l)) {
      const e = /^(.+?)\s+hacer$/i.exec(m[1])
      if (!e) throw new FallaDeTraduccion(n, 'Falta «Hacer» al final: Mientras condición Hacer.')
      pila.push({ tipo: 'mientras', linea: n })
      return `while (__cond(${expresion(e[1], n)})) { __l = ${n};`
    }
    if (c === 'finmientras') { cierre(['mientras'], 'FinMientras', n); return '}' }
    if (c === 'repetir') { pila.push({ tipo: 'repetir', linea: n }); return 'do {' }
    if ((m = /^(hasta\s+que|mientras\s+que)\s+(.+)$/i.exec(l))) {
      cierre(['repetir'], m[1].replace(/\s+/g, ' '), n)
      const cond = expresion(m[2], n)
      return /^hasta/i.test(m[1]) ? `__l = ${n}; } while (!__cond(${cond}));` : `__l = ${n}; } while (__cond(${cond}));`
    }
    if ((m = /^para\s+(.+?)\s*(<-|←|:=|=)\s*(.+?)\s+hasta\s+(.+?)(?:\s+con\s+paso\s+(.+?))?\s+hacer$/i.exec(l))) {
      const dst = destino(m[1], n)
      if (dst.indices) throw new FallaDeTraduccion(n, 'La variable del Para debe ser una variable simple.')
      const k = ++tmp
      const v = `__v[${JSON.stringify(dst.nombre)}]`
      pila.push({ tipo: 'para', linea: n })
      return `{ const __a${k} = __num(${expresion(m[3], n)}); const __b${k} = __num(${expresion(m[4], n)}); ` +
        `const __p${k} = ${m[5] ? `__num(${expresion(m[5], n)})` : `(__a${k} <= __b${k} ? 1 : -1)`}; __paso(__p${k}); ` +
        `for (${v} = __a${k}; __p${k} > 0 ? ${v} <= __b${k} : ${v} >= __b${k}; ${v} += __p${k}) { __l = ${n};`
    }
    if (/^para\b/i.test(l)) throw new FallaDeTraduccion(n, 'Así se escribe un Para: Para i <- 1 Hasta 10 Hacer (o Con Paso 2 Hacer).')
    if (c === 'finpara') { cierre(['para'], 'FinPara', n); return '}}' }
    if ((m = /^segun\s+(.+?)\s+hacer$/i.exec(sinTildes(l)))) {
      const k = ++tmp
      pila.push({ tipo: 'segun', linea: n, casos: 0, k })
      return `{ const __s${k} = ${expresion(l.replace(/^\S+\s+/, '').replace(/\s+hacer$/i, ''), n)};`
    }
    if (c === 'finsegun') {
      const b = cierre(['segun'], 'FinSegun', n)
      return b.casos ? '}}' : '}'
    }
    const asignada = asignacion(l, n)
    if (asignada !== null) return asignada
    if (/^(finalgoritmo|finproceso)$/.test(c)) throw new FallaDeTraduccion(n, '«FinAlgoritmo» va al final.')
    throw new FallaDeTraduccion(n, `No entiendo esta instrucción: «${l.slice(0, 60)}». Revisa cómo se escribe (Leer, Escribir, x <- valor, Si, Mientras, Para…).`)
  }

  return armar(js)
}

/**
 * Definir, Dimension, Leer y Escribir: instrucciones de una línea, sin bloque. Las usa el algoritmo y también cada figura
 * del diagrama de flujo (diagramaFlujo.ts). null si la línea no es ninguna de ellas.
 */
export function instruccionSimple(l: string, n: number): string | null {
  let m: RegExpExecArray | null
  if ((m = /^definir\s+(.+?)\s+como\s+(\S+)$/i.exec(sinTildes(l)))) {
    const tipo = TIPOS[clave(m[2])]
    if (!tipo) throw new FallaDeTraduccion(n, `«${m[2]}» no es un tipo. Usa Entero, Real, Caracter o Logico.`)
    return `__def(${JSON.stringify(Object.fromEntries(partirPorComas(m[1]).map((v) => [destino(v, n).nombre, tipo])))});`
  }
  if ((m = /^dimension\s+(.+)$/i.exec(sinTildes(l)))) {
    return partirPorComas(m[1]).map((d) => {
      const dst = destino(d, n)
      if (!dst.indices) throw new FallaDeTraduccion(n, 'Indica el tamaño del arreglo: Dimension notas[10].')
      return `__dim(${JSON.stringify(dst.nombre)}, [${dst.indices}]);`
    }).join(' ')
  }
  if ((m = /^leer\s+(.+)$/i.exec(l))) {
    return partirPorComas(m[1]).map((d) => {
      const dst = destino(d, n)
      const valor = `__leer(${JSON.stringify(dst.nombre)})`
      return dst.indices ? `__set(${JSON.stringify(dst.nombre)}, [${dst.indices}], ${valor});` : `__v[${JSON.stringify(dst.nombre)}] = ${valor};`
    }).join(' ')
  }
  if ((m = /^(escribir|mostrar|imprimir)\b\s*(.*)$/i.exec(l))) {
    let resto = m[2]
    const sinSaltar = /\s*\bsin\s+(saltar|bajar)\s*$/i.exec(sinTildes(resto))
    if (sinSaltar) resto = resto.slice(0, sinSaltar.index)
    const partes = resto.trim() ? partirPorComas(resto).map((e) => expresion(e, n)) : []
    return `__escribir([${partes.join(', ')}], ${sinSaltar ? 'false' : 'true'});`
  }
  return null
}

/** «x <- valor» (o «x = valor» como instrucción). null si la línea no es una asignación. */
export function asignacion(l: string, n: number): string | null {
  let m: RegExpExecArray | null
  if ((m = ASIGNA.exec(l)) || (m = /^([A-Za-zÁÉÍÓÚáéíóúÑñÜü_][\wÁÉÍÓÚáéíóúÑñÜü]*(?:\s*\[[^\]]*\])?)\s*(=)\s*(.+)$/.exec(l))) {
    const dst = destino(m[1], n)
    const valor = expresion(m[3], n)
    return dst.indices ? `__set(${JSON.stringify(dst.nombre)}, [${dst.indices}], ${valor});` : `__asignar(${JSON.stringify(dst.nombre)}, ${valor});`
  }
  return null
}

/** Una condición (la de un Si, un Mientras o un rombo del diagrama) como JavaScript que exige verdadero o falso. */
export function condicion(texto: string, n: number): string {
  return `__cond(${expresion(texto, n)})`
}

/** Arma el programa: el ambiente (variables, lectura, escritura) y las instrucciones traducidas. */
export function armar(js: string[], dondeFallo = "'Error en la línea ' + __l"): string {
  return `${AMBIENTE}
let __l = 0;
try {
${js.join('\n')}
__terminar();
} catch (e) {
  __terminar();
  const err = new Error(e && e.message ? e.message : String(e));
  err.name = ${dondeFallo};
  throw err;
}`
}

/** Funciones que usa el código traducido. Corren dentro del Worker de proyectoNavegador.ts. */
const AMBIENTE = `
const __v = Object.create(null);
const __tipos = Object.create(null);
const __entradas = String(leerEntrada()).split(/\\r?\\n/).filter((t) => t.trim() !== '');
let __siguiente = 0;
let __linea = '';
const __falla = (m) => { throw new Error(m); };
const __g = (n) => (n in __v ? __v[n] : __falla('«' + n + '» todavía no tiene un valor: asígnale uno o léelo antes de usarlo.'));
const __def = (d) => { for (const k in d) __tipos[k] = d[k]; };
const __convertir = (n, valor) => {
  const t = __tipos[n];
  if (t === 'entero') { const x = Number(valor); if (!Number.isInteger(x)) __falla('«' + n + '» es Entero y recibió ' + JSON.stringify(valor) + '.'); return x; }
  if (t === 'numero') { const x = Number(valor); if (typeof valor === 'string' && (valor.trim() === '' || Number.isNaN(x))) __falla('«' + n + '» es Real y recibió ' + JSON.stringify(valor) + '.'); return typeof valor === 'string' ? x : valor; }
  if (t === 'logico') { if (typeof valor === 'boolean') return valor; const s = String(valor).trim().toLowerCase(); if (s === 'verdadero') return true; if (s === 'falso') return false; __falla('«' + n + '» es Logico y recibió ' + JSON.stringify(valor) + '.'); }
  if (t === 'texto') return String(valor);
  return valor;
};
const __asignar = (n, valor) => { __v[n] = __convertir(n, valor); };
const __leer = (n) => {
  if (__siguiente >= __entradas.length) __falla('El algoritmo pidió leer «' + n + '» y no hay más datos en la Entrada. Escribe un dato por línea.');
  const t = __entradas[__siguiente++].trim();
  if (__tipos[n]) return __convertir(n, t);
  return t !== '' && !Number.isNaN(Number(t)) ? Number(t) : t;
};
const __mostrar = (x) => x === true ? 'VERDADERO' : x === false ? 'FALSO' : typeof x === 'number' && !Number.isInteger(x) ? String(Math.round(x * 1e6) / 1e6) : String(x);
const __escribir = (partes, salto) => { __linea += partes.map(__mostrar).join(''); if (salto) { console.log(__linea); __linea = ''; } };
const __terminar = () => { if (__linea) { console.log(__linea); __linea = ''; } };
const __cond = (x) => { if (typeof x !== 'boolean') __falla('La condición debe ser verdadera o falsa, y dio ' + __mostrar(x) + '. ¿Usaste «<-» en vez de «=»?'); return x; };
const __num = (x) => { if (typeof x !== 'number' || Number.isNaN(x)) __falla('Se esperaba un número y llegó ' + JSON.stringify(x) + '.'); return x; };
const __paso = (p) => { if (p === 0) __falla('El paso del Para no puede ser 0: nunca terminaría.'); };
const __dim = (n, tam) => { __v[n] = { __arreglo: true, tam, datos: Object.create(null) }; };
const __pos = (a, n, idx) => {
  if (!a || !a.__arreglo) __falla('«' + n + '» no es un arreglo: créalo antes con Dimension ' + n + '[tamaño].');
  if (idx.length !== a.tam.length) __falla('«' + n + '» tiene ' + a.tam.length + ' dimensión(es) y se usó con ' + idx.length + '.');
  idx.forEach((i, k) => { if (!Number.isInteger(i) || i < 0 || i > a.tam[k]) __falla('La posición ' + i + ' está fuera de «' + n + '» (va de 0 o 1 hasta ' + a.tam[k] + ').'); });
  return idx.join(',');
};
const __idx = (a, idx) => { const k = __pos(a, '?', idx); return k in a.datos ? a.datos[k] : __falla('Esa posición del arreglo todavía no tiene un valor.'); };
const __set = (n, idx, valor) => { const a = __v[n]; a.datos[__pos(a, n, idx)] = valor; };
const __f = {
  trunc: Math.trunc, redon: Math.round, abs: Math.abs, sen: Math.sin, cos: Math.cos, tan: Math.tan, exp: Math.exp,
  raiz: (x) => (x < 0 ? __falla('No hay raíz de un número negativo.') : Math.sqrt(x)),
  ln: (x) => (x <= 0 ? __falla('El logaritmo necesita un número mayor que 0.') : Math.log(x)),
  azar: (x) => Math.floor(Math.random() * x), aleatorio: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  longitud: (s) => String(s).length, mayusculas: (s) => String(s).toUpperCase(), minusculas: (s) => String(s).toLowerCase(),
  subcadena: (s, a, b) => String(s).substring(a, b + 1), concatenar: (a, b) => String(a) + String(b),
  convertiranumero: (s) => { const x = Number(s); return Number.isNaN(x) ? __falla('«' + s + '» no es un número.') : x; },
  convertiratexto: (x) => __mostrar(x),
};
`

/** Pseudocódigo con el que arranca un proyecto nuevo o el código inicial de una entrega. */
export function algoritmoDeEjemplo(titulo = 'MiAlgoritmo'): string {
  const nombre = sinTildes(titulo).replace(/[^A-Za-z0-9]+/g, ' ').trim().split(' ').filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join('') || 'MiAlgoritmo'
  return `Algoritmo ${/^\d/.test(nombre) ? 'A' + nombre : nombre}\n    // Cada Leer toma una línea de la Entrada.\n    Leer nombre\n    Escribir "Hola, ", nombre\nFinAlgoritmo\n`
}
