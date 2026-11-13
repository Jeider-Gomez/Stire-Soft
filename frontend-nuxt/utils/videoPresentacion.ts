// El video que presenta STIRE con la voz de la mascota (docs/material-visual/video-presentacion/). Se usa en Entrar y en
// la página de inicio (cuadros «Entrar», «Pagina-inicio» y «Video-mascota» del lienzo v3). Dura 1 min 42 s.
// Subtítulos en el video (.vtt) y la transcripción en la página (WCAG 1.2.1 y 1.2.2). No arranca solo.

export const VIDEO_PRESENTACION = {
  mp4: '/video/stire-presentacion.mp4',
  poster: '/video/stire-presentacion.jpg',
  subtitulos: '/video/stire-presentacion.es.vtt',
  duracion: '1 min 42 s',
} as const

/** Lo que dice la mascota, escena por escena (GUION.md del proyecto del video). */
export const TRANSCRIPCION: string[] = [
  '¡Hola! Soy el Tutor de STIRE. Bueno… en realidad soy una pantalla con gafas, ¡pero me tomo muy en serio lo de ayudarte!',
  '¿Y por qué me llamo así? STIRE significa: Sistema… Tutor… Inteligente… con Repetición Espaciada. Dicho fácil: un tutor que te enseña, y te repasa justo a tiempo.',
  'Aprender a programar asusta un poco al principio: un error en rojo… y cero idea de por dónde empezar.',
  'Por eso aquí vas a tu ritmo. Todo va en módulos, temas y lecciones cortitas: una idea, un ejemplo, y un espacio para probar el código ahí mismo.',
  '¿Te equivocaste? Tranqui, no te doy la respuesta. Te doy una pista, luego una pregunta y, si hace falta, te digo dónde mirar. La solución la escribes tú… ¡y se siente increíble!',
  'Lo que aprendes vuelve justo cuando lo empiezas a olvidar. Sin rachas, sin presión: un repaso a la vez.',
  'Y cuando por fin te sale… ¡lo celebramos juntos!',
  'Tu profe también está ahí: ve lo que le cuesta a la clase y prepara repasos con su Asistente. Pero las decisiones siempre son suyas.',
  'En el computador o en el celular. ¡Y gratis!',
  'Entra con el código de tu clase. ¡Aquí te espero!',
]
