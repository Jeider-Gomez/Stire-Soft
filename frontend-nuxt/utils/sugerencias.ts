// La bandeja de sugerencias del admin (pages/admin/sugerencias.vue), como funciones puras (07/10, Jeider: «quiero ver
// las nuevas arriba, que se vaya mostrando lo resuelto, archivar las descartadas y poner cómo se resolvió»). Como la
// bandeja de un sistema de soporte: lo pendiente aparte, lo resuelto con su respuesta y lo descartado archivado.
import type { Celda, Hoja } from './excel'

export type EstadoSugerencia = 'nuevo' | 'visto' | 'resuelto' | 'descartado'
export type TipoSugerencia = 'problema' | 'confuso' | 'idea'
export interface Sugerencia {
  id: number; autor: string; rol: string; tipo: TipoSugerencia; gravedad: number | null
  texto: string; ruta: string; dispositivo: string; clase: string; estado: EstadoSugerencia; nota: string | null
  createdAt: string; updatedAt?: string; tieneCaptura?: boolean
}

export type Bandeja = 'pendientes' | 'resueltas' | 'archivadas'
export const BANDEJAS: Array<{ valor: Bandeja; texto: string; ayuda: string; estados: EstadoSugerencia[] }> = [
  { valor: 'pendientes', texto: 'Por atender', ayuda: 'Nuevas y vistas: lo que falta resolver.', estados: ['nuevo', 'visto'] },
  { valor: 'resueltas', texto: 'Resueltas', ayuda: 'Con la respuesta que lee quien la envió.', estados: ['resuelto'] },
  { valor: 'archivadas', texto: 'Archivadas', ayuda: 'Descartadas: pruebas, vacías o repetidas. No se borran.', estados: ['descartado'] },
]

export const TIPOS: Record<TipoSugerencia, string> = { problema: 'Problema', confuso: 'Confuso', idea: 'Idea' }
export const GRAVEDADES: Record<number, string> = { 1: 'Detalle', 2: 'Confunde', 3: 'Bloquea' }
export const ESTADOS: Record<EstadoSugerencia, string> = { nuevo: 'Nueva', visto: 'Vista', resuelto: 'Resuelta', descartado: 'Archivada' }

/** Motivos rápidos al archivar: el admin no tiene que escribirlos cada vez. */
export const MOTIVOS_ARCHIVAR = ['Era una prueba', 'Está vacía o no se entiende', 'Repetida', 'No aplica a STIRE'] as const

export const bandejaDe = (e: EstadoSugerencia): Bandeja => BANDEJAS.find((b) => b.estados.includes(e))!.valor

export function contarPorBandeja(lista: Sugerencia[]): Record<Bandeja, number> {
  const c: Record<Bandeja, number> = { pendientes: 0, resueltas: 0, archivadas: 0 }
  for (const s of lista) c[bandejaDe(s.estado)]++
  return c
}

export type Orden = 'recientes' | 'graves' | 'antiguas'
export interface Filtros { bandeja: Bandeja; tipo: TipoSugerencia | 'todos'; buscar: string; orden: Orden }

const sinTildes = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Lo que se ve: la bandeja elegida, el tipo, lo que se busca (en texto, autor, clase y pantalla) y el orden. */
export function filtrar(lista: Sugerencia[], f: Filtros): Sugerencia[] {
  const q = sinTildes(f.buscar.trim())
  const fecha = (s: Sugerencia) => new Date(s.createdAt).getTime()
  return lista
    .filter((s) => bandejaDe(s.estado) === f.bandeja)
    .filter((s) => f.tipo === 'todos' || s.tipo === f.tipo)
    .filter((s) => !q || sinTildes(`${s.texto} ${s.autor} ${s.clase} ${s.ruta} ${s.nota ?? ''}`).includes(q))
    .sort((a, b) => {
      if (f.orden === 'antiguas') return fecha(a) - fecha(b)
      if (f.orden === 'graves') return (b.gravedad ?? 0) - (a.gravedad ?? 0) || fecha(b) - fecha(a)
      return fecha(b) - fecha(a)
    })
}

