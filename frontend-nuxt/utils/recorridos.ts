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
  rol: 'estudiante' | 'docente'
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
            : null
        : null
  return RECORRIDOS.find((x) => x.id === id) ?? null
}

/** Clave del navegador que recuerda que ya se vio (una vez por persona y pantalla; si se borra, solo vuelve a salir). */
export function claveVisto(id: string, usuarioId: number | string | null | undefined): string {
  return `stire-recorrido-${id}-${usuarioId ?? 'anonimo'}`
}
