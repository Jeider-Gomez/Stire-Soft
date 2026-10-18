/**
 * Manual de usuario de STIRE (S10-P07, Pedro a cargo). Se ve en /ayuda, sin iniciar sesión, y se descarga en PDF
 * (public/manual/). Organizado por tareas y por rol, como las guías de Canvas o de Google Classroom; cada tarea con la
 * misma plantilla. Las mismas palabras que el recorrido guiado (utils/recorridos.ts).
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
  /** Secciones de explicación (cómo funciona, glosario): párrafos con título, sin pasos. */
  bloques?: Array<{ titulo: string; texto: string }>
}

export const VERSION_MANUAL = 'Versión 2.0 · octubre de 2026'
export const PDF_MANUAL = '/manual/STIRE-Manual-de-usuario.pdf'

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
    ],
  },
  {
    id: 'estudiante',
    rol: 'estudiante',
    titulo: 'Si eres estudiante',
    intro: 'Lo que vas a hacer casi siempre: unirte a la clase, seguir las lecciones, practicar y repasar.',
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
          'En tu inicio, toca «Crear nueva clase».',
          'Escribe el «Nombre de la clase». La asignatura, el grupo y el periodo son opcionales.',
          'En «Código de la clase», escribe uno o toca «Generar sugerido».',
          'En «Contenido de la clase», elige «Empezar vacía», una plantilla o una de tus clases para copiar sus lecciones.',
          'Toca «Crear clase».',
        ],
        captura: { src: '/manual/capturas/docente-crear-clase.png', alt: 'Ventana «Crear nueva clase» con el nombre, el código y el contenido de la clase.' },
        resultado: 'La clase aparece en tu inicio. Comparte el código o el QR con tus estudiantes.',
        consejo: 'Si marcas «Requiere aprobación», cada estudiante entra cuando tú lo aceptas.',
      },
    ],
  },
  {
    id: 'como-funciona',
    rol: 'todos',
    titulo: 'Cómo funciona STIRE',
    intro: 'Tres ideas explican casi todo lo que ves en la aplicación.',
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
          'Te guía con preguntas y pistas, sin darte la respuesta. Puedes escribirle o hablarle con el micrófono.',
      },
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
