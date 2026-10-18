/**
 * Recorrido guiado (S10-J04, Jeider a cargo; SUS del equipo, 17/10: lo que más bajó el puntaje fue «necesitaría ayuda de
 * una persona técnica»). La primera vez que alguien entra a una pantalla, un recorrido corto señala sus partes con una
 * explicación de una o dos frases; se puede repetir desde el botón «?» de la cabecera. Se dibuja con Driver.js (MIT).
 *
 * Cada paso apunta a un elemento con `data-recorrido="…"` (o a un id que ya existía). Si el elemento no está en la
 * pantalla (oculto en el celular, o la pantalla no lo muestra en ese momento), el paso se salta: nunca un globo flotando
 * sobre nada.
 */

export interface PasoRecorrido {
  /** Selector CSS del elemento que se señala. */
  elemento: string
  titulo: string
  texto: string
}

export interface Recorrido {
  id: string
  rol: 'estudiante' | 'docente' | 'administrador'
  /** Nombre de la pantalla, para el botón «?»: «Ver cómo funciona {pantalla}». */
  pantalla: string
  pasos: PasoRecorrido[]
}

const tutor: PasoRecorrido = {
  elemento: '#lanzador-tutor',
  titulo: 'El Tutor',
  texto: 'Te guía con preguntas y pistas, sin darte la respuesta. Puedes escribirle o hablarle con el micrófono.',
}

