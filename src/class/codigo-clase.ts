// El código de una clase es la «llave» con la que entran los estudiantes (escrito o escaneando el QR). Debe ser único:
// dos clases no pueden compartirlo, ni siquiera con otra escritura («algo web» y «ALGO-WEB» son el mismo código).

export const CODIGO_CLASE = { min: 3, max: 30 } as const;

/** Forma única de un código: sin espacios a los lados, sin tildes, en mayúsculas y con guiones en lugar de espacios. */
export function normalizarCodigo(texto: unknown): string {
  if (typeof texto !== 'string') return '';
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** El motivo por el que un código (ya normalizado) no sirve, o null si sirve. */
export function problemaDelCodigo(codigo: string): string | null {
  if (codigo.length < CODIGO_CLASE.min) return `El código debe tener al menos ${CODIGO_CLASE.min} caracteres.`;
  if (codigo.length > CODIGO_CLASE.max) return `El código puede tener hasta ${CODIGO_CLASE.max} caracteres.`;
  if (!/^[A-Z0-9-]+$/.test(codigo)) return 'Usa solo letras, números y guiones (sin ñ ni símbolos).';
  return null;
}
