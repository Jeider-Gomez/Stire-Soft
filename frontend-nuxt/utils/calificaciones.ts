// Formas de calificar (docs/DISENO_INTERVENCION_DOCENTE.md §6; BASE_TEORICA.md BT-14): tipos, textos, formas de
// empezar, columnas de la tabla y el CSV para Moodle. Todo es opcional y el docente lo arma a su manera: notas del curso
// o de un módulo, notas que salen de STIRE o que pone él (también actividades presenciales), con porcentajes,
// promediando o sin calcular final. STIRE ayuda; no le impone un esquema.

export type TipoComponente = 'dominio' | 'entregas' | 'manual'
export type ModoCalculo = 'porcentajes' | 'promedio' | 'ninguno'
export type ModoGrupo = Exclude<ModoCalculo, 'ninguno'>

export interface Componente {
  clave: string; nombre: string; tipo: TipoComponente; peso: number
  /** null = del curso entero. */
  moduloId: number | null
  lecciones: number[] | null; entregas: number[] | null
}
export interface GrupoModulo { moduloId: number; calculo: ModoGrupo; peso: number }
export interface Esquema { componentes: Componente[]; calculo: ModoCalculo; grupos: GrupoModulo[]; notaAprobatoria: number; visibleParaEstudiantes: boolean }
export interface Modulo { id: number; titulo: string; lecciones: number[] }
export interface NotaComponente { nota: number | null; detalle: string }
export interface FilaLibro {
  studentId: number; nombre: string; email: string
  componentes: Record<string, NotaComponente>
  modulos: Record<string, { nota: number | null; faltan: string[] }>
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
  manual: { nombre: 'Nota que pones tú', ayuda: 'Un parcial, un taller o una actividad en el salón: la escribes en la tabla.' },
  dominio: { nombre: 'Dominio de las lecciones', ayuda: 'STIRE la calcula: promedio del dominio de las lecciones, de 0 a 5. Lo no empezado cuenta 0.' },
  entregas: { nombre: 'Entregas con nota', ayuda: 'STIRE la calcula: promedio de las entregas con nota. Por revisar o abierta no cuenta todavía; cerrada sin entregar cuenta 0.' },
}

export const MODO_CALCULO: Record<ModoCalculo, string> = {
  porcentajes: 'Con porcentajes',
  promedio: 'Promediando',
  ninguno: 'Sin nota final (solo registro las notas)',
}

const componente = (clave: string, nombre: string, tipo: TipoComponente, peso = 0, moduloId: number | null = null): Componente =>
  ({ clave, nombre, tipo, peso, moduloId, lecciones: null, entregas: null })
const base = (componentes: Componente[], calculo: ModoCalculo, grupos: GrupoModulo[] = []): Esquema =>
  ({ componentes, calculo, grupos, notaAprobatoria: 3, visibleParaEstudiantes: false })

/** Formas de empezar. Son solo un punto de partida: después se cambia todo (nombres, módulos, porcentajes, lecciones). */
export function formasDeEmpezar(modulos: Modulo[]): Array<{ id: string; titulo: string; descripcion: string; esquema: Esquema }> {
  const conLecciones = modulos.filter((m) => m.lecciones.length)
  const formas = [
    { id: 'una', titulo: 'Una sola nota', descripcion: 'La pones tú, como en una planilla. Después agregas las que quieras.', esquema: base([componente('nota', 'Nota', 'manual')], 'promedio') },
  ]
  if (conLecciones.length) {
    formas.push({
      id: 'modulos', titulo: 'Una nota por módulo',
      descripcion: 'Cada módulo con su nota (para empezar, el dominio de sus lecciones). Le agregas actividades del salón y decides si promedias o usas porcentajes.',
      esquema: base(
        conLecciones.map((m, i) => componente(`m${i + 1}`, 'Práctica', 'dominio', 0, m.id)),
        'promedio',
        conLecciones.map((m) => ({ moduloId: m.id, calculo: 'promedio' as const, peso: 0 })),
      ),
    })
  }
  formas.push({
    id: 'mixta', titulo: 'Práctica, entregas y parcial',
    descripcion: 'Dominio de las lecciones, entregas con nota y un parcial que pones tú, con porcentajes (40, 30 y 30 para empezar).',
    esquema: base([componente('practica', 'Práctica', 'dominio', 40), componente('entregas', 'Entregas', 'entregas', 30), componente('parcial', 'Parcial', 'manual', 30)], 'porcentajes'),
  })
  return formas
}

