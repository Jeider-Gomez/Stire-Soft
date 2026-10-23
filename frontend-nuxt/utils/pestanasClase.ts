// La clase como lugar (docs/DISENO_INTERVENCION_DOCENTE.md §8, fase E): el docente entra a SU clase y ahí encuentra
// todo, en pestañas, como en Canvas o Google Classroom, en vez de un menú por herramienta donde cada pantalla le
// vuelve a preguntar «¿de qué clase?». Las pestañas son enlaces a las pantallas de siempre, con la clase ya elegida.

export type PestanaClase = 'hoy' | 'contenido' | 'estudiantes' | 'asistencia' | 'entregas' | 'refuerzos' | 'notas' | 'ajustes'

export const PESTANAS_CLASE: Array<{ id: PestanaClase; texto: string }> = [
  { id: 'hoy', texto: 'Hoy' },
  { id: 'contenido', texto: 'Contenido' },
  { id: 'estudiantes', texto: 'Estudiantes' },
  { id: 'asistencia', texto: 'Asistencia' },
  { id: 'entregas', texto: 'Entregas' },
  { id: 'refuerzos', texto: 'Refuerzos' },
  { id: 'notas', texto: 'Notas' },
  { id: 'ajustes', texto: 'Ajustes' },
]

/** Dirección de una pestaña para una clase. Cada pantalla conserva el parámetro que ya leía. */
export function enlacePestana(pestana: PestanaClase, classId: number): string {
  switch (pestana) {
    case 'hoy': return `/docente/clase/${classId}`
    case 'contenido': return `/docente/contenidos?classId=${classId}`
    case 'estudiantes': return `/docente/rendimiento?classId=${classId}`
    case 'asistencia': return `/docente/clase/${classId}/asistencia`
    case 'entregas': return `/docente/entregas?clase=${classId}`
    case 'refuerzos': return `/docente/refuerzos?clase=${classId}`
    case 'notas': return `/docente/clase/${classId}/notas`
    case 'ajustes': return `/docente/clase/${classId}/ajustes`
  }
}

/** La clase de la que trata la dirección actual, venga en la ruta (`/docente/clase/5`) o en la consulta. */
export function claseDeLaRuta(ruta: string, consulta: Record<string, unknown>): number | null {
  const enRuta = /^\/docente\/clase\/(\d+)/.exec(ruta)
  const valor = enRuta ? enRuta[1] : (consulta.classId ?? consulta.clase)
  const id = Number(Array.isArray(valor) ? valor[0] : valor)
  return Number.isInteger(id) && id > 0 ? id : null
}

/**
 * La sección de la clase que muestra la dirección actual (para marcarla en la barra lateral), o null si no es una
 * pantalla de la clase. «Estudiantes» incluye la ficha de un estudiante.
 */
export function pestanaDeLaRuta(ruta: string): PestanaClase | null {
  const enClase = /^\/docente\/clase\/\d+(?:\/([a-z]+))?\/?$/.exec(ruta)
  if (enClase) {
    const seccion = enClase[1]
    if (!seccion) return 'hoy'
    return seccion === 'asistencia' || seccion === 'notas' || seccion === 'ajustes' ? seccion : null
  }
  if (ruta.startsWith('/docente/contenidos')) return 'contenido'
  if (ruta.startsWith('/docente/rendimiento') || ruta.startsWith('/docente/estudiante/')) return 'estudiantes'
  if (ruta.startsWith('/docente/entregas')) return 'entregas'
  if (ruta.startsWith('/docente/refuerzos')) return 'refuerzos'
  return null
}
