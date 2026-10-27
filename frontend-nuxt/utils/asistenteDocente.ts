/**
 * El Asistente del docente en el panel (docs/PLAN_ASISTENTE_DOCENTE.md §4): qué propone según la pantalla donde está el
 * docente, y cómo un borrador se convierte en módulos, lecciones o ejercicios de STIRE. El servidor solo propone
 * (src/asistente-docente); lo que se crea, lo crea el panel con las rutas de siempre y en borrador. Sin importaciones
 * para probarlo solo.
 */

export type TipoBorrador = 'estructura' | 'leccion' | 'alternativa' | 'ejercicios' | 'programacion' | 'analisis'
export type Dificultad = 'basico' | 'intermedio' | 'avanzado'

export interface BorradorEstructura {
  tipo: 'estructura'
  modulos: Array<{ titulo: string; descripcion: string; temas: Array<{ titulo: string; lecciones: Array<{ titulo: string; objetivo: string; dificultad: Dificultad }> }> }>
  porque: string
}
export interface BorradorLeccion { tipo: 'leccion'; titulo: string; explicacion: string; porque: string }
export interface EjercicioBorrador { enunciado: string; opciones: string[]; correcta: number; porQue: string; repasar: string; dificultad: Dificultad }
export interface BorradorEjercicios { tipo: 'ejercicios'; ejercicios: EjercicioBorrador[]; porque: string }
export interface BorradorAlternativa { tipo: 'alternativa'; forma: 'analogia' | 'paso'; titulo: string; explicacion: string; cuando: 'noclaro' | 'falla2' | 'repaso'; porque: string }
export type AccionHallazgo = 'alternativa' | 'ejercicios' | 'refuerzo' | 'mensaje'
export interface HallazgoClase { titulo: string; detalle: string; accion: AccionHallazgo; leccion: string }
export interface BorradorAnalisis { tipo: 'analisis'; hallazgos: HallazgoClase[]; porque: string }
/** Un ejercicio de programación: las salidas de sus casos las calculó el juez de STIRE con la solución. */
export interface EjercicioProgramacion { titulo: string; enunciado: string; inicial: string; solucion: string; casos: Array<{ entrada: string; salida: string; publico: boolean }>; dificultad: Dificultad }
export interface BorradorProgramacion { tipo: 'programacion'; ejercicios: EjercicioProgramacion[]; porque: string }
export type BorradorAsistente = BorradorEstructura | BorradorLeccion | BorradorAlternativa | BorradorEjercicios | BorradorProgramacion | BorradorAnalisis

export type PantallaDocente = 'inicio' | 'contenido' | 'clase' | 'ejercicios' | 'otra'

export const TAREAS: Record<TipoBorrador, { titulo: string; ayuda: string; boton: string; necesitaLeccion: boolean }> = {
  estructura: { titulo: 'Estructura del curso', ayuda: 'Módulos, temas y lecciones con su objetivo, en orden.', boton: 'Proponer la estructura', necesitaLeccion: false },
  leccion: { titulo: 'Explicación de una lección', ayuda: 'Texto para leer, con un ejemplo resuelto y un error común.', boton: 'Escribir la explicación', necesitaLeccion: true },
  alternativa: { titulo: 'Explicación alternativa', ayuda: 'Otra forma de explicar la lección para quien no la entendió.', boton: 'Escribir la alternativa', necesitaLeccion: true },
  ejercicios: { titulo: 'Ejercicios de práctica', ayuda: 'Opción múltiple en escalera, con su retroalimentación.', boton: 'Generar los ejercicios', necesitaLeccion: true },
  programacion: { titulo: 'Ejercicios de programación', ayuda: 'En JavaScript, corregidos por el juez; STIRE comprueba la solución.', boton: 'Generar los ejercicios', necesitaLeccion: true },
  analisis: { titulo: 'Analizar mi clase', ayuda: 'Qué atender primero y con qué, según cómo le va a la clase.', boton: 'Analizar la clase', necesitaLeccion: false },
}

/** Las tareas en el orden del panel. */
export const ORDEN_TAREAS: TipoBorrador[] = ['estructura', 'leccion', 'alternativa', 'ejercicios', 'programacion', 'analisis']

/** Qué hace cada hallazgo del análisis: el botón y adónde lleva (o qué tarea abre en el Asistente). */
export const ACCION_HALLAZGO: Record<AccionHallazgo, { texto: string; tarea?: TipoBorrador }> = {
  alternativa: { texto: 'Preparar una explicación alternativa', tarea: 'alternativa' },
  ejercicios: { texto: 'Preparar más práctica', tarea: 'ejercicios' },
  refuerzo: { texto: 'Ver quiénes y asignar un refuerzo' },
  mensaje: { texto: 'Escribir un aviso a la clase' },
}
export function enlaceDeHallazgo(accion: AccionHallazgo, classId: number): string | null {
  if (accion === 'refuerzo') return `/docente/clase/${classId}#bloqueados`
  if (accion === 'mensaje') return '/docente/mensajes?ver=avisos'
  return null
}

