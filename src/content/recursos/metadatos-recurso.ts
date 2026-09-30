import { ContentType } from '../../common/enums/content-type.enum';
import { normalizarRecurso, RecursoInvalidoError } from './normalizar-recurso';

/**
 * El `metadata` de una lección multimedia se reconstruye aquí, nunca se guarda tal como llega: así una dirección
 * `javascript:` o un campo inventado no pueden llegar a la pantalla del estudiante.
 * - VIDEO, PDF y EMBED: `{ url, provider, embedUrl }`, armado por `normalizarRecurso`.
 * - IMAGE: `{ url, alt, caption? }`; `url` es https o una imagen subida (`/media/<uuid>`); `alt` es obligatorio
 *   (lo lee un lector de pantalla).
 * - MARKDOWN y CODE: sin cambios (su contenido va en `body`, que ya se sanea).
 */

const IMAGEN_SUBIDA = /^\/media\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const MAX_TEXTO = 300;

function texto(valor: unknown, campo: string, obligatorio: boolean): string | undefined {
  if (valor === undefined || valor === null || valor === '') {
    if (obligatorio) throw new RecursoInvalidoError(`Falta ${campo}.`);
    return undefined;
  }
  if (typeof valor !== 'string') throw new RecursoInvalidoError(`${campo} debe ser texto.`);
  const limpio = valor.trim();
  if (obligatorio && !limpio) throw new RecursoInvalidoError(`Falta ${campo}.`);
  if (limpio.length > MAX_TEXTO) throw new RecursoInvalidoError(`${campo} admite como máximo ${MAX_TEXTO} caracteres.`);
  return limpio || undefined;
}

function direccionDeImagen(valor: unknown): string {
  const url = texto(valor, 'la dirección de la imagen', true) as string;
  if (IMAGEN_SUBIDA.test(url)) return url;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new RecursoInvalidoError('Eso no es una dirección de imagen. Copia el enlace completo (empieza por https://).');
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new RecursoInvalidoError('La imagen debe estar en una dirección segura (https://).');
  }
  return parsed.toString();
}

export function metadatosDeRecurso(tipo: ContentType, metadata: Record<string, unknown> | undefined | null): Record<string, unknown> | undefined {
  const m = metadata ?? {};
  switch (tipo) {
    case ContentType.VIDEO:
    case ContentType.PDF:
    case ContentType.EMBED: {
      const recurso = normalizarRecurso(texto(m.url, 'el enlace del recurso', true) as string);
      return { url: recurso.url, provider: recurso.proveedor, embedUrl: recurso.embedUrl };
    }
    case ContentType.IMAGE: {
      const caption = texto(m.caption, 'el pie de la imagen', false);
      return {
        url: direccionDeImagen(m.url),
        alt: texto(m.alt, 'la descripción de la imagen (para quien no puede verla)', true),
        ...(caption ? { caption } : {}),
      };
    }
    default:
      return metadata ?? undefined;
  }
}
