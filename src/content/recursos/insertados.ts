/**
 * Imágenes y recursos DENTRO del texto de una lección (no como bloques aparte). El docente los pone en el punto del
 * texto donde los quiere, cada uno en su propia línea:
 *
 *   ![Descripción de la imagen](https://… o /media/<uuid>)            imagen
 *   ![Descripción](https://…/foto.png "Pie de la imagen")             imagen con pie
 *   @[Título del video](https://youtu.be/…)                           video, documento, presentación o actividad
 *
 * Se aplican las MISMAS reglas que a los recursos sueltos (metadatos-recurso.ts, normalizar-recurso.ts). Del recurso se
 * guarda aparte, en `metadata.insertados`, la dirección de inserción que arma el servidor: el texto conserva el enlace
 * que pegó el docente y nunca se confía en una dirección de inserción que venga del navegador.
 * Lo que está dentro de un bloque de código (```) no se toca: es un ejemplo, no un recurso.
 */
import { direccionDeImagen } from './metadatos-recurso';
import { normalizarRecurso, RecursoInvalidoError, type ProveedorRecurso } from './normalizar-recurso';

export const IMAGEN_EN_LINEA = /^!\[([^\]\n]*)\]\(\s*(\S+?)(?:\s+"([^"\n]*)")?\s*\)$/;
export const RECURSO_EN_LINEA = /^@\[([^\]\n]*)\]\(\s*(\S+?)\s*\)$/;
export const MAX_INSERTADOS = 30;

export interface Insertado { url: string; provider: ProveedorRecurso; embedUrl: string | null }

/** Las líneas del texto que están fuera de los bloques de código, con su número. */
function lineasFueraDeCodigo(texto: string): Array<{ n: number; linea: string }> {
  const fuera: Array<{ n: number; linea: string }> = [];
  let enCodigo = false;
  texto.split(/\r?\n/).forEach((linea, i) => {
    if (/^\s*```/.test(linea)) { enCodigo = !enCodigo; return; }
    if (!enCodigo) fuera.push({ n: i + 1, linea: linea.trim() });
  });
  return fuera;
}

/**
 * Revisa las imágenes y los recursos del texto y devuelve, por enlace, cómo se inserta cada recurso. Lanza
 * RecursoInvalidoError con la línea y el motivo, en palabras del docente.
 */
export function insertadosDelTexto(texto: string): Record<string, Insertado> {
  const insertados: Record<string, Insertado> = {};
  let cuantos = 0;
  for (const { n, linea } of lineasFueraDeCodigo(texto ?? '')) {
    const img = IMAGEN_EN_LINEA.exec(linea);
    const rec = img ? null : RECURSO_EN_LINEA.exec(linea);
    if (!img && !rec) continue;
    if (++cuantos > MAX_INSERTADOS) throw new RecursoInvalidoError(`Una lección admite como máximo ${MAX_INSERTADOS} imágenes y recursos dentro del texto.`);
    try {
      if (img) {
        if (!img[1].trim()) throw new RecursoInvalidoError('describe la imagen entre los corchetes (la lee quien no puede verla).');
        if (img[1].length > 300 || (img[3] ?? '').length > 300) throw new RecursoInvalidoError('la descripción y el pie admiten 300 caracteres.');
        direccionDeImagen(img[2]);
      } else if (rec) {
        if (rec[1].length > 200) throw new RecursoInvalidoError('el título admite 200 caracteres.');
        const r = normalizarRecurso(rec[2]);
        insertados[rec[2]] = { url: r.url, provider: r.proveedor, embedUrl: r.embedUrl };
      }
    } catch (e) {
      if (e instanceof RecursoInvalidoError) {
        const motivo = e.message.charAt(0).toLowerCase() + e.message.slice(1);
        throw new RecursoInvalidoError(`Línea ${n}: ${motivo}`);
      }
      throw e;
    }
  }
  return insertados;
}
