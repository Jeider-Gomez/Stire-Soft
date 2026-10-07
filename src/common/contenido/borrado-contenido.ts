import { ConflictException } from '@nestjs/common';
import { EntityManager } from 'typeorm';

/**
 * Qué se pierde si se elimina un módulo, un tema o una lección (Fase 30, 05/10). El docente lo ve antes de confirmar.
 *
 * Por qué existe: las llaves foráneas reales (migración InitialSchema) no protegen el trabajo de los estudiantes.
 * `learning_progress` y `review_schedules` se borran EN CASCADA con la lección: borrarla eliminaba en silencio el avance
 * de la clase. Y `activities → learning_units` es NO ACTION: con ejercicios, el borrado fallaba con un 500. Por eso no se
 * borra nada con trabajo de estudiantes (se archiva) y, lo que sí se borra, se borra en orden y en una transacción.
 */
export interface ImpactoBorrado {
  modulos: number;
  temas: number;
  lecciones: number;
  ejercicios: number;
  /** Estudiantes distintos con avance, entregas, repasos o valoraciones en estas lecciones. */
  estudiantesConAvance: number;
  /** Envíos de estudiantes a los ejercicios de estas lecciones. */
  entregas: number;
  sePuedeEliminar: boolean;
  motivo?: string;
  /** Solo para una clase: estudiantes matriculados que perderán el acceso (la ventana lo advierte). */
  matriculados?: number;
}

type Filas = Array<{ n: string | number | null }>;
const numero = (filas: Filas): number => Number(filas[0]?.n ?? 0);

export async function impactoDeLecciones(
  manager: EntityManager,
  unitIds: number[],
  base: { modulos: number; temas: number },
): Promise<ImpactoBorrado> {
  if (unitIds.length === 0) {
    return { ...base, lecciones: 0, ejercicios: 0, estudiantesConAvance: 0, entregas: 0, sePuedeEliminar: true };
  }
  const ejercicios = numero(await manager.query('SELECT COUNT(*) AS n FROM activities WHERE learningUnitId IN (?)', [unitIds]));
  const entregas = numero(
    await manager.query(
      'SELECT COUNT(*) AS n FROM submissions s INNER JOIN activities a ON a.id = s.activityId WHERE a.learningUnitId IN (?)',
      [unitIds],
    ),
  );
  // Un registro de progreso sin intentos ni dominio no es trabajo del estudiante (abrir la lección no cuenta).
  const estudiantesConAvance = numero(
    await manager.query(
      'SELECT COUNT(DISTINCT t.studentId) AS n FROM (' +
        'SELECT studentId FROM learning_progress WHERE learningUnitId IN (?) AND (attemptsCount > 0 OR mastery > 0) ' +
        'UNION SELECT s.studentId FROM submissions s INNER JOIN activities a ON a.id = s.activityId WHERE a.learningUnitId IN (?) ' +
        'UNION SELECT studentId FROM review_schedules WHERE learningUnitId IN (?) ' +
        'UNION SELECT studentId FROM valoraciones_leccion WHERE learningUnitId IN (?)' +
        ') t',
      [unitIds, unitIds, unitIds, unitIds],
    ),
  );
  const sePuedeEliminar = estudiantesConAvance === 0 && entregas === 0;
  return {
    ...base,
    lecciones: unitIds.length,
    ejercicios,
    estudiantesConAvance,
    entregas,
    sePuedeEliminar,
    ...(sePuedeEliminar ? {} : { motivo: motivoDeBloqueo(estudiantesConAvance) }),
  };
}

export function motivoDeBloqueo(estudiantes: number): string {
  const quien = estudiantes === 1 ? '1 estudiante tiene' : `${Math.max(estudiantes, 1)} estudiantes tienen`;
  // 07/10: dice qué hace archivar (Jeider no entendía qué pasaba con el progreso).
  return `${quien} avance aquí. Archívalo para no perder su trabajo: deja de verse, se guarda su avance y lo puedes restaurar cuando quieras.`;
}

/** Lanza 409 si hay trabajo de estudiantes: la ventana del docente ofrece «Archivar en su lugar». */
export function exigirQueSePuedaEliminar(impacto: ImpactoBorrado): void {
  if (!impacto.sePuedeEliminar) throw new ConflictException(impacto.motivo ?? motivoDeBloqueo(impacto.estudiantesConAvance));
}

/**
 * Borra lecciones sin trabajo de estudiantes, en el orden que exigen las llaves foráneas. Va dentro de la transacción
 * del llamador, después de `exigirQueSePuedaEliminar`. Las tablas sin llave foránea (`entregas`, `valoraciones_leccion`)
 * se limpian a mano para no dejar referencias a lecciones que ya no existen.
 */
