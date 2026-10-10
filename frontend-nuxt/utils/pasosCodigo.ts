// Los pasos para resolver un ejercicio de programar (08/10, Jeider: «te dejan todo a ti, y yo todavía no sé cómo
// funciona JavaScript»). Es un andamiaje (scaffolding, Wood, Bruner y Ross, 1976): la misma receta para todos los
// ejercicios de entrada → proceso → salida, armada con el ejemplo y la plantilla de ESE ejercicio, para que el
// estudiante sepa qué hacer primero sin que se le dé la solución. Si se atasca, el Tutor lo guía paso a paso.
//
// 10/10 (Jeider, «Área y perímetro»): escribió `lineas[3]` porque la base era 3, y copió `const resultado = /* tu
// cálculo */;`, que no es JavaScript válido. Por eso ahora: (1) se muestra qué hay en cada posición de `lineas` (ver la
// entrada antes de programar: Predecir de PRIMM: Sentance, Waite y Kallia, 2019); (2) la salida se parte en una meta por línea,
// cada una con su marca cuando ya coincide (submetas: Margulieux y Catrambone, 2016); (3) todo el código de ejemplo es
// JavaScript que funciona si se pega.

export interface DatoEntrada { posicion: string; valor: string }
export interface MetaSalida { linea: number; esperado: string; ok?: boolean }
export interface PasoCodigo {
  titulo: string
  detalle: string
  codigo?: string
  /** Qué hay en cada posición de `lineas` con el ejemplo. */
  datos?: DatoEntrada[]
  /** Cada línea que debe mostrar el programa, y si la última prueba ya la mostró igual. */
  metas?: MetaSalida[]
}

const esNumero = (t: string) => /^-?\d+([.,]\d+)?$/.test(t.trim())

function lineasDe(entrada: string): string[] {
  return entrada.replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '')
}

const ORDINAL = ['primera', 'segunda', 'tercera', 'cuarta', 'quinta']

export function pasosCodigo(e: {
  codigo: string
  ejemplo?: { input: string; expectedOutput: string; actualOutput?: string; passed?: boolean } | null
}): PasoCodigo[] {
  const pasos: PasoCodigo[] = []
  const entra = e.ejemplo ? lineasDe(e.ejemplo.input) : []
  const sale = e.ejemplo ? e.ejemplo.expectedOutput.replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '') : []

  if (e.ejemplo) {
    const queEntra = entra.length === 0
      ? 'Si no entra nada'
      : entra.length === 1 ? `Si entra \`${entra[0]}\`` : `Si entran ${entra.length} líneas, ${entra.map((l) => `\`${l}\``).join(', ')}`
    const queSale = sale.length > 1 ? `deben salir ${sale.length} líneas: ${sale.map((l) => `\`${l}\``).join(' y luego ')}` : `debe salir \`${e.ejemplo.expectedOutput}\``
    // El ejemplo va al final y sin punto después: la salida puede terminar en punto y se leía «Algoritmia..».
    pasos.push({ titulo: 'Mira qué entra y qué debe salir', detalle: `Primero piensa cómo lo harías a mano. ${queEntra}, ${queSale}` })
  } else {
    pasos.push({ titulo: 'Mira qué entra y qué debe salir', detalle: 'Lee el enunciado y el ejemplo: qué datos recibe el programa y qué debe mostrar.' })
  }

  const numeros = entra.length > 0 && entra.every(esNumero)
  if (/\blineas\b/.test(e.codigo)) {
    pasos.push({
      titulo: 'Lo que recibe tu programa',
      detalle: `La plantilla ya lee la entrada: cada línea queda en \`lineas\`. El número entre corchetes es la posición y empieza en 0; no es el valor.${numeros ? ' Llegan como texto: para hacer cuentas, conviértelas con `Number(...)`.' : ''} No cambies la línea que las lee.`,
      datos: entra.slice(0, 5).map((v, i) => ({ posicion: `lineas[${i}]`, valor: v })),
      codigo: numeros
        ? `const a = Number(lineas[0]); // a vale ${entra[0]}, la ${ORDINAL[0]} línea`
        : `const dato = lineas[0]; // dato vale "${entra[0] ?? ''}"`,
    })
  } else if (/\binput\b/.test(e.codigo)) {
    pasos.push({ titulo: 'Lo que recibe tu programa', detalle: '`input` tiene todo lo que entra, como texto. Si son varias líneas, sepáralas con `input.split(\'\\n\')`.' })
  }

  pasos.push({
    titulo: 'Haz el cálculo o arma el texto',
    detalle: 'Un paso por línea, guardando cada resultado en una variable con `const` y un nombre que diga qué es. Así es más fácil encontrar un error.',
    codigo: numeros ? 'const doble = a * 2; // cambia a * 2 por lo que pide el ejercicio' : 'const mensaje = "Recibí: " + dato; // cambia esto por lo que pide el ejercicio',
  })

  const obtenidas = (e.ejemplo?.actualOutput ?? '').replace(/\r/g, '').split('\n')
  const probado = e.ejemplo?.passed !== undefined
  pasos.push({
    titulo: sale.length > 1 ? `Muestra ${sale.length} líneas, en este orden` : 'Muestra el resultado con console.log',
    detalle: sale.length > 1
      ? 'Cada `console.log` escribe una línea. Usa uno para cada línea, en el orden del ejemplo.'
      : 'Debe quedar exactamente como en el ejemplo: mismas mayúsculas, espacios y puntos.',
    metas: sale.length > 1
      ? sale.map((esperado, i) => ({ linea: i + 1, esperado, ok: probado ? (obtenidas[i] ?? '').trim() === esperado.trim() : undefined }))
      : undefined,
    codigo: numeros ? 'console.log(doble);' : 'console.log(mensaje);',
  })
  pasos.push({ titulo: 'Pulsa «Probar código»', detalle: 'En «Casos de prueba» ves si coincide y qué cambia. Probar no gasta intentos: entrega cuando coincida.' })
  return pasos
}
