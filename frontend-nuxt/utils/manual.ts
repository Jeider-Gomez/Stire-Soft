/**
 * Manual de usuario de STIRE (S10-P07, Pedro a cargo). Se ve en /ayuda, sin iniciar sesión, y se descarga en PDF
 * (public/manual/). Organizado por tareas y por rol, como las guías de Canvas o de Google Classroom; cada tarea con la
 * misma plantilla. Las mismas palabras que el recorrido guiado (utils/recorridos.ts).
 *
 * Sigue los cuatro tipos de Diátaxis (docs/PLAN_AYUDA_AL_USUARIO.md §4): primeros pasos (aprender), tareas por rol
 * (lograr algo), «cómo funciona» y repetición espaciada (entender), y preguntas frecuentes y glosario (consultar).
 *
 * Cómo agregar una tarea: copiar una de abajo y cambiar sus textos. Los nombres de botones y campos van entre «» tal
 * como se leen en la pantalla; el manual los dibuja como botones. La captura va en public/manual/capturas/.
 */

export type RolManual = 'todos' | 'estudiante' | 'docente' | 'administrador'

export interface TareaManual {
  id: string
  /** Como pregunta: «¿Cómo me uno a una clase?». */
  titulo: string
  /** Para qué sirve, en una frase. */
  paraQue: string
  /** Una acción por paso. */
  pasos: string[]
  captura?: { src: string; alt: string }
  /** Qué debe pasar al final. */
  resultado: string
  consejo?: string
  siAlgoSaleMal?: Array<{ problema: string; solucion: string }>
}

export interface SeccionManual {
  id: string
  rol: RolManual
  titulo: string
  intro: string
  tareas: TareaManual[]
  /** Secciones de explicación (cómo funciona, glosario): párrafos con título, sin pasos. `formula` se dibuja en monoespaciado. */
  bloques?: Array<{ titulo: string; texto: string; formula?: string }>
  /** Preguntas frecuentes, con su respuesta corta. */
  preguntas?: Array<{ pregunta: string; respuesta: string }>
  /** Dibuja el calendario de repasos (CALENDARIO_REPASOS) después de los bloques. */
  conCalendario?: boolean
}

export const VERSION_MANUAL = 'Versión 2.1 · octubre de 2026'
export const PDF_MANUAL = '/manual/STIRE-Manual-de-usuario.pdf'

/**
 * Cada cuántos días vuelve una lección según cómo te fue en el repaso. Son los intervalos que calcula el motor
 * (src/common/utils/spaced-repetition.ts, SM-2 con 3 días en vez de 6 en el segundo repaso y tope de 60); una prueba
 * comprueba que coinciden con él.
 */
export const CALENDARIO_REPASOS: Array<{ resultado: string; cuando: string; dias: number[] }> = [
  { resultado: 'Fácil', cuando: 'Aciertas al primer intento y dijiste «Estoy seguro».', dias: [1, 3, 8, 23, 60] },
  { resultado: 'Bien', cuando: 'Aciertas al primer intento.', dias: [1, 3, 8, 20, 50, 60] },
  { resultado: 'Difícil', cuando: 'Aciertas, pero después de varios intentos.', dias: [1, 3, 6, 12, 22, 37] },
  { resultado: 'Otra vez', cuando: 'Fallas el repaso: la lección vuelve mañana y el calendario empieza de nuevo.', dias: [1] },
]

