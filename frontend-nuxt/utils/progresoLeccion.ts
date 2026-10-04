// Estado de una lección en «Mi progreso» (revisión del 04/10, MOD-02 de la lista de chequeo de Sistemas Tutores).
// Mismos cortes que el servidor (learning-progress.service.ts): <20 explorado, <60 en práctica, <85 comprensión
// parcial, si no dominado.

/** Desde aquí una lección ya se aprendió lo suficiente como para «repasarla»; antes, lo que toca es practicarla. */
export const UMBRAL_REPASO = 60

/**
 * La lista de «Mi progreso» es de lecciones que el estudiante ya trabajó: con 0 % no es «No visto» (la abrió e intentó
 * ejercicios), es «Empezada».
 */
export function nombreDelEstado(dominio: number): string {
  if (dominio >= 85) return 'Dominado'
  if (dominio >= 60) return 'Comprensión parcial'
  if (dominio >= 20) return 'En práctica'
  if (dominio > 0) return 'Explorado'
  return 'Empezada'
}

/**
 * «Toca repasarla» solo si el repaso venció y la lección ya se había aprendido. STIRE programa un repaso tras cualquier
 * entrega, también fallida (SM-2 con calidad baja): en una lección con 0 % eso no es olvido, es que falta practicar.
 */
export function tocaRepasar(dominio: number, urgencia: string | undefined): boolean {
  return (urgencia === 'vencido' || urgencia === 'critico') && dominio >= UMBRAL_REPASO
}
