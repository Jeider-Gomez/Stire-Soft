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