/**
 * El resumen ANÓNIMO de la clase que se le manda al Asistente para el análisis: cifras por lección y nombres de errores,
 * nunca nombres de estudiantes. Se arma aquí, en el navegador del docente.
 */
export function resumenAnonimoClase(d: {
  estudiantes?: number
  bloqueados?: ReadonlyArray<{ studentId: number; unitTitle: string }>
  segurosQueFallan?: ReadonlyArray<{ studentId: number; unitTitle: string }>
  errores?: ReadonlyArray<{ nombre: string; detalle?: string; estudiantes: ReadonlyArray<unknown> }>
}): string {
  const lineas: string[] = []
  if (d.estudiantes) lineas.push(`Estudiantes en la clase: ${d.estudiantes}.`)
  const porLeccion = (filas: ReadonlyArray<{ studentId: number; unitTitle: string }> = []) => {
    const m = new Map<string, Set<number>>()
    for (const f of filas) m.set(f.unitTitle, (m.get(f.unitTitle) ?? new Set()).add(f.studentId))
    return [...m.entries()].sort((a, b) => b[1].size - a[1].size)
  }
  for (const [leccion, ids] of porLeccion(d.bloqueados)) lineas.push(`Lección «${leccion}»: ${ids.size} fallan varias veces seguidas (bloqueados).`)
  for (const [leccion, ids] of porLeccion(d.segurosQueFallan)) lineas.push(`Lección «${leccion}»: ${ids.size} dicen estar seguros y fallan.`)
  for (const e of (d.errores ?? []).slice(0, 5)) lineas.push(`Error de concepto repetido esta semana: «${e.nombre}» (${e.estudiantes.length} estudiantes)${e.detalle ? `: ${e.detalle}` : ''}.`)
  return lineas.length ? lineas.join('\n') : 'Sin alertas esta semana: nadie está bloqueado ni hay errores repetidos.'
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
  if (p === 'clase') return 'analisis'
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

/** Una lista con el elemento `i` movido a `j` (fuera de rango, igual). Para reordenar el borrador antes de crearlo. */
export function moverItem<T>(lista: ReadonlyArray<T>, i: number, j: number): T[] {
  const copia = [...lista]
  if (i < 0 || i >= copia.length || j < 0 || j >= copia.length || i === j) return copia
  const [x] = copia.splice(i, 1)
  copia.splice(j, 0, x)
  return copia
}
export const quitarItem = <T>(lista: ReadonlyArray<T>, i: number): T[] => lista.filter((_, k) => k !== i)

/** El enlace a un ejercicio creado: su lección en «Actividades», con la ventana de edición de ese ejercicio abierta. */
export function enlaceEjercicio(classId: number, leccionId: number, ejercicioId: number): string {
  return `${enlaceContenido(classId, leccionId, 'actividades')}&ejercicio=${ejercicioId}`
}

/** La configuración de una pregunta de programación tal como la guarda el constructor de STIRE (CodingExerciseBuilder). */
export function configProgramacion(e: EjercicioProgramacion) {
  let publico = 0
  let oculto = 0
  return {
    language: 'javascript',
    starterCode: e.inicial,
    testCases: e.casos.map((c) => ({
      label: c.publico ? `Ejemplo ${++publico}` : `Caso oculto ${++oculto}`,
      input: c.entrada,
      expected: c.salida,
      isPublic: c.publico,
    })),
  }
}

/** Resumen del borrador en una línea, para la tarjeta. */
export function resumenBorrador(b: BorradorAsistente): string {
  if (b.tipo === 'leccion') return `Explicación de «${b.titulo}»`
  if (b.tipo === 'alternativa') return `${b.forma === 'paso' ? 'Paso a paso' : 'Analogía'}: «${b.titulo}»`
  if (b.tipo === 'programacion') return b.ejercicios.length === 1 ? '1 ejercicio de programación' : `${b.ejercicios.length} ejercicios de programación`
  if (b.tipo === 'analisis') return b.hallazgos.length === 1 ? '1 cosa por atender' : `${b.hallazgos.length} cosas por atender`
  if (b.tipo === 'ejercicios') return b.ejercicios.length === 1 ? '1 ejercicio' : `${b.ejercicios.length} ejercicios`
  const temas = b.modulos.reduce((s, m) => s + m.temas.length, 0)
  const lecciones = b.modulos.reduce((s, m) => s + m.temas.reduce((x, t) => x + t.lecciones.length, 0), 0)
  return `${b.modulos.length} módulos · ${temas} temas · ${lecciones} lecciones`
}

/** El evento con el que Contenido del curso se recarga para mostrar lo que el Asistente acaba de crear. */
export const EVENTO_CONTENIDO_CAMBIO = 'stire:contenido-cambio'
