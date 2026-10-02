import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Asistencia con QR (docs/calidad/PRUEBA_DOS_SEMANAS.md): el estudiante muestra en SU celular un QR personal que cambia
 * cada 20 segundos y el docente lo escanea. Así no sirve tomarle foto al QR y mandárselo a un compañero (vence), el
 * docente ve el nombre y la foto de quien marca, y si un mismo celular marca a dos cuentas queda la alerta.
 */

export const PREFIJO_QR_ASISTENCIA = 'STIRE-ASIS:';
/** Cada cuánto cambia el QR del estudiante. Se acepta la ventana actual y la anterior (entre 20 y 40 s de vida). */
export const VENTANA_QR_MS = 20_000;
export const ESTADOS_ASISTENCIA = ['presente', 'tarde', 'excusa', 'ausente'] as const;
export type EstadoAsistencia = (typeof ESTADOS_ASISTENCIA)[number];

export class AsistenciaInvalidaError extends Error {}

/** El identificador que el navegador del estudiante guarda una vez (no es un dato personal, solo distingue celulares). */
export function validarDispositivo(valor: unknown): string {
  if (typeof valor !== 'string' || !/^[a-z0-9]{8,32}$/.test(valor)) {
    throw new AsistenciaInvalidaError('Identificador de dispositivo inválido.');
  }
  return valor;
}

export function validarEstado(valor: unknown): EstadoAsistencia | null {
  if (valor === null) return null;
  if (typeof valor === 'string' && (ESTADOS_ASISTENCIA as readonly string[]).includes(valor)) return valor as EstadoAsistencia;
  throw new AsistenciaInvalidaError('El estado debe ser presente, tarde, excusa o ausente.');
}

/** La fecha de hoy en Colombia (AAAA-MM-DD), para que una clase a las 8 p. m. no quede con la fecha de mañana. */
export function fechaDeHoy(ahora: Date = new Date()): string {
  return ahora.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

export function validarFecha(valor: unknown, ahora: Date = new Date()): string {
  if (valor === undefined || valor === null || valor === '') return fechaDeHoy(ahora);
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number.isNaN(Date.parse(valor))) {
    throw new AsistenciaInvalidaError('La fecha debe tener la forma AAAA-MM-DD.');
  }
  return valor;
}

export function validarTema(valor: unknown): string | null {
  if (valor === undefined || valor === null) return null;
  if (typeof valor !== 'string') throw new AsistenciaInvalidaError('El tema debe ser texto.');
  const tema = valor.trim();
  if (tema.length > 120) throw new AsistenciaInvalidaError('El tema puede tener hasta 120 caracteres.');
  return tema || null;
}

function firma(secreto: string, userId: number, ventana: number, dispositivo: string): string {
  return createHmac('sha256', secreto).update(`asistencia:${userId}:${ventana}:${dispositivo}`).digest('base64url').slice(0, 22);
}

/** El texto del QR del estudiante para este momento, y cuántos milisegundos le quedan. */
export function codigoDeAsistencia(secreto: string, userId: number, dispositivo: string, ahora: number = Date.now()): { codigo: string; venceEnMs: number } {
  const ventana = Math.floor(ahora / VENTANA_QR_MS);
  return {
    codigo: `${PREFIJO_QR_ASISTENCIA}${userId}.${ventana}.${dispositivo}.${firma(secreto, userId, ventana, dispositivo)}`,
    venceEnMs: (ventana + 1) * VENTANA_QR_MS - ahora,
  };
}

/** Lee el QR escaneado por el docente: de quién es y desde qué celular. Rechaza QR ajenos, alterados o vencidos. */
export function leerCodigoDeAsistencia(secreto: string, texto: unknown, ahora: number = Date.now()): { userId: number; dispositivo: string } {
  const limpio = typeof texto === 'string' ? texto.trim() : '';
  if (!limpio.startsWith(PREFIJO_QR_ASISTENCIA)) {
    throw new AsistenciaInvalidaError('Ese QR no es un código de asistencia de STIRE.');
  }
  const partes = limpio.slice(PREFIJO_QR_ASISTENCIA.length).split('.');
  const [idTexto, ventanaTexto, dispositivo, firmada] = partes;
  if (partes.length !== 4 || !/^\d+$/.test(idTexto) || !/^\d+$/.test(ventanaTexto) || !/^[a-z0-9]{8,32}$/.test(dispositivo)) {
    throw new AsistenciaInvalidaError('Ese QR no es un código de asistencia de STIRE.');
  }
  const userId = Number(idTexto);
  const ventana = Number(ventanaTexto);
  const esperada = Buffer.from(firma(secreto, userId, ventana, dispositivo));
  const recibida = Buffer.from(firmada ?? '');
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) {
    throw new AsistenciaInvalidaError('El QR no es válido: pide al estudiante que lo abra de nuevo en STIRE.');
  }
  const actual = Math.floor(ahora / VENTANA_QR_MS);
  if (ventana > actual || ventana < actual - 1) {
    throw new AsistenciaInvalidaError('El QR ya venció (cambia cada 20 segundos): pide al estudiante que lo muestre de nuevo.');
  }
  return { userId, dispositivo };
}