/** Qué falta para guardar una revisión (null si nada): resolver exige decir cómo (lo lee quien la envió). */
export function faltaEnRevision(estado: EstadoSugerencia, nota: string): string | null {
  if (estado === 'resuelto' && !nota.trim()) return 'Escribe cómo se resolvió: lo lee quien la envió.'
  return null
}

const ESTILO_ESTADO = { nuevo: 'nuevo', visto: 'visto', resuelto: 'resuelto', descartado: 'descartado' } as const

/**
 * El libro de Excel de las sugerencias: una hoja con todas (encabezado fijo, filtros, estado con color, lo que bloquea
 * en rojo, fechas de verdad) y una de resumen por estado, tipo, rol y clase.
 */
export function libroDeSugerencias(lista: Sugerencia[], ahora = new Date()): Hoja[] {
  const enc = (titulo: string): Celda => ({ v: titulo, estilo: 'encabezado' })
  const columnas = [
    { titulo: 'N.º', ancho: 6 }, { titulo: 'Fecha', ancho: 17 }, { titulo: 'Estado', ancho: 12 }, { titulo: 'Tipo', ancho: 11 },
    { titulo: 'Gravedad', ancho: 11 }, { titulo: 'Qué contó', ancho: 60 }, { titulo: 'Cómo se resolvió / nota', ancho: 45 },
    { titulo: 'Autor', ancho: 22 }, { titulo: 'Rol', ancho: 11 }, { titulo: 'Clase', ancho: 30 }, { titulo: 'Pantalla', ancho: 28 },
    { titulo: 'Dispositivo', ancho: 30 }, { titulo: 'Pantallazo', ancho: 11 }, { titulo: 'Última revisión', ancho: 17 },
  ]
  const filas: Celda[][] = [columnas.map((c) => enc(c.titulo))]
  for (const s of [...lista].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())) {
    filas.push([
      { v: s.id, estilo: 'numero' },
      { v: new Date(s.createdAt) },
      { v: ESTADOS[s.estado], estilo: ESTILO_ESTADO[s.estado] },
      { v: TIPOS[s.tipo] },
      { v: s.gravedad ? GRAVEDADES[s.gravedad] : '', estilo: s.gravedad === 3 ? 'grave' : 'texto' },
      { v: s.texto },
      { v: s.nota ?? '' },
      { v: s.autor },
      { v: s.rol },
      { v: s.clase },
      { v: s.ruta },
      { v: s.dispositivo },
      { v: s.tieneCaptura ? 'Sí' : '' },
      { v: s.updatedAt && s.estado !== 'nuevo' ? new Date(s.updatedAt) : null, estilo: 'fecha' },
    ])
  }

  const cuenta = <K extends string>(clave: (s: Sugerencia) => K) => {
    const m = new Map<K, number>()
    for (const s of lista) m.set(clave(s), (m.get(clave(s)) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }
  const tabla = (titulo: string, pares: Array<[string, number]>): Celda[][] => [
    [],
    [{ v: titulo, estilo: 'encabezado' }, { v: 'Cuántas', estilo: 'encabezado' }],
    ...pares.map(([k, n]): Celda[] => [{ v: k }, { v: n, estilo: 'numero' }]),
  ]
  const resumen: Celda[][] = [
    [{ v: 'Sugerencias de STIRE', estilo: 'titulo' }],
    [{ v: `Descargado el ${ahora.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })} · ${lista.length} en total`, estilo: 'nota' }],
    ...tabla('Estado', BANDEJAS.map((b) => [b.texto, lista.filter((s) => b.estados.includes(s.estado)).length])),
    ...tabla('Tipo', cuenta((s) => TIPOS[s.tipo])),
    ...tabla('Lo que bloquea (por atender)', [['Bloquea y sigue pendiente', lista.filter((s) => s.gravedad === 3 && bandejaDe(s.estado) === 'pendientes').length]]),
    ...tabla('Rol de quien la envió', cuenta((s) => s.rol)),
    ...tabla('Clase', cuenta((s) => s.clase || 'Sin clase')),
  ]
  return [
    { nombre: 'Sugerencias', columnas, filas, conEncabezado: true },
    { nombre: 'Resumen', columnas: [{ titulo: '', ancho: 38 }, { titulo: '', ancho: 12 }], filas: resumen },
  ]
}
