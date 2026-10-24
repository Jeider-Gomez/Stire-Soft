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

/**
 * Lo que muestra la barra lateral (rediseño v2, 24/10): cinco secciones en vez de ocho. Dos agrupan pantallas que siguen
 * existiendo («Estudiantes y avance» incluye Refuerzos; «Asistencia y notas», las dos) y, cuando están abiertas, las
 * muestran debajo. Ajustes va aparte, al pie de la clase.
 */
export const SECCIONES_MENU: Array<{ id: PestanaClase; texto: string; incluye: PestanaClase[] }> = [
  { id: 'hoy', texto: 'Resumen', incluye: ['hoy'] },
  { id: 'contenido', texto: 'Contenido del curso', incluye: ['contenido'] },
  { id: 'estudiantes', texto: 'Estudiantes y avance', incluye: ['estudiantes', 'refuerzos'] },
  { id: 'entregas', texto: 'Entregas', incluye: ['entregas'] },
  { id: 'asistencia', texto: 'Asistencia y notas', incluye: ['asistencia', 'notas'] },
]

/** La sección del menú que contiene una pantalla de la clase (Refuerzos → «Estudiantes y avance»). */
export function seccionDelMenu(pestana: PestanaClase | null): PestanaClase | null {
  if (!pestana) return null
  if (pestana === 'ajustes') return 'ajustes'
  return SECCIONES_MENU.find((s) => s.incluye.includes(pestana))?.id ?? null
}

/** Color con el que se reconoce cada clase en el menú y en sus tarjetas, mientras no tenga portada propia. */
export const COLORES_CLASE = ['#0B3D91', '#0F766E', '#7B2FBF', '#B45309', '#334155', '#BE185D'] as const
export function colorDeClase(indice: number): string {
  return COLORES_CLASE[((indice % COLORES_CLASE.length) + COLORES_CLASE.length) % COLORES_CLASE.length]
}

/**
 * Qué clase muestra el menú: la de la dirección; si la dirección no es de una clase (Inicio, Mensajes), la última que
 * eligió el docente, si todavía es suya; si no, la primera.
 */
export function claseDelMenu(deLaRuta: number | null, recordada: number | null, ids: number[]): number | null {
  if (deLaRuta && ids.includes(deLaRuta)) return deLaRuta
  if (recordada && ids.includes(recordada)) return recordada
  return ids[0] ?? null
}
