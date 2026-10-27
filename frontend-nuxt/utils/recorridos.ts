/**
 * Recorrido guiado (S10-J04, Jeider a cargo; SUS del equipo, 17/10: lo que más bajó el puntaje fue «necesitaría ayuda de
 * una persona técnica»). La primera vez que alguien entra a una pantalla, un recorrido corto señala sus partes con una
 * explicación de una o dos frases; se puede repetir desde el botón «?» de la cabecera. Se dibuja con Driver.js (MIT).
 *
 * Cada paso apunta a un elemento con `data-recorrido="…"` (o a un id que ya existía). Si el elemento no está en la
 * pantalla (oculto en el celular, o la pantalla no lo muestra en ese momento), el paso se salta: nunca un globo flotando
 * sobre nada. Solo la bienvenida del inicio va sin elemento: sale en el centro de la pantalla.
 *
 * Más didáctico (docs/PLAN_AYUDA_AL_USUARIO.md §4, frente B): los pasos «hazlo tú» esperan a que la persona toque el
 * elemento (aprender haciendo), y cada recorrido enlaza a su tarea del manual («Ver en el manual»).
 */

export interface PasoRecorrido {
  /** Selector CSS del elemento que se señala. Sin él, el globo sale en el centro (solo la bienvenida). */
  elemento?: string
  titulo: string
  texto: string
  /** «Hazlo tú»: el recorrido sigue cuando la persona toca el elemento (también puede tocar «Siguiente»). */
  hazloTu?: boolean
}

export interface Recorrido {
  id: string
  rol: 'estudiante' | 'docente' | 'administrador'
  /** Nombre de la pantalla, para el botón «?»: «Ver cómo funciona {pantalla}». */
  pantalla: string
  /** Id de la tarea del manual (utils/manual.ts) que explica esta pantalla: el globo enlaza a /ayuda#{manual}. */
  manual?: string
  pasos: PasoRecorrido[]
}

