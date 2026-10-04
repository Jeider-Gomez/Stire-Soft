import type { AlcancePlantilla } from '../class/entities/class.entity';
import type { Asignatura } from '../institution/entities/asignatura.entity';

/**
 * Quién ve una plantilla y cuál conviene más (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md §2.3). El contexto de un docente
 * son las asignaturas de sus clases (y la que está eligiendo al crear una): de ahí salen sus programas, facultades e
 * instituciones. Un docente sin clases con asignatura solo ve lo compartido con todo STIRE.
 */
export interface ContextoDocente {
  asignaturas: Set<number>;
  programas: Set<number>;
  /** «institución|facultad»: dos facultades con el mismo nombre en instituciones distintas no son la misma. */
  facultades: Set<string>;
  instituciones: Set<number>;
}

type AsignaturaDeClase = Pick<Asignatura, 'id' | 'programId' | 'institutionId' | 'periodoPlan'> & {
  program?: { facultad?: string | null } | null;
};

const claveFacultad = (a: AsignaturaDeClase): string | null =>
  a.institutionId && a.program?.facultad ? `${a.institutionId}|${a.program.facultad.trim().toLowerCase()}` : null;

export function contextoDe(asignaturas: ReadonlyArray<AsignaturaDeClase | null | undefined>): ContextoDocente {
  const ctx: ContextoDocente = { asignaturas: new Set(), programas: new Set(), facultades: new Set(), instituciones: new Set() };
  for (const a of asignaturas) {
    if (!a) continue;
    ctx.asignaturas.add(a.id);
    if (a.programId) ctx.programas.add(a.programId);
    if (a.institutionId) ctx.instituciones.add(a.institutionId);
    const f = claveFacultad(a);
    if (f) ctx.facultades.add(f);
  }
  return ctx;
}

/** ¿Este docente (con su contexto) puede ver y copiar esta plantilla? Las propias y el admin se resuelven antes. */
export function puedeVerPlantilla(alcance: AlcancePlantilla, asignatura: AsignaturaDeClase | null | undefined, ctx: ContextoDocente): boolean {
  if (alcance === 'todos') return true;
  if (alcance === 'nadie' || !asignatura) return false;
  if (alcance === 'asignatura') return ctx.asignaturas.has(asignatura.id);
  if (alcance === 'programa') return !!asignatura.programId && ctx.programas.has(asignatura.programId);
  if (alcance === 'facultad') {
    const f = claveFacultad(asignatura);
    return !!f && ctx.facultades.has(f);
  }
  return !!asignatura.institutionId && ctx.instituciones.has(asignatura.institutionId);
}

/**
 * Qué tan cerca está una plantilla de la asignatura que el docente va a dictar: 0 la misma asignatura, 1 mismo programa y
 * semestre, 2 mismo programa, 3 misma facultad, 4 misma institución, 5 el resto. Sin asignatura elegida, todo es 5.
 */
export function cercania(origen: AsignaturaDeClase | null | undefined, destino: AsignaturaDeClase | null | undefined): number {
  if (!origen || !destino) return 5;
  if (origen.id === destino.id) return 0;
  if (origen.programId && origen.programId === destino.programId) return origen.periodoPlan && origen.periodoPlan === destino.periodoPlan ? 1 : 2;
  const f = claveFacultad(origen);
  if (f && f === claveFacultad(destino)) return 3;
  if (origen.institutionId && origen.institutionId === destino.institutionId) return 4;
  return 5;
}

/** Para compartir con un alcance, la clase necesita los datos de ese alcance. Devuelve el motivo si no los tiene. */
export function problemaDelAlcance(alcance: AlcancePlantilla, asignatura: AsignaturaDeClase | null | undefined): string | null {
  if (alcance === 'nadie' || alcance === 'todos') return null;
  if (!asignatura) return 'Para compartir con una asignatura, programa, facultad o institución, primero elige la asignatura de la clase.';
  if (alcance === 'programa' && !asignatura.programId) return 'La asignatura de esta clase no es de un programa: compártela con su institución o con todos.';
  if (alcance === 'facultad' && !claveFacultad(asignatura)) return 'El programa de esta clase no tiene facultad: compártela con su programa o su institución.';
  if (alcance === 'institucion' && !asignatura.institutionId) return 'Es un curso libre, sin institución: compártelo con todos o con su asignatura.';
  return null;
}
