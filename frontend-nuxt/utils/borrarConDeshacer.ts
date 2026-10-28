// Borrar con «Deshacer» (ítem 8 de la evaluación heurística, docs/calidad/EVALUACION_HEURISTICA_PLAN_A_5.md): lo
// borrado desaparece de la pantalla al instante, pero el servidor recién lo borra cuando se cierra el aviso (6 s, lo
// mismo que dura en pantalla, composables/useAvisos.ts). Mientras tanto, «Deshacer» lo devuelve a su lugar. Si se
// cierra la pestaña antes, no se borra nada: el error queda del lado seguro.

export const ESPERA_DESHACER_MS = 6000

export interface BorradoConDeshacer {
  /** Lo devuelve a la pantalla y cancela el borrado, si todavía no se hizo. */
  deshacer: () => void
}

export function borrarConDeshacer(o: {
  /** Lo quita de la pantalla. */
  quitar: () => void
  /** Lo vuelve a poner donde estaba. */
  reponer: () => void
  /** El borrado en el servidor. */
  borrar: () => Promise<unknown>
  /** Si el servidor no pudo borrarlo (ya se repuso en la pantalla). */
  alFallar?: (err: unknown) => void
  ms?: number
  programar?: (fn: () => void, ms: number) => unknown
  cancelar?: (t: unknown) => void
}): BorradoConDeshacer {
  const programar = o.programar ?? ((fn, ms) => setTimeout(fn, ms))
  const cancelar = o.cancelar ?? ((t) => clearTimeout(t as ReturnType<typeof setTimeout>))
  let pendiente = true
  o.quitar()
  const t = programar(() => {
    if (!pendiente) return
    pendiente = false
    o.borrar().catch((err: unknown) => {
      o.reponer()
      o.alFallar?.(err)
    })
  }, o.ms ?? ESPERA_DESHACER_MS)
  return {
    deshacer() {
      if (!pendiente) return
      pendiente = false
      cancelar(t)
      o.reponer()
    },
  }
}

/** Quita un elemento de una lista y devuelve cómo reponerlo en la misma posición. */
export function quitarDeLista<T>(lista: T[], esEl: (x: T) => boolean): { quitar: () => void; reponer: () => void } {
  const i = lista.findIndex(esEl)
  const item = i >= 0 ? lista[i] : undefined
  return {
    quitar: () => { const j = lista.findIndex(esEl); if (j >= 0) lista.splice(j, 1) },
    reponer: () => { if (item !== undefined && !lista.some(esEl)) lista.splice(Math.min(i, lista.length), 0, item) },
  }
}
