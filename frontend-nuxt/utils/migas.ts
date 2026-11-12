// «Dónde estás» en la barra de arriba (v3, Fase B; barra() y barraD() del prototipo, scripts/diseno-v3/generador):
// el camino hasta la pantalla con los nombres del menú v3. El último tramo es la pantalla actual.
// Para el docente, lo que es de una clase empieza con su nombre («Fundamentos · G2 › Entregas»).

type Tramo = string | 'CLASE'

const ESTUDIANTE: Array<[RegExp, Tramo[]]> = [
  [/^\/estudiante\/?$/, ['Inicio']],
  [/^\/estudiante\/clases/, ['Mis clases']],
  [/^\/estudiante\/unidad\//, ['Aprender', 'Lección']],
  [/^\/estudiante\/evaluacion\//, ['Aprender', 'Ejercicio']],
  [/^\/estudiante\/repasos/, ['Repasos']],
  [/^\/estudiante\/proyectos\/\d+/, ['Mis proyectos', 'Proyecto']],
  [/^\/estudiante\/proyectos/, ['Mis proyectos']],
  [/^\/estudiante\/asistencia/, ['Mi clase', 'Mi asistencia']],
  [/^\/estudiante\/mensajes/, ['Mi clase', 'Mensajes']],
  [/^\/estudiante\/entregas\//, ['Mi clase', 'Entrega']],
  [/^\/estudiante\/refuerzos\//, ['Inicio', 'Refuerzo']],
  [/^\/estudiante\/progreso/, ['Mi progreso']],
  [/^\/estudiante\/logros/, ['Mi progreso', 'Logros']],
  [/^\/estudiante\/perfil/, ['Mi cuenta']],
  [/^\/estudiante\/encuesta/, ['Encuesta de usabilidad']],
]

const DOCENTE: Array<[RegExp, Tramo[]]> = [
  [/^\/docente\/?$/, ['Mis clases']],
  [/^\/docente\/clase\/\d+\/ajustes/, ['CLASE', 'Ajustes de la clase']],
  [/^\/docente\/clase\/\d+\/notas/, ['CLASE', 'Asistencia y notas', 'Notas']],
  [/^\/docente\/clase\/\d+\/asistencia/, ['CLASE', 'Asistencia y notas', 'Asistencia']],
  [/^\/docente\/clase\/\d+/, ['CLASE', 'Resumen de la clase']],
  [/^\/docente\/contenidos/, ['CLASE', 'Contenido']],
  [/^\/docente\/ejercicios\/crear/, ['CLASE', 'Contenido', 'Nuevo ejercicio']],
  [/^\/docente\/rendimiento/, ['CLASE', 'Estudiantes']],
  [/^\/docente\/estudiante\//, ['CLASE', 'Estudiantes', 'Ficha del estudiante']],
  [/^\/docente\/entregas\/revision\//, ['CLASE', 'Entregas', 'Revisar entrega']],
  [/^\/docente\/entregas/, ['CLASE', 'Entregas']],
  [/^\/docente\/refuerzos\/nuevo/, ['CLASE', 'Refuerzos y retos', 'Asignar']],
  [/^\/docente\/refuerzos/, ['CLASE', 'Refuerzos y retos']],
  [/^\/docente\/mensajes/, ['Avisos y mensajes']],
  [/^\/docente\/biblioteca/, ['Biblioteca']],
  [/^\/docente\/perfil/, ['Mi cuenta']],
  [/^\/docente\/encuesta/, ['Encuesta de usabilidad']],
]

// Administrador: todo empieza por «Administración», como en los cuadros A-… del prototipo (las secciones del menú
// —Personas, Académico…— no van en el camino).
const ADMIN: Array<[RegExp, Tramo[]]> = [
  [/^\/admin\/?$/, ['Administración', 'Usuarios y roles']],
  [/^\/admin\/usuarios/, ['Administración', 'Usuarios y roles']],
  [/^\/admin\/catalogo/, ['Administración', 'Catálogo académico']],
  [/^\/admin\/sugerencias/, ['Administración', 'Sugerencias']],
  [/^\/admin\/usabilidad/, ['Administración', 'Encuesta de usabilidad']],
  [/^\/admin\/dashboard/, ['Administración', 'Estado del sistema']],
  [/^\/admin\/sistema/, ['Administración', 'Registros y mantenimiento']],
  [/^\/admin\/perfil/, ['Administración', 'Mi perfil']],
]

/** Los tramos de «Dónde estás» para una ruta; sin coincidencia, ninguno (nunca un camino inventado). */
export function migasDeRuta(ruta: string, rol: string, clase?: string | null): string[] {
  const tabla = rol === 'docente' ? DOCENTE : rol === 'administrador' ? ADMIN : rol === 'estudiante' ? ESTUDIANTE : []
  const tramos = tabla.find(([patron]) => patron.test(ruta))?.[1] ?? []
  return tramos.flatMap((t) => (t === 'CLASE' ? (clase?.trim() ? [clase.trim()] : []) : [t]))
}
