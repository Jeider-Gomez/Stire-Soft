/**
 * El inicio del docente como se planteó en el prototipo del panel v2: un saludo con el resumen, «Por revisar» con lo que
 * pide atención en todas sus clases y «Mis clases» en tarjetas o en lista. Sin importaciones para probarlo solo.
 */

export interface ClaseResumen {
  id: number
  name: string
  enrollmentCount?: number
  atRiskCount?: number
}

export interface PendienteInicio {
  /** La cifra grande a la izquierda. */
  n: number
  texto: string
  /** La clase a la que pertenece, si es de una sola. */
  clase?: string
  claseId?: number
  ir: string
  /** Qué tipo de aviso es: decide el color de la cifra y el título del enlace. */
  tipo?: 'rezago' | 'bloqueados' | 'error' | 'mensajes'
}

/** Lo que se sabe de una clase para sus alertas en «Por revisar»: quiénes no pueden avanzar y el error más repetido. */
export interface AlertasDeClase {
  claseId: number
  clase: string
  /** Estudiantes distintos que fallaron varias veces seguidas en una lección (el mapa de calor). */
  bloqueados: number
  /** El error de concepto que más estudiantes repitieron esta semana. */
  errorMasRepetido: { nombre: string; estudiantes: number } | null
}

/**
 * Las alertas de cada clase para «Por revisar» del Inicio (27/10): antes solo aparecían dentro de la clase, en «Hoy».
 * Llevan a «Hoy» de esa clase, donde están las personas y la acción (asignar un refuerzo).
 */
export function alertasInicio(alertas: ReadonlyArray<AlertasDeClase>): PendienteInicio[] {
  const items: PendienteInicio[] = []
  for (const a of alertas) {
    const ir = `/docente/clase/${a.claseId}`
    if (a.bloqueados > 0) items.push({ n: a.bloqueados, texto: a.bloqueados === 1 ? 'estudiante no puede avanzar' : 'estudiantes no pueden avanzar', clase: a.clase, claseId: a.claseId, ir: `${ir}#bloqueados`, tipo: 'bloqueados' })
    const e = a.errorMasRepetido
    if (e && e.estudiantes >= 2) items.push({ n: e.estudiantes, texto: `repiten el error «${e.nombre}»`, clase: a.clase, claseId: a.claseId, ir: `${ir}#errores`, tipo: 'error' })
  }
  return items
}

export type VistaClases = 'tarjetas' | 'lista'
export const CLAVE_VISTA_CLASES = 'stire-vista-clases'

export function saludo(hora: number): string {
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

/** «Laura Martínez Gómez» → «Laura». Sin nombre, el saludo va solo. */
export function primerNombre(completo: string | null | undefined): string {
  return (completo ?? '').trim().split(/\s+/)[0] ?? ''
}

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

/** «3 clases · 74 estudiantes · 5 necesitan apoyo»: lo que antes ocupaba cuatro tarjetas de cifras. */
export function resumenInicio(clases: ReadonlyArray<ClaseResumen>): string {
  if (clases.length === 0) return 'Todavía no tienes clases.'
  const estudiantes = clases.reduce((s, c) => s + (c.enrollmentCount ?? 0), 0)
  const apoyo = clases.reduce((s, c) => s + (c.atRiskCount ?? 0), 0)
  const partes = [plural(clases.length, 'clase', 'clases'), plural(estudiantes, 'estudiante', 'estudiantes')]
  if (apoyo > 0) partes.push(apoyo === 1 ? '1 necesita apoyo' : `${apoyo} necesitan apoyo`)
  return partes.join(' · ')
}

/**
 * Lo que pide atención, de todas las clases, de lo más grande a lo más pequeño: quién necesita apoyo en cada clase
 * (dominio menor a 50 %) y los mensajes sin leer. Solo cifras reales; si no hay nada, la lista va vacía.
 */
export function porRevisar(clases: ReadonlyArray<ClaseResumen>, noLeidos: number | null, maximo = 5, alertas: ReadonlyArray<AlertasDeClase> = []): PendienteInicio[] {
  const items: PendienteInicio[] = clases
    .filter((c) => (c.atRiskCount ?? 0) > 0)
    .map((c) => ({
      n: c.atRiskCount as number,
      texto: c.atRiskCount === 1 ? 'estudiante necesita apoyo' : 'estudiantes necesitan apoyo',
      clase: c.name,
      claseId: c.id,
      ir: `/docente/rendimiento?classId=${c.id}`,
      tipo: 'rezago' as const,
    }))
  items.push(...alertasInicio(alertas))
  if (noLeidos && noLeidos > 0) items.push({ n: noLeidos, texto: noLeidos === 1 ? 'mensaje sin leer' : 'mensajes sin leer', ir: '/docente/mensajes', tipo: 'mensajes' })
  // Primero quien no puede avanzar (lo más urgente), después por cifra.
  const peso = (p: PendienteInicio) => (p.tipo === 'bloqueados' ? 1 : 0)
  return items.sort((a, b) => peso(b) - peso(a) || b.n - a.n).slice(0, maximo)
}

/** La vista guardada; cualquier otra cosa vuelve a tarjetas. */
export function vistaGuardada(valor: string | null): VistaClases {
  return valor === 'lista' ? 'lista' : 'tarjetas'
}