/** Mensajes: los mismos tres pasos para el estudiante y el docente (components/mensajes/). */
const mensajes = (conQuien: string): PasoRecorrido[] => [
  { elemento: 'nav[aria-label="Mensajes y avisos"]', titulo: 'Mensajes y avisos', texto: `«Mensajes» es uno a uno con ${conQuien}; «Avisos de la clase» es lo que se publica para todo el grupo.` },
  { elemento: '#redactar-mensaje', titulo: 'Escribir', texto: 'Escoge a quién y escribe tu mensaje. Lo recibe en su bandeja de STIRE.' },
  { elemento: '[aria-label="Bandejas"]', titulo: 'Tus bandejas', texto: '«Recibidos» y «Enviados». Cada mensaje se responde desde aquí.' },
]

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
    manual: 'estudiar-una-leccion',
    pasos: [
      { titulo: 'Bienvenido a STIRE', texto: 'Aquí aprendes a programar a tu ritmo: lees, practicas, el Tutor te guía y STIRE te recuerda repasar.' },
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
    manual: 'estudiar-una-leccion',
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
    manual: 'resolver-un-ejercicio',
    pasos: [
      { elemento: '#panel-enunciado', titulo: 'El enunciado', texto: 'Qué hay que hacer, qué recibe tu programa y qué debe mostrar. En «Casos de prueba» ves ejemplos de entrada y salida.' },
      { elemento: '[data-recorrido="probar"]', titulo: 'Probar', texto: 'Revisa tu código con los ejemplos sin gastar intentos. Hazlo tú: tócalo ahora y mira qué pasa.', hazloTu: true },
      { elemento: '[data-recorrido="entregar"]', titulo: 'Entregar', texto: 'Cuando estés listo, entrégalo: se califica y cuenta como un intento.' },
      { ...tutor, titulo: 'Si te atascas', texto: 'El Tutor te da una pista y, si sigues atascado, te acompaña paso a paso. Hazlo tú: ábrelo y pregúntale.', hazloTu: true },
    ],
  },
  {
    id: 'estudiante-progreso',
    rol: 'estudiante',
    pantalla: 'tu progreso',
    manual: 'ver-mi-progreso',
    pasos: [
      { elemento: '[data-recorrido="avance"]', titulo: 'Avance del curso', texto: 'Cuántas lecciones dominas de todo el curso.' },
      { elemento: '[data-recorrido="lecciones"]', titulo: 'Cómo vas en cada lección', texto: 'El dominio de cada lección que has trabajado, y un botón para repasarla.' },
      { elemento: '[data-recorrido="perfil"]', titulo: 'Tu perfil de aprendizaje', texto: 'Los errores que se te repiten y cómo sueles estudiar. Te sirve para pensar cómo mejorar; no cambia lo que ves.' },
    ],
  },
  {
    id: 'estudiante-repasos',
    rol: 'estudiante',
    pantalla: 'tus repasos',
    manual: 'hacer-mis-repasos',
    pasos: [
      { elemento: '[data-recorrido="repasos-hoy"]', titulo: 'Por qué repasar', texto: 'Lo que aprendes se olvida en pocos días. Repasar justo a tiempo hace que lo recuerdes por más tiempo.' },
      { elemento: '[aria-labelledby="empezar-titulo"]', titulo: 'Empieza por aquí', texto: 'El repaso más urgente. Es un ejercicio corto de una lección que ya practicaste.' },
      { elemento: '[aria-labelledby="despues-titulo"]', titulo: 'Después', texto: 'Los demás de hoy. Según cómo te vaya, cada lección vuelve en 1, 3, 8 días o más.' },
    ],
  },
  {
    id: 'estudiante-clases',
    rol: 'estudiante',
    pantalla: 'tus clases',
    manual: 'unirme-a-una-clase',
    pasos: [
      { elemento: '[data-recorrido="unirse-clase"]', titulo: 'Unirte a una clase', texto: 'Escribe el código que te dio tu docente y toca «Unirse». También puedes escanear su QR.' },
      { elemento: '[data-recorrido="lista-clases"]', titulo: 'Tus clases', texto: 'Las clases en las que estás. Cada una tiene su plan del curso.' },
    ],
  },
  {
    id: 'estudiante-asistencia',
    rol: 'estudiante',
    pantalla: 'tu asistencia',
    manual: 'marcar-asistencia',
    pasos: [
      { elemento: '[aria-labelledby="mi-codigo-titulo"]', titulo: 'Tu código', texto: 'Muéstraselo a tu docente cuando tome asistencia. Cambia cada 20 segundos: una foto no sirve para marcar a otro.' },
      { elemento: '[aria-labelledby="historial-titulo"]', titulo: 'Tu asistencia', texto: 'El porcentaje de cada clase y cada sesión: presente, tarde, con excusa o ausente.' },
    ],
  },
  {
    id: 'estudiante-mensajes',
    rol: 'estudiante',
    pantalla: 'tus mensajes',
    manual: 'escribirle-a-mi-docente',
    pasos: mensajes('tus docentes'),
  },
  {
    id: 'estudiante-logros',
    rol: 'estudiante',
    pantalla: 'tus logros',
    manual: 'ver-mi-progreso',
    pasos: [
      { elemento: '[aria-labelledby="mis-logros-titulo"]', titulo: 'Tus medallas', texto: 'Cada medalla dice qué hacer para ganarla y cuánto te falta. Solo las ves tú.' },
    ],
  },
  {
    id: 'estudiante-perfil',
    rol: 'estudiante',
    pantalla: 'tu perfil',
    manual: 'cambiar-mis-datos',
    pasos: [
      { elemento: '[data-recorrido="datos-perfil"]', titulo: 'Tus datos', texto: 'Tu nombre, tu foto (opcional) y tu contraseña.' },
      { elemento: '[aria-labelledby="vinculos-titulo"]', titulo: 'Qué estudias', texto: 'Opcional: tu programa y tu semestre ayudan a tus docentes a conocer el grupo.' },
      { elemento: '[data-recorrido="apariencia"]', titulo: 'Apariencia y lectura', texto: 'El tema, el contraste, el tamaño del texto y menos movimiento, a tu gusto.' },
    ],
  },
  {
    id: 'estudiante-proyectos',
    rol: 'estudiante',
    pantalla: 'tus proyectos',
    manual: 'crear-un-proyecto',
    pasos: [
      { elemento: '[data-recorrido="nuevo-proyecto"]', titulo: 'Un proyecto nuevo', texto: 'Ponle nombre, elige el tipo y créalo. Se ejecuta en tu navegador y solo tú lo ves.' },
      { elemento: '[aria-labelledby="lista-proyectos"]', titulo: 'Tus proyectos', texto: 'Ábrelos cuando quieras para seguir programando.' },
    ],
  },
  {
    id: 'docente-inicio',
    rol: 'docente',
    pantalla: 'el inicio',
    manual: 'crear-una-clase',
    pasos: [
      { titulo: 'Bienvenido a STIRE', texto: 'STIRE enseña, califica y agenda los repasos de tus estudiantes. Todo lo del docente es opcional: usa lo que te sirva.' },
      { elemento: '#abrir-crear-clase', titulo: 'Crear una clase', texto: 'Desde una plantilla o en blanco. Tus estudiantes entran con el código o escaneando el QR.' },
      { elemento: '[data-recorrido="rezago"]', titulo: 'Por revisar', texto: 'Lo que pide atención en todas tus clases: quién va por debajo de 50 % de dominio y los mensajes sin leer. Toca uno para atenderlo.' },
      { elemento: '[data-recorrido="clases"]', titulo: 'Tus clases', texto: 'Abre una clase para ver «Hoy», los contenidos, las entregas y las notas.' },
    ],
  },
  {
    id: 'docente-clase',
    rol: 'docente',
    pantalla: 'la clase',
    manual: 'saber-a-quien-ayudar',
    pasos: [
      { elemento: 'nav[aria-label="Secciones de la clase"]', titulo: 'Las secciones de la clase', texto: '«Hoy», contenidos, estudiantes, entregas, notas, asistencia y ajustes, siempre arriba.' },
      { elemento: '[data-recorrido="hoy"]', titulo: 'Hoy en tu clase', texto: 'Lo que conviene atender primero: quien no puede avanzar, lo que espera tu comentario y quien está listo para más.' },
    ],
  },
  {
    id: 'docente-contenidos',
    rol: 'docente',
    pantalla: 'los contenidos',
    manual: 'armar-los-contenidos',
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
    manual: 'saber-a-quien-ayudar',
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
    manual: 'llevar-las-notas',
    pasos: [
      { elemento: '[data-recorrido="empezar-notas"]', titulo: 'Las notas son opcionales', texto: 'Si quieres llevarlas aquí, elige cómo empezar. Después cambias lo que quieras.' },
      { elemento: '[data-recorrido="resumen-notas"]', titulo: 'Resumen', texto: 'El promedio de la clase, quiénes aprueban y quiénes no tienen nota todavía.' },
      { elemento: '[data-recorrido="tabla-notas"]', titulo: 'La tabla', texto: 'Las notas que pones tú se escriben en la celda. La final se puede ajustar, con un motivo que queda en el historial.' },
      { elemento: '[data-recorrido="moodle"]', titulo: 'Para Moodle', texto: 'Descarga el archivo y súbelo en Moodle, en «Importar calificaciones».' },
    ],
  },
  {
    id: 'docente-asistencia',
    rol: 'docente',
    pantalla: 'la asistencia',
    manual: 'tomar-asistencia',
    pasos: [
      { elemento: '[data-recorrido="tomar-asistencia"]', titulo: 'La asistencia es opcional', texto: 'Si quieres llevarla aquí, empieza la sesión de hoy. Cada estudiante abre «Mi asistencia» en su celular.' },
      { elemento: '[aria-labelledby="sesion-titulo"]', titulo: 'La sesión de hoy', texto: 'Escanea los códigos: ves el nombre y la foto de cada uno. Al cerrar, quien no marcó queda ausente.' },
      { elemento: '[aria-labelledby="sesiones-titulo"]', titulo: 'Sesiones anteriores', texto: 'Las sesiones que ya tomaste. Con «Planilla (CSV)» las descargas todas.' },
    ],
  },
  {
    id: 'docente-entregas',
    rol: 'docente',
    pantalla: 'las entregas',
    manual: 'recibir-entregas',
    pasos: [
      { elemento: '[data-recorrido="nueva-entrega"]', titulo: 'Las entregas son opcionales', texto: 'Para un proyecto más grande que un ejercicio: describe qué deben entregar y para cuándo.' },
      { elemento: '[aria-label="Entregas de la clase"]', titulo: 'Las de tu clase', texto: 'Abre una para revisar cada versión y dejar tu comentario.' },
    ],
  },
  {
    id: 'docente-crear-ejercicio',
    rol: 'docente',
    pantalla: 'el nuevo ejercicio',
    manual: 'crear-un-ejercicio',
    pasos: [
      { elemento: '[aria-label="Pasos para crear el ejercicio"]', titulo: 'Tres pasos', texto: 'Eliges el tipo, escribes el contenido y revisas cómo lo verá el estudiante antes de publicar.' },
      { elemento: '[aria-label="Tipo de ejercicio"]', titulo: 'El tipo', texto: 'Programar, opción múltiple, completar código, ordenar pasos y más. STIRE califica cada uno al instante.' },
    ],
  },
  {
    id: 'docente-mensajes',
    rol: 'docente',
    pantalla: 'tus mensajes',
    manual: 'avisar-a-la-clase',
    pasos: mensajes('tus estudiantes'),
  },
  {
    id: 'docente-perfil',
    rol: 'docente',
    pantalla: 'tu perfil',
    manual: 'cambiar-mis-datos',
    pasos: [
      { elemento: '[data-recorrido="datos-perfil"]', titulo: 'Tus datos', texto: 'Tu nombre, tu foto (opcional) y tu contraseña.' },
      { elemento: '[aria-labelledby="vinculos-titulo"]', titulo: 'Dónde enseñas', texto: 'Opcional: con tu programa ves desde el primer día las plantillas que comparten sus docentes.' },
      { elemento: '[data-recorrido="apariencia"]', titulo: 'Apariencia y lectura', texto: 'El tema, el contraste, el tamaño del texto y menos movimiento, a tu gusto.' },
    ],
  },
  {
    id: 'docente-refuerzos',
    rol: 'docente',
    pantalla: 'los refuerzos',
    manual: 'asignar-un-refuerzo',
    pasos: [
      { elemento: '[data-recorrido="nuevo-refuerzo"]', titulo: 'Refuerzos y retos', texto: 'Un refuerzo apoya a quien va atrás; un reto le da más a quien va adelante. Los dos son opcionales.' },
    ],
  },
  {
    id: 'docente-ajustes',
    rol: 'docente',
    pantalla: 'los ajustes de la clase',
    manual: 'ajustar-la-clase',
    pasos: [
      { elemento: '[aria-labelledby="avance-titulo"]', titulo: 'Avance entre módulos', texto: 'Cuánto dominio del módulo anterior hace falta para abrir el siguiente. Con 0 % no hay bloqueo.' },
      { elemento: '[aria-labelledby="compartir-titulo"]', titulo: 'Compartir el contenido', texto: 'Con quién compartes tu curso como plantilla: nadie, tu asignatura, tu programa o más.' },
      { elemento: '[aria-labelledby="logros-titulo"]', titulo: 'Logros y medallas', texto: 'Qué medallas pueden ganar tus estudiantes.' },
      { elemento: '[aria-labelledby="gestion-clase-titulo"]', titulo: 'Estado de la clase', texto: 'Al terminar el periodo, la archivas aquí.' },
    ],
  },
  {
    id: 'admin-estado',
    rol: 'administrador',
    pantalla: 'el estado del sistema',
    manual: 'revisar-el-sistema',
    pasos: [
      { elemento: '[aria-label="Indicadores principales de salud"]', titulo: 'Lo principal', texto: 'Cada indicador dice si va normal o degradado.' },
      { elemento: '[data-recorrido="subsistemas"]', titulo: 'Cada parte de STIRE', texto: 'El estado detallado de cada subsistema y a qué hora se actualizó.' },
    ],
  },
  {
    id: 'admin-perfil',
    rol: 'administrador',
    pantalla: 'tu perfil',
    manual: 'cambiar-mis-datos',
    pasos: [
      { elemento: '[data-recorrido="datos-perfil"]', titulo: 'Tus datos', texto: 'Tu nombre, tu foto (opcional) y tu contraseña.' },
      { elemento: '[data-recorrido="apariencia"]', titulo: 'Apariencia y lectura', texto: 'El tema, el contraste, el tamaño del texto y menos movimiento, a tu gusto.' },
    ],
  },
  {
    id: 'admin-catalogo',
    rol: 'administrador',
    pantalla: 'el catálogo',
    manual: 'ordenar-el-catalogo',
    pasos: [
      { elemento: '[aria-labelledby="duplicados-titulo"]', titulo: 'Posibles duplicados', texto: 'La misma asignatura con dos nombres. Eliges cuál dejar, o dices que son distintas.' },
      { elemento: '[aria-labelledby="agregadas-titulo"]', titulo: 'Agregadas por docentes', texto: 'Ya funcionan. Confirmarlas como oficiales es opcional: salen primero en la búsqueda.' },
    ],
  },
  {
    id: 'admin-registros',
    rol: 'administrador',
    pantalla: 'los registros',
    manual: 'revisar-el-sistema',
    pasos: [
      { elemento: '[aria-label="Actualizar registros del sistema"]', titulo: 'Actualizar', texto: 'Trae los registros más recientes del servidor.' },
      { elemento: '[aria-label="Registro del servidor"]', titulo: 'El registro del servidor', texto: 'Lo que pasó en el servidor. Sirve para saber qué falló y cuándo.' },
    ],
  },
  {
    id: 'admin-usuarios',
    rol: 'administrador',
    pantalla: 'usuarios y roles',
    manual: 'aprobar-un-docente',
    pasos: [
      { titulo: 'Bienvenido a STIRE', texto: 'Desde aquí apruebas a los docentes, atiendes las sugerencias y revisas cómo está STIRE.' },
      { elemento: '[data-recorrido="menu-admin"]', titulo: 'El menú', texto: 'El estado del servidor, los usuarios, las sugerencias, el catálogo, la encuesta y los registros.' },
      { elemento: '#open-register-user-btn', titulo: 'Registrar usuario', texto: 'Crea una cuenta a mano, por ejemplo para un docente nuevo.' },
      { elemento: 'nav[aria-label="Secciones de administración"]', titulo: 'Solicitudes y cambios', texto: 'Aquí apruebas a quien pidió ser docente y ves el historial de cambios de rol.' },
    ],
  },
  {
    id: 'admin-sugerencias',
    rol: 'administrador',
    pantalla: 'las sugerencias',
    manual: 'atender-sugerencias',
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
    manual: 'leer-la-encuesta',
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
              : r === '/estudiante/repasos' ? 'estudiante-repasos'
                : r === '/estudiante/clases' ? 'estudiante-clases'
                  : r === '/estudiante/asistencia' ? 'estudiante-asistencia'
                    : r === '/estudiante/mensajes' ? 'estudiante-mensajes'
                      : r === '/estudiante/logros' ? 'estudiante-logros'
                        : r === '/estudiante/perfil' ? 'estudiante-perfil'
                          : r === '/estudiante/proyectos' ? 'estudiante-proyectos'
                            : null
      : rol === 'docente'
        ? r === '/docente' ? 'docente-inicio'
          : /^\/docente\/clase\/[^/]+$/.test(r) ? 'docente-clase'
            : r === '/docente/contenidos' ? 'docente-contenidos'
              : r === '/docente/rendimiento' ? 'docente-estudiantes'
                : /^\/docente\/clase\/[^/]+\/notas$/.test(r) ? 'docente-notas'
                  : /^\/docente\/clase\/[^/]+\/asistencia$/.test(r) ? 'docente-asistencia'
                    : r === '/docente/entregas' ? 'docente-entregas'
                      : r === '/docente/ejercicios/crear' ? 'docente-crear-ejercicio'
                        : r === '/docente/mensajes' ? 'docente-mensajes'
                          : r === '/docente/perfil' ? 'docente-perfil'
                            : r === '/docente/refuerzos' ? 'docente-refuerzos'
                              : /^\/docente\/clase\/[^/]+\/ajustes$/.test(r) ? 'docente-ajustes'
                                : null
        : rol === 'administrador'
          ? r === '/admin' || r === '/admin/usuarios' ? 'admin-usuarios'
            : r === '/admin/sugerencias' ? 'admin-sugerencias'
              : r === '/admin/usabilidad' ? 'admin-usabilidad'
                : r === '/admin/dashboard' ? 'admin-estado'
                  : r === '/admin/perfil' ? 'admin-perfil'
                    : r === '/admin/catalogo' ? 'admin-catalogo'
                      : r === '/admin/sistema' ? 'admin-registros'
                        : null
          : null
  return RECORRIDOS.find((x) => x.id === id) ?? null
}

/** Clave del navegador que recuerda que ya se vio (una vez por persona y pantalla; si se borra, solo vuelve a salir). */
export function claveVisto(id: string, usuarioId: number | string | null | undefined): string {
  return `stire-recorrido-${id}-${usuarioId ?? 'anonimo'}`
}
