// El foco vuelve a donde estaba al cerrar una ventana (ítem 11 de la evaluación heurística, docs/calidad/
// EVALUACION_HEURISTICA_PLAN_A_5.md): quien navega con teclado o lector de pantalla sigue donde iba, no al inicio de la página.

/** Recuerda lo que tiene el foco ahora (al abrir) y devuelve la función que se lo regresa (al cerrar). */
export function recordarFoco(): () => void {
  const previo = typeof document === 'undefined' ? null : (document.activeElement as HTMLElement | null)
  return () => {
    if (!previo || previo === document.body) return
    // Después de que la ventana salga del DOM; si el botón ya no existe (se navegó a otra página), no se hace nada.
    setTimeout(() => { if (previo.isConnected) previo.focus() }, 0)
  }
}
