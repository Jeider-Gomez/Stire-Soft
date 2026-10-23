// Glosario en línea (ítems 4 y 28 de la evaluación heurística): las palabras de STIRE que piden explicación se explican
// donde aparecen, con la misma definición del glosario del manual (utils/manual.ts), para no tener dos versiones.
import { MANUAL } from './manual'

const GLOSARIO = new Map(
  (MANUAL.find((s) => s.id === 'glosario')?.bloques ?? []).map((b) => [b.titulo.toLowerCase(), b.texto]),
)

/** La definición del glosario, o '' si la palabra no está. */
export function definicion(palabra: string): string {
  return GLOSARIO.get(palabra.toLowerCase()) ?? ''
}
