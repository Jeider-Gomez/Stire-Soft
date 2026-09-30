/**
 * Reglas de las imágenes que sube un docente. El tipo se decide por los primeros bytes del archivo (su «firma»), no por
 * el nombre ni por lo que diga el navegador: un archivo .png que por dentro es HTML o un ejecutable se rechaza.
 */

export const MAX_BYTES_IMAGEN = 1024 * 1024; // 1 MB
export const MAX_BYTES_POR_DOCENTE = 50 * 1024 * 1024; // 50 MB

export type TipoImagen = 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp';

export function detectarTipoImagen(datos: Buffer): TipoImagen | null {
  const empieza = (...bytes: number[]) => bytes.every((b, i) => datos[i] === b);
  if (datos.length < 12) return null;
  if (empieza(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'image/png';
  if (empieza(0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (datos.subarray(0, 6).toString('latin1') === 'GIF87a' || datos.subarray(0, 6).toString('latin1') === 'GIF89a') return 'image/gif';
  if (datos.subarray(0, 4).toString('latin1') === 'RIFF' && datos.subarray(8, 12).toString('latin1') === 'WEBP') return 'image/webp';
  return null;
}

export class ImagenRechazadaError extends Error {}

/** Devuelve el tipo real de la imagen o lanza con el motivo, en palabras del docente. */
export function validarImagen(datos: Buffer, usadoPorDocente: number): TipoImagen {
  if (datos.length === 0) throw new ImagenRechazadaError('El archivo está vacío.');
  if (datos.length > MAX_BYTES_IMAGEN) {
    throw new ImagenRechazadaError('La imagen pesa más de 1 MB. Redúcela (por ejemplo, guárdala como JPG o WebP) o enlázala desde la web.');
  }
  const tipo = detectarTipoImagen(datos);
  if (!tipo) throw new ImagenRechazadaError('Solo se aceptan imágenes PNG, JPG, GIF o WebP.');
  if (usadoPorDocente + datos.length > MAX_BYTES_POR_DOCENTE) {
    throw new ImagenRechazadaError('Llegaste al límite de 50 MB de imágenes. Borra alguna que ya no uses o enlaza imágenes desde la web o Google Drive.');
  }
  return tipo;
}
