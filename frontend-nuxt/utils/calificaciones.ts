// Formas de calificar (docs/DISENO_INTERVENCION_DOCENTE.md §6; BASE_TEORICA.md BT-14): tipos, textos, formas de
// empezar y el CSV para Moodle. Todo es opcional y el docente lo arma a su manera: una sola nota, una por módulo, con
// porcentajes o sin ellos. STIRE ayuda; no le impone un esquema.

export type TipoComponente = 'dominio' | 'entregas' | 'manual'

export interface Componente {
  clave: string; nombre: string; tipo: TipoComponente; peso: number
  lecciones: number[] | null; entregas: number[] | null
}
export interface Esquema { componentes: Componente[]; usarPesos: boolean; notaAprobatoria: number; visibleParaEstudiantes: boolean }
export interface Modulo { id: number; titulo: string; lecciones: number[] }
export interface NotaComponente { nota: number | null; detalle: string }
export interface FilaLibro {
  studentId: number; nombre: string; email: string
  componentes: Record<string, NotaComponente>
  propuesta: number | null; faltan: string[]
  ajuste: { nota: number; motivo: string | null; fecha: string } | null
  final: number | null; aprueba: boolean | null
}
export interface Libro {
  /** null = la clase no usa notas en STIRE. */
  esquema: Esquema | null; actualizadoAt: string | null
  modulos: Modulo[]
  lecciones: Array<{ id: number; titulo: string }>
  entregas: Array<{ id: number; titulo: string; publicada: boolean }>
  filas: FilaLibro[]
  resumen: { promedio: number | null; aprueban: number; reprueban: number; sinNota: number }
}

export const TIPO_COMPONENTE: Record<TipoComponente, { nombre: string; ayuda: string }> = {
  dominio: { nombre: 'Dominio de las lecciones', ayuda: 'STIRE la calcula: promedio del dominio de las lecciones, de 0 a 5. Lo no empezado cuenta 0.' },
  entregas: { nombre: 'Entregas con nota', ayuda: 'STIRE la calcula: promedio de las entregas con nota. Por revisar o abierta no cuenta todavía; cerrada sin entregar cuenta 0.' },
  manual: { nombre: 'Nota que pones tú', ayuda: 'Un parcial, una exposición: la escribes en la tabla.' },
}

const componente = (clave: string, nombre: string, tipo: TipoComponente, peso = 0, lecciones: number[] | null = null): Componente =>
  ({ clave, nombre, tipo, peso, lecciones, entregas: null })
const base = (componentes: Componente[], usarPesos: boolean): Esquema => ({ componentes, usarPesos, notaAprobatoria: 3, visibleParaEstudiantes: false })

/** Formas de empezar. Son solo un punto de partida: después se cambia todo (nombres, tipos, porcentajes, lecciones). */
export function formasDeEmpezar(modulos: Modulo[]): Array<{ id: string; titulo: string; descripcion: string; esquema: Esquema }> {
  const formas = [
    { id: 'una', titulo: 'Una sola nota', descripcion: 'La pones tú, como en una planilla. Sin porcentajes ni cálculos.', esquema: base([componente('nota', 'Nota', 'manual')], false) },
  ]
  if (modulos.length) {
    formas.push({
      id: 'modulos', titulo: 'Una nota por módulo',
      descripcion: 'STIRE calcula cada una con el dominio de las lecciones del módulo. La final es el promedio; si quieres, les das porcentajes.',
      esquema: base(modulos.map((m, i) => componente(`m${i + 1}`, m.titulo.slice(0, 60), 'dominio', 0, m.lecciones)), false),
    })
  }
  formas.push({
    id: 'mixta', titulo: 'Práctica, entregas y parcial',
    descripcion: 'Dominio de las lecciones, entregas con nota y un parcial que pones tú, con porcentajes (40, 30 y 30 para empezar).',
    esquema: base([componente('practica', 'Práctica', 'dominio', 40), componente('entregas', 'Entregas', 'entregas', 30), componente('parcial', 'Parcial', 'manual', 30)], true),
  })
  return formas
}

export const sumaPesos = (componentes: Array<{ peso: number }>): number => componentes.reduce((s, c) => s + (Number(c.peso) || 0), 0)

/** Lo que escribe el docente: «4,5», «4.5» o vacío. undefined = no es una nota válida. */
export function leerNota(texto: string): number | null | undefined {
  const t = texto.trim().replace(',', '.')
  if (t === '') return null
  const n = Number(t)
  if (!Number.isFinite(n) || n < 0 || n > 5) return undefined
  return Math.round(n * 10 + 1e-9) / 10
}

/** «4,5»; vacío si no hay nota. */
export const notaComa = (n: number | null | undefined): string => (n === null || n === undefined ? '' : n.toFixed(1).replace('.', ','))

function celda(valor: string): string {
  return /[",\n\r]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor
}

/**
 * CSV para «Importar calificaciones» de Moodle: una columna de correo para identificar al estudiante y una por cada
 * nota, con punto decimal. Lleva BOM para que Excel lo abra con tildes; Moodle lo ignora al importar.
 */
export function csvParaMoodle(libro: Pick<Libro, 'esquema' | 'filas'>): string {
  const n = (v: number | null | undefined) => (v === null || v === undefined ? '' : v.toFixed(1))
  const componentes = libro.esquema?.componentes ?? []
  const encabezado = ['Correo electrónico', 'Nombre', ...componentes.map((c) => (libro.esquema?.usarPesos ? `${c.nombre} (${c.peso} %)` : c.nombre)), 'Nota propuesta', 'Nota final']
  const filas = libro.filas.map((f) => [f.email, f.nombre, ...componentes.map((c) => n(f.componentes[c.clave]?.nota)), n(f.propuesta), n(f.final)])
  return '﻿' + [encabezado, ...filas].map((fila) => fila.map(celda).join(',')).join('\r\n') + '\r\n'
}

/** «notas-fundamentos-de-algoritmia-2026-09-30.csv» */
export function nombreArchivoNotas(clase: string, fecha: Date): string {
  const slug = clase.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'clase'
  const dos = (x: number) => String(x).padStart(2, '0')
  return `notas-${slug}-${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}.csv`
}
