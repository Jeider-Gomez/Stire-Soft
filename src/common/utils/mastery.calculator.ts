import {
  ActividadDominio,
  IntentoDominio,
  calcularDominio,
} from './motor-dominio';

/**
 * El cálculo del dominio hasta el 09/10 («la mejor nota de cada casilla»), que ahora es la parte «antes del corte» del
 * motor del dominio por evidencia (motor-dominio.ts; docs/DISENO_DOMINIO.md). Se conserva con su nombre para las
 * pruebas que fijan ese comportamiento: siempre aplica las reglas de antes, sin importar la fecha de los intentos.
 * El servicio usa `calcularDominio` (reglas nuevas desde CORTE_REGLAS_NUEVAS).
 */
const SIEMPRE_ANTES = new Date(8.64e15);

export function calculateUnitMastery(
  allSubmissions: IntentoDominio[],
  activities: ActividadDominio[],
  nivelSaltadoHasta = -1,
): number {
  return calcularDominio(allSubmissions, activities, {
    nivelSaltadoHasta,
    corte: SIEMPRE_ANTES,
  });
}
