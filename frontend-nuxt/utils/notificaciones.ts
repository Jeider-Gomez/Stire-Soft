// La campana (components/layout/NotificationBell.vue). 12/10, Jeider: «se acumulan mucho». Como en GitHub, LinkedIn o
// Instagram: ver solo las que no has leído, agrupadas por día, y poder borrar las que ya no sirven.

export type TipoNotificacion = 'grade' | 'review_schedule' | 'message' | 'info' | 'aviso'
export interface NotificacionCampana {
  id: number
  title: string
  message: string
  isRead: boolean
  type: TipoNotificacion
  enlace?: string | null
  createdAt: string
}
export type GrupoFecha = 'Hoy' | 'Ayer' | 'Esta semana' | 'Antes'

const DIA = 24 * 60 * 60 * 1000
const inicioDelDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

/** «ahora», «hace 5 min», «hace 3 h» o la fecha corta. */
export function haceCuanto(fecha: string, ahora: Date = new Date()): string {
  const d = new Date(fecha)
  const minutos = Math.round((ahora.getTime() - d.getTime()) / 60000)
  if (minutos < 1) return 'ahora'
  if (minutos < 60) return `hace ${minutos} min`
  if (minutos < 24 * 60) return `hace ${Math.round(minutos / 60)} h`
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

/** El grupo por día (hora local del equipo). */
export function grupoDeFecha(fecha: string, ahora: Date = new Date()): GrupoFecha {
  const dias = Math.round((inicioDelDia(ahora) - inicioDelDia(new Date(fecha))) / DIA)
  if (dias <= 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7) return 'Esta semana'
  return 'Antes'
}

/** La lista que se ve: con el filtro «Sin leer», solo esas; agrupadas por día, en el orden en que llegan (más nueva arriba). */
export function agruparNotificaciones<T extends Pick<NotificacionCampana, 'isRead' | 'createdAt'>>(
  lista: T[],
  soloSinLeer: boolean,
  ahora: Date = new Date(),
): Array<{ grupo: GrupoFecha; items: T[] }> {
  const grupos: Array<{ grupo: GrupoFecha; items: T[] }> = []
  for (const n of lista) {
    if (soloSinLeer && n.isRead) continue
    const g = grupoDeFecha(n.createdAt, ahora)
    const ultimo = grupos[grupos.length - 1]
    if (ultimo?.grupo === g) ultimo.items.push(n)
    else grupos.push({ grupo: g, items: [n] })
  }
  return grupos
}

/** Qué decir cuando la lista filtrada queda vacía. */
export function textoVacio(soloSinLeer: boolean, hayLeidas: boolean): string {
  if (soloSinLeer && hayLeidas) return 'No tienes notificaciones sin leer.'
  return 'Estás al día.'
}
