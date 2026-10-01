import { diasEntre } from '../common/utils/dia-colombia';

/**
 * Resumen de la semana para el docente (docs/DISENO_INTERVENCION_DOCENTE.md §4.4, estilo «Class Snapshot»; BASE_TEORICA.md
 * BT-17): qué avanzó el grupo, comparado con la semana anterior, y quién se quedó sin practicar. Se muestra en «Hoy»; no
 * se envía por correo. Los días se cuentan en la hora de Colombia. Función pura.
 */

/** Siete días sin practicar ya merecen una pregunta del docente. */
export const DIAS_SIN_ACTIVIDAD = 7;

export interface EntradaResumen {
  estudiantes: Array<{ id: number; nombre: string }>;
  /** Intentos calificados de los ejercicios de la clase (al menos los de las últimas dos semanas). */
  intentos: Array<{ studentId: number; aprobado: boolean; fecha: Date }>;
  /** Última vez que cada estudiante entregó un ejercicio de la clase, aunque haya sido hace meses. */
  ultimaActividad: Map<number, Date>;
  ahora: Date;
}

export interface Semana {
  estudiantesActivos: number;
  ejercicios: number;
  aprobados: number;
}

export interface ResumenSemanal {
  total: number;
  estaSemana: Semana;
  semanaAnterior: Semana;
  sinActividad: Array<{ studentId: number; nombre: string; dias: number | null }>;
}

function semana(e: EntradaResumen, desdeDias: number, hastaDias: number): Semana {
  const dentro = (f: Date) => {
    const d = diasEntre(f, e.ahora);
    return d >= desdeDias && d < hastaDias;
  };
  const intentos = e.intentos.filter((i) => dentro(i.fecha));
  return {
    estudiantesActivos: new Set(intentos.map((i) => i.studentId)).size,
    ejercicios: intentos.length,
    aprobados: intentos.filter((i) => i.aprobado).length,
  };
}

export function construirResumenSemanal(e: EntradaResumen): ResumenSemanal {
  const sinActividad = e.estudiantes
    .map((est) => {
      const ultima = e.ultimaActividad.get(est.id);
      return { studentId: est.id, nombre: est.nombre, dias: ultima ? diasEntre(ultima, e.ahora) : null };
    })
    .filter((x) => x.dias === null || x.dias >= DIAS_SIN_ACTIVIDAD)
    // Primero quien lleva más tiempo; quien nunca ha practicado, al final (puede que aún no empiece el curso).
    .sort((a, b) => (a.dias === null ? 1 : 0) - (b.dias === null ? 1 : 0) || (b.dias ?? 0) - (a.dias ?? 0) || a.nombre.localeCompare(b.nombre, 'es'));
  return {
    total: e.estudiantes.length,
    estaSemana: semana(e, 0, 7),
    semanaAnterior: semana(e, 7, 14),
    sinActividad,
  };
}
