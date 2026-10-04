// Logros y medallas del estudiante (src/analytics/logros.ts; BASE_TEORICA.md BT-29). Privados, sin ranking, solo por
// aprendizaje real. Categorías como Khan Academy y niveles bronce → plata → oro como Duolingo.

export type NivelLogro = 'bronce' | 'plata' | 'oro'
export type CategoriaLogro = 'constancia' | 'practica' | 'dominio' | 'desafio' | 'persistencia' | 'memoria'

/** GET /analytics/student/:id/logros */
export interface Logro {
  clave: string
  categoria: CategoriaLogro
  titulo: string
  descripcion: string
  nivel: NivelLogro | null
  obtenido: string | null
  progreso: { actual: number; meta: number }
}
export interface RespuestaLogros { logros: Logro[]; nuevos: string[]; siguiente: Logro | null }

/** Nombre y para qué sirve cada categoría, en el orden en que se muestran. */
export const CATEGORIAS_LOGRO: Record<CategoriaLogro, { nombre: string; sentido: string }> = {
  constancia: { nombre: 'Constancia', sentido: 'Estudiar varios días a la semana, sin exigir días seguidos.' },
  practica: { nombre: 'Práctica', sentido: 'Aprobar varios ejercicios distintos en un mismo día.' },
  dominio: { nombre: 'Dominio', sentido: 'Dominar lecciones y módulos completos.' },
  desafio: { nombre: 'Desafío', sentido: 'Atreverse con los ejercicios avanzados.' },
  persistencia: { nombre: 'Persistencia', sentido: 'Lograrlo después de varios intentos.' },
  memoria: { nombre: 'Memoria', sentido: 'Repasar a tiempo para no olvidar.' },
}

export const NOMBRE_NIVEL: Record<NivelLogro, string> = { bronce: 'Bronce', plata: 'Plata', oro: 'Oro' }

/** «2 de 3» */
export function textoProgreso(l: Pick<Logro, 'progreso'>): string {
  return `${l.progreso.actual} de ${l.progreso.meta}`
}

/** Porcentaje de avance (0–100) para la barra. */
export function porcentajeLogro(l: Pick<Logro, 'progreso'>): number {
  return l.progreso.meta > 0 ? Math.round((100 * Math.min(l.progreso.actual, l.progreso.meta)) / l.progreso.meta) : 0
}

/** Los logros por categoría, en el orden de CATEGORIAS_LOGRO; dentro, primero los obtenidos y luego por nivel. */
export function agruparLogros(logros: ReadonlyArray<Logro>): Array<{ categoria: CategoriaLogro; nombre: string; sentido: string; logros: Logro[]; obtenidos: number }> {
  const ordenNivel = (l: Logro) => (l.nivel ? ['bronce', 'plata', 'oro'].indexOf(l.nivel) : -1)
  return (Object.keys(CATEGORIAS_LOGRO) as CategoriaLogro[])
    .map((categoria) => {
      const deLaCategoria = logros
        .filter((l) => l.categoria === categoria)
        .sort((a, b) => Number(!!b.obtenido) - Number(!!a.obtenido) || ordenNivel(a) - ordenNivel(b))
      return { categoria, ...CATEGORIAS_LOGRO[categoria], logros: deLaCategoria, obtenidos: deLaCategoria.filter((l) => l.obtenido).length }
    })
    .filter((g) => g.logros.length > 0)
}

/** El logro obtenido más reciente. */
export function ultimoLogro(logros: ReadonlyArray<Logro>): Logro | null {
  return [...logros].filter((l) => l.obtenido).sort((a, b) => b.obtenido!.localeCompare(a.obtenido!))[0] ?? null
}

/** «¡Nueva medalla: Semana de estudio!» o «¡3 medallas nuevas!» */
export function textoNuevos(nuevos: ReadonlyArray<Logro>): string {
  if (!nuevos.length) return ''
  return nuevos.length === 1 ? `¡Nueva medalla: ${nuevos[0].titulo}!` : `¡${nuevos.length} medallas nuevas!`
}