export async function borrarLecciones(manager: EntityManager, unitIds: number[]): Promise<void> {
  if (unitIds.length === 0) return;
  await manager.query(
    'UPDATE learning_progress SET lastActivityId = NULL WHERE lastActivityId IN (SELECT id FROM activities WHERE learningUnitId IN (?))',
    [unitIds],
  );
  await manager.query('UPDATE entregas SET learningUnitId = NULL WHERE learningUnitId IN (?)', [unitIds]);
  await manager.query('DELETE FROM valoraciones_leccion WHERE learningUnitId IN (?)', [unitIds]);
  // activity_questions y submissions caen en cascada con la actividad; contents, prerequisites, learning_progress y
  // review_schedules, con la lección.
  await manager.query('DELETE FROM activities WHERE learningUnitId IN (?)', [unitIds]);
  await manager.query('DELETE FROM learning_units WHERE id IN (?)', [unitIds]);
}

/** Une las lecciones de una tabla `x` (con `learningUnitId`) con su clase. */
const EN_CLASE =
  'INNER JOIN learning_units lu ON lu.id = x.learningUnitId INNER JOIN topics t ON t.id = lu.topicId ' +
  'INNER JOIN sections s ON s.id = t.sectionId WHERE s.classId = ?';
const ENVIOS_DE_CLASE =
  'FROM submissions sb INNER JOIN activities x ON x.id = sb.activityId ' + EN_CLASE;

/**
 * Trabajo de estudiantes en TODA una clase (Fase 30, 06/10: una clase creada por error se puede eliminar aunque tenga
 * módulos, siempre que nadie haya trabajado en ella). Además de lo de sus lecciones, cuentan los envíos de proyectos,
 * las notas, la asistencia tomada, los pasos de refuerzos hechos y los eventos de entregas de estudiantes.
 */
export async function trabajoEnClase(manager: EntityManager, classId: number): Promise<{ estudiantes: number; entregas: number }> {
  const consulta = [
    `SELECT x.studentId FROM learning_progress x ${EN_CLASE} AND (x.attemptsCount > 0 OR x.mastery > 0)`,
    `SELECT x.studentId FROM review_schedules x ${EN_CLASE}`,
    `SELECT x.studentId FROM valoraciones_leccion x ${EN_CLASE}`,
    `SELECT sb.studentId ${ENVIOS_DE_CLASE}`,
    'SELECT studentId FROM proyecto_envios WHERE classId = ?',
    'SELECT studentId FROM notas_registradas WHERE classId = ?',
    'SELECT studentId FROM notas_historial WHERE classId = ?',
    'SELECT h.studentId FROM refuerzo_pasos_hechos h INNER JOIN refuerzos r ON r.id = h.refuerzoId WHERE r.classId = ?',
    'SELECT ra.userId FROM registros_asistencia ra INNER JOIN sesiones_asistencia sa ON sa.id = ra.sesionId WHERE sa.classId = ?',
    'SELECT ee.studentId FROM entrega_eventos ee INNER JOIN entregas e ON e.id = ee.entregaId WHERE e.classId = ? AND ee.studentId IS NOT NULL',
  ];
  const estudiantes = numero(
    await manager.query(`SELECT COUNT(DISTINCT q.studentId) AS n FROM (${consulta.join(' UNION ')}) q`, consulta.map(() => classId)),
  );
  const entregas =
    numero(await manager.query(`SELECT COUNT(*) AS n ${ENVIOS_DE_CLASE}`, [classId])) +
    numero(await manager.query('SELECT COUNT(*) AS n FROM proyecto_envios WHERE classId = ?', [classId]));
  return { estudiantes, entregas };
}

/**
 * Borra lo que el docente configuró en la clase y no tiene llave foránea hacia ella (entregas, refuerzos, esquema de
 * notas). Va después de `exigirQueSePuedaEliminar` y de `borrarLecciones`; módulos, temas, matrículas y sesiones de
 * asistencia caen en cascada con la clase.
 */
export async function borrarConfiguracionDeClase(manager: EntityManager, classId: number): Promise<void> {
  await manager.query('DELETE ee FROM entrega_eventos ee INNER JOIN entregas e ON e.id = ee.entregaId WHERE e.classId = ?', [classId]);
  await manager.query('DELETE FROM entregas WHERE classId = ?', [classId]);
  await manager.query('DELETE h FROM refuerzo_pasos_hechos h INNER JOIN refuerzos r ON r.id = h.refuerzoId WHERE r.classId = ?', [classId]);
  await manager.query('DELETE FROM refuerzos WHERE classId = ?', [classId]);
  await manager.query('DELETE FROM notas_historial WHERE classId = ?', [classId]);
  await manager.query('DELETE FROM esquemas_calificacion WHERE classId = ?', [classId]);
}
