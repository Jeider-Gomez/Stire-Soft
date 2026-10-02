// Código de una clase: la misma forma que guarda el servidor (src/class/codigo-clase.ts), una sugerencia difícil de
// repetir y la dirección que lleva el QR para que el estudiante entre escaneándolo.

/** Igual que en el servidor: sin tildes, en mayúsculas y con guiones en lugar de espacios. */
export function normalizarCodigo(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Sin letras ni números que se confunden al dictarlos o leerlos en un proyector (0/O, 1/I/L).
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/**
 * Sugerencia: la primera palabra del nombre (hasta 6 letras) y 4 caracteres al azar, p. ej. «ALGORI-7KQ2».
 * Con 31^4 ≈ 920 000 combinaciones por prefijo, repetir es muy raro; si pasa, el servidor lo rechaza igual.
 */
export function sugerirCodigo(nombre: string, azar: () => number = Math.random): string {
  const palabra = normalizarCodigo(nombre).split('-').find((p) => /^[A-Z]{3,}$/.test(p)) ?? 'CLASE'
  const sufijo = Array.from({ length: 4 }, () => ALFABETO[Math.floor(azar() * ALFABETO.length)]).join('')
  return `${palabra.slice(0, 6)}-${sufijo}`
}

/** Lo que lleva el QR: la página para unirse, con el código ya escrito. Una cámara de celular la abre sola. */
export function urlDeIngreso(origen: string, codigo: string): string {
  return `${origen.replace(/\/$/, '')}/estudiante/clases?codigo=${encodeURIComponent(codigo)}`
}

/**
 * A dónde volver después de iniciar sesión o registrarse (el QR lleva a una página protegida). Solo rutas internas:
 * nunca «//otro-sitio» ni una dirección completa, para que el enlace no pueda mandar a otra página.
 */
export function rutaDeVuelta(valor: unknown): string | null {
  if (typeof valor !== 'string') return null
  if (!valor.startsWith('/') || valor.startsWith('//') || valor.startsWith('/\\') || valor.startsWith('/auth')) return null
  return valor
}

/**
 * El código que trae un QR escaneado dentro de la app: el enlace de STIRE (…/estudiante/clases?codigo=X) o, en un QR
 * antiguo, el código suelto. Cualquier otro enlace se ignora (no se sigue un QR ajeno).
 */
export function codigoDesdeQr(texto: string): string | null {
  const limpio = texto.trim()
  try {
    const url = new URL(limpio)
    if (!url.pathname.endsWith('/estudiante/clases')) return null
    const codigo = normalizarCodigo(url.searchParams.get('codigo') ?? '')
    return codigo || null
  } catch {
    const codigo = normalizarCodigo(limpio)
    return /^[A-Z0-9-]{3,30}$/.test(codigo) ? codigo : null
  }
}
