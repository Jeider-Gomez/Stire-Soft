// Términos y política de datos de STIRE (decisión del 22/10/2026: público de 18 años o más). Se muestran en /terminos y
// /privacidad, sin iniciar sesión. Borradores completos y fuentes: docs/legal/ y docs/PLAN_MENORES_Y_TRANSVERSALIDAD.md.
// La versión debe ser la misma que src/user/aceptacion-terminos.ts: al cambiar el texto, se cambia en los dos y cada
// persona vuelve a aceptar.

export const VERSION_TERMINOS = '2026-10-22'
export const FECHA_TERMINOS = '22 de octubre de 2026'

export interface DecisionTerminos {
  confirmaMayorDeEdad: boolean
  aceptaTerminos: boolean
  consienteInvestigacion?: boolean
}

/** ¿Aceptó la versión vigente? Igual que terminosAlDia en src/user/aceptacion-terminos.ts. */
export function terminosAlDia(u: { terminosVersion?: string | null; mayorDeEdadConfirmadoEn?: string | null } | null): boolean {
  return !!u && u.terminosVersion === VERSION_TERMINOS && !!u.mayorDeEdadConfirmadoEn
}

/** El servidor ya guarda la aceptación: su usuario trae el campo (null si aún no aceptó). */
export function servidorConTerminos(u: object | null): boolean {
  return !!u && 'terminosVersion' in u
}

export interface SeccionLegal {
  titulo: string
  parrafos: string[]
}

export interface DocumentoLegal {
  titulo: string
  resumen: string
  secciones: SeccionLegal[]
}

const GOOGLE =
  'Si usas el Tutor con IA, tu pregunta y el ejercicio se envían a Google (API de Gemini) con tu propia clave gratuita de ' +
  'Google AI Studio, y pueden procesarse fuera de Colombia. En la capa gratuita, Google puede usar ese contenido y ' +
  'revisarlo con personas para mejorar sus productos. Por eso STIRE no le envía tu nombre ni tu correo, y te pedimos no ' +
  'escribir datos personales ni contraseñas en el chat.'

export const TERMINOS: DocumentoLegal = {
  titulo: 'Términos y condiciones',
  resumen: 'Las reglas para usar STIRE y su Tutor con inteligencia artificial.',
  secciones: [
    {
      titulo: 'Qué es STIRE',
      parrafos: [
        'Una plataforma para aprender algoritmia y programación con un Tutor con inteligencia artificial y repasos ' +
          'espaciados. Es un proyecto académico de la Licenciatura en Informática de la Universidad de Córdoba, gratuito y ' +
          'con fines educativos y de investigación.',
      ],
    },
    {
      titulo: 'Quién puede usarlo',
      parrafos: [
        'STIRE es para personas de 18 años o más. Al crear tu cuenta confirmas que tienes 18 años o más. Si no es así, no ' +
          'crees la cuenta: los servicios de inteligencia artificial que usa STIRE no se permiten para menores de edad.',
      ],
    },
    {
      titulo: 'Tu cuenta',
      parrafos: ['Es personal. No compartas tu contraseña. Usa tu nombre y tu edad reales.'],
    },
    {
      titulo: 'El Tutor es una IA, no una persona',
      parrafos: [
        'Puede equivocarse. Te guía con pistas, pero no te da la solución completa del ejercicio. No escribas datos ' +
          'personales, contraseñas ni información de otras personas en el chat.',
      ],
    },
    {
      titulo: 'Tu clave de Google AI Studio',
      parrafos: [
        'El Tutor funciona con tu propia clave gratuita de Google AI Studio. Al crearla, aceptas los términos de Google ' +
          '(Gemini API Additional Terms of Service) como titular de esa clave. STIRE la guarda cifrada, la usa solo para el ' +
          'Tutor y la borra si la quitas. Nadie del equipo puede verla.',
      ],
    },
    {
      titulo: 'Uso correcto',
      parrafos: [
        'No intentes entrar a cuentas o datos ajenos, alterar notas ni usar el Tutor para algo distinto de aprender.',
      ],
    },
    {
      titulo: 'Lo que creas es tuyo',
      parrafos: ['Tu código y tus proyectos te pertenecen. Los contenidos del curso son de tu docente o de la institución.'],
    },
    {
      titulo: 'Disponibilidad',
      parrafos: ['STIRE es un proyecto académico: puede tener fallas o pausas. Guarda copia de lo importante.'],
    },
    {
      titulo: 'Datos personales y cambios',
      parrafos: [
        'Tus datos se tratan según la Política de tratamiento de datos. Si estos términos cambian, te avisamos y te pedimos ' +
          'aceptarlos de nuevo.',
      ],
    },
  ],
}

