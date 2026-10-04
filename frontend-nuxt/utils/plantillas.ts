// Plantillas compartidas (docs/DISENO_CLASES_Y_DOCENTES.md y DISENO_ORGANIZACION_Y_PLANTILLAS.md §2.3): un docente comparte
// el CONTENIDO de su clase con quien elija y otros docentes lo copian a sus propias clases. Se copia, nunca se enlaza;
// estudiantes, entregas y notas no se comparten. Varias plantillas de una misma asignatura son ENFOQUES, no duplicados.

import { institucionCorta, periodoDelPlan, programaCorto, type AsignaturaInfo } from './contextoAcademico'

export type AlcancePlantilla = 'nadie' | 'asignatura' | 'programa' | 'facultad' | 'institucion' | 'todos'

/** GET /reuse/plantillas — no trae el código de la clase: es el secreto con el que entran sus estudiantes. */
export interface Plantilla {
  classId: number
  nombre: string
  docente: string
  enfoque: string | null
  alcance: AlcancePlantilla
  asignatura: AsignaturaInfo | null
  modulos: number
  lecciones: number
  ejercicios: number
  vecesCopiada: number
  valoracion: { utiles: number; total: number } | null
  actualizada: string
  /** 0 la misma asignatura … 5 nada en común con la que se va a dictar. */
  cercania: number
}

const n = (x: number, uno: string, varios: string) => `${x} ${x === 1 ? uno : varios}`

/** Para una lista desplegable: «Con JavaScript — Laura Martínez · 4 módulos, 13 lecciones». */
export function textoPlantilla(p: Plantilla): string {
  return `${p.enfoque || p.nombre} — ${p.docente} · ${n(p.modulos, 'módulo', 'módulos')}, ${n(p.lecciones, 'lección', 'lecciones')}`
}

/** Hace cuánto: «hoy», «hace 3 días», «hace 2 meses», «hace 1 año». */
export function haceCuanto(iso: string, ahora = new Date()): string {
  const dias = Math.floor((ahora.getTime() - new Date(iso).getTime()) / 86_400_000)
  if (dias < 1) return 'hoy'
  if (dias < 30) return dias === 1 ? 'ayer' : `hace ${dias} días`
  const meses = Math.floor(dias / 30)
  if (meses < 12) return `hace ${n(meses, 'mes', 'meses')}`
  return `hace ${n(Math.floor(meses / 12), 'año', 'años')}`
}

/**
 * Lo que responde «¿me sirve?» sin abrir la plantilla: contenido, uso y utilidad para los estudiantes. La utilidad solo
 * se muestra con 5 votos o más: con menos, un porcentaje engaña.
 */
export function senalesDePlantilla(p: Plantilla, ahora = new Date()): string[] {
  const s = [`${n(p.modulos, 'módulo', 'módulos')} · ${n(p.lecciones, 'lección', 'lecciones')} · ${n(p.ejercicios, 'ejercicio', 'ejercicios')}`]
  if (p.vecesCopiada > 0) s.push(`la ${p.vecesCopiada === 1 ? 'copió 1 docente' : `copiaron ${p.vecesCopiada} docentes`}`)
  if (p.valoracion && p.valoracion.total >= 5) s.push(`a ${Math.round((100 * p.valoracion.utiles) / p.valoracion.total)} % de los estudiantes le sirvió`)
  s.push(`actualizada ${haceCuanto(p.actualizada, ahora)}`)
  return s
}

export interface GrupoDePlantillas { clave: string; titulo: string; subtitulo: string; cercania: number; plantillas: Plantilla[] }

/**
 * Agrupa por asignatura: «Fundamentos de Algoritmia — 2 enfoques». Los grupos van por cercanía (la asignatura que se
 * va a dictar primero); dentro de cada uno, el orden del servidor (copias, utilidad, actualidad).
 */
export function agruparPorAsignatura(plantillas: ReadonlyArray<Plantilla>): GrupoDePlantillas[] {
  const grupos = new Map<string, GrupoDePlantillas>()
  for (const p of plantillas) {
    const a = p.asignatura
    const clave = a ? `a${a.id}` : 'sin'
    if (!grupos.has(clave)) {
      const subtitulo = a
        ? [a.periodoPlan && a.program ? periodoDelPlan(a.periodoPlan, a.program.tipo) : '', a.program ? programaCorto(a.program.name) : '', institucionCorta(a.institution)].filter(Boolean).join(' · ')
        : ''
      grupos.set(clave, { clave, titulo: a?.nombre ?? 'Sin asignatura', subtitulo, cercania: p.cercania, plantillas: [] })
    }
    const g = grupos.get(clave)!
    g.plantillas.push(p)
    g.cercania = Math.min(g.cercania, p.cercania)
  }
  return [...grupos.values()].sort((x, y) => x.cercania - y.cercania || x.titulo.localeCompare(y.titulo, 'es'))
}

/** «2 enfoques», «1 enfoque». */
export function cuantosEnfoques(g: GrupoDePlantillas): string {
  return n(g.plantillas.length, 'enfoque', 'enfoques')
}

export interface OpcionDeAlcance { valor: AlcancePlantilla; titulo: string; ayuda: string; motivoNoDisponible: string | null }

/**
 * Las opciones de «¿Con quién compartes?» con los nombres reales de la clase («Docentes de Fundamentos de Algoritmia»,
 * «Lic. en Informática»…). Las que la clase no puede usar (le falta la asignatura, el programa o la facultad) dicen por qué.
 */
export function opcionesDeAlcance(a: AsignaturaInfo | null | undefined): OpcionDeAlcance[] {
  const sinAsignatura = 'Primero elige la asignatura de la clase (arriba, en «Datos de la clase»).'
  const facultad = a?.program?.facultad?.trim()
  return [
    { valor: 'nadie', titulo: 'No compartir', ayuda: 'Solo tú la usas, también para copiarla a tus otros grupos.', motivoNoDisponible: null },
    {
      valor: 'asignatura', titulo: a ? `Docentes de ${a.nombre}` : 'Docentes de la misma asignatura',
      ayuda: 'Quien dicte esta asignatura en otro grupo o periodo.', motivoNoDisponible: a ? null : sinAsignatura,
    },
    {
      valor: 'programa', titulo: a?.program ? `Docentes de ${programaCorto(a.program.name)}` : 'Docentes del programa',
      ayuda: 'Cursos parecidos de semestres cercanos.', motivoNoDisponible: !a ? sinAsignatura : a.program ? null : 'Esta asignatura no es de un programa.',
    },
    {
      valor: 'facultad', titulo: facultad ? `Docentes de la ${facultad}` : 'Docentes de la facultad',
      ayuda: 'Asignaturas comunes de la facultad.', motivoNoDisponible: !a ? sinAsignatura : facultad ? null : 'El programa de esta asignatura no tiene facultad.',
    },
    {
      valor: 'institucion', titulo: a?.institution ? `Docentes de ${institucionCorta(a.institution)}` : 'Docentes de la institución',
      ayuda: 'Toda la institución.', motivoNoDisponible: !a ? sinAsignatura : a.institution || a.institutionId ? null : 'Es un curso libre, sin institución.',
    },
    { valor: 'todos', titulo: 'Todos los docentes de STIRE', ayuda: 'Material abierto, también para otras instituciones y colegios.', motivoNoDisponible: null },
  ]
}
