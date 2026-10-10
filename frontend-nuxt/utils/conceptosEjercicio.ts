// «Lo que vas a usar» en un ejercicio de programar (10/10, Jeider: «yo no sé JavaScript… si hubiera una mejor guía en el
// ejercicio de cómo hacerlo o qué debería ir a revisar»). Para quien ya vio el tema pero no lo recuerda, se muestran solo
// los conceptos que pide ESTE ejercicio, cada uno con una frase y un ejemplo resuelto de OTRO contexto (efecto del
// ejemplo resuelto: Atkinson, Derry, Renkl y Wortham, 2000; Renkl y Atkinson, 2003). Nunca es la solución: los ejemplos
// usan otros datos y otro problema. Se deducen del enunciado, la plantilla y el ejemplo; el docente no tiene que hacer nada.

export type ClaveConcepto =
  | 'leer-entrada' | 'convertir-numero' | 'operaciones' | 'division-entera' | 'texto' | 'varias-lineas'
  | 'decisiones' | 'ciclos' | 'escribir-bien'

export interface Concepto {
  clave: ClaveConcepto
  titulo: string
  /** Una frase, en lenguaje de estudiante. */
  idea: string
  /** Ejemplo resuelto de otro contexto (JavaScript válido). */
  ejemplo: string
}

export const CONCEPTOS: Record<ClaveConcepto, Concepto> = {
  'leer-entrada': {
    clave: 'leer-entrada',
    titulo: 'Leer lo que entra',
    idea: 'La plantilla guarda cada línea que entra en lineas. Se cuenta desde 0: la primera es lineas[0], la segunda lineas[1]. El número es la posición, no el valor.',
    ejemplo: '// Si entra:  Ana\n//            17\nconst nombre = lineas[0]; // "Ana"\nconst edad = lineas[1];   // "17"',
  },
  'convertir-numero': {
    clave: 'convertir-numero',
    titulo: 'Convertir texto en número',
    idea: 'Todo lo que entra llega como texto. Para hacer cuentas, conviértelo con Number(...). Sin eso, "5" + "3" da "53".',
    ejemplo: 'const precio = Number("1500"); // 1500, ya es número\nconsole.log(precio + 500);     // 2000',
  },
  operaciones: {
    clave: 'operaciones',
    titulo: 'Operaciones',
    idea: 'Suma +, resta -, multiplicación *, división /. Los paréntesis se hacen primero, como en matemáticas. Guarda cada resultado en una variable con un nombre que diga qué es.',
    ejemplo: 'const precio = 1500;\nconst envio = 500;\nconst total = (precio + envio) * 2; // 4000',
  },
  'division-entera': {
    clave: 'division-entera',
    titulo: 'División entera y residuo',
    idea: 'Math.floor(a / b) da cuántas veces cabe b en a (sin decimales). a % b da lo que sobra.',
    ejemplo: 'const dias = Math.floor(50 / 7); // 7 semanas completas\nconst sobran = 50 % 7;           // 1 día que sobra',
  },
  texto: {
    clave: 'texto',
    titulo: 'Armar un texto',
    idea: 'Une textos y variables con +. Los espacios y signos van dentro de las comillas, y deben quedar igual que en el ejemplo.',
    ejemplo: 'const ciudad = "Montería";\nconsole.log("Vivo en " + ciudad + ".");  // Vivo en Montería.',
  },
  'varias-lineas': {
    clave: 'varias-lineas',
    titulo: 'Mostrar varias líneas',
    idea: 'Cada console.log escribe una línea. Si deben salir dos líneas, usa dos console.log, en el orden del ejemplo.',
    ejemplo: 'console.log(10); // primera línea\nconsole.log(20); // segunda línea',
  },
  decisiones: {
    clave: 'decisiones',
    titulo: 'Decidir con if',
    idea: 'if revisa una condición: si se cumple hace lo primero; si no, lo que está en else.',
    ejemplo: 'const nota = 3.5;\nif (nota >= 3) {\n  console.log("Aprobó");\n} else {\n  console.log("Reprobó");\n}',
  },
  ciclos: {
    clave: 'ciclos',
    titulo: 'Repetir con for',
    idea: 'for repite un bloque: dónde empieza, hasta cuándo sigue y cuánto avanza en cada vuelta. Revisa si el último valor entra (< o <=).',
    ejemplo: 'for (let i = 1; i <= 3; i++) {\n  console.log("Vuelta " + i);\n}',
  },
  'escribir-bien': {
    clave: 'escribir-bien',
    titulo: 'Escribir para que JavaScript entienda',
    idea: 'Cada operación necesita un valor a cada lado; cada paréntesis o comilla que abres, se cierra. Un comentario /* … */ no es un valor.',
    ejemplo: 'const total = 3 + 4;   // bien: un valor a cada lado del +\n// const mal = 3 + ;   // mal: falta el valor después del +',
  },
}

const lineasDe = (t: string) => t.replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '')
const esNumero = (t: string) => /^-?\d+([.,]\d+)?$/.test(t.trim())

/** Los conceptos que pide este ejercicio, en el orden en que se usan al programar. */
export function conceptosDelEjercicio(e: {
  enunciado: string
  plantilla: string
  ejemplo?: { input: string; expectedOutput: string } | null
  unidad?: string
}): Concepto[] {
  const texto = `${e.enunciado}\n${e.unidad ?? ''}`
  const entra = e.ejemplo ? lineasDe(e.ejemplo.input) : []
  const sale = e.ejemplo ? lineasDe(e.ejemplo.expectedOutput) : []
  const claves: ClaveConcepto[] = []
  if (/\blineas\b/.test(e.plantilla) && entra.length > 0) claves.push('leer-entrada')
  if (entra.length > 0 && entra.some(esNumero)) claves.push('convertir-numero')
  if (/[×÷*]|\b(suma|resta|multiplic|divid|área|perímetro|promedio|total|calcul|operador|expresi)/i.test(texto)) claves.push('operaciones')
  if (/Math\.floor|%|\b(residuo|resto|entera|sobran|horas y minutos)/i.test(texto)) claves.push('division-entera')
  if (sale.some((l) => /[A-Za-zÁÉÍÓÚáéíóúñ]{2,}/.test(l) && !esNumero(l))) claves.push('texto')
  if (sale.length > 1) claves.push('varias-lineas')
  if (/\bif\b|\bsi (es|el|la|un|una)\b|condicional|decisi|mayor que|menor que|\bpar\b|\bimpar\b|aprob/i.test(texto)) claves.push('decisiones')
  if (/\bfor\b|\bwhile\b|\bciclo|\bbucle|repet|tabla de multiplicar|desde 1 hasta/i.test(texto)) claves.push('ciclos')
  return claves.map((c) => CONCEPTOS[c])
}