export const MANUAL: SeccionManual[] = [
  {
    id: 'primeros-pasos',
    rol: 'todos',
    titulo: 'Primeros pasos',
    intro:
      'STIRE es un tutor inteligente para aprender a programar. Te explica cada lección, te pone ejercicios que se califican al instante, te acompaña con un Tutor que te guía sin darte la respuesta y te recuerda repasar justo antes de que se te olvide.',
    tareas: [
      {
        id: 'entrar',
        titulo: '¿Cómo creo mi cuenta y entro?',
        paraQue: 'Para empezar a usar STIRE desde el computador o el celular.',
        pasos: [
          'Abre stire-soft.vercel.app en el navegador.',
          'Si no tienes cuenta, toca «Regístrate aquí», escribe tu «Nombre completo», «Correo» y «Contraseña», y toca «Crear cuenta».',
          'Si ya tienes cuenta, escribe tu correo y tu contraseña y toca «Ingresar a la plataforma».',
        ],
        resultado: 'Llegas a tu inicio.',
        consejo: 'La primera vez en cada pantalla, un recorrido corto te muestra sus partes. Para verlo otra vez, toca «?» arriba a la derecha.',
        siAlgoSaleMal: [{ problema: 'No recuerdo mi contraseña', solucion: 'En la pantalla de entrada, toca «¿Olvidaste tu clave?».' }],
      },
      {
        id: 'pedir-ayuda',
        titulo: '¿Dónde encuentro ayuda dentro de STIRE?',
        paraQue: 'Para resolver una duda sin tener que preguntarle a otra persona.',
        pasos: [
          'Toca «?» arriba a la derecha: repite el recorrido de la pantalla en la que estás.',
          'Abre este manual desde el pie de página («Manual de usuario») y busca tu duda con el buscador.',
          'Si algo no funciona o te confunde, toca «Sugerencias» y luego «Nueva sugerencia». Lo leemos todo y te contamos qué hicimos.',
        ],
        resultado: 'Encuentras la respuesta o la dejas escrita para que la resolvamos.',
      },
      {
        id: 'cambiar-mis-datos',
        titulo: '¿Cómo cambio mi nombre, mi foto o mi contraseña?',
        paraQue: 'Para mantener tu cuenta al día.',
        pasos: [
          'Toca tu nombre, arriba a la derecha, y luego «Mi perfil».',
          'En «Datos del perfil», cambia tu nombre y toca «Guardar nombre». La «Foto de perfil» es opcional.',
          'En «Cambiar contraseña», escribe la actual y la nueva, y toca «Cambiar contraseña».',
        ],
        resultado: 'Tus datos quedan guardados.',
        consejo: 'En la misma pantalla, «Apariencia» cambia el tema, el contraste y el tamaño del texto.',
      },
    ],
  },
  {
    id: 'estudiante',
    rol: 'estudiante',
    titulo: 'Si eres estudiante',
    intro: 'Lo que vas a hacer casi siempre: unirte a la clase, estudiar la lección, practicar, pedirle ayuda al Tutor y repasar.',
    tareas: [
      {
        id: 'unirme-a-una-clase',
        titulo: '¿Cómo me uno a una clase?',
        paraQue: 'Para ver las lecciones y los ejercicios que preparó tu docente.',
        pasos: [
          'En tu inicio, toca «Mis clases». Si todavía no tienes clases, toca «Ingresar código de clase».',
          'En «¿Tienes un código de clase?», escribe el código que te dio tu docente, por ejemplo ALGO-203413.',
          'Toca «Unirse». Si tu docente proyecta un QR, también puedes tocar «Escanear QR» y apuntar la cámara.',
        ],
        captura: { src: '/manual/capturas/estudiante-unirse.png', alt: 'Pantalla «Mis clases» con el campo del código de clase y el botón «Unirse».' },
        resultado: 'La clase aparece en «Clases en las que estás».',
        siAlgoSaleMal: [
          { problema: 'El código no funciona', solucion: 'Revisa las letras y los guiones. Si sigue sin funcionar, pídele el código otra vez a tu docente.' },
          { problema: 'Me uní, pero no veo la clase', solucion: 'Si la clase requiere aprobación, entras cuando tu docente te acepte.' },
        ],
      },
      {
        id: 'estudiar-una-leccion',
        titulo: '¿Cómo estudio una lección?',
        paraQue: 'Para entender la idea antes de practicarla.',
        pasos: [
          'En el menú, abre el plan del curso y toca la lección. En tu inicio, «Tu siguiente paso» te dice cuál conviene.',
          'Lee la explicación. Si prefieres oírla, toca «Escuchar».',
          'Al final, responde «¿Te sirvió esta explicación?». Si tocas «No me quedó claro», STIRE te ofrece otros caminos: un ejercicio sencillo, otro video o preguntarle a tu docente.',
          'Baja hasta «Practica» y abre el ejercicio que te recomienda.',
        ],
        resultado: 'Tu dominio de la lección empieza a subir con cada ejercicio que resuelves.',
        consejo: 'Una lección con ✓ en el plan ya la dominas; con un punto, la estás practicando.',
      },
      {
        id: 'resolver-un-ejercicio',
        titulo: '¿Cómo resuelvo un ejercicio de programación?',
        paraQue: 'Para practicar y subir tu dominio de la lección.',
        pasos: [
          'Lee el «Enunciado»: qué recibe tu programa y qué debe mostrar. En «Casos de prueba» ves ejemplos de entrada y salida.',
          'Escribe tu solución en el editor.',
          'Toca «Probar código». Compara tu código con los ejemplos y no gasta intentos: pruébalo las veces que quieras.',
          'Cuando pasen los ejemplos, toca «Entregar solución».',
          'La primera vez te pregunta qué tan seguro estás. Elige «Estoy seguro», «Tengo dudas» o «Estoy adivinando». Si quieres revisar algo, toca «Volver a editar».',
        ],
        resultado: 'Se califica al instante, ves qué casos pasaron y tu dominio se actualiza.',
        consejo: 'Decir con honestidad qué tan seguro estás sirve: si estabas seguro y aciertas, la lección tarda más en volver a tus repasos.',
        siAlgoSaleMal: [
          { problema: 'Un caso falla y no sé por qué', solucion: 'Abre el Tutor y elige «Por qué no sale lo esperado». Te ayuda a encontrar el error sin darte la solución.' },
          { problema: '«Ya usaste todos tus intentos.»', solucion: 'Pasadas 24 horas se reabre un intento. Mientras tanto, repasa la lección o resuelve otro ejercicio.' },
        ],
      },
      {
        id: 'pedir-ayuda-al-tutor',
        titulo: '¿Cómo le pido ayuda al Tutor?',
        paraQue: 'Para destrabarte con preguntas y pistas, sin que te den la respuesta.',
        pasos: [
          'En una lección o un ejercicio, toca «Tutor», abajo a la derecha.',
          'La primera vez te pide tu clave de Google AI Studio. Sigue los pasos del panel: crea la clave, cópiala y pégala.',
          'Escribe tu duda en «Pregúntale al Tutor…» o toca el micrófono para dictarla.',
          'Si no sabes qué preguntar, toca el bombillo y elige «Pista conceptual».',
        ],
        resultado: 'El Tutor te responde con una pregunta o una pista. Si fallas varias veces, te ofrece «Resolverlo juntos, paso a paso».',
        consejo: 'El Tutor no te da el código resuelto: te hace pensar. Así lo aprendes de verdad.',
        siAlgoSaleMal: [
          { problema: 'El micrófono no aparece o no escribe', solucion: 'Usa Chrome o Edge en el computador, o el navegador del celular, y dale permiso al micrófono cuando lo pida.' },
          { problema: 'El Tutor dice que falta la clave', solucion: 'Arriba en el Tutor, toca «Mi clave» y vuelve a pegar tu clave de Google AI Studio.' },
        ],
      },
      {
        id: 'hacer-mis-repasos',
        titulo: '¿Cómo hago mis repasos?',
        paraQue: 'Para no olvidar lo que ya aprendiste.',
        pasos: [
          'Toca «Repasos» en el menú. El número rojo dice cuántos tocan hoy.',
          'En «Empieza por aquí», toca «Repasar ahora».',
          'Resuelve el ejercicio corto de la lección.',
          'Si hay más, sigue con la lista «Después» y toca «Repasar» en cada una.',
        ],
        resultado: 'Según cómo te fue, STIRE agenda el siguiente repaso de esa lección (la sección sobre la repetición espaciada, más abajo, lo explica con un calendario).',
        consejo: 'Dejar pasar un repaso no te baja el dominio de una lección dominada. El repaso es para que no se te olvide.',
      },
      {
        id: 'ver-mi-progreso',
        titulo: '¿Cómo veo mi progreso?',
        paraQue: 'Para saber cuánto llevas del curso y qué te conviene reforzar.',
        pasos: [
          'Toca «Mi progreso» en el menú.',
          'Arriba ves cuántas lecciones dominas de todo el curso.',
          'En «Cómo vas en cada lección» ves el dominio de cada una y un botón para repasarla.',
          'Más abajo, tu perfil de aprendizaje muestra los errores que se te repiten.',
        ],
        resultado: 'Sabes en qué lecciones vas bien y cuáles conviene practicar.',
      },
      {
        id: 'marcar-asistencia',
        titulo: '¿Cómo marco mi asistencia?',
        paraQue: 'Para que tu docente registre que estás en clase, si la toma en STIRE.',
        pasos: [
          'Cuando tu docente tome asistencia, toca «Mi asistencia» en el menú.',
          'Muéstrale a tu docente el código QR desde tu celular. Cambia cada 20 segundos.',
          'En «Asistencia por clase» ves tu porcentaje y cada sesión.',
        ],
        resultado: 'Quedas como presente en la sesión de hoy.',
        siAlgoSaleMal: [{ problema: 'Al docente le cuesta leer el código', solucion: 'Sube el brillo de la pantalla y acerca el celular.' }],
      },
      {
        id: 'escribirle-a-mi-docente',
        titulo: '¿Cómo le escribo a mi docente?',
        paraQue: 'Para preguntarle algo sin salir de STIRE.',
        pasos: [
          'Toca «Mensajes» en el menú.',
          'Toca «Escribir a un docente», elige el docente y escribe tu mensaje.',
          'Toca «Enviar mensaje».',
          'En «Avisos de la clase» ves lo que tu docente publica para todo el grupo.',
        ],
        resultado: 'Tu docente lo recibe en su bandeja de STIRE y su respuesta te llega a «Mensajes».',
      },
      {
        id: 'crear-un-proyecto',
        titulo: '¿Cómo creo un proyecto propio?',
        paraQue: 'Para programar lo que quieras, fuera de los ejercicios del curso.',
        pasos: [
          'Toca «Mis proyectos» en el menú. Si no aparece, todavía no está disponible en tu clase: está en prueba.',
          'En «Nuevo proyecto», escribe el «Nombre» y elige el «Tipo de proyecto».',
          'Toca «Crear proyecto» y luego «Abrir proyecto».',
        ],
        resultado: 'Tu proyecto se ejecuta en tu navegador y solo tú lo ves.',
      },
    ],
  },
  {
    id: 'docente',
    rol: 'docente',
    titulo: 'Si eres docente',
    intro: 'Todo lo del docente es opcional: usas solo lo que te sirve y lo demás lo hace STIRE.',
    tareas: [
      {
        id: 'crear-una-clase',
        titulo: '¿Cómo creo una clase?',
        paraQue: 'Para que tus estudiantes entren con un código y tú veas cómo van.',
        pasos: [
          'En tu inicio, toca «Crear clase». También está en el menú, al abrir el selector de tus clases.',
          'Escribe el «Nombre de la clase». La asignatura, el grupo y el periodo son opcionales.',
          'En «Código de la clase», escribe uno o toca «Generar sugerido».',
          'En «Contenido de la clase», elige «Empezar vacía», una plantilla o una de tus clases para copiar sus lecciones.',
          'Toca «Crear clase».',
        ],
        captura: { src: '/manual/capturas/docente-crear-clase.png', alt: 'Ventana «Crear nueva clase» con el nombre, el código y el contenido de la clase.' },
        resultado: 'La clase aparece en tu inicio. Comparte el código o el QR con tus estudiantes.',
        consejo: 'Si marcas «Requiere aprobación», cada estudiante entra cuando tú lo aceptas.',
      },
      {
        id: 'armar-los-contenidos',
        titulo: '¿Cómo armo los contenidos del curso?',
        paraQue: 'Para organizar lo que tus estudiantes van a estudiar y practicar.',
        pasos: [
          'Elige tu clase en el menú y toca «Contenido del curso».',
          'Toca «Nuevo módulo». Dentro del módulo, toca «Nuevo tema» y luego agrega cada lección.',
          'Abre una lección para escribir su explicación y crear sus ejercicios.',
          'Cuando esté lista, toca «Publicar». Con «Ocultar» la retiras sin borrarla.',
        ],
        resultado: 'Tus estudiantes ven la lección publicada en su plan del curso.',
        consejo: 'Si ya tienes el curso en otra clase o en una plantilla, usa «Traer de otra clase» en vez de escribirlo otra vez.',
      },
      {
        id: 'crear-un-ejercicio',
        titulo: '¿Cómo creo un ejercicio?',
        paraQue: 'Para que tus estudiantes practiquen una lección y se califique solo.',
        pasos: [
          'En «Contenido del curso», abre la lección y toca «Ejercicio».',
          'Responde «¿Qué va a hacer el estudiante?» eligiendo el tipo de ejercicio.',
          'Escribe el enunciado y lo que debe cumplir la respuesta, y toca «Ver cómo lo verá el estudiante».',
          'Revisa la vista previa, elige «Publicar ahora» o «Guardar como borrador», y confirma.',
        ],
        resultado: 'El ejercicio aparece en la lección y STIRE lo califica al instante.',
        consejo: 'Con «Volver al paso anterior» corriges lo que haga falta antes de publicarlo.',
      },
      {
        id: 'recibir-entregas',
        titulo: '¿Cómo recibo proyectos de mis estudiantes?',
        paraQue: 'Para que entreguen un trabajo más grande que un ejercicio, si te sirve.',
        pasos: [
          'Elige tu clase en el menú y toca «Entregas».',
          'Toca «Nueva entrega» y describe qué deben entregar y para cuándo.',
          'Cuando entreguen, abre la entrega para revisar cada versión y dejar tu comentario.',
        ],
        resultado: 'Cada versión queda con su fecha y cada revisión en el historial.',
      },
      {
        id: 'asignar-un-refuerzo',
        titulo: '¿Cómo le asigno un refuerzo o un reto a un estudiante?',
        paraQue: 'Para apoyar a quien va atrás o darle más a quien va adelante.',
        pasos: [
          'Elige tu clase en el menú, abre «Estudiantes y avance» y toca «Refuerzos».',
          'Toca «Nuevo refuerzo o reto».',
          'Elige el «Tipo», a quién va y qué tiene que hacer: una explicación, un ejercicio, un recurso o una entrega.',
          'Toca «Asignar el refuerzo» o «Asignar el reto».',
        ],
        resultado: 'En «Refuerzos y retos» ves los pasos que hizo y su dominio antes y ahora.',
        consejo: 'También puedes asignarlo desde «Resumen» o desde el mapa de calor de «Estudiantes y avance».',
      },
      {
        id: 'ajustar-la-clase',
        titulo: '¿Qué puedo cambiar en los ajustes de la clase?',
        paraQue: 'Para que la clase funcione como tú quieres. Todo es opcional.',
        pasos: [
          'Elige tu clase en el menú y toca «Ajustes de la clase», al pie.',
          'En «Avance entre módulos» decides cuánto dominio del módulo anterior hace falta para abrir el siguiente.',
          'En «Compartir el contenido» eliges con quién compartirlo como plantilla, o «No compartir».',
          'En «Logros y medallas» eliges qué medallas pueden ganar tus estudiantes.',
          'En «Estado y gestión de la clase» la archivas al terminar el periodo.',
        ],
        resultado: 'La clase queda como la quieres, y todo se puede cambiar después.',
      },
      {
        id: 'avisar-a-la-clase',
        titulo: '¿Cómo le aviso algo a mis estudiantes?',
        paraQue: 'Para escribirle a uno o recordarle algo a toda la clase.',
        pasos: [
          'Toca «Mensajes» en el menú.',
          'Para escribirle a uno, toca «Escribir a un estudiante».',
          'Para toda la clase, abre «Avisos de la clase» y toca «Publicar un aviso».',
        ],
        resultado: 'Tus estudiantes lo reciben en STIRE, con una notificación.',
      },
      {
        id: 'saber-a-quien-ayudar',
        titulo: '¿Cómo sé a quién ayudar?',
        paraQue: 'Para apoyar primero a quien más lo necesita.',
        pasos: [
          'En tu inicio, «Por revisar» junta a quienes necesitan apoyo en todas tus clases. Toca uno para ir a esa clase.',
          'Dentro de la clase, «Resumen» muestra lo que conviene atender primero: quien no puede avanzar y lo que espera tu comentario.',
          'Toca «Estudiantes y avance». El mapa de calor muestra a cada estudiante en una fila y cada lección en una columna.',
          'Usa el filtro para ver solo a quienes van por debajo de 50 % de dominio.',
          'Abre un estudiante para ver su avance lección por lección.',
        ],
        resultado: 'Sabes quién necesita apoyo y en qué lección.',
      },
      {
        id: 'tomar-asistencia',
        titulo: '¿Cómo tomo asistencia?',
        paraQue: 'Para llevar la asistencia sin papel, si te sirve.',
        pasos: [
          'Elige tu clase en el menú, abre «Asistencia y notas» y toca «Asistencia».',
          'Toca «Tomar asistencia de hoy».',
          'Si quieres seguir usando STIRE mientras llegan, ve a otra pantalla: abajo a la derecha queda el botón «Asistencia» con cuántos llegaron. Ábrelo para ver quiénes llegaron, escanear con «Escanear aquí» o buscar a alguien y marcarlo a mano.',
          'Toca «Escanear códigos» y lee el QR que cada estudiante muestra en «Mi asistencia». Ves su nombre y su foto para comparar.',
          'Al terminar, toca «Cerrar asistencia». Quien no marcó queda ausente y puedes corregir a mano.',
        ],
        resultado: 'La sesión queda guardada. Con «Planilla (CSV)» la descargas.',
        consejo: '«Llamar a 3 al azar» te ayuda a comprobar que quien marcó está en el salón. Si no quieres el botón flotante, toca «Quitar de la vista»; vuelve con «Dejar activa mientras uso STIRE».',
      },
      {
        id: 'llevar-las-notas',
        titulo: '¿Cómo llevo las notas y las paso a Moodle?',
        paraQue: 'Para tener las notas en un solo lugar, si quieres llevarlas aquí.',
        pasos: [
          'Elige tu clase en el menú, abre «Asistencia y notas» y toca «Notas».',
          'Elige cómo empezar, por ejemplo «Una sola nota» o «Una nota por módulo». Después cambias lo que quieras.',
          'Escribe las notas en la tabla. La final se puede ajustar, con un motivo que queda en el historial.',
          'Toca «Descargar para Moodle (CSV)» y súbelo en Moodle, en «Importar calificaciones».',
        ],
        resultado: 'Las notas quedan en Moodle sin copiarlas una por una.',
      },
    ],
  },
  {
    id: 'administrador',
    rol: 'administrador',
    titulo: 'Si eres administrador',
    intro: 'El administrador aprueba a los docentes, atiende las sugerencias y revisa cómo está STIRE.',
    tareas: [
      {
        id: 'aprobar-un-docente',
        titulo: '¿Cómo apruebo a un docente?',
        paraQue: 'Para que quien pidió ser docente pueda crear clases.',
        pasos: [
          'Toca «Usuarios y roles» en el menú.',
          'Abre «Solicitudes de docente».',
          'Revisa la solicitud y toca «Aprobar» o «Rechazar».',
        ],
        resultado: 'La persona ya entra como docente. El cambio queda en el historial de roles.',
      },
      {
        id: 'atender-sugerencias',
        titulo: '¿Cómo atiendo las sugerencias?',
        paraQue: 'Para resolver lo que reportan estudiantes y docentes.',
        pasos: [
          'Toca «Sugerencias» en el menú. Arriba ves cuántas faltan y cuántas impiden usar STIRE.',
          'Abre una y toca «Resolver…». Escribe qué hiciste: quien la envió lo lee.',
          'Si no aplica, toca «Archivar» y escribe el motivo.',
        ],
        resultado: 'La sugerencia pasa a resueltas o archivadas, y quien la envió recibe la respuesta.',
      },
      {
        id: 'leer-la-encuesta',
        titulo: '¿Cómo leo la encuesta de usabilidad?',
        paraQue: 'Para saber qué tan fácil de usar encuentran STIRE y por dónde mejorarlo.',
        pasos: [
          'Toca «Encuesta de usabilidad» en el menú.',
          'Arriba está el puntaje SUS de 0 a 100. Cuenta la última respuesta de cada persona.',
          'Mira cada afirmación por separado: la que más baja es por donde conviene empezar.',
          'Lee los comentarios: dicen qué cambiaría cada persona.',
        ],
        resultado: 'Sabes qué mejorar primero.',
      },
      {
        id: 'revisar-el-sistema',
        titulo: '¿Cómo reviso el estado del sistema?',
        paraQue: 'Para saber si STIRE funciona bien o qué parte falla.',
        pasos: [
          'Toca «Estado del sistema» en el menú.',
          'Arriba están los indicadores principales: cada uno dice si va normal o degradado.',
          'Más abajo, el estado detallado de cada parte de STIRE.',
          'Para ver el registro del servidor, toca «Registros y mantenimiento».',
        ],
        resultado: 'Sabes si hay que actuar y dónde.',
      },
      {
        id: 'ordenar-el-catalogo',
        titulo: '¿Cómo ordeno el catálogo académico?',
        paraQue: 'Para que no haya la misma asignatura con dos nombres.',
        pasos: [
          'Toca «Catálogo académico» en el menú.',
          'En «Posibles duplicados», STIRE muestra las asignaturas parecidas: elige cuál dejar o toca «Son distintas».',
          'En «Agregadas por docentes», toca «Confirmar como oficial» si corresponde. Es opcional: las oficiales salen primero en la búsqueda.',
        ],
        resultado: 'Al unir, las clases pasan a la que se queda y el nombre viejo sigue sirviendo para buscarla.',
      },
    ],
  },
  {
    id: 'repeticion-espaciada',
    rol: 'todos',
    titulo: 'La repetición espaciada',
    intro:
      'Por qué STIRE te pide repasar y cómo decide cuándo. Es la misma idea que usan aplicaciones como Anki o Duolingo, ajustada a un semestre universitario.',
    tareas: [],
    bloques: [
      {
        titulo: 'Olvidar es normal',
        texto:
          'Lo que aprendes hoy se empieza a olvidar en pocos días si no lo vuelves a usar. Pero cada vez que lo recuerdas, el olvido se hace más lento.',
      },
      {
        titulo: 'Repasar justo a tiempo',
        texto:
          'Por eso STIRE no te pone a repasar todo, todos los días. Te pide repasar cada lección justo cuando empezarías a olvidarla: primero al día siguiente, luego a los tres días y después cada vez más separado.',
      },
      {
        titulo: 'Tú marcas el ritmo',
        texto:
          'No tienes que calificarte. STIRE mira cómo te fue en el ejercicio del repaso: si acertaste al primer intento, si necesitaste varios y si dijiste que estabas seguro. Con eso decide cuándo vuelve la lección.',
      },
      {
        titulo: 'Si fallas, no pasa nada',
        texto:
          'Un repaso fallado no te quita el dominio de una lección dominada. Solo hace que la lección vuelva mañana, para afianzarla otra vez.',
      },
    ],
    conCalendario: true,
  },
  {
    // Las mismas fórmulas que src/common/utils/spaced-repetition.ts; manual-usuario.frontend.spec.ts lo comprueba.
    id: 'algoritmo-repasos',
    rol: 'docente',
    titulo: 'Cómo calcula STIRE los repasos',
    intro:
      'El detalle del algoritmo, para el docente que quiere saber exactamente cuándo vuelve una lección. STIRE usa SM-2, el algoritmo de SuperMemo (Woźniak, 1990) en el que se basa Anki, con dos ajustes para un semestre. Se calcula para cada estudiante y cada lección.',
    tareas: [],
    bloques: [
      {
        titulo: 'Las cuatro variables',
        texto:
          'q es la calidad del repaso: 1, 3, 4 o 5. n es cuántos repasos seguidos lleva bien; empieza en 0. I es el intervalo: los días hasta el próximo repaso. EF es el factor de facilidad, el número por el que se multiplica el intervalo; empieza en 2,5 y nunca baja de 1,3.',
      },
      {
        titulo: '1. La calidad sale del resultado',
        texto:
          'El estudiante no se califica a sí mismo: STIRE mira la entrega. Aprobar es llegar a la nota mínima del ejercicio. «Estar seguro» es haber respondido «Estoy seguro» antes de entregar o haber tomado el reto de entrada de la lección.',
        formula: 'q = 1   si no aprueba               (Otra vez)\nq = 3   si aprueba con 2 o más intentos (Difícil)\nq = 4   si aprueba al primer intento    (Bien)\nq = 5   si además estaba seguro         (Fácil)',
      },
      {
        titulo: '2. El factor de facilidad',
        texto:
          'Si acierta (q ≥ 3), EF se ajusta: con q = 5 sube 0,10; con q = 4 queda igual; con q = 3 baja 0,14. Si falla, EF no cambia, como en el SM-2 original.',
        formula: "EF' = máx( 1,3 ;  EF + 0,1 − (5 − q) × (0,08 + (5 − q) × 0,02) )",
      },
      {
        titulo: '3. El intervalo',
        texto:
          'Si falla, n vuelve a 0 y la lección vuelve mañana. Si acierta, n sube en 1: el primer repaso es al día siguiente, el segundo a los 3 días y desde el tercero el intervalo anterior se multiplica por el EF nuevo y se redondea. Nunca pasa de 60 días.',
        formula: "si q < 3:   n' = 0      I' = 1\nsi q ≥ 3:   n' = n + 1\n            I' = 1                    si n' = 1\n            I' = 3                    si n' = 2\n            I' = redondear(I × EF')   si n' ≥ 3\nI' = mín(I', 60)\npróximo repaso = hoy + I' días",
      },
      {
        titulo: 'Un ejemplo',
        texto:
          'Una estudiante acierta siempre al primer intento, sin decir que está segura (q = 4): EF se queda en 2,5 y sus repasos llegan a los 1, 3, 8, 20, 50 y 60 días. Si falla el cuarto repaso, la lección vuelve mañana y desde ahí el calendario se repite: 1, 3 y luego 3 × EF días.',
        formula: '1 → 3 → redondear(3 × 2,5) = 8 → 8 × 2,5 = 20 → 20 × 2,5 = 50 → 60 (tope)',
      },
      {
        titulo: 'Cuándo se mueve el calendario',
        texto:
          'La primera vez que el estudiante entrega un ejercicio de la lección y cada vez que entrega uno con el repaso ya vencido. Practicar antes de la fecha no cuenta como repaso: si contara, el intervalo crecería sin que pasara el tiempo. Un repaso fallado no baja el dominio de la lección.',
      },
      {
        titulo: 'En qué se aparta del SM-2 original',
        texto:
          'El segundo intervalo es de 3 días en vez de 6, para que en un semestre el primer repaso real llegue antes; hay un tope de 60 días; y la calidad sale del resultado del ejercicio en lugar de pedirle al estudiante que se califique de 0 a 5. La tabla de la sección «La repetición espaciada» sale de estas mismas fórmulas.',
      },
      {
        titulo: 'Qué aporta «qué tan seguro estás»',
        texto:
          'En el algoritmo solo separa Bien (4) de Fácil (5): un acierto seguro hace subir el EF y espacia más los repasos. Quien omite la pregunta o la apaga llega como máximo a Bien. Fuera del algoritmo, alimenta la calibración (¿acierta cuando dice estar seguro?), que ves en la ficha de cada estudiante.',
      },
    ],
  },
  {
    id: 'como-funciona',
    rol: 'todos',
    titulo: 'Cómo funciona STIRE',
    intro: 'Cuatro ideas explican casi todo lo que ves en la aplicación.',
    tareas: [],
    bloques: [
      {
        titulo: 'Dominio',
        texto:
          'Cada lección tiene un porcentaje de dominio que sube con los ejercicios que resuelves. Desde 85 % la lección queda dominada y vuelve de vez en cuando como repaso.',
      },
      {
        titulo: 'Repasos',
        texto:
          'Lo que aprendes se empieza a olvidar enseguida. STIRE te pide repasar justo antes: al día siguiente, a los tres días y luego cada vez más separado, según cómo te fue. Cada repaso es un ejercicio corto, y te avisa una sola vez al día.',
      },
      {
        titulo: 'El Tutor',
        texto:
          'Te guía con preguntas y pistas, sin darte la respuesta. Puedes escribirle o hablarle con el micrófono. Si te atascas varias veces, cambia de táctica: te acompaña paso a paso o te muestra un ejemplo parecido.',
      },
      {
        titulo: 'Qué tan seguro estás',
        texto:
          'Antes de la primera entrega de un ejercicio, STIRE te pregunta qué tan seguro estás. Al calificar ves si tu seguridad coincidió con el resultado: saber cuándo sabes también es aprender. Si no quieres que te pregunte, marca «No volver a preguntarme»; se vuelve a activar en Apariencia.',
      },
    ],
  },
  {
    id: 'preguntas-frecuentes',
    rol: 'todos',
    titulo: 'Preguntas frecuentes',
    intro: 'Las dudas que más aparecen, con su respuesta corta.',
    tareas: [],
    preguntas: [
      { pregunta: '¿«Probar código» gasta intentos?', respuesta: 'No. Solo cuenta como intento «Entregar solución».' },
      { pregunta: '¿El Tutor me da la respuesta?', respuesta: 'No. Te guía con preguntas y pistas para que llegues tú. Si te atascas, te acompaña paso a paso.' },
      { pregunta: '¿Qué necesito para usar el Tutor?', respuesta: 'Una clave de Google AI Studio, que se crea con tu cuenta de Google. El panel del Tutor te explica cómo.' },
      { pregunta: '¿Si dejo pasar un repaso pierdo lo que avancé?', respuesta: 'No. Una lección dominada sigue dominada. El repaso solo te ayuda a no olvidarla.' },
      { pregunta: '¿Funciona en el celular?', respuesta: 'Sí. STIRE se adapta a la pantalla del celular, y los botones de «Probar código» y «Entregar solución» quedan abajo, a mano.' },
      { pregunta: '¿Cómo vuelvo a ver el recorrido de una pantalla?', respuesta: 'Toca «?» arriba a la derecha.' },
      { pregunta: '¿Puedo saltarme el recorrido?', respuesta: 'Sí. Toca «Saltar recorrido» en el globo. Si no quieres que aparezca en ninguna pantalla, marca «No volver a mostrar recorridos»; se vuelve a activar en «Apariencia», en «Ayuda».' },
      { pregunta: '¿El docente tiene que usar todo?', respuesta: 'No. Asistencia, notas, refuerzos y entregas son opcionales. STIRE funciona aunque el docente solo cree la clase.' },
      { pregunta: '¿Puedo dejar de responder qué tan seguro estoy?', respuesta: 'Sí. Marca «No volver a preguntarme» en esa ventana, o apágalo en «Apariencia», en «Al practicar». Sin tu respuesta, ningún repaso se marca como Fácil y tu calibración deja de llenarse.' },
      { pregunta: '¿Puedo cambiar los colores o el tamaño de la letra?', respuesta: 'Sí. Toca «Apariencia» en la cabecera: puedes cambiar el tema, el contraste y el tamaño del texto.' },
    ],
  },
  {
    id: 'glosario',
    rol: 'todos',
    titulo: 'Glosario',
    intro: 'Las palabras de STIRE, en una frase.',
    tareas: [],
    bloques: [
      { titulo: 'Clase', texto: 'El grupo de tu docente. Se entra con un código o con un QR.' },
      { titulo: 'Módulo, tema y lección', texto: 'Cómo se organiza el curso: los módulos tienen temas y los temas tienen lecciones.' },
      { titulo: 'Dominio', texto: 'Cuánto dominas una lección, de 0 a 100 %. Desde 85 % queda dominada.' },
      { titulo: 'Intento', texto: 'Cada vez que entregas un ejercicio. Probar no cuenta como intento.' },
      { titulo: 'Casos de prueba', texto: 'Ejemplos de lo que entra a tu programa y lo que debe salir. Al probar, STIRE te dice cuáles pasan.' },
      { titulo: 'Repaso', texto: 'Un ejercicio corto de una lección que ya practicaste, para no olvidarla.' },
      { titulo: 'Repetición espaciada', texto: 'Repasar justo antes de olvidar, con cada vez más días entre un repaso y el siguiente.' },
      { titulo: 'Tutor', texto: 'El asistente con IA que te guía con preguntas y pistas, sin darte la solución.' },
      { titulo: 'Refuerzo', texto: 'Una actividad extra que tu docente te asigna para afianzar una lección.' },
      { titulo: 'Recorrido', texto: 'La guía corta que señala las partes de cada pantalla. Se repite con «?».' },
    ],
  },
]

