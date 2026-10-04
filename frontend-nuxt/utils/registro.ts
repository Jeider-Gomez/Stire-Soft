// Validación del paso 1 del registro, con mensajes que dicen qué arreglar. La contraseña sigue las mismas reglas que el
// servidor (src/common/validators/password-complexity.ts); el servidor vuelve a validar todo.

export type Faltantes = Partial<Record<'fullName' | 'email' | 'password', string>>

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function claveCumple(clave: string): boolean {
  return clave.length >= 6 && /[A-Z]/.test(clave) && /[a-z]/.test(clave) && /[\d\W]/.test(clave)
}

export function faltantesDelRegistro(nombre: string, correo: string, clave: string): Faltantes {
  const f: Faltantes = {}
  if (!nombre.trim()) f.fullName = 'Escribe tu nombre completo.'
  if (!correo.trim()) f.email = 'Escribe tu correo.'
  else if (!CORREO.test(correo.trim())) f.email = 'Revisa el correo: debe verse como nombre@dominio.com.'
  if (!claveCumple(clave)) f.password = 'La contraseña aún no cumple lo que falta abajo.'
  return f
}

/**
 * Validación del inicio de sesión campo a campo (PAT-03 de la lista de chequeo): el error aparece debajo del campo que
 * hay que corregir, con un texto que dice qué hacer, en lugar del globo del navegador.
 */
export function faltantesDelIngreso(correo: string, clave: string): Partial<Record<'email' | 'password', string>> {
  const f: Partial<Record<'email' | 'password', string>> = {}
  if (!correo.trim()) f.email = 'Escribe tu correo.'
  else if (!CORREO.test(correo.trim())) f.email = 'Revisa el correo: debe verse como nombre@dominio.com.'
  if (!clave) f.password = 'Escribe tu contraseña.'
  return f
}
