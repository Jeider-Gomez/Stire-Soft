// La lección v3 (Fase D, paso 2; cuadros «E-Leccion» y «E-Leccion-Cerrado» del lienzo): dónde está la lección dentro del
// curso, para la portada («TEMA 2 · LECCIÓN 2 DE 2») y la miga de pan, y el anillo de la meta de la barra de arriba.

interface Unidad { id: number }
interface Tema { title: string; units: ReadonlyArray<Unidad> }
interface Modulo { title: string; topics: ReadonlyArray<Tema>; units: ReadonlyArray<Unidad> }

export interface UbicacionLeccion {
  modulo: string | null
  /** El tema solo si agrupa más de una lección (si no, repite el nombre de la lección). */
  tema: string | null
  /** «MÓDULO 1 · TEMA 2 · LECCIÓN 2 DE 2»; sin tema propio, la posición va dentro del módulo. */
  rotulo: string | null
}

export function ubicacionLeccion(modulos: ReadonlyArray<Modulo>, unitId: number): UbicacionLeccion {
  for (const [m, mod] of modulos.entries()) {
    for (const [t, tema] of mod.topics.entries()) {
      const i = tema.units.findIndex((u) => u.id === unitId)
      if (i < 0) continue
      if (tema.units.length > 1) {
        return { modulo: mod.title, tema: tema.title, rotulo: `Módulo ${m + 1} · Tema ${t + 1} · Lección ${i + 1} de ${tema.units.length}` }
      }
      const enModulo = mod.units.findIndex((u) => u.id === unitId)
      return { modulo: mod.title, tema: null, rotulo: `Módulo ${m + 1} · Lección ${enModulo + 1} de ${mod.units.length}` }
    }
  }
  return { modulo: null, tema: null, rotulo: null }
}

/** El anillo pequeño de la barra: la parte llena es el dominio y la marca, la meta (como la línea de la barra). */
export function anilloMeta(dominio: number, meta: number, radio = 14) {
  const largo = 2 * Math.PI * radio
  const d = Math.max(0, Math.min(100, dominio))
  return {
    largo: Number(largo.toFixed(1)),
    lleno: Number((largo * (1 - d / 100)).toFixed(1)),
    marca: Number((-largo * (meta / 100)).toFixed(1)),
    lectura: `Tu dominio de esta lección: ${d} % de una meta de ${meta} %. Ir a practicar.`,
  }
}
