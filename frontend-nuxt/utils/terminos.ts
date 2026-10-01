// Los nombres de la estructura del curso, en un solo lugar (docs/DISENO_INTERVENCION_DOCENTE.md §10.1). En el código y la
// base de datos siguen siendo sección → tema → unidad de aprendizaje; en pantalla se llaman así.

export const TERMINOS = {
  modulo: { uno: 'Módulo', varios: 'Módulos' },
  tema: { uno: 'Tema', varios: 'Temas' },
  leccion: { uno: 'Lección', varios: 'Lecciones' },
  explicacion: { uno: 'Explicación', varios: 'Explicaciones' },
  ejercicio: { uno: 'Ejercicio', varios: 'Ejercicios' },
} as const

export type Termino = keyof typeof TERMINOS

/** «1 lección», «3 lecciones»; con `mayuscula`, «3 Lecciones». */
export function contar(n: number, termino: Termino, mayuscula = false): string {
  const t = TERMINOS[termino]
  const palabra = n === 1 ? t.uno : t.varios
  return `${n} ${mayuscula ? palabra : palabra.toLowerCase()}`
}

/** Una lección está «dominada» desde este porcentaje; es el mismo umbral del servidor (learning-progress.service.ts). */
export const DOMINADO = 85

/** Un repaso con intervalo de 21 días o más es un dominio «firme», como las tarjetas maduras de Anki. */
export const DIAS_FIRME = 21
