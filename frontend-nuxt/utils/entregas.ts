// Entregas (docs/DISENO_INTERVENCION_DOCENTE.md §3 y §10): textos y formatos compartidos por las pantallas del docente
// y del estudiante.

export type EstadoEntrega = 'sin_entregar' | 'por_revisar' | 'revisada'
export type TipoEntrega = 'web' | 'javascript' | 'cualquiera'

/** Lo que el docente edita de una entrega (EntregaForm). */
export interface EntregaEditable {
  id: number; titulo: string; consigna: string; learningUnitId: number | null; tipoProyecto: TipoEntrega
  abreAt: string | null; cierraAt: string | null; aceptaTarde: boolean; maxVersiones: number; conNota: boolean
  cuentaParaDominio: boolean; dificultad: string; publicada: boolean; asignadaA: number[] | null
}

export const ESTADO_ENTREGA: Record<EstadoEntrega, string> = {
  sin_entregar: 'Sin entregar',
  por_revisar: 'Por revisar',
  revisada: 'Revisada',
}

export const TIPO_ENTREGA: Record<TipoEntrega, string> = {
  cualquiera: 'Cualquier proyecto',
  web: 'Página web',
  javascript: 'Programa de JavaScript',
}

/** «30 sept, 19:35» */
export function fechaCorta(iso: string | Date | null | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

/** Nota con coma decimal: 4.5 → «4,5». */
export function notaTexto(nota: number | null | undefined): string {
  return nota === null || nota === undefined ? '' : nota.toFixed(1).replace('.', ',')
}

/** Valor para un <input type="datetime-local"> en la hora local del navegador; '' si no hay fecha. */
export function aFechaLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const dos = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`
}

/** De un <input type="datetime-local"> a ISO (con la zona del navegador); null si está vacío. */
export function deFechaLocal(valor: string): string | null {
  return valor ? new Date(valor).toISOString() : null
}

export interface EventoHistorial {
  id: number
  tipo: 'enviada' | 'revisada' | 'nota_cambiada' | 'comentario_editado' | 'revision_borrada' | 'reabierta'
  detalle: Record<string, unknown> | null
  actor: string
  createdAt: string
}

/** Una línea del historial en palabras: «Versión 2 enviada (tarde)», «Nota cambiada: 4,0 → 4,5». */
export function textoEvento(e: EventoHistorial): string {
  const d = e.detalle ?? {}
  switch (e.tipo) {
    case 'enviada': return `Versión ${d.version} enviada${d.tarde ? ' (tarde)' : ''}`
    case 'revisada': return typeof d.nota === 'number' ? `Revisada · nota ${notaTexto(d.nota)}` : 'Revisada con comentario'
    case 'nota_cambiada': return `Nota cambiada: ${notaTexto(d.antes as number | null) || 'sin nota'} → ${notaTexto(d.despues as number | null) || 'sin nota'}`
    case 'comentario_editado': return 'Comentario editado'
    case 'revision_borrada': return 'Revisión borrada: vuelve a «sin revisar»'
    case 'reabierta': return 'El docente dio una versión más'
  }
}
