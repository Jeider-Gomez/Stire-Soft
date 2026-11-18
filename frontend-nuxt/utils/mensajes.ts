// Mensajes entre estudiante y docente: tipos y reglas puras que comparten las dos bandejas
// (composables/useMensajes.ts, components/mensajes/).

export interface UsuarioMensaje { id: number; fullName: string; email: string }

export interface Mensaje {
  id: number
  senderId: number
  receiverId: number
  content: string
  isRead: boolean
  createdAt: string
  /** Imagen adjunta: se pide con GET /message/:id/imagen (sugerencia n.º 13). */
  imagenId?: string | null
  /** Cuándo se editó el texto; la bandeja muestra «Editado». */
  editadoEn?: string | null
  sender?: UsuarioMensaje
  receiver?: UsuarioMensaje
}

export type Bandeja = 'recibidos' | 'enviados'

/** Hoy: la hora («10:42»); antes: el día y el mes («3 oct»). */
export function fechaMensaje(iso: string, ahora: Date = new Date()): string {
  const d = new Date(iso)
  if (ahora.getTime() - d.getTime() < 86_400_000 && d.getDate() === ahora.getDate()) {
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

/** Con quién es el mensaje: quien lo envió (en recibidos) o a quien se envió (en enviados). */
export function otraPersona(m: Mensaje, bandeja: Bandeja): string {
  const u = bandeja === 'recibidos' ? m.sender : m.receiver
  const id = bandeja === 'recibidos' ? m.senderId : m.receiverId
  return u?.fullName || `Usuario #${id}`
}

/** Un mensaje largo se muestra recortado hasta abrirlo. */
export const LARGO_VISTA_PREVIA = 160
export function esLargo(m: Pick<Mensaje, 'content'>): boolean {
  return m.content.length > LARGO_VISTA_PREVIA || m.content.includes('\n')
}

// ─── La conversación con el profe (17/11; cuadro «E-Clase-Mensajes»): un chat, no una bandeja de correo ───

/** Los mensajes entre la persona y `otroId`, del más viejo al más nuevo (así se lee un chat). */
export function conversacionCon<M extends Pick<Mensaje, 'id' | 'senderId' | 'receiverId' | 'createdAt'>>(mensajes: M[], otroId: number): M[] {
  const vistos = new Set<number>()
  return mensajes
    .filter((m) => (m.senderId === otroId || m.receiverId === otroId) && !vistos.has(m.id) && vistos.add(m.id))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() || a.id - b.id)
}

/** El separador de cada día del chat: «Hoy», «Ayer» o «Martes 4 nov». */
export function diaDeMensaje(iso: string, ahora: Date = new Date()): string {
  const d = new Date(iso)
  const dia = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const dias = Math.round((dia(ahora) - dia(d)) / 86_400_000)
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  const texto = d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' }).replace(',', '').replace(/ de /g, ' ').replace(/\.$/, '')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** La hora de un mensaje: «4:12 p. m.». */
export const horaDeMensaje = (iso: string) => new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })
