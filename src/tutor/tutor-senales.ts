/**
 * Señales del estudiante para el Tutor (segunda versión, listas de chequeo del profesor: Caro, 2015):
 * - MOD-02 · error de concepto probable: lo detecta la pantalla al comparar la salida del último «Probar código»
 *   (frontend-nuxt/utils/diagnosticoSalida.ts) y aquí se traduce a una instrucción para el Tutor.
 * - META-02 · juicio de confianza: lo que el estudiante dijo antes de entregar («seguro», «dudo», «adivino») y si acertó.
 * - UI-05 · resolver por pasos: el estudiante pidió que el problema se divida en subpreguntas.
 * - UI-04 · otra explicación: el estudiante dijo que la explicación de la lección no le sirvió.
 * - UI-05 · ejemplo parecido: tras varios intentos fallidos, ver resuelto un problema PARECIDO (no el suyo) — cambio de
 *   táctica con el efecto del ejemplo resuelto (Atkinson, Derry, Renkl y Wortham, 2000).
 *
 * Todo llega como un código de una lista cerrada: el navegador no puede colar texto libre en el prompt.
 */

export const ERRORES_DE_SALIDA = {
  vacia: 'su programa no muestra nada: probablemente falta mostrar el resultado (console.log) o el programa no llega a esa línea',
  eco: 'su programa muestra la misma entrada que recibe: le falta el paso que la procesa',
  concatena: 'junta los números como texto en lugar de operarlos (no convierte la entrada a número; «5» + «3» da «53»)',
  espacios: 'la salida solo difiere en espacios o saltos de línea',
  mayusculas: 'la salida solo difiere en mayúsculas o minúsculas',
  puntuacion: 'la salida solo difiere en un signo de puntuación',
  'por-uno': 'el resultado se pasa o se queda corto por 1: suele ser el inicio o el fin de un ciclo, o < en lugar de <=',
  redondeo: 'el número es cercano pero no igual: decimales, división entera o redondeo',
  numero: 'el resultado numérico es otro: falta, sobra o está en otro orden una operación',
  linea: 'la salida difiere en alguna línea; puede faltar o sobrar una línea',
} as const;
export type ErrorDeSalida = keyof typeof ERRORES_DE_SALIDA;

export const CONFIANZAS = ['seguro', 'dudo', 'adivino'] as const;
export type Confianza = (typeof CONFIANZAS)[number];

export interface SenalesDelEstudiante {
  errorProbable?: unknown;
  confianza?: unknown;
  /** Si la última entrega con ese juicio aprobó. */
  acerto?: unknown;
  modo?: unknown;
}

/** Líneas para el prompt, solo con valores de las listas cerradas; lo demás se ignora. */
export function instruccionesDeSenales(s: SenalesDelEstudiante | null | undefined): string[] {
  if (!s || typeof s !== 'object') return [];
  const lineas: string[] = [];

  if (typeof s.errorProbable === 'string' && Object.prototype.hasOwnProperty.call(ERRORES_DE_SALIDA, s.errorProbable)) {
    lineas.push(
      `ERROR DE CONCEPTO PROBABLE (según la salida de su último «Probar código»): ${ERRORES_DE_SALIDA[s.errorProbable as ErrorDeSalida]}. ` +
        'Úsalo para orientar tu ayuda hacia esa idea, con una pregunta que lo lleve a descubrirlo. No le digas la corrección ni escribas el código.',
    );
  }

  if (typeof s.confianza === 'string' && (CONFIANZAS as readonly string[]).includes(s.confianza) && typeof s.acerto === 'boolean') {
    const c = s.confianza as Confianza;
    if (c === 'seguro' && !s.acerto) {
      lineas.push('CALIBRACIÓN: antes de entregar dijo estar SEGURO y no acertó. Pregúntale qué esperaba que hiciera su programa y ayúdale a contrastarlo con lo que hizo; no lo hagas sentir mal, es la forma de calibrar.');
    } else if (c !== 'seguro' && s.acerto) {
      lineas.push('CALIBRACIÓN: dudaba de su respuesta y acertó. Hazle notar qué hizo bien para que confíe en su razonamiento.');
    } else if (c === 'adivino' && !s.acerto) {
      lineas.push('CALIBRACIÓN: reconoció que estaba adivinando. Vuelve a la idea base de la lección antes de hablar del código.');
    }
  }

  if (s.modo === 'por-pasos') {
    lineas.push(
      'MODO POR PASOS (lo pidió el estudiante tras varios intentos fallidos): divide el problema en 3 a 5 subpreguntas pequeñas y en orden. ' +
        'Escribe solo la lista corta de pasos y plantea ÚNICAMENTE la primera subpregunta; espera su respuesta antes de seguir. No escribas el código de la solución.',
    );
  }
  if (s.modo === 'ejemplo-parecido') {
    lineas.push(
      'EJEMPLO PARECIDO (UI-05, lo pidió el estudiante tras varios intentos fallidos): resuelve paso a paso un problema PARECIDO pero distinto ' +
        '(otro contexto y otros datos), explicando el porqué de cada paso. NO resuelvas su ejercicio ni escribas su solución. ' +
        'Termina pidiéndole que diga qué paso del ejemplo se parece a lo que le falta en su ejercicio.',
    );
  }
  if (s.modo === 'otra-explicacion') {
    lineas.push(
      'OTRA EXPLICACIÓN (UI-04): el estudiante marcó que la explicación de la lección NO le sirvió. Explica la misma idea de otra forma: ' +
        'otra analogía de la vida diaria, otro ejemplo más sencillo o un dibujo en texto, sin repetir el de la lección. Corto, y termina con una pregunta para comprobar si ahora quedó claro.',
    );
  }
  return lineas;
}