/** Un texto partido en trozos: lo que va entre «» se dibuja como el botón o campo de la pantalla. */
export function trozosConBotones(texto: string): Array<{ tipo: 'texto' | 'boton'; valor: string }> {
  return texto
    .split(/(«[^»]+»)/)
    .filter(Boolean)
    .map((t) => (t.startsWith('«') && t.endsWith('»') ? { tipo: 'boton', valor: t.slice(1, -1) } : { tipo: 'texto', valor: t }))
}

/** Nombre corto del rol para la etiqueta de cada sección. */
export function etiquetaRol(rol: RolManual): string {
  return rol === 'estudiante' ? 'Estudiante' : rol === 'docente' ? 'Docente' : rol === 'administrador' ? 'Administrador' : 'Para todos'
}

/** Minúsculas y sin tildes, para que «leccion» encuentre «lección». */
function normalizar(t: string): string {
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/**
 * Lo que se ve con el buscador y el filtro de rol de /ayuda. Con un rol, quedan sus secciones y las de «todos». Con
 * texto, cada sección deja solo las tareas, bloques y preguntas que lo contienen; si su título o su introducción lo
 * contienen, se ve completa. Las secciones vacías desaparecen.
 */
export function filtrarManual(manual: SeccionManual[], texto: string, rol: RolManual): SeccionManual[] {
  const q = normalizar(texto.trim())
  const tiene = (...partes: Array<string | undefined>) => partes.some((p) => p && normalizar(p).includes(q))
  return manual
    .filter((s) => rol === 'todos' || s.rol === 'todos' || s.rol === rol)
    .map((s) => {
      if (!q || tiene(s.titulo, s.intro)) return s
      return {
        ...s,
        tareas: s.tareas.filter((t) => tiene(t.titulo, t.paraQue, t.resultado, t.consejo, ...t.pasos, ...(t.siAlgoSaleMal ?? []).flatMap((p) => [p.problema, p.solucion]))),
        bloques: s.bloques?.filter((b) => tiene(b.titulo, b.texto)),
        preguntas: s.preguntas?.filter((p) => tiene(p.pregunta, p.respuesta)),
        conCalendario: false,
      }
    })
    .filter((s) => s.tareas.length || s.bloques?.length || s.preguntas?.length || s.conCalendario)
}
