// «Mi clase» v3 (Fase D, paso 5; cuadros «E-Clase-Notas», «E-Clase-Asistencia», «E-Clase-Entregas», «E-Clase-Refuerzos» y
// «E-Clase-Mensajes»): lo que llega del profe, reunido bajo una cabecera con cinco pestañas. Cada pestaña es una pantalla.
import type { EstadoEntrega } from '~/utils/entregas'

export const PESTANAS_CLASE = [
  { ruta: '/estudiante/clase', texto: 'Notas' },
  { ruta: '/estudiante/asistencia', texto: 'Asistencia' },
  { ruta: '/estudiante/clase/entregas', texto: 'Entregas' },
  { ruta: '/estudiante/clase/refuerzos', texto: 'Refuerzos y retos' },
  { ruta: '/estudiante/mensajes', texto: 'Avisos y mensajes' },
] as const

/** La pestaña de una ruta (con o sin barra final); null si no es de «Mi clase». */
export function pestanaDeRuta(ruta: string): string | null {
  const limpia = ruta.replace(/\/+$/, '') || '/'
  return PESTANAS_CLASE.find((p) => p.ruta === limpia)?.ruta ?? null
}

/** «Mi clase» del menú se marca en cualquiera de sus pestañas, en una entrega o en un refuerzo. */
export function enMiClase(ruta: string): boolean {
  return pestanaDeRuta(ruta) !== null || ruta.startsWith('/estudiante/entregas/') || ruta.startsWith('/estudiante/refuerzos/')
}

/** Una entrega en la lista: qué falta y la pastilla de su estado (sin rojo: una cerrada no es un error). */
export function filaEntrega(e: { estado: EstadoEntrega; cierraAt: string | null; versionesUsadas: number; limite: number }, nota: string | null, ahora = Date.now()): { detalle: string; pastilla: string; tono: 'sol' | 'menta' | 'gris' } {
  if (e.estado === 'revisada') return { detalle: 'Revisada por tu profe', pastilla: nota ?? 'Revisada', tono: 'menta' }
  if (e.estado === 'por_revisar') return { detalle: `Entregada · ${e.versionesUsadas} de ${e.limite} ${e.limite === 1 ? 'versión' : 'versiones'}`, pastilla: 'Por revisar', tono: 'gris' }
  if (!e.cierraAt) return { detalle: 'Sin fecha de cierre', pastilla: 'Por entregar', tono: 'sol' }
  const fecha = new Date(e.cierraAt)
  // Días de Colombia, no horas: lo que cierra esta noche «vence hoy» aunque falten pocas horas.
  const dia = (t: number) => Date.parse(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).format(t))
  const dias = Math.round((dia(fecha.getTime()) - dia(ahora)) / 86_400_000)
  const cuando = fecha.toLocaleString('es-CO', { weekday: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Bogota' })
  if (dias < 0) return { detalle: `Cerró el ${cuando}`, pastilla: 'Cerrada', tono: 'gris' }
  return { detalle: `Vence el ${cuando}`, pastilla: dias === 0 ? 'Vence hoy' : 'Por entregar', tono: 'sol' }
}

/** Refuerzos y retos: los que faltan arriba (primero los que tienen fecha más cercana) y los terminados aparte. */
export function ordenarRefuerzos<T extends { totalPasos: number; pasosHechos: number; fechaLimite: string | null }>(lista: ReadonlyArray<T>): { pendientes: T[]; terminados: T[] } {
  const hecho = (r: T) => r.totalPasos > 0 && r.pasosHechos >= r.totalPasos
  const fecha = (r: T) => (r.fechaLimite ? new Date(r.fechaLimite).getTime() : Number.POSITIVE_INFINITY)
  return {
    pendientes: lista.filter((r) => !hecho(r)).sort((a, b) => fecha(a) - fecha(b)),
    terminados: lista.filter(hecho),
  }
}
