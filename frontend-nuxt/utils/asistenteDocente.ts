/**
 * El Asistente del docente en el panel (docs/PLAN_ASISTENTE_DOCENTE.md §4): qué propone según la pantalla donde está el
 * docente, y cómo un borrador se convierte en módulos, lecciones o ejercicios de STIRE. El servidor solo propone
 * (src/asistente-docente); lo que se crea, lo crea el panel con las rutas de siempre y en borrador. Sin importaciones
 * para probarlo solo.
 */

export type TipoBorrador = 'estructura' | 'leccion' | 'ejercicios'
export type Dificultad = 'basico' | 'intermedio' | 'avanzado'

export interface BorradorEstructura {
  tipo: 'estructura'
  modulos: Array<{ titulo: string; descripcion: string; temas: Array<{ titulo: string; lecciones: Array<{ titulo: string; objetivo: string; dificultad: Dificultad }> }> }>
  porque: string
}
export interface BorradorLeccion { tipo: 'leccion'; titulo: string; explicacion: string; porque: string }
export interface EjercicioBorrador { enunciado: string; opciones: string[]; correcta: number; porQue: string; repasar: string; dificultad: Dificultad }
export interface BorradorEjercicios { tipo: 'ejercicios'; ejercicios: EjercicioBorrador[]; porque: string }
export type BorradorAsistente = BorradorEstructura | BorradorLeccion | BorradorEjercicios

export type PantallaDocente = 'inicio' | 'contenido' | 'clase' | 'ejercicios' | 'otra'

export const TAREAS: Record<TipoBorrador, { titulo: string; ayuda: string; boton: string; necesitaLeccion: boolean }> = {
  estructura: { titulo: 'Estructura del curso', ayuda: 'Módulos, temas y lecciones con su objetivo, en orden.', boton: 'Proponer la estructura', necesitaLeccion: false },
  leccion: { titulo: 'Explicación de una lección', ayuda: 'Texto para leer, con un ejemplo resuelto y un error común.', boton: 'Escribir la explicación', necesitaLeccion: true },
  ejercicios: { titulo: 'Ejercicios de práctica', ayuda: 'Opción múltiple en escalera, con su retroalimentación.', boton: 'Generar los ejercicios', necesitaLeccion: true },
}

/** Dónde está el docente y de qué clase: de eso depende qué le propone primero. */
export function pantallaDeRuta(ruta: string, query: Record<string, unknown>): { pantalla: PantallaDocente; classId: number | null; unitId: number | null } {
  const numero = (v: unknown) => (Number(v) > 0 ? Number(v) : null)
  const deClase = /^\/docente\/clase\/(\d+)/.exec(ruta)
  const classId = numero(query.classId) ?? (deClase ? Number(deClase[1]) : null)
  const unitId = numero(query.unitId) ?? numero(query.unidad) ?? numero(query.leccion)
  let pantalla: PantallaDocente = 'otra'
  if (ruta === '/docente') pantalla = 'inicio'
  else if (ruta.startsWith('/docente/contenidos')) pantalla = 'contenido'
  else if (ruta.startsWith('/docente/ejercicios') || ruta.startsWith('/docente/crear-ejercicio')) pantalla = 'ejercicios'
  else if (deClase) pantalla = 'clase'
  return { pantalla, classId, unitId }
}

/** Lo que el Asistente propone primero en cada pantalla (las otras dos tareas siguen a un clic). */
export function tareaSugerida(p: PantallaDocente): TipoBorrador {
  if (p === 'ejercicios') return 'ejercicios'
  if (p === 'contenido') return 'leccion'
  return 'estructura'
}

/**
 * Dónde se ve lo que se crea: el contenido del curso de esa clase y, si fue para una lección, esa lección en su pestaña
 * («Lección» para la explicación, «Actividades» para los ejercicios). Lo lleva allí aunque ya esté en Contenido.
 */
export function enlaceContenido(classId: number, leccionId?: number, pestana?: 'leccion' | 'actividades'): string {
  if (!leccionId) return `/docente/contenidos?classId=${classId}`
  return `/docente/contenidos?classId=${classId}&unitId=${leccionId}${pestana === 'actividades' ? '&pestana=actividades' : ''}`
}

/** La pregunta de opción múltiple en el formato del constructor de STIRE (McqExerciseBuilder.vue). */
export function configOpcionMultiple(e: EjercicioBorrador): Record<string, unknown> {
  const options = e.opciones.map((text, i) => ({ id: `opt${i + 1}`, text }))
  return {
    options,
    correctAnswerId: options[e.correcta]?.id ?? options[0]?.id,
    isMultipleChoice: false,
    explanation: e.porQue || undefined,
    repasar: e.repasar || undefined,
  }
}

/** Título corto del ejercicio a partir del enunciado: la primera frase, sin pasar de 80 caracteres. */
export function tituloDeEjercicio(enunciado: string, n: number): string {
  const frase = enunciado.split(/(?<=[.?!])\s/)[0].replace(/\s+/g, ' ').trim()
  return frase.length <= 80 ? frase : `Ejercicio ${n}: ${frase.slice(0, 66).trim()}…`
}

/** Los pasos que verá el docente mientras se aplica la estructura: uno por módulo, tema y lección, en orden. */
export function pasosDeEstructura(b: BorradorEstructura): string[] {
  return b.modulos.flatMap((m) => [`Módulo «${m.titulo}»`, ...m.temas.flatMap((t) => [`Tema «${t.titulo}»`, ...t.lecciones.map((l) => `Lección «${l.titulo}»`)])])
}

/** Resumen del borrador en una línea, para la tarjeta. */
export function resumenBorrador(b: BorradorAsistente): string {
  if (b.tipo === 'leccion') return `Explicación de «${b.titulo}»`
  if (b.tipo === 'ejercicios') return b.ejercicios.length === 1 ? '1 ejercicio' : `${b.ejercicios.length} ejercicios`
  const temas = b.modulos.reduce((s, m) => s + m.temas.length, 0)
  const lecciones = b.modulos.reduce((s, m) => s + m.temas.reduce((x, t) => x + t.lecciones.length, 0), 0)
  return `${b.modulos.length} módulos · ${temas} temas · ${lecciones} lecciones`
}

/** El evento con el que Contenido del curso se recarga para mostrar lo que el Asistente acaba de crear. */
export const EVENTO_CONTENIDO_CAMBIO = 'stire:contenido-cambio'
