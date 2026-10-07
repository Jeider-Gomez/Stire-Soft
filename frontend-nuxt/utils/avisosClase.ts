// Avisos del docente a toda su clase (src/avisos-clase/aviso-reglas.ts): un mensaje es uno a uno y se responde; un aviso
// es uno a muchos, se lee y queda a la vista. Como los «Anuncios» de Canvas y Classroom.

export type TipoAviso = 'aviso' | 'citacion' | 'recordatorio'

export interface AvisoClase {
  id: number
  classId: number
  clase: string
  tipo: TipoAviso
  titulo: string
  cuerpo: string
  fechaEvento: string | null
  lugar: string | null
  createdAt: string
}

export const TIPOS_AVISO: Array<{ valor: TipoAviso; texto: string; ayuda: string; conFecha: boolean }> = [
  { valor: 'aviso', texto: 'Aviso', ayuda: 'Una información para todos: un cambio, un informe.', conFecha: false },
  { valor: 'citacion', texto: 'Citación', ayuda: 'Que vengan a un lugar un día y una hora.', conFecha: true },
  { valor: 'recordatorio', texto: 'Recordatorio', ayuda: 'Algo que no deben olvidar, con fecha si la tiene.', conFecha: true },
]

export const nombreTipoAviso = (t: TipoAviso) => TIPOS_AVISO.find((x) => x.valor === t)?.texto ?? 'Aviso'

/** «jueves 15 de octubre, 8:00 a. m.»: la fecha de una citación, completa, para que nadie la malinterprete. */
export function fechaDeEvento(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const dia = d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
  const hora = d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })
  return `${dia}, ${hora}`
}

export interface FormularioAviso { tipo: TipoAviso; titulo: string; cuerpo: string; fecha: string; lugar: string }

/**
 * Lo que se envía al servidor. La fecha del formulario (`datetime-local`, sin zona) se convierte aquí a ISO: el servidor
 * no sabe en qué zona está el docente. Un aviso sin fecha no la manda aunque el campo haya quedado escrito.
 */
export function avisoParaEnviar(f: FormularioAviso): Record<string, unknown> {
  const conFecha = TIPOS_AVISO.find((t) => t.valor === f.tipo)?.conFecha ?? false
  const fecha = conFecha && f.fecha ? new Date(f.fecha) : null
  return {
    tipo: f.tipo,
    titulo: f.titulo.trim(),
    cuerpo: f.cuerpo.trim(),
    fechaEvento: fecha && !Number.isNaN(fecha.getTime()) ? fecha.toISOString() : null,
    lugar: conFecha && f.lugar.trim() ? f.lugar.trim() : null,
  }
}

/** Qué falta para poder publicar (null si nada): se dice junto al botón, no después de fallar. */
export function faltaEnAviso(f: FormularioAviso, claseId: number): string | null {
  if (!claseId) return 'Elige la clase.'
  if (f.titulo.trim().length < 3) return 'Ponle un título corto.'
  if (!f.cuerpo.trim()) return 'Escribe el aviso.'
  if (f.tipo === 'citacion' && !f.fecha) return 'Una citación necesita el día y la hora.'
  return null
}
