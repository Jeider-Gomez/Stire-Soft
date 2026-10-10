// Diagnóstico de una salida que no coincide (MOD-02 y MOD-04 de la lista de chequeo de Sistemas Tutores, Caro 2015):
// en lugar de solo «se esperaba X y se mostró Y», se reconoce el error de concepto más común que explica la diferencia
// y se dice qué revisar, sin dar la solución. Ejemplo real del QA de Jorge (02/10): entrada 5 y 3, se esperaba 8 y se
// mostró 53 → se juntaron los números como texto.

export type TipoDiagnostico =
  | 'sintaxis' | 'no-existe' | 'indefinido' | 'error' | 'nan'
  | 'vacia' | 'eco' | 'concatena' | 'espacios' | 'mayusculas' | 'puntuacion' | 'por-uno' | 'redondeo' | 'numero' | 'linea'

export interface Diagnostico {
  tipo: TipoDiagnostico
  /** Qué pasó y qué revisar, en lenguaje de estudiante. Nunca trae el código corregido. */
  mensaje: string
  /** Línea del código donde está el error, si el servidor la dijo («… (línea 8)»). */
  linea?: number
}

const LEER_POSICION = 'Ojo: el número entre corchetes es la POSICIÓN, no el valor: la primera línea que entra es lineas[0], la segunda lineas[1].'

/**
 * Un error de JavaScript explicado en palabras de estudiante (10/10, Jeider: «SyntaxError: Unexpected token ';'» y la
 * pista decía «la primera diferencia está en la línea 1»). Mensajes mejorados del compilador: Becker (2016).
 */
function diagnosticarError(o: string): Diagnostico | null {
  const m = /^([A-Za-z]*Error): ?(.*?)(?: \(línea (\d+)\))?$/.exec(o.split('\n')[0].trim())
  if (!m) return null
  const [, tipoError, detalle] = m
  const linea = m[3] ? Number(m[3]) : undefined
  const enLinea = linea ? `en la línea ${linea}` : 'en tu código'
  if (tipoError === 'SyntaxError') {
    return {
      tipo: 'sintaxis', linea,
      mensaje: `JavaScript no entiende cómo está escrito algo ${enLinea}, así que el programa ni siquiera empezó. Revisa que no falte un valor después de un signo (+, *, =), un paréntesis o una comilla. Un comentario /* … */ no cuenta como valor.`,
    }
  }
  const noExiste = /^(\S+) is not defined$/.exec(detalle)
  if (tipoError === 'ReferenceError' && noExiste) {
    return { tipo: 'no-existe', linea, mensaje: `Usas «${noExiste[1]}» ${enLinea}, pero no existe. ¿La creaste antes con const o let? ¿Está escrita igual, con las mismas mayúsculas?` }
  }
  if (tipoError === 'TypeError' && /undefined|null/.test(detalle)) {
    return { tipo: 'indefinido', linea, mensaje: `${enLinea[0].toUpperCase()}${enLinea.slice(1)} usas algo que está vacío (undefined). ¿Leíste una línea de la entrada que no existe? ${LEER_POSICION}` }
  }
  if (tipoError === 'TypeError' && /constant variable/.test(detalle)) {
    return { tipo: 'error', linea, mensaje: `${enLinea[0].toUpperCase()}${enLinea.slice(1)} cambias una variable creada con const, y const no se puede cambiar. Si su valor debe cambiar, créala con let.` }
  }
  return { tipo: 'error', linea, mensaje: `Tu programa se detuvo por un error ${enLinea}: «${detalle || tipoError}». Lee esa línea con calma: ¿qué valor tiene cada variable ahí?` }
}

const lineas = (t: string) => t.replace(/\r\n/g, '\n').split('\n')
const sinEspacios = (t: string) => lineas(t).map((l) => l.trim().replace(/[ \t]+/g, ' ')).filter((l) => l !== '').join('\n')
const sinPuntuacion = (t: string) => t.replace(/[.,;:¡!¿?«»"'()]/g, '').replace(/\s+/g, ' ').trim()
const numero = (t: string): number | null => {
  const s = t.trim().replace(',', '.')
  return s !== '' && /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : null
}

export function diagnosticarSalida(esperada: string, obtenida: string, entrada = ''): Diagnostico | null {
  const e = esperada.trim()
  const o = obtenida.trim()
  if (e === o) return null

  if (o === '') {
    return { tipo: 'vacia', mensaje: 'Tu programa no mostró nada. ¿Escribiste el resultado con console.log?' }
  }
  const error = diagnosticarError(o)
  if (error) return error
  if (/\bNaN\b/.test(o) && !/\bNaN\b/.test(e)) {
    return { tipo: 'nan', mensaje: `Salió NaN, que quiere decir «no es un número»: una cuenta usó un dato que no es número. ¿Lo convertiste con Number(...)? ${LEER_POSICION}` }
  }
  if (/\bundefined\b/.test(o) && !/\bundefined\b/.test(e)) {
    return { tipo: 'indefinido', mensaje: `Salió undefined: mostraste algo que está vacío. ${LEER_POSICION}` }
  }

  const datos = entrada.split(/\s+/).map((x) => x.trim()).filter(Boolean)
  if (datos.length > 0 && o === entrada.trim()) {
    return { tipo: 'eco', mensaje: 'Tu programa muestra la misma entrada que recibe: falta el paso que la procesa.' }
  }
  const ne = numero(e)
  if (ne !== null && datos.length >= 2 && datos.every((d) => numero(d) !== null) && o === datos.join('')) {
    return {
      tipo: 'concatena',
      mensaje: `Los números se juntaron como texto (${datos.map((d) => `«${d}»`).join(' + ')} = «${o}»). Lo que llega de la entrada es texto: conviértelo a número antes de operar.`,
    }
  }

  if (sinEspacios(e) === sinEspacios(o)) {
    return { tipo: 'espacios', mensaje: 'Casi: la diferencia está en espacios o saltos de línea. Revisa qué hay antes y después de cada línea.' }
  }
  if (e.toLowerCase() === o.toLowerCase()) {
    return { tipo: 'mayusculas', mensaje: 'Casi: cambia alguna mayúscula o minúscula. La salida debe ser exactamente igual.' }
  }
  if (sinPuntuacion(e).toLowerCase() === sinPuntuacion(o).toLowerCase()) {
    return { tipo: 'puntuacion', mensaje: 'Casi: falta o sobra un signo (punto, coma, dos puntos…). Compáralos uno por uno.' }
  }

  const no = numero(o)
  if (ne !== null && no !== null) {
    if (Math.abs(ne - no) === 1) {
      return { tipo: 'por-uno', mensaje: 'Te faltó o sobró 1. Si hay un ciclo, revisa dónde empieza y dónde termina (¿< o <=?).' }
    }
    if (Math.round(ne) === Math.round(no) || Math.trunc(ne) === Math.trunc(no)) {
      return { tipo: 'redondeo', mensaje: `El número es cercano, pero no igual: revisa los decimales, la división o el redondeo. Se esperaba ${e}.` }
    }
    return { tipo: 'numero', mensaje: `Tu programa mostró ${o} y se esperaba ${e}. ¿Qué operación o qué paso cambia el resultado?` }
  }

  const le = lineas(e)
  const lo = lineas(o)
  const i = le.findIndex((l, k) => l.trim() !== (lo[k] ?? '').trim())
  const n = i === -1 ? Math.min(le.length, lo.length) + 1 : i + 1
  return { tipo: 'linea', mensaje: `Compara línea por línea: la primera diferencia está en la línea ${n}.` }
}
