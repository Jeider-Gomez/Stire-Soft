/**
 * Explicaciones alternativas (27/10; src/content/explicaciones-alternativas.ts tiene las mismas reglas en el servidor).
 * Cada explicación dice cuándo la ve el estudiante: la principal siempre; las alternativas, cuando las necesita.
 */
export type CuandoExplicacion = 'siempre' | 'noclaro' | 'falla2' | 'repaso'

export const CUANDO_EXPLICACION: ReadonlyArray<{ valor: CuandoExplicacion; texto: string; ayuda: string }> = [
  { valor: 'siempre', texto: 'Siempre', ayuda: 'La explicación principal: todos la ven.' },
  { valor: 'noclaro', texto: 'Si no entendió', ayuda: 'Aparece si toca «No me quedó claro» o falla dos veces.' },
  { valor: 'falla2', texto: 'Si falla dos veces', ayuda: 'Aparece después de dos intentos fallidos en la lección.' },
  { valor: 'repaso', texto: 'En el repaso', ayuda: 'Aparece cuando vuelve a la lección a repasarla.' },
]

export const textoCuando = (c: string | null | undefined) => CUANDO_EXPLICACION.find((x) => x.valor === (c ?? 'siempre'))?.texto ?? 'Siempre'
export const esAlternativa = (c: string | null | undefined) => (c ?? 'siempre') !== 'siempre'

/** Para «Ver como estudiante»: qué ve un estudiante en cada situación. */
export type SituacionEstudiante = 'entendio' | 'noclaro' | 'falla2' | 'repaso'
export const SITUACIONES: ReadonlyArray<{ valor: SituacionEstudiante; texto: string }> = [
  { valor: 'entendio', texto: 'entendió' },
  { valor: 'noclaro', texto: 'no entendió' },
  { valor: 'falla2', texto: 'falló dos veces' },
  { valor: 'repaso', texto: 'está repasando' },
]

/** Si un estudiante en esa situación ve la explicación (mismas reglas que el servidor). */
export function laVe(cuando: string | null | undefined, s: SituacionEstudiante): boolean {
  switch (cuando ?? 'siempre') {
    case 'noclaro': return s === 'noclaro' || s === 'falla2'
    case 'falla2': return s === 'falla2'
    case 'repaso': return s === 'repaso'
    default: return true
  }
}
