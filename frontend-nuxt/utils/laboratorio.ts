// El Laboratorio (v3, Fase D, paso 6; cuadros «E-Laboratorio», «E-Laboratorio-Proyecto» y «E-Proyectos»). Sin imports:
// las pruebas cargan este archivo solo.

export type AlcanceLaboratorio = 'clase' | 'universidad'
type Tipo = 'web' | 'javascript' | 'pseudocodigo' | 'diagrama'

/** Los filtros de arriba: de dónde (Mi clase / Toda la Universidad) y de qué tipo. */
export const FILTROS_TIPO: ReadonlyArray<{ tipo: Tipo | null; texto: string }> = [
  { tipo: null, texto: 'Todos' },
  { tipo: 'web', texto: 'Páginas web' },
  { tipo: 'javascript', texto: 'JavaScript' },
  { tipo: 'pseudocodigo', texto: 'Pseudocódigo' },
  { tipo: 'diagrama', texto: 'Diagramas' },
]

/** Los cuatro tipos al crear, con lo que hace cada uno (E-Proyectos). */
export const TIPOS_NUEVO: ReadonlyArray<{ tipo: Tipo; texto: string; detalle: string }> = [
  { tipo: 'web', texto: 'Página web', detalle: 'HTML, CSS y JavaScript, con la página a la vista' },
  { tipo: 'javascript', texto: 'JavaScript', detalle: 'Programas que leen datos y muestran resultados' },
  { tipo: 'pseudocodigo', texto: 'Pseudocódigo', detalle: 'Algoritmos al estilo PSeInt que se pueden ejecutar' },
  { tipo: 'diagrama', texto: 'Diagrama de flujo', detalle: 'Figuras unidas con flechas que también se ejecutan' },
]

/**
 * «¿No sabes qué crear?»: ideas para empezar. Abren «Nuevo proyecto» con el nombre y el tipo puestos. No dicen qué ya
 * sabe el estudiante ni cuánto tarda: eso no lo sabemos.
 */
export const IDEAS_LABORATORIO: ReadonlyArray<{ emoji: string; titulo: string; tipo: Tipo; pista: string }> = [
  { emoji: '🧾', titulo: 'Calculadora de propinas', tipo: 'javascript', pista: 'Lee la cuenta y cuántos son, y muestra cuánto pone cada uno.' },
  { emoji: '🎂', titulo: 'Tarjeta de cumpleaños', tipo: 'web', pista: 'Una página con un botón que muestra una sorpresa.' },
  { emoji: '🔀', titulo: 'Diagrama de tu rutina', tipo: 'diagrama', pista: 'Tu mañana con una decisión: ¿llueve? ¿hay clase?' },
]

/** La dirección de «Nuevo proyecto» con una idea puesta. */
export function enlaceIdea(idea: { titulo: string; tipo: Tipo }): string {
  return `/estudiante/proyectos?nuevo=${idea.tipo}&nombre=${encodeURIComponent(idea.titulo)}#nuevo-proyecto`
}

/** Cuántas publicaciones de otros llegaron después de la última visita (sin visita guardada, ninguna es «nueva»). */
export function cuantasNuevas(lista: ReadonlyArray<{ createdAt: string; esMia: boolean }>, ultimaVisita: number | null): number {
  if (!ultimaVisita) return 0
  return lista.filter((p) => !p.esMia && Date.parse(p.createdAt) > ultimaVisita).length
}

/** «hace 2 h», «ayer», «el 3 de nov.». */
export function haceCuanto(iso: string, ahora = Date.now()): string {
  const min = Math.round((ahora - Date.parse(iso)) / 60_000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  if (d === 1) return 'ayer'
  if (d < 7) return `hace ${d} días`
  return `el ${new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', timeZone: 'America/Bogota' })}`
}

export function textoAlcance(alcance: AlcanceLaboratorio): string {
  return alcance === 'universidad' ? 'visible para toda la universidad' : 'visible para tu clase'
}

/** Comienzos de mensaje amables (E-Laboratorio-Proyecto): tocar uno lo escribe en la caja. */
export const COMIENZOS_MENSAJE = ['Me gustó…', '¿Cómo hiciste…?'] as const
