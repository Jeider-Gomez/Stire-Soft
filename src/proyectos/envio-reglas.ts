/**
 * Revisión de un envío (docs/DISENO_INTERVENCION_DOCENTE.md §3): el docente pone un comentario y, si la entrega lleva
 * nota, una nota de 0,0 a 5,0. Las reglas de las versiones están en entrega-reglas.ts.
 */
import { ProyectoInvalidoError } from './proyecto-reglas';

export const LARGO_COMENTARIO = 2000;

export interface Revision {
  nota: number | null;
  comentario: string | null;
}

/** Nota de 0,0 a 5,0 con un decimal (escala colombiana); vacía = sin nota. Comentario de hasta 2000 caracteres. */
export function validarRevision(datos: { nota?: unknown; comentario?: unknown }, conNota = true): Revision {
  let nota: number | null = null;
  if (datos.nota !== undefined && datos.nota !== null && datos.nota !== '') {
    if (!conNota) throw new ProyectoInvalidoError('Esta entrega es sin nota: deja solo el comentario.');
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

/** Qué cambió entre la revisión anterior y la nueva, para el historial (§3.4). */
export function eventosDeRevision(
  antes: Revision & { revisadoAt: Date | null },
  despues: Revision,
): Array<{ tipo: 'revisada' | 'nota_cambiada' | 'comentario_editado' | 'revision_borrada'; detalle: Record<string, unknown> }> {
  const vacia = despues.nota === null && despues.comentario === null;
  if (!antes.revisadoAt) return vacia ? [] : [{ tipo: 'revisada', detalle: { nota: despues.nota, comentario: despues.comentario } }];
  if (vacia) return [{ tipo: 'revision_borrada', detalle: { notaAnterior: antes.nota } }];
  const eventos: ReturnType<typeof eventosDeRevision> = [];
  if (antes.nota !== despues.nota) eventos.push({ tipo: 'nota_cambiada', detalle: { antes: antes.nota, despues: despues.nota } });
  if (antes.comentario !== despues.comentario) eventos.push({ tipo: 'comentario_editado', detalle: { comentario: despues.comentario } });
  return eventos;
}
