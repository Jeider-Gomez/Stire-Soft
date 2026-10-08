// Los pasos para resolver un ejercicio de programar (08/10, Jeider: «te dejan todo a ti, y yo todavía no sé cómo
// funciona JavaScript»). Es un andamiaje (scaffolding, Wood, Bruner y Ross, 1976): la misma receta para todos los
// ejercicios de entrada → proceso → salida, armada con el ejemplo y la plantilla de ESE ejercicio, para que el
// estudiante sepa qué hacer primero sin que se le dé la solución. Si se atasca, el Tutor lo guía paso a paso.

export interface PasoCodigo { titulo: string; detalle: string; codigo?: string }

const esNumero = (t: string) => /^-?\d+([.,]\d+)?$/.test(t.trim())

function lineasDe(entrada: string): string[] {
  return entrada.replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '')
}

export function pasosCodigo(e: { codigo: string; ejemplo?: { input: string; expectedOutput: string } | null }): PasoCodigo[] {
  const pasos: PasoCodigo[] = []
  const entra = e.ejemplo ? lineasDe(e.ejemplo.input) : []

  if (e.ejemplo) {
    const queEntra = entra.length === 0
      ? 'Si no entra nada'
      : entra.length === 1 ? `Si entra \`${entra[0]}\`` : `Si entran ${entra.length} líneas, ${entra.map((l) => `\`${l}\``).join(', ')}`
    // El ejemplo va al final y sin punto después: la salida puede terminar en punto y se leía «Algoritmia..».
    pasos.push({ titulo: 'Mira qué entra y qué debe salir', detalle: `Primero piensa cómo lo harías a mano. ${queEntra}, debe salir \`${e.ejemplo.expectedOutput}\`` })
  } else {
    pasos.push({ titulo: 'Mira qué entra y qué debe salir', detalle: 'Lee el enunciado y el ejemplo: qué datos recibe el programa y qué debe mostrar.' })
  }

  if (/\blineas\b/.test(e.codigo)) {
    const numeros = entra.length > 0 && entra.every(esNumero)
    pasos.push({
      titulo: 'La plantilla ya lee la entrada por ti',
      detalle: `Cada línea que entra queda en \`lineas\`: la primera es \`lineas[0]\`${entra.length > 1 ? ', la segunda `lineas[1]`' : ''}, y así. No cambies la línea que las lee.${numeros ? ' Llegan como texto: para hacer cuentas, conviértelas con `Number(...)`.' : ''}`,
      codigo: numeros ? 'const a = Number(lineas[0]);' : 'const dato = lineas[0];',
    })
  } else if (/\binput\b/.test(e.codigo)) {
    pasos.push({ titulo: 'La plantilla ya lee la entrada por ti', detalle: '`input` tiene todo lo que entra, como texto. Si son varias líneas, sepáralas con `input.split(\'\\n\')`.' })
  }

  pasos.push({
    titulo: 'Haz el cálculo o arma el texto',
    detalle: 'Un paso por línea, guardando cada resultado en una variable con `const`. Así es más fácil encontrar un error.',
    codigo: 'const resultado = /* tu cálculo */;',
  })
  pasos.push({
    titulo: 'Muestra el resultado con console.log',
    detalle: 'Debe quedar exactamente como en el ejemplo: mismas mayúsculas, espacios y puntos.',
    codigo: 'console.log(resultado);',
  })
  pasos.push({ titulo: 'Pulsa «Probar código»', detalle: 'En «Casos de prueba» ves si coincide y qué cambia. Probar no gasta intentos: entrega cuando coincida.' })
  return pasos
}
