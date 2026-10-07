/**
 * Avisos a la clase (07/10, pedido de Jeider): lo que el docente comunica a TODOS sus estudiantes y no es una conversación:
 * una citación («reunión el jueves a las 8 en el aula 3»), un recordatorio o un informe. Un mensaje es uno a uno y se
 * responde; un aviso es uno a muchos, se lee y queda a la vista. Como los «Anuncios» de Canvas y Classroom o el «Foro de
 * avisos» de Moodle. Funciones puras: el servicio las aplica.
 */
export const TIPOS_AVISO = ['aviso', 'citacion', 'recordatorio'] as const;
export type TipoAviso = (typeof TIPOS_AVISO)[number];

export const LIMITES_AVISO = { titulo: 120, cuerpo: 3000, lugar: 160 } as const;

export class AvisoInvalidoError extends Error {}

export interface DatosAviso {
  tipo: TipoAviso;
  titulo: string;
  cuerpo: string;
  /** Cuándo es la citación o el recordatorio (opcional). */
  fechaEvento: Date | null;
  lugar: string | null;
}

export function validarAviso(entrada: Record<string, unknown>): DatosAviso {
  const tipo = (entrada.tipo ?? 'aviso') as TipoAviso;
  if (!(TIPOS_AVISO as readonly string[]).includes(tipo)) throw new AvisoInvalidoError('El tipo es aviso, citación o recordatorio.');
  const titulo = typeof entrada.titulo === 'string' ? entrada.titulo.trim() : '';
  if (titulo.length < 3) throw new AvisoInvalidoError('Ponle un título corto: de qué se trata.');
  if (titulo.length > LIMITES_AVISO.titulo) throw new AvisoInvalidoError(`El título va hasta ${LIMITES_AVISO.titulo} caracteres.`);
  const cuerpo = typeof entrada.cuerpo === 'string' ? entrada.cuerpo.trim() : '';
  if (!cuerpo) throw new AvisoInvalidoError('Escribe el aviso.');
  if (cuerpo.length > LIMITES_AVISO.cuerpo) throw new AvisoInvalidoError(`El aviso va hasta ${LIMITES_AVISO.cuerpo} caracteres.`);
  let fechaEvento: Date | null = null;
  if (entrada.fechaEvento !== undefined && entrada.fechaEvento !== null && entrada.fechaEvento !== '') {
    fechaEvento = new Date(String(entrada.fechaEvento));
    if (Number.isNaN(fechaEvento.getTime())) throw new AvisoInvalidoError('La fecha no es válida.');
  }
  if (tipo === 'citacion' && !fechaEvento) throw new AvisoInvalidoError('Una citación necesita el día y la hora.');
  const lugar = typeof entrada.lugar === 'string' && entrada.lugar.trim() ? entrada.lugar.trim().slice(0, LIMITES_AVISO.lugar) : null;
  return { tipo, titulo, cuerpo, fechaEvento, lugar };
}

const NOMBRE_TIPO: Record<TipoAviso, string> = { aviso: 'Aviso', citacion: 'Citación', recordatorio: 'Recordatorio' };

/** La notificación de un aviso: «Citación: Reunión de padres» y el inicio del texto. */
export function notificacionDeAviso(d: Pick<DatosAviso, 'tipo' | 'titulo' | 'cuerpo'>, clase: string): { titulo: string; mensaje: string } {
  const inicio = d.cuerpo.length > 180 ? `${d.cuerpo.slice(0, 180)}…` : d.cuerpo;
  return { titulo: `${NOMBRE_TIPO[d.tipo]}: ${d.titulo}`, mensaje: `${clase}. ${inicio}` };
}