export const RECORRIDOS: Recorrido[] = [
  {
    id: 'estudiante-inicio',
    rol: 'estudiante',
    pantalla: 'el inicio',
    pasos: [
      { elemento: '[data-recorrido="siguiente-paso"]', titulo: 'Tu siguiente paso', texto: 'STIRE te dice qué conviene hacer ahora: seguir practicando, ver la explicación o hacer tus repasos.' },
      { elemento: '[data-recorrido="plan"]', titulo: 'El plan del curso', texto: 'Los módulos y sus lecciones, con tu avance. Una lección con ✓ ya la dominas; con un punto, la estás practicando.' },
      { elemento: '[data-recorrido="repasos"]', titulo: 'Repasos', texto: 'Las lecciones que toca repasar hoy para no olvidarlas. El número dice cuántas son.' },
      tutor,
      { elemento: '[data-recorrido="sugerencias"]', titulo: 'Sugerencias', texto: 'Si algo no funciona o te confunde, cuéntanos aquí. Lo leemos todo.' },
    ],
  },
  {
    id: 'estudiante-leccion',
    rol: 'estudiante',
    pantalla: 'la lección',
    pasos: [
      { elemento: '[data-recorrido="meta-leccion"]', titulo: 'La meta de la lección', texto: 'Lo que vas a poder hacer al terminarla y cuánto dominio llevas.' },
      { elemento: '[data-recorrido="escuchar"]', titulo: 'Escuchar', texto: 'STIRE te lee la lección en voz alta, por si prefieres oírla.' },
      { elemento: '[data-recorrido="valorar"]', titulo: '¿Te quedó claro?', texto: 'Si no, dilo aquí: te ofrece otros caminos, como un ejercicio sencillo, otro video o preguntarle a tu docente.' },
      { elemento: '[aria-labelledby="practicar-titulo"]', titulo: 'Practica', texto: 'Los ejercicios suben tu dominio. Desde 85 % la lección queda dominada y vuelve de vez en cuando como repaso.' },
    ],
  },
  {
    id: 'estudiante-ejercicio',
    rol: 'estudiante',
    pantalla: 'el ejercicio',
    pasos: [
      { elemento: '#panel-enunciado', titulo: 'El enunciado', texto: 'Qué hay que hacer, qué recibe tu programa y qué debe mostrar. En «Casos de prueba» ves ejemplos de entrada y salida.' },
      { elemento: '[data-recorrido="probar"]', titulo: 'Probar', texto: 'Revisa tu código con los ejemplos sin gastar intentos. Pruébalo las veces que quieras.' },
      { elemento: '[data-recorrido="entregar"]', titulo: 'Entregar', texto: 'Cuando estés listo, entrégalo: se califica y cuenta como un intento.' },
      { ...tutor, titulo: 'Si te atascas', texto: 'Ábrele el Tutor: te da una pista y, si sigues atascado, te acompaña paso a paso.' },
    ],
  },
  {
    id: 'estudiante-progreso',
    rol: 'estudiante',
    pantalla: 'tu progreso',
    pasos: [
      { elemento: '[data-recorrido="avance"]', titulo: 'Avance del curso', texto: 'Cuántas lecciones dominas de todo el curso.' },
      { elemento: '[data-recorrido="lecciones"]', titulo: 'Cómo vas en cada lección', texto: 'El dominio de cada lección que has trabajado, y un botón para repasarla.' },
      { elemento: '[data-recorrido="perfil"]', titulo: 'Tu perfil de aprendizaje', texto: 'Los errores que se te repiten y cómo sueles estudiar. Te sirve para pensar cómo mejorar; no cambia lo que ves.' },
    ],
  },
  {
    id: 'docente-inicio',
    rol: 'docente',
    pantalla: 'el inicio',
    pasos: [
      { elemento: '#abrir-crear-clase', titulo: 'Crear una clase', texto: 'Desde una plantilla o en blanco. Tus estudiantes entran con el código o escaneando el QR.' },
      { elemento: '[data-recorrido="rezago"]', titulo: 'Alumnos en rezago', texto: 'Quién va por debajo de 50 % de dominio. Toca «Ver quiénes» para saber a quién apoyar.' },
      { elemento: '[data-recorrido="clases"]', titulo: 'Tus clases', texto: 'Abre una clase para ver «Hoy», los contenidos, las entregas y las notas.' },
    ],
  },
  {
    id: 'docente-clase',
    rol: 'docente',
    pantalla: 'la clase',
    pasos: [
      { elemento: 'nav[aria-label="Secciones de la clase"]', titulo: 'Las secciones de la clase', texto: '«Hoy», contenidos, estudiantes, entregas, notas, asistencia y ajustes, siempre arriba.' },
      { elemento: '[data-recorrido="hoy"]', titulo: 'Hoy en tu clase', texto: 'Lo que conviene atender primero: quien no puede avanzar, lo que espera tu comentario y quien está listo para más.' },
    ],
  },
  {
    id: 'docente-contenidos',
    rol: 'docente',
    pantalla: 'los contenidos',
    pasos: [
      { elemento: '[data-recorrido="nuevo-modulo"]', titulo: 'Nuevo módulo', texto: 'El curso se arma en módulos, temas y lecciones. Empieza por un módulo.' },
      { elemento: '#abrir-importar', titulo: 'Traer de otra clase', texto: 'Copia los módulos de otra clase tuya o de una plantilla, en vez de escribirlos otra vez.' },
      { elemento: '[data-recorrido="arbol"]', titulo: 'Tu curso', texto: 'Abre una lección para escribir su explicación y crear sus ejercicios. Lo que no publiques, tus estudiantes no lo ven.' },
    ],
  },
  {
    id: 'docente-estudiantes',
    rol: 'docente',
    pantalla: 'tus estudiantes',
    pasos: [
      { elemento: '[data-recorrido="resumen-clase"]', titulo: 'La clase de un vistazo', texto: 'El dominio promedio, los ejercicios aprobados y cuántos necesitan apoyo.' },
      { elemento: '[aria-labelledby="mapa-calor-titulo"]', titulo: '¿A quién ayudo ahora?', texto: 'Cada fila es un estudiante y cada columna una lección. Toca una celda para ver qué le pasa.' },
      { elemento: '[data-recorrido="solo-riesgo"]', titulo: 'Solo quienes necesitan apoyo', texto: 'Filtra la lista para ver primero a quienes van por debajo.' },
      { elemento: '[data-recorrido="lista-estudiantes"]', titulo: 'Cada estudiante', texto: 'Ábrelo para ver su avance lección por lección.' },
    ],
  },
  {
    id: 'docente-notas',
    rol: 'docente',
    pantalla: 'las notas',
    pasos: [
      { elemento: '[data-recorrido="empezar-notas"]', titulo: 'Las notas son opcionales', texto: 'Si quieres llevarlas aquí, elige cómo empezar. Después cambias lo que quieras.' },
      { elemento: '[data-recorrido="resumen-notas"]', titulo: 'Resumen', texto: 'El promedio de la clase, quiénes aprueban y quiénes no tienen nota todavía.' },
      { elemento: '[data-recorrido="tabla-notas"]', titulo: 'La tabla', texto: 'Las notas que pones tú se escriben en la celda. La final se puede ajustar, con un motivo que queda en el historial.' },
      { elemento: '[data-recorrido="moodle"]', titulo: 'Para Moodle', texto: 'Descarga el archivo y súbelo en Moodle, en «Importar calificaciones».' },
    ],
  },
  {
    id: 'admin-usuarios',
    rol: 'administrador',
    pantalla: 'usuarios y roles',
    pasos: [
      { elemento: '[data-recorrido="menu-admin"]', titulo: 'El menú', texto: 'El estado del servidor, los usuarios, las sugerencias, el catálogo, la encuesta y los registros.' },
      { elemento: '#open-register-user-btn', titulo: 'Registrar usuario', texto: 'Crea una cuenta a mano, por ejemplo para un docente nuevo.' },
      { elemento: 'nav[aria-label="Secciones de administración"]', titulo: 'Solicitudes y cambios', texto: 'Aquí apruebas a quien pidió ser docente y ves el historial de cambios de rol.' },
    ],
  },
  {
    id: 'admin-sugerencias',
    rol: 'administrador',
    pantalla: 'las sugerencias',
    pasos: [
      { elemento: '[data-recorrido="estado-sugerencias"]', titulo: 'Lo pendiente', texto: 'Cuántas faltan por atender y cuántas impiden que alguien siga usando STIRE.' },
      { elemento: '[data-recorrido="bandejas"]', titulo: 'Bandejas', texto: 'Al resolver una, escribe cómo: quien la envió lo lee. Lo que no sirve se archiva con un motivo.' },
      { elemento: '[data-recorrido="excel"]', titulo: 'Descargar', texto: 'Todas en un Excel con filtros y un resumen.' },
    ],
  },
  {
    id: 'admin-usabilidad',
    rol: 'administrador',
    pantalla: 'la encuesta',
    pasos: [
      { elemento: '[data-recorrido="sus-resumen"]', titulo: 'El puntaje', texto: 'El promedio SUS de 0 a 100. Cuenta la última respuesta de cada persona.' },
      { elemento: '[aria-labelledby="por-afirmacion-titulo"]', titulo: 'Qué lo baja', texto: 'Cada afirmación por separado: la que más baja es por donde conviene empezar.' },
      { elemento: '[aria-labelledby="comentarios-titulo"]', titulo: 'En sus palabras', texto: 'Lo que cambiarían primero. El puntaje dice cuánto; los comentarios dicen qué.' },
    ],
  },
]

