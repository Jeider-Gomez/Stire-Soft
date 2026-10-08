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
  // Sin datos del programa o la institución pero con sus ids, no se sabe dónde va: mejor nada que un «Curso libre» falso.
  if (a.programId || a.institutionId) return ''
  return 'Curso libre'
}

/** Para la barra superior del estudiante: la asignatura y dónde va, o null si la clase no la tiene. */
export function contextoDeClase(c: ClaseConAsignatura | null | undefined): string | null {
  if (!c?.asignatura) return null
  const lugar = lugarDeAsignatura(c.asignatura)
  return lugar ? `${c.asignatura.nombre} · ${lugar}` : c.asignatura.nombre
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

/** Un vínculo de «Dónde enseño / Qué estudio» (GET /users/me/affiliations). */
export interface VinculoInfo { program: ProgramaInfo; institution: InstitucionInfo | null }

/** Si las clases no dicen dónde enseña (sin asignatura o sin clases), lo dicen sus vínculos de «Dónde enseño». */
export function contextoDeVinculos(vinculos: ReadonlyArray<VinculoInfo>): string | null {
  if (!vinculos.length) return null
  const instituciones = new Set(vinculos.map((v) => v.institution?.id ?? v.program.institutionId))
  if (instituciones.size > 1) return `${instituciones.size} instituciones`
  const inst = institucionCorta(vinculos[0].institution)
  if (vinculos.length === 1) return [inst, programaCorto(vinculos[0].program.name)].filter(Boolean).join(' · ')
  return [inst, `${vinculos.length} programas`].filter(Boolean).join(' · ')
}

/** Para comparar nombres de clase: sin tildes, mayúsculas ni espacios de más («FUNDAMENTOS  de algoritmia» = «Fundamentos de Algoritmia»). */
const normalizarNombre = (n: string) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toLowerCase()

/**
 * Si `nombre` ya lo usa otra de `otros`. En la prueba del 07/10 tres clases de dos docentes se llamaban igual
 * («Fundamentos de Algoritmia», sin grupo ni periodo) y los estudiantes creían ver el mismo curso con otro contenido.
 */
export function nombreRepetido(nombre: string, otros: string[]): boolean {
  const n = normalizarNombre(nombre)
  return !!n && otros.some((o) => normalizarNombre(o) === n)
}

/**
 * Cómo ve el estudiante el nombre de una clase: el que le puso su docente y, si tiene otra con el mismo nombre, también
 * el docente (y el código, si además es el mismo docente). Así dos clases iguales nunca se confunden.
 */
export function etiquetaDeClase(
  c: { classId: number; name: string; teacherName: string; code?: string },
  todas: ReadonlyArray<{ classId: number; name: string; teacherName: string }>,
): string {
  const gemelas = todas.filter((o) => o.classId !== c.classId && normalizarNombre(o.name) === normalizarNombre(c.name))
  if (!gemelas.length) return c.name
  const mismoDocente = gemelas.some((o) => o.teacherName === c.teacherName)
  return mismoDocente && c.code ? `${c.name} · ${c.teacherName} · ${c.code}` : `${c.name} · ${c.teacherName}`
}

const PALABRAS_MENORES = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'en', 'a', 'para', 'con'])

/**
 * Iniciales de cada clase para el menú del docente (07/10, Jeider: con el menú plegado todas tenían el mismo ícono y no
 * se sabía cuál era cuál). «Fundamentos de Algoritmia» → «FA»; si dos clases dan las mismas iniciales, se numeran en el
 * orden de la lista: «FA1», «FA2». Como los avatares de los equipos de Teams o de los servidores de Discord.
 */
export function siglasDeClases(clases: ReadonlyArray<{ id: number; name: string }>): Record<number, string> {
  const base = clases.map((c) => {
    const palabras = c.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^A-Za-z0-9]+/).filter(Boolean)
    const fuertes = palabras.filter((p) => !PALABRAS_MENORES.has(p.toLowerCase()))
    const usar = fuertes.length ? fuertes : palabras
    const sigla = usar.length === 1 ? usar[0].slice(0, 2) : usar.slice(0, 2).map((p) => p[0]).join('')
    return { id: c.id, sigla: sigla.toUpperCase() || '?' }
  })
  const vistas: Record<string, number> = {}
  const total = (s: string) => base.filter((b) => b.sigla === s).length
  return Object.fromEntries(base.map((b) => {
    if (total(b.sigla) === 1) return [b.id, b.sigla]
    vistas[b.sigla] = (vistas[b.sigla] ?? 0) + 1
    return [b.id, `${b.sigla}${vistas[b.sigla]}`]
  }))
}
