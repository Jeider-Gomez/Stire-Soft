// Plantillas compartidas (docs/DISENO_CLASES_Y_DOCENTES.md): un docente comparte el CONTENIDO de su clase y otros
// docentes lo copian a sus propias clases. Se copia, nunca se enlaza; estudiantes, entregas y notas no se comparten.

/** GET /reuse/plantillas */
export interface Plantilla {
  classId: number; nombre: string; codigo: string; docente: string
  modulos: number; lecciones: number; ejercicios: number
}

/** «Fundamentos de Algoritmia (ALGO-203413) · Laura Martínez · 3 módulos, 17 lecciones» */
export function textoPlantilla(p: Plantilla): string {
  const n = (x: number, uno: string, varios: string) => `${x} ${x === 1 ? uno : varios}`
  return `${p.nombre} (${p.codigo}) · ${p.docente} · ${n(p.modulos, 'módulo', 'módulos')}, ${n(p.lecciones, 'lección', 'lecciones')}`
}
