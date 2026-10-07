/**
 * Utilidad pura para confirmar «Eliminar» (D3 bis; simplificada el 07/10).
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
 * ¿Puede confirmar el borrado? Cuando marcó «Entiendo que se borra para siempre».
 *
 * 07/10, Jeider: antes había que esperar una cuenta regresiva y escribir el nombre exacto, y era tedioso. Solo se puede
 * eliminar lo que ningún estudiante trabajó (si hay avance, el servidor lo impide y se ofrece archivar), así que lo que se
 * pierde es contenido del docente, que ve listado arriba de la casilla. Como Classroom o Moodle: confirmar, no teclear.
 */
export function puedeConfirmar(entendido: boolean): boolean {
  return entendido
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
