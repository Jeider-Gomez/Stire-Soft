// Cambio de tema con un círculo que crece desde donde se tocó y revela los colores nuevos (como el de remotion.dev;
// pedido por Jeider, 16/11). Usa la View Transitions API: el navegador toma una foto de la página, aplica el cambio y
// recorta la página nueva con un círculo que se agranda. Sin la API, o con «reducir movimiento» (del sistema o de
// STIRE), el cambio es inmediato, como antes.

let ultimoToque: { x: number; y: number } | null = null
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', (e) => { ultimoToque = { x: e.clientX, y: e.clientY } }, { capture: true, passive: true })
  // Con teclado no hay puntero: el círculo sale del control que tiene el foco.
  window.addEventListener('keydown', () => { ultimoToque = null }, { capture: true, passive: true })
}

type DocumentoConTransicion = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }

/** El centro del círculo: el último toque, o el control con el foco, o el centro de la pantalla. */
export function origenDelCirculo(): { x: number; y: number } {
  if (ultimoToque) return ultimoToque
  const r = document.activeElement?.getBoundingClientRect()
  if (r && r.width) return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}

/** Radio que cubre toda la ventana desde (x, y): la distancia a la esquina más lejana. */
export function radioHastaLaEsquina(x: number, y: number, ancho: number, alto: number): number {
  return Math.hypot(Math.max(x, ancho - x), Math.max(y, alto - y))
}

export function cambiarConCirculo(aplicar: () => void, menosMovimiento = false): void {
  const doc = document as DocumentoConTransicion
  const quieto = menosMovimiento || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (quieto || typeof doc.startViewTransition !== 'function') { aplicar(); return }
  const { x, y } = origenDelCirculo()
  const radio = radioHastaLaEsquina(x, y, window.innerWidth, window.innerHeight)
  const transicion = doc.startViewTransition(aplicar)
  transicion.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radio}px at ${x}px ${y}px)`] },
      { duration: 550, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
    )
  }).catch(() => { /* si la transición se cancela, el tema ya quedó aplicado */ })
}
