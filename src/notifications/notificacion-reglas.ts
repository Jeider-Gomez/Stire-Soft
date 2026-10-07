/**
 * Qué se le avisa al estudiante y cuándo (07/10; hallazgo de José en la prueba S08-E01 y decisión de Jeider: «no saturar al
 * estudiante, notificarle cosas realmente importantes y significativas»). Funciones puras; los listeners las aplican.
 *
 * Antes llegaba un aviso por CADA ejercicio calificado y otro por cada cambio de estado de la lección: 3 o 4 por lección,
 * que repetían lo que la pantalla del ejercicio ya decía. Ahora solo llega lo que el estudiante no ve en la pantalla donde
 * está, una sola vez:
 * - su avance por módulo al 50 %, 75 % y 100 % de lecciones dominadas (el logro que importa, no cada paso);
 * - una sugerencia cuando se atasca en una lección (3 fallos seguidos), una vez por racha;
 * - un solo aviso al día con los repasos pendientes (antes, uno por lección vencida);
 * - lo que hace el docente: una nota, la revisión de una entrega, un mensaje o un aviso a la clase.
 */

/** Porcentajes de lecciones dominadas de un módulo que merecen un aviso. */
export const HITOS_MODULO = [50, 75, 100] as const;

/**
 * El hito más alto que se cruzó al pasar de `antes` a `ahora` lecciones dominadas de `total`; null si ninguno. Si un
 * módulo de una sola lección pasa de 0 a 1, cruza los tres: se avisa solo el 100 % (un aviso, no tres).
 */
export function hitoCruzado(antes: number, ahora: number, total: number): number | null {
  if (total <= 0 || ahora <= antes) return null;
  const pa = (antes / total) * 100;
  const pb = (ahora / total) * 100;
  const cruzados = HITOS_MODULO.filter((h) => pa < h && pb >= h);
  return cruzados.length ? cruzados[cruzados.length - 1] : null;
}

export function avisoDeHito(hito: number, modulo: string, dominadas: number, total: number): { titulo: string; mensaje: string } {
  if (hito >= 100) {
    return {
      titulo: `¡Dominaste el módulo «${modulo}»!`,
      mensaje: `Dominaste las ${total} lecciones del módulo. Los repasos te ayudarán a no olvidarlo.`,
    };
  }
  return {
    titulo: `Llevas el ${hito} % del módulo «${modulo}»`,
    mensaje: `Dominaste ${dominadas} de ${total} lecciones. ${hito >= 75 ? 'Ya casi lo terminas.' : 'Vas por la mitad: sigue así.'}`,
  };
}

/** Un solo aviso al día con los repasos pendientes (la clave del día evita repetirlo si el cron corre dos veces). */
export function avisoDeRepasos(pendientes: number): { titulo: string; mensaje: string } {
  return {
    titulo: pendientes === 1 ? 'Tienes 1 repaso pendiente hoy' : `Tienes ${pendientes} repasos pendientes hoy`,
    mensaje: 'Repasar a tiempo es lo que hace que no se olvide. Son unos minutos.',
  };
}

/** La sugerencia al atascarse: qué hacer, no solo «fallaste». Queda en las notificaciones para volver a ella después. */
export function avisoDeAtasco(leccion: string, fallos: number): { titulo: string; mensaje: string } {
  return {
    titulo: `Una sugerencia para «${leccion}»`,
    mensaje:
      `Llevas ${fallos} intentos seguidos sin lograrlo, y es normal. Antes de seguir: relee la explicación (puedes escucharla), ` +
      'mira en qué falló tu último intento y pide una pista al Tutor: él ve tu código.',
  };
}

/** La nota o la revisión del docente, en una línea: «Nota: 4,2 · "Buen trabajo…"». */
export function resumenRevision(nota: number | null, valoracion: string | null, comentario: string | null): string {
  const partes: string[] = [];
  if (nota !== null) partes.push(`Nota: ${nota.toFixed(1).replace('.', ',')}`);
  if (valoracion) partes.push(`Valoración: ${valoracion}`);
  if (comentario) partes.push(`«${comentario.length > 160 ? `${comentario.slice(0, 160)}…` : comentario}»`);
  return partes.length ? partes.join(' · ') : 'Tu docente revisó tu entrega.';
}

export const fechaClave = (d: Date) => d.toISOString().slice(0, 10);
