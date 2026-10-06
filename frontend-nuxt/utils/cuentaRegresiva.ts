/**
 * Utilidad pura para la cuenta regresiva antes de habilitar «Eliminar» (D3 bis).
 * Sin dependencias de Vue: se puede probar con jest sin montar componentes.
 */

export interface ImpactoEliminacion {
  modulos?: number
  temas?: number
  lecciones?: number
  ejercicios?: number
  estudiantesConAvance?: number
  entregas?: number
  matriculados?: number
  sePuedeEliminar: boolean
  motivo?: string
}

/**
 * Duración de la cuenta según el impacto.
 * - Clase/módulo vacíos (sin módulos ni matriculados): 4 s
 * - Resto: 8 s (clase) o 5 s (módulo)
 */
export function duracionSegundos(impacto: ImpactoEliminacion, nivel: 'clase' | 'modulo'): number {
  if (nivel === 'clase') {
    const esVacia = !impacto.modulos && !impacto.matriculados
    return esVacia ? 4 : 8
  }
  // módulo
  const esVacio = !impacto.temas && !impacto.lecciones && !impacto.ejercicios
  return esVacio ? 2 : 5
}

/**
 * ¿Puede confirmar el borrado?
 * Sí cuando: cuenta en 0 Y nombre escrito coincide (sin mayúsculas ni espacios de borde).
 */
export function puedeConfirmar(
  segundosRestantes: number,
  nombreEscrito: string,
  nombreEsperado: string,
): boolean {
  if (segundosRestantes > 0) return false
  return nombreEscrito.trim().toLowerCase() === nombreEsperado.trim().toLowerCase()
}

/** Texto del resumen de consecuencias (plurales correctos en español). */
export function textoConsecuencias(impacto: ImpactoEliminacion, nivel: 'clase' | 'modulo' | 'tema' | 'leccion'): string[] {
  const lineas: string[] = []
  const p = (n: number, singular: string, plural: string) => `${n} ${n === 1 ? singular : plural}`

  if (nivel === 'clase') {
    const partes: string[] = []
    if (impacto.modulos) partes.push(p(impacto.modulos, 'módulo', 'módulos'))
    if (impacto.temas) partes.push(p(impacto.temas, 'tema', 'temas'))
    if (impacto.lecciones) partes.push(p(impacto.lecciones, 'lección', 'lecciones'))
    if (impacto.ejercicios) partes.push(p(impacto.ejercicios, 'ejercicio', 'ejercicios'))
    if (partes.length) lineas.push(`Se eliminarán ${partes.join(', ')}.`)
    if (impacto.matriculados) lineas.push(`${p(impacto.matriculados, 'estudiante matriculado perderá', 'estudiantes matriculados perderán')} el acceso a la clase.`)
  } else {
    const partes: string[] = []
    if (nivel === 'modulo' && impacto.temas) partes.push(p(impacto.temas, 'tema', 'temas'))
    if (impacto.lecciones) partes.push(p(impacto.lecciones, 'lección', 'lecciones'))
    if (impacto.ejercicios) partes.push(p(impacto.ejercicios, 'ejercicio', 'ejercicios'))
    if (partes.length) lineas.push(`Se eliminarán ${partes.join(', ')}.`)
    if (impacto.estudiantesConAvance) lineas.push(`${p(impacto.estudiantesConAvance, 'estudiante tiene', 'estudiantes tienen')} avance aquí.`)
  }

  return lineas
}
