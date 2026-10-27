/**
 * Explicaciones alternativas (27/10, prototipo del panel v2; nombre elegido por Jeider). Cada explicación de una lección
 * dice CUÁNDO la ve el estudiante: siempre (la principal), si no entendió, si falla dos veces o en el repaso. Así el
 * docente prepara otra forma de explicar (una analogía, un paso a paso, un video) y STIRE se la muestra a quien la
 * necesita, sin llenarle la lección a quien ya entendió. Funciones puras: ContentService las aplica con las señales del
 * estudiante.
 */
export const CUANDO_EXPLICACION = ['siempre', 'noclaro', 'falla2', 'repaso'] as const;
export type CuandoExplicacion = (typeof CUANDO_EXPLICACION)[number];

/** Fallos calificados en la lección a partir de los cuales se abre lo de «si falla dos veces». */
export const FALLOS_PARA_ALTERNATIVA = 2;

/** Lo que se sabe del estudiante en esta lección. */
export interface SenalesExplicacion {
  /** Tocó «No me quedó claro» en la lección. */
  noClaro: boolean;
  /** Entregas calificadas por debajo del mínimo para aprobar, en ejercicios de la lección. */
  fallos: number;
  /** La lección ya está en su ciclo de repasos (la estudió al menos una vez). */
  enRepaso: boolean;
}

/**
 * Si el estudiante ve una explicación. «Si no entendió» también se abre al fallar dos veces: quien falla tampoco
 * entendió, aunque no lo haya dicho.
 */
export function seMuestra(cuando: string | null | undefined, s: SenalesExplicacion): boolean {
  switch (cuando ?? 'siempre') {
    case 'noclaro': return s.noClaro || s.fallos >= FALLOS_PARA_ALTERNATIVA;
    case 'falla2': return s.fallos >= FALLOS_PARA_ALTERNATIVA;
    case 'repaso': return s.enRepaso;
    default: return true;
  }
}

/** Las explicaciones que ve el estudiante, en su orden. Si ninguna depende de él, no hace falta mirar sus señales. */
export function explicacionesDelEstudiante<T extends { cuando?: string | null }>(contenidos: ReadonlyArray<T>, s: SenalesExplicacion): T[] {
  return contenidos.filter((c) => seMuestra(c.cuando, s));
}

export const hayAlternativas = (contenidos: ReadonlyArray<{ cuando?: string | null }>) => contenidos.some((c) => (c.cuando ?? 'siempre') !== 'siempre');
