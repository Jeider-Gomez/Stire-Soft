// Dónde va una clase (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md): institución, programa, semestre o grado. Todo sale de
// los datos de la clase; si una clase no tiene asignatura, no se inventa nada.

export interface InstitucionInfo { id: number; name: string; sigla?: string | null; tipo?: 'universidad' | 'colegio' | 'otra' }
export interface ProgramaInfo { id: number; name: string; tipo?: 'carrera' | 'grado'; maxSemesters?: number; facultad?: string | null; institutionId?: number }
export interface AsignaturaInfo {
  id: number
  nombre: string
  codigo?: string | null
  periodoPlan?: number | null
  programId?: number | null
  institutionId?: number | null
  program?: ProgramaInfo | null
  institution?: InstitucionInfo | null
  /** Del plan de estudios o confirmada por el admin; si no, la agregó un docente (funciona igual). */
  oficial?: boolean
}
export interface ClaseConAsignatura { asignatura?: AsignaturaInfo | null }

/** «1.er», «2.°», «3.er»…: en español, 1 y 3 llevan «er» y los demás «°». */
export function ordinal(n: number): string {
  return n === 1 || n === 3 ? `${n}.er` : `${n}.°`
}

/** «3.er semestre» en una carrera, «8.° grado» en un colegio. */
export function periodoDelPlan(n: number, tipo: ProgramaInfo['tipo'] = 'carrera'): string {
  return `${ordinal(n)} ${tipo === 'grado' ? 'grado' : 'semestre'}`
}

/** Nombre corto del programa para la barra: «Licenciatura en Informática» → «Lic. en Informática». */
export function programaCorto(nombre: string): string {
  return nombre.replace(/^Licenciatura\b/, 'Lic.').replace(/^Ingeniería\b/, 'Ing.').replace(/^Tecnología\b/, 'Tec.')
}

export function institucionCorta(i: InstitucionInfo | null | undefined): string {
  return i ? i.sigla?.trim() || i.name : ''
}

/**
 * Dónde va la asignatura, en una línea:
 * - de un programa: «3.er semestre · Lic. en Informática»;
 * - de una institución sin programa: «Electiva · Unicórdoba»;
 * - libre: «Curso libre».
 */
export function lugarDeAsignatura(a: AsignaturaInfo): string {
  if (a.program) {
    const partes = [a.periodoPlan ? periodoDelPlan(a.periodoPlan, a.program.tipo) : '', programaCorto(a.program.name)]
    return partes.filter(Boolean).join(' · ')
  }
  if (a.institution) return `Electiva · ${institucionCorta(a.institution)}`
  return 'Curso libre'
}

/** Para la barra superior del estudiante: la asignatura y dónde va, o null si la clase no la tiene. */
export function contextoDeClase(c: ClaseConAsignatura | null | undefined): string | null {
  return c?.asignatura ? `${c.asignatura.nombre} · ${lugarDeAsignatura(c.asignatura)}` : null
}

/**
 * Para la barra del docente, a partir de TODAS sus clases: la institución y el programa si son uno solo
 * («Unicórdoba · Lic. en Informática»), la institución si enseña en varios programas de ella, o cuántas instituciones.
 * Null si ninguna clase tiene asignatura: no se muestra nada antes que algo falso.
 */
export function contextoDocente(clases: ReadonlyArray<ClaseConAsignatura>): string | null {
  const asignaturas = clases.map((c) => c.asignatura).filter((a): a is AsignaturaInfo => !!a)
  const instituciones = new Map<number, InstitucionInfo>()
  const programas = new Map<number, ProgramaInfo>()
  for (const a of asignaturas) {
    if (a.institution) instituciones.set(a.institution.id, a.institution)
    if (a.program) programas.set(a.program.id, a.program)
  }
  if (instituciones.size === 0) return asignaturas.length ? 'Cursos libres' : null
  if (instituciones.size > 1) return `${instituciones.size} instituciones`
  const inst = institucionCorta([...instituciones.values()][0])
  if (programas.size === 1) return `${inst} · ${programaCorto([...programas.values()][0].name)}`
  return programas.size > 1 ? `${inst} · ${programas.size} programas` : inst
}

/** Periodo académico de una fecha: enero a junio = 1, julio a diciembre = 2. */
export function periodoActual(fecha = new Date()): string {
  return `${fecha.getFullYear()}-${fecha.getMonth() < 6 ? 1 : 2}`
}

/** Nombre sugerido de la clase: «Fundamentos de Algoritmia — Grupo 2 · 2026-2». El docente lo puede cambiar. */
export function nombreSugerido(asignatura: string, grupo = '', periodo = ''): string {
  const cola = [grupo.trim(), periodo.trim()].filter(Boolean).join(' · ')
  return cola ? `${asignatura.trim()} — ${cola}` : asignatura.trim()
}