/** Un grupo por cada módulo que tenga notas, en el orden del curso; conserva lo que el docente ya decidió de cada uno. */
export function sincronizarGrupos(esquema: Esquema, modulos: Modulo[]): GrupoModulo[] {
  const usados = new Set(esquema.componentes.map((c) => c.moduloId).filter((m): m is number => m !== null))
  return modulos.filter((m) => usados.has(m.id)).map((m) => esquema.grupos.find((g) => g.moduloId === m.id) ?? { moduloId: m.id, calculo: 'promedio', peso: 0 })
}

export const sumaPesos = (items: Array<{ peso: number }>): number => items.reduce((s, c) => s + (Number(c.peso) || 0), 0)

export type Columna =
  | { tipo: 'componente'; clave: string; componente: Componente; titulo: string; porcentaje: string }
  | { tipo: 'modulo'; clave: string; moduloId: number; titulo: string; porcentaje: string }

/**
 * Columnas de la tabla y del CSV, en orden: por cada módulo con notas, sus notas y luego la nota del módulo; al final,
 * las notas del curso. El porcentaje solo aparece donde ese nivel usa porcentajes.
 */
export function columnasDelLibro(esquema: Esquema, modulos: Modulo[]): Columna[] {
  const titulo = (id: number) => modulos.find((m) => m.id === id)?.titulo ?? 'Módulo'
  const columnas: Columna[] = []
  for (const g of esquema.grupos) {
    for (const c of esquema.componentes.filter((x) => x.moduloId === g.moduloId)) {
      columnas.push({ tipo: 'componente', clave: c.clave, componente: c, titulo: c.nombre, porcentaje: g.calculo === 'porcentajes' ? `${c.peso} %` : '' })
    }
    columnas.push({ tipo: 'modulo', clave: `modulo-${g.moduloId}`, moduloId: g.moduloId, titulo: `Nota de ${titulo(g.moduloId)}`, porcentaje: esquema.calculo === 'porcentajes' ? `${g.peso} %` : '' })
  }
  for (const c of esquema.componentes.filter((x) => x.moduloId === null)) {
    columnas.push({ tipo: 'componente', clave: c.clave, componente: c, titulo: c.nombre, porcentaje: esquema.calculo === 'porcentajes' ? `${c.peso} %` : '' })
  }
  return columnas
}

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
export function csvParaMoodle(libro: Pick<Libro, 'esquema' | 'filas' | 'modulos'>): string {
  const n = (v: number | null | undefined) => (v === null || v === undefined ? '' : v.toFixed(1))
  const columnas = libro.esquema ? columnasDelLibro(libro.esquema, libro.modulos) : []
  const conFinal = libro.esquema?.calculo !== 'ninguno'
  const encabezado = ['Correo electrónico', 'Nombre', ...columnas.map((c) => (c.porcentaje ? `${c.titulo} (${c.porcentaje})` : c.titulo)), ...(conFinal ? ['Nota propuesta'] : []), 'Nota final']
  const filas = libro.filas.map((f) => [
    f.email, f.nombre,
    ...columnas.map((c) => n(c.tipo === 'componente' ? f.componentes[c.clave]?.nota : f.modulos[String(c.moduloId)]?.nota)),
    ...(conFinal ? [n(f.propuesta)] : []), n(f.final),
  ])
  return '﻿' + [encabezado, ...filas].map((fila) => fila.map(celda).join(',')).join('\r\n') + '\r\n'
}

/** «notas-fundamentos-de-algoritmia-2026-09-30.csv» */
export function nombreArchivoNotas(clase: string, fecha: Date): string {
  const slug = clase.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'clase'
  const dos = (x: number) => String(x).padStart(2, '0')
  return `notas-${slug}-${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}.csv`
}
