/**
 * Revisión de un envío (docs/DISENO_INTERVENCION_DOCENTE.md §3): el docente pone un comentario y, según la escala de la
 * entrega, una valoración (aprobado o no; Superior, Alto, Básico o Bajo) o una nota de 0,0 a 5,0. Las reglas de las
 * versiones y las escalas están en entrega-reglas.ts.
 */
import type { EscalaEntrega } from './entrega-reglas';
import { ProyectoInvalidoError } from './proyecto-reglas';

export const LARGO_COMENTARIO = 2000;

/** Las valoraciones de cada escala sin número. */
export const VALORACIONES = {
  aprobacion: ['aprobado', 'no_aprobado'],
  desempeno: ['superior', 'alto', 'basico', 'bajo'],
} as const;
export type Valoracion = (typeof VALORACIONES)[keyof typeof VALORACIONES][number];

export interface Revision {
  nota: number | null;
  valoracion: Valoracion | null;
  comentario: string | null;
}

const vacio = (v: unknown) => v === undefined || v === null || v === '';

/**
 * Según la escala: nota de 0,0 a 5,0 con un decimal (escala colombiana) o una valoración de su lista; vacía = sin
 * calificar todavía. Comentario de hasta 2000 caracteres.
 */
export function validarRevision(datos: { nota?: unknown; valoracion?: unknown; comentario?: unknown }, escala: EscalaEntrega = 'nota'): Revision {
  let valoracion: Valoracion | null = null;
  if (!vacio(datos.valoracion)) {
    if (escala !== 'aprobacion' && escala !== 'desempeno') throw new ProyectoInvalidoError('Esta entrega no se califica con aprobado o desempeño.');
    if (!(VALORACIONES[escala] as readonly unknown[]).includes(datos.valoracion)) throw new ProyectoInvalidoError('Esa valoración no es de la escala de la entrega.');
    valoracion = datos.valoracion as Valoracion;
  }
  let nota: number | null = null;
  if (!vacio(datos.nota)) {
    if (escala !== 'nota') throw new ProyectoInvalidoError('Esta entrega es sin nota: deja solo el comentario.');
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
  return { nota, valoracion, comentario };
}

/** Qué cambió entre la revisión anterior y la nueva, para el historial (§3.4). */
export function eventosDeRevision(
  antes: Revision & { revisadoAt: Date | null },
  despues: Revision,
): Array<{ tipo: 'revisada' | 'nota_cambiada' | 'valoracion_cambiada' | 'comentario_editado' | 'revision_borrada'; detalle: Record<string, unknown> }> {
  const vacia = despues.nota === null && despues.valoracion === null && despues.comentario === null;
  if (!antes.revisadoAt) {
    if (vacia) return [];
    return [{ tipo: 'revisada', detalle: { nota: despues.nota, comentario: despues.comentario, ...(despues.valoracion ? { valoracion: despues.valoracion } : {}) } }];
  }
  if (vacia) return [{ tipo: 'revision_borrada', detalle: { notaAnterior: antes.nota, ...(antes.valoracion ? { valoracionAnterior: antes.valoracion } : {}) } }];
  const eventos: ReturnType<typeof eventosDeRevision> = [];
  if (antes.nota !== despues.nota) eventos.push({ tipo: 'nota_cambiada', detalle: { antes: antes.nota, despues: despues.nota } });
  if (antes.valoracion !== despues.valoracion) eventos.push({ tipo: 'valoracion_cambiada', detalle: { antes: antes.valoracion, despues: despues.valoracion } });
  if (antes.comentario !== despues.comentario) eventos.push({ tipo: 'comentario_editado', detalle: { comentario: despues.comentario } });
  return eventos;
}
