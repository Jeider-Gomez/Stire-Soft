import { PublicationStatus } from '../common/enums/status.enum';

/**
 * ¿Un estudiante ve esta actividad? (docs/DISENO_INTERVENCION_DOCENTE.md §4.1). Publicada y, si el docente la asignó a
 * algunos estudiantes (un refuerzo o un reto), solo a ellos. Para los demás no existe: no la ven, no la pueden
 * intentar y no cuenta en su dominio.
 */
export function actividadVisiblePara(
  actividad: { status: PublicationStatus | string; asignadaA?: number[] | null },
  studentId: number,
): boolean {
  return actividad.status === PublicationStatus.PUBLISHED && (!actividad.asignadaA || actividad.asignadaA.includes(studentId));
}
