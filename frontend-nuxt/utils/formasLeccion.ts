// Otras formas de la misma lección para quien marcó «No me quedó claro» (UI-04 y UI-01, Caro 2015). Pedro (S09-V-PEDRO,
// 16/10): STIRE ofrecía «escúchala o mira el diagrama» aunque la lección no tuviera diagrama; ahora ofrece solo las formas
// que esa lección sí trae, y cada botón lleva a ella. Las marcas `data-forma` las ponen ContenidoLeccion y LessonResource.

export interface FormaLeccion { selector: string; texto: string }

export const FORMAS: FormaLeccion[] = [
  { selector: '[data-forma="algoritmo"]', texto: 'Verlo como diagrama o paso a paso' },
  { selector: '[data-forma="vivo"]', texto: 'Probar el ejemplo en vivo' },
  { selector: '[data-forma="recurso"]', texto: 'Ver el video o recurso' },
  { selector: '#escuchar-leccion', texto: 'Escuchar la lección' },
]

/** Las formas que la página tiene; `hay` dice si un selector existe (en el navegador, document.querySelector). */
export function formasDisponibles(hay: (selector: string) => boolean): FormaLeccion[] {
  return FORMAS.filter((f) => hay(f.selector))
}
