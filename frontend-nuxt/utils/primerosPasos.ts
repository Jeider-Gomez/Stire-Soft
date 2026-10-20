/**
 * Lista de primeros pasos del estudiante (docs/PLAN_AYUDA_AL_USUARIO.md, frente B.2). Cinco cosas que conviene hacer la
 * primera semana, con su avance a la vista y la opción de ocultarla, como las listas de inicio de Notion o de GitHub.
 * Aprender haciendo: cada paso se marca solo cuando la persona lo hace, no al leerlo.
 *
 * Se recuerda en el navegador, por persona: es una ayuda para empezar, no un registro (si se borra, solo vuelve a salir).
 */

export type IdPrimerPaso = 'clase' | 'leccion' | 'ejercicio' | 'tutor' | 'repasos'

export interface PrimerPaso {
  id: IdPrimerPaso
  texto: string
  /** Para qué sirve, en pocas palabras. */
  detalle: string
  /** A dónde lleva el enlace del paso. */
  enlace: string
}

export const PRIMEROS_PASOS: PrimerPaso[] = [
  { id: 'clase', texto: 'Únete a tu clase', detalle: 'Con el código o el QR de tu docente.', enlace: '/estudiante/clases' },
  { id: 'leccion', texto: 'Abre una lección', detalle: 'Desde el plan del curso, en el menú.', enlace: '/ayuda#estudiar-una-leccion' },
  { id: 'ejercicio', texto: 'Abre un ejercicio y prueba tu código', detalle: '«Probar código» no gasta intentos.', enlace: '/ayuda#resolver-un-ejercicio' },
  { id: 'tutor', texto: 'Pregúntale algo al Tutor', detalle: 'Te guía sin darte la respuesta.', enlace: '/ayuda#pedir-ayuda-al-tutor' },
  { id: 'repasos', texto: 'Mira tus repasos', detalle: 'Así no se te olvida lo que aprendes.', enlace: '/estudiante/repasos' },
]

/** El paso que se cumple al entrar a una ruta (la clase y el Tutor se cumplen por otro lado). */
export function pasoDeRuta(ruta: string): IdPrimerPaso | null {
  if (ruta.startsWith('/estudiante/unidad/')) return 'leccion'
  if (ruta.startsWith('/estudiante/evaluacion/')) return 'ejercicio'
  if (ruta.replace(/\/+$/, '') === '/estudiante/repasos') return 'repasos'
  return null
}

/** Cuántos van y si ya terminó. */
export function avancePrimerosPasos(hechos: ReadonlyArray<IdPrimerPaso>): { hechos: number; total: number; terminado: boolean } {
  const n = PRIMEROS_PASOS.filter((p) => hechos.includes(p.id)).length
  return { hechos: n, total: PRIMEROS_PASOS.length, terminado: n === PRIMEROS_PASOS.length }
}

export function clavePrimerosPasos(usuarioId: number | string | null | undefined): string {
  return `stire-primeros-pasos-${usuarioId ?? 'anonimo'}`
}
