// Competencias (P39; profesor Toscano, 28/10; cuadros «E-Progreso-Competencias», «D3-Competencias» y
// «D3-Competencias-Modelo»). La ecuación vive en el servidor (src/common/utils/competencias.ts):
// Nivel = (puntos logrados + 1) ÷ (puntos posibles + 2), con básico 1, intermedio 2 y avanzado 3.

export type ModoCompetencias = 'apagado' | 'informar' | 'recomendar'
export type EstadoNivel = 'sin-evidencia' | 'en-camino' | 'lo-hace' | 'lo-domina'

export interface EstadoCompetencia {
  id: string
  nombre: string
  ejemplo: string
  grupo: string
  logrados: number
  posibles: number
  nivel: number
  estado: EstadoNivel
  ejercicios: number
  lecciones: string[]
}

export interface EjercicioSugerido { activityId: number; title: string; learningUnitId: number; difficulty: string }

export interface CompetenciasDelEstudiante {
  modo: ModoCompetencias
  docente: string | null
  competencias: EstadoCompetencia[]
  practicar: { id: string; nombre: string; estado: EstadoNivel; ejercicio: EjercicioSugerido | null } | null
}

export interface CompetenciaDeLaClase {
  id: string
  nombre: string
  ejemplo: string
  nivel: number
  estado: EstadoNivel
  porEstado: Record<EstadoNivel, number>
  enCamino: Array<{ studentId: number; nombre: string; nivel: number }>
  banco: { basico: number; intermedio: number; avanzado: number }
}

export interface CompetenciasDeLaClase {
  modo: ModoCompetencias
  estudiantes: number
  competencias: CompetenciaDeLaClase[]
  masBaja: string | null
}

export interface PracticarPrimero {
  modo: ModoCompetencias
  competencia: { id: string; nombre: string; ejemplo: string; nivel: number; estado: EstadoNivel } | null
  leccion: { learningUnitId: number; titulo: string } | null
  ejercicio: EjercicioSugerido | null
}

export const NOMBRE_ESTADO: Record<EstadoNivel, string> = {
  'sin-evidencia': 'Sin evidencia',
  'en-camino': 'En camino',
  'lo-hace': 'Lo hace',
  'lo-domina': 'Lo domina',
}

/** Color de cada estado: el mismo lenguaje que las lecciones (dominada, en progreso, por iniciar). */
export const CLASE_ESTADO: Record<EstadoNivel, string> = {
  'sin-evidencia': 'estado-sin',
  'en-camino': 'estado-camino',
  'lo-hace': 'estado-hace',
  'lo-domina': 'estado-domina',
}

export const MODOS: Array<{ valor: ModoCompetencias; texto: string; ayuda: string }> = [
  { valor: 'apagado', texto: 'Apagadas', ayuda: 'Nadie las ve. El dominio de cada lección sigue igual.' },
  { valor: 'informar', texto: 'Solo ver', ayuda: 'Tú y tus estudiantes ven el nivel de cada competencia; no cambia qué ejercicio sigue.' },
  { valor: 'recomendar', texto: 'Elegir ejercicios', ayuda: 'Además, STIRE elige el siguiente ejercicio por la competencia más baja de cada estudiante y, si uno no le sale, lo manda a practicar lo que le falta.' },
]

export const NOMBRE_DIFICULTAD: Record<string, string> = { basico: 'básico', intermedio: 'intermedio', avanzado: 'avanzado' }

/** «83 %» (el nivel se muestra redondeado; sin evidencia no hay porcentaje). */
export const porcentajeNivel = (c: { nivel: number; estado: EstadoNivel }) => (c.estado === 'sin-evidencia' ? '' : `${Math.round(c.nivel * 100)} %`)

/** «Lo domina · 83 %» o «Sin evidencia». */
export const etiquetaNivel = (c: { nivel: number; estado: EstadoNivel }) =>
  c.estado === 'sin-evidencia' ? NOMBRE_ESTADO[c.estado] : `${NOMBRE_ESTADO[c.estado]} · ${porcentajeNivel(c)}`
