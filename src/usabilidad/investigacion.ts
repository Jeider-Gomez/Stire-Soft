import { createHmac } from 'crypto';

/**
 * Datos para la investigación, anonimizados (docs/PLAN_MENORES_Y_TRANSVERSALIDAD.md §4; política de datos, utils/legal.ts):
 * solo de quienes aceptaron participar, sin nombre ni correo, con un código que no se puede revertir sin la sal del
 * servidor. El mismo estudiante siempre recibe el mismo código, para poder seguirlo en el tiempo sin saber quién es.
 */

export function codigoParticipante(userId: number, sal: string): string {
  return 'P-' + createHmac('sha256', sal).update(String(userId)).digest('hex').slice(0, 10);
}

export interface ProgresoParaInvestigacion {
  studentId: number;
  learningUnitId: number;
  status: string;
  mastery: number;
  attemptsCount: number;
  successRate: number;
  completedActivities: number;
  entryConfidence: number | null;
}

export const COLUMNAS_INVESTIGACION = [
  'participante', 'leccion', 'estado', 'dominio', 'intentos', 'tasa_exito', 'actividades_completadas', 'confianza_inicial', 'sus',
] as const;

/** Una fila por participante y lección. `consintieron` filtra: quien no aceptó, no aparece. */
export function filasInvestigacion(
  progresos: ProgresoParaInvestigacion[],
  consintieron: ReadonlySet<number>,
  susPorUsuario: ReadonlyMap<number, number>,
  sal: string,
): string[][] {
  return progresos
    .filter((p) => consintieron.has(p.studentId))
    .map((p) => [
      codigoParticipante(p.studentId, sal),
      String(p.learningUnitId),
      p.status,
      p.mastery.toFixed(3),
      String(p.attemptsCount),
      p.successRate.toFixed(3),
      String(p.completedActivities),
      p.entryConfidence === null ? '' : String(p.entryConfidence),
      susPorUsuario.has(p.studentId) ? String(susPorUsuario.get(p.studentId)) : '',
    ]);
}

/** CSV con separador coma y comillas donde haga falta (abre en Excel y en R). */
export function aCsv(encabezado: readonly string[], filas: string[][]): string {
  const celda = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [encabezado, ...filas].map((f) => f.map(celda).join(',')).join('\n') + '\n';
}
