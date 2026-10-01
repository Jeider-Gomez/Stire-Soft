/**
 * Reglas de «Enviar al docente» (docs/DISENO_PROYECTOS.md §3): el estudiante manda una copia congelada de su proyecto a
 * una de sus clases, y el docente le pone una nota, un comentario o ambos.
 */
import { ProyectoInvalidoError, type ArchivoProyecto } from './proyecto-reglas';

/** Versiones que se guardan por proyecto y clase: historial sin crecer sin límite. */
export const VERSIONES_POR_CLASE = 5;
export const LARGO_COMENTARIO = 2000;

export interface Revision {
  nota: number | null;
  comentario: string | null;
}

/** Nota de 0,0 a 5,0 con un decimal (escala colombiana); vacía = sin nota. Comentario de hasta 2000 caracteres. */
export function validarRevision(datos: { nota?: unknown; comentario?: unknown }): Revision {
  let nota: number | null = null;
  if (datos.nota !== undefined && datos.nota !== null && datos.nota !== '') {
    const n = typeof datos.nota === 'number' ? datos.nota : Number(String(datos.nota).replace(',', '.'));
    if (!Number.isFinite(n) || n < 0 || n > 5) throw new ProyectoInvalidoError('La nota va de 0,0 a 5,0.');
    nota = Math.round(n * 10) / 10;
  }
  let comentario: string | null = null;
  if (datos.comentario !== undefined && datos.comentario !== null) {
    if (typeof datos.comentario !== 'string') throw new ProyectoInvalidoError('El comentario debe ser texto.');
    const limpio = datos.comentario.trim();
    if (limpio.length > LARGO_COMENTARIO) throw new ProyectoInvalidoError(`El comentario admite como máximo ${LARGO_COMENTARIO} caracteres.`);
    comentario = limpio || null;
  }
  return { nota, comentario };
}

/** Número de la versión que toca enviar, o el motivo por el que no se puede. */
export function siguienteVersion(
  anteriores: Array<{ version: number; titulo: string; archivos: ArchivoProyecto[] }>,
  actual: { titulo: string; archivos: ArchivoProyecto[] },
): number {
  if (anteriores.length >= VERSIONES_POR_CLASE) {
    throw new ProyectoInvalidoError(`Ya enviaste ${VERSIONES_POR_CLASE} versiones de este proyecto a esta clase, el máximo.`);
  }
  const ultima = [...anteriores].sort((a, b) => b.version - a.version)[0];
  if (ultima && ultima.titulo === actual.titulo && JSON.stringify(ultima.archivos) === JSON.stringify(actual.archivos)) {
    throw new ProyectoInvalidoError('El proyecto no ha cambiado desde tu último envío a esta clase.');
  }
  return (ultima?.version ?? 0) + 1;
}