/** Qué recorrido corresponde a una ruta, según el rol. Las rutas con más partes (una lección, un ejercicio) van por prefijo. */
export function recorridoDeRuta(ruta: string, rol: string | null | undefined): Recorrido | null {
  const r = ruta.replace(/\/+$/, '') || '/'
  const id =
    rol === 'estudiante'
      ? r === '/estudiante' ? 'estudiante-inicio'
        : r.startsWith('/estudiante/unidad/') ? 'estudiante-leccion'
          : r.startsWith('/estudiante/evaluacion/') ? 'estudiante-ejercicio'
            : r === '/estudiante/progreso' ? 'estudiante-progreso'
              : null
      : rol === 'docente'
        ? r === '/docente' ? 'docente-inicio'
          : /^\/docente\/clase\/[^/]+$/.test(r) ? 'docente-clase'
            : r === '/docente/contenidos' ? 'docente-contenidos'
              : r === '/docente/rendimiento' ? 'docente-estudiantes'
                : /^\/docente\/clase\/[^/]+\/notas$/.test(r) ? 'docente-notas'
                  : null
        : rol === 'administrador'
          ? r === '/admin' || r === '/admin/usuarios' ? 'admin-usuarios'
            : r === '/admin/sugerencias' ? 'admin-sugerencias'
              : r === '/admin/usabilidad' ? 'admin-usabilidad'
                : null
          : null
  return RECORRIDOS.find((x) => x.id === id) ?? null
}

/** Clave del navegador que recuerda que ya se vio (una vez por persona y pantalla; si se borra, solo vuelve a salir). */
export function claveVisto(id: string, usuarioId: number | string | null | undefined): string {
  return `stire-recorrido-${id}-${usuarioId ?? 'anonimo'}`
}
