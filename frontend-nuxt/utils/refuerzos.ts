// Refuerzos y retos (docs/DISENO_INTERVENCION_DOCENTE.md §4 y §10.4): enlaces desde donde aparece el dato y el
// mensaje que STIRE propone al docente (lo revisa y lo cambia antes de enviarlo).

export type TipoRefuerzo = 'refuerzo' | 'reto'

/** «Asignar refuerzo» desde el mapa de calor o la ficha: abre el formulario con estudiantes y lecciones ya elegidos. */
export function enlaceNuevoRefuerzo(classId: number | null | undefined, tipo: TipoRefuerzo, estudiantes: number[], lecciones: number[] = []): string {
  const q = new URLSearchParams({ tipo })
  if (classId) q.set('clase', String(classId))
  if (estudiantes.length) q.set('estudiantes', [...new Set(estudiantes)].join(','))
  if (lecciones.length) q.set('lecciones', [...new Set(lecciones)].join(','))
  return `/docente/refuerzos/nuevo?${q.toString()}`
}

/** Lista de ids de un parámetro «1,2,3» de la dirección. */
export function idsDeConsulta(valor: unknown): number[] {
  return String(valor ?? '').split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0)
}

/**
 * Borrador del mensaje: corto, sobre la tarea y no sobre la persona (Kluger y DeNisi, 1996), y con lo que se espera que
 * haga. El docente lo cambia a su manera; STIRE no envía nada solo.
 */
export function mensajeSugerido(tipo: TipoRefuerzo, lecciones: string[], nombres: string[]): string {
  const saludo = nombres.length === 1 ? `Hola, ${nombres[0].split(' ')[0]}.` : 'Hola.'
  const tema = lecciones.length ? `«${lecciones.join('», «')}»` : 'esta parte del curso'
  if (tipo === 'reto') {
    return `${saludo} Vas muy bien en ${tema}. Te preparé un reto para ir un paso más allá: inténtalo con calma y, si te atascas, pídele una pista al tutor.`
  }
  return `${saludo} Vi que ${tema} todavía está costando. Te preparé unos pasos cortos con otra forma de verlo: haz uno a la vez y, si algo no queda claro, escríbeme.`
}

export const NOMBRE_TIPO_PREGUNTA: Record<string, string> = {
  mcq: 'Opción múltiple',
  ordering: 'Ordenar',
  matching: 'Emparejar',
  drag_drop: 'Clasificar',
  fill_code: 'Completar código',
  coding: 'Programar',
  html_css: 'HTML/CSS',
  ai_evaluated: 'Respuesta abierta',
}

export const NOMBRE_NIVEL: Record<string, string> = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' }