export const POLITICA: DocumentoLegal = {
  titulo: 'Política de tratamiento de datos',
  resumen: 'Qué datos recoge STIRE, para qué, con quién los comparte y cómo ejercer tus derechos (Ley 1581 de 2012).',
  secciones: [
    {
      titulo: 'Quién es el responsable',
      parrafos: [
        'El proyecto STIRE de la Licenciatura en Informática, Universidad de Córdoba (Montería, Colombia). Para consultas y ' +
          'reclamos sobre tus datos, usa «Contar un problema o una idea» en el menú de ayuda de STIRE o escríbele a tu docente.',
      ],
    },
    {
      titulo: 'Qué datos recogemos',
      parrafos: [
        'Tu nombre, tu correo y tu contraseña (guardada cifrada, nadie puede leerla).',
        'Las clases a las que perteneces y lo que haces al estudiar: lecciones, ejercicios, intentos, errores, tiempos, ' +
          'repasos y dominio.',
        'La asistencia y las notas que registra tu docente, los mensajes que envías y tus respuestas a la encuesta de usabilidad.',
        'Opcionales: tu foto de perfil y tu voz cuando le hablas al Tutor. No son obligatorios y nada depende de ellos.',
        'No pedimos tu documento de identidad, tu dirección, tu teléfono ni datos de salud.',
      ],
    },
    {
      titulo: 'Para qué los usamos',
      parrafos: [
        'Para prestarte el servicio educativo: tus clases, ejercicios, repasos y progreso, y para que tu docente sepa a quién ayudar.',
        'Para mejorar STIRE: encontrar errores y pantallas difíciles.',
        'Para investigación, solo si lo autorizas aparte. En las publicaciones nunca aparece tu nombre: se analizan los datos ' +
          'de grupo con un código en lugar de tu nombre. Puedes cambiar esa decisión cuando quieras desde tu perfil, sin ' +
          'ninguna consecuencia en tu clase.',
      ],
    },
    {
      titulo: 'Con quién se comparten',
      parrafos: [
        'Tu docente ve tu avance, tus errores y tus notas en las clases que dicta. Ningún docente ve clases ajenas.',
        GOOGLE,
        'Nadie más, salvo orden de una autoridad competente.',
      ],
    },
    {
      titulo: 'Tus derechos',
      parrafos: [
        'Conocer, actualizar y corregir tus datos; pedir prueba de tu autorización; saber cómo se usaron; retirar tu ' +
          'autorización y pedir que se borren, salvo que la ley obligue a conservarlos; y presentar quejas ante la ' +
          'Superintendencia de Industria y Comercio.',
      ],
    },
    {
      titulo: 'Cuánto tiempo se guardan',
      parrafos: [
        'Mientras tu cuenta esté activa. Si pides borrarla, se borran tus datos personales; los datos de investigación ya ' +
          'anonimizados pueden conservarse para verificar los resultados publicados.',
      ],
    },
    {
      titulo: 'Cambios',
      parrafos: ['Si esta política cambia en algo importante, te avisamos en STIRE y te pedimos aceptarla de nuevo.'],
    },
  ],
}
