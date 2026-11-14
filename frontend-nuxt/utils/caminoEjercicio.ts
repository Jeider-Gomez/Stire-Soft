// El ejercicio de programar v3 (Fase D, paso 3; cuadro «E-Ejercicio» v9, aprobado por Jeider el 10/11): el camino
// Escribe → Ejecuta → Prueba casos → Entrega, para que el estudiante sepa qué hacer sin necesitar al Tutor, y «Tu misión»
// con lo que recibe y lo que muestra el programa, sacado del ejemplo del docente (no se inventa nada).

export type EstadoPaso = 'hecho' | 'actual' | 'pendiente'
export interface PasoCamino { clave: 'escribe' | 'ejecuta' | 'casos' | 'entrega'; titulo: string; ayuda: string; estado: EstadoPaso }
export type TipoCamino = 'codigo' | 'web'

const PASOS: Array<Omit<PasoCamino, 'estado'>> = [
  { clave: 'escribe', titulo: 'Escribe', ayuda: 'tu código' },
  { clave: 'ejecuta', titulo: 'Ejecuta', ayuda: 'pruébalo con tus datos · no cuenta' },
  { clave: 'casos', titulo: 'Prueba casos', ayuda: '¿cumples? · no gasta intentos' },
  { clave: 'entrega', titulo: 'Entrega', ayuda: 'se califica · gasta 1 de {n}' },
]
/** Página web (cuadro «E-Tipo-Html»): no hay datos que ejecutar; la vista previa cambia sola y se prueban las reglas. */
const PASOS_WEB: Array<Omit<PasoCamino, 'estado'>> = [
  { clave: 'escribe', titulo: 'Escribe', ayuda: 'HTML y CSS' },
  { clave: 'ejecuta', titulo: 'Mira', ayuda: 'la vista previa cambia sola' },
  { clave: 'casos', titulo: 'Probar', ayuda: 'revisa las reglas · no gasta intentos' },
  { clave: 'entrega', titulo: 'Entrega', ayuda: 'se califica · gasta 1 de {n}' },
]

/**
 * Dónde va el estudiante. El camino es una guía, no un candado: cada paso se marca hecho apenas pasa, aunque se salte
 * uno (probar los casos sin haber ejecutado con sus datos es válido), y el actual es el primero que falta.
 */
export function caminoEjercicio(e: { cambio: boolean; ejecuto: boolean; cumple: boolean; entrego: boolean; intentos: number }, tipo: TipoCamino = 'codigo'): PasoCamino[] {
  // «Prueba casos» queda hecho cuando los casos de ejemplo pasan, no solo por probarlos: la pregunta es «¿cumples?».
  const hechos = [e.cambio || e.ejecuto || e.cumple || e.entrego, e.ejecuto, e.cumple, e.entrego]
  const actual = hechos.findIndex((h) => !h)
  return (tipo === 'web' ? PASOS_WEB : PASOS).map((p, i) => ({
    ...p,
    ayuda: p.ayuda.replace('{n}', String(Math.max(1, e.intentos))),
    estado: hechos[i] ? 'hecho' : i === actual ? 'actual' : 'pendiente',
  }))
}

const lineas = (t: string) => t.replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '')

/** «3 y 4», «3, 4 y 5». */
export function unirConY(v: string[]): string {
  return v.length <= 1 ? (v[0] ?? '') : `${v.slice(0, -1).join(', ')} y ${v[v.length - 1]}`
}

export interface Mision { entra: string[]; sale: string[]; frase: string }

/** Lo que recibe y lo que muestra el programa con el ejemplo del docente; null si no hay ejemplo. */
export function misionDelEjemplo(ejemplo?: { input: string; expectedOutput: string } | null): Mision | null {
  if (!ejemplo) return null
  const entra = lineas(ejemplo.input ?? '')
  const sale = lineas(ejemplo.expectedOutput ?? '')
  if (!sale.length) return null
  // Valores cortos en la frase; si son largos o muchos, la frase se queda en las cajas de arriba.
  const corto = (v: string[]) => v.length <= 4 && v.every((x) => x.length <= 24)
  const muestra = corto(sale) ? `debe mostrar ${unirConY(sale.map((x) => `«${x}»`))}` : `debe mostrar ${sale.length === 1 ? 'una línea' : `${sale.length} líneas`}`
  const frase = !entra.length
    ? `Ejemplo: sin datos de entrada, ${muestra}.`
    : corto(entra)
      ? `Ejemplo: si ${entra.length === 1 ? 'entra' : 'entran'} ${unirConY(entra.map((x) => `«${x}»`))}, ${muestra}.`
      : `Ejemplo: con ${entra.length} líneas de entrada, ${muestra}.`
  return { entra, sale, frase }
}

