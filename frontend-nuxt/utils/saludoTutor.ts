/**
 * Saludo de respaldo del Tutor cuando el servidor no responde con el suyo. Usa la hora del equipo del estudiante, como
 * el saludo del servidor usa la de Colombia (QA-ERR-08, Jorge 16/10: el Tutor solo decía «¡Hola!»).
 */
export function saludoSegunHora(hora: number = new Date().getHours()): string {
  if (hora < 12) return '¡Buenos días!'
  if (hora < 19) return '¡Buenas tardes!'
  return '¡Buenas noches!'
}

export function saludoDeRespaldo(hora?: number): string {
  return `${saludoSegunHora(hora)} Soy tu Tutor de STIRE. Escríbeme tu duda abajo: puede ser sobre un ejercicio, tu código o un tema de la lección.`
}
