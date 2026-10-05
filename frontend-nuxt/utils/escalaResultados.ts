// Cada resultado contado como en Anki (pedido del dueño, 04/10: «como Anki con sus escalas, pero lo determina el
// ejercicio con su resultado»). Es la misma traducción con la que el servidor programa los repasos
// (src/common/utils/spaced-repetition.ts, calidadDeRepaso): el estudiante no califica nada a mano, solo ve cómo quedó
// y por qué, para que sepa cómo funciona STIRE y cómo avanzar más rápido.

export type NombreCalidad = 'otra-vez' | 'dificil' | 'bien' | 'facil'

export const ORDEN_CALIDADES: NombreCalidad[] = ['otra-vez', 'dificil', 'bien', 'facil']

export const CALIDADES: Record<NombreCalidad, { texto: string; significa: string }> = {
  'otra-vez': { texto: 'Otra vez', significa: 'No pasó todos los casos.' },
  dificil: { texto: 'Difícil', significa: 'Pasó, después de varios intentos.' },
  bien: { texto: 'Bien', significa: 'Pasó al primer intento.' },
  facil: { texto: 'Fácil', significa: 'Pasó al primer intento y estabas seguro (o era un reto).' },
}

/** Igual que calidadDeRepaso en el servidor: falló, varios intentos, primer intento, primer intento estando seguro. */
export function calidadDelResultado(r: { aprobado: boolean; primerIntento: boolean; seguro: boolean }): NombreCalidad {
  if (!r.aprobado) return 'otra-vez'
  if (!r.primerIntento) return 'dificil'
  return r.seguro ? 'facil' : 'bien'
}

/** Qué significa para sus repasos: mientras mejor el resultado, más tarda la lección en volver. */
export const EFECTO_EN_REPASOS = 'Esto decide cuándo vuelve la lección como repaso: con «Otra vez», pronto; con «Fácil», más tarde.'
