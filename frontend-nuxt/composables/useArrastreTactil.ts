/**
 * Arrastrar con el dedo (17/11, Jeider: «que el ejercicio de arrastrar sea arrastrable en el teléfono»).
 *
 * El arrastre nativo del navegador (`draggable`, `dragstart`, `drop`) solo responde al ratón: en el celular el dedo
 * desplazaba la página y había que tocar la pieza y luego la zona. Esto lo hace con eventos de puntero, solo para dedo y
 * lápiz (el ratón sigue con el arrastre nativo):
 *  · la pieza empieza a moverse al pasar de UMBRAL_PX (un toque sin mover sigue siendo un toque: seleccionar);
 *  · una copia de la pieza sigue al dedo y la zona que está debajo (`data-zona`) se avisa en cada movimiento;
 *  · cerca del borde de arriba o de abajo la página se desplaza sola, para llegar a zonas que no se ven;
 *  · al soltar fuera de toda zona, la pieza vuelve a su lugar.
 * La pieza que se arrastra necesita `touch-action: none` (clase `arrastre-tactil`, en exercise-common.css o el
 * componente) para que el navegador no se lleve el dedo a desplazar la página.
 */
export const UMBRAL_PX = 8
const BORDE_PX = 72
const PASO_PX = 14

/** ¿El dedo ya se movió lo bastante para que sea un arrastre y no un toque? */
export function esArrastre(dx: number, dy: number, umbral = UMBRAL_PX): boolean {
  return Math.hypot(dx, dy) >= umbral
}

/** Cuánto desplazar la página con el dedo a `y` (negativo: hacia arriba). */
export function desplazamientoEnBorde(y: number, alto: number, borde = BORDE_PX, paso = PASO_PX): number {
  if (y < borde) return -paso
  if (y > alto - borde) return paso
  return 0
}

interface Opciones {
  alEmpezar: (id: string) => void
  alMover: (zona: string | null) => void
  /** `zona` es null si se soltó fuera de toda zona. */
  alSoltar: (zona: string | null) => void
}

export function useArrastreTactil(op: Opciones) {
  let inicio: { id: string; x: number; y: number; el: HTMLElement } | null = null
  let fantasma: HTMLElement | null = null
  let arrastrando = false
  // Con espera (mantener presionado): mientras corre, mover el dedo desplaza la página; al cumplirse, empieza el arrastre.
  let temporizador: ReturnType<typeof setTimeout> | null = null
  let conEspera = false

  function zonaEn(x: number, y: number): string | null {
    const el = document.elementFromPoint(x, y)
    return (el?.closest('[data-zona]') as HTMLElement | null)?.dataset.zona ?? null
  }

  function crearFantasma(el: HTMLElement) {
    const r = el.getBoundingClientRect()
    const copia = el.cloneNode(true) as HTMLElement
    copia.removeAttribute('id')
    copia.setAttribute('aria-hidden', 'true')
    Object.assign(copia.style, {
      position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, margin: '0',
      zIndex: '1000', pointerEvents: 'none', opacity: '0.92', boxShadow: '0 10px 24px rgba(20,33,61,.25)',
      transition: 'none', willChange: 'transform',
    })
    document.body.appendChild(copia)
    return copia
  }

  function mover(e: PointerEvent) {
    if (!inicio) return
    const dx = e.clientX - inicio.x
    const dy = e.clientY - inicio.y
    if (!arrastrando) {
      if (!esArrastre(dx, dy)) return
      // Se movió antes de cumplir la espera: es desplazar la página, no arrastrar.
      if (conEspera) { limpiar(); return }
      arrancar()
    }
    e.preventDefault()
    if (fantasma) fantasma.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`
    const paso = desplazamientoEnBorde(e.clientY, window.innerHeight)
    if (paso) window.scrollBy(0, paso)
    op.alMover(zonaEn(e.clientX, e.clientY))
  }

  function arrancar() {
    if (!inicio) return
    arrastrando = true
    fantasma = crearFantasma(inicio.el)
    op.alEmpezar(inicio.id)
    navigator.vibrate?.(8)
  }

  /** Mientras se arrastra, el dedo no desplaza la página (en una fila que sí deja desplazar: `touch-action` normal). */
  function frenarDesplazamiento(t: TouchEvent) {
    if (arrastrando && t.cancelable) t.preventDefault()
  }

  function soltar(e: PointerEvent) {
    if (arrastrando) {
      op.alSoltar(zonaEn(e.clientX, e.clientY))
      // El dedo que suelta puede «tocar» lo que hay debajo: ese clic no cuenta.
      const bloquear = (c: Event) => { c.stopPropagation(); c.preventDefault() }
      window.addEventListener('click', bloquear, { capture: true, once: true })
      setTimeout(() => window.removeEventListener('click', bloquear, { capture: true }), 60)
    }
    limpiar()
  }

  function cancelar() {
    if (arrastrando) op.alSoltar(null)
    limpiar()
  }

  function limpiar() {
    fantasma?.remove()
    fantasma = null
    inicio = null
    arrastrando = false
    conEspera = false
    if (temporizador) clearTimeout(temporizador)
    temporizador = null
    window.removeEventListener('touchmove', frenarDesplazamiento)
    window.removeEventListener('pointermove', mover)
    window.removeEventListener('pointerup', soltar)
    window.removeEventListener('pointercancel', cancelar)
  }

  /**
   * En `@pointerdown` de la pieza. El ratón no entra aquí: usa el arrastre nativo.
   * Sin `espera`, la pieza (con `touch-action: none`) se arrastra apenas se mueve el dedo. Con `espera` (ms), hay que
   * mantenerla presionada ese tiempo: así una fila grande deja desplazar la página con un deslizamiento rápido.
   */
  function empezar(e: PointerEvent, id: string, opciones: { espera?: number; pieza?: HTMLElement } = {}) {
    if (e.pointerType === 'mouse' || e.button > 0) return
    limpiar()
    inicio = { id, x: e.clientX, y: e.clientY, el: opciones.pieza ?? (e.currentTarget as HTMLElement) }
    if (opciones.espera) {
      conEspera = true
      temporizador = setTimeout(() => { temporizador = null; if (inicio && !arrastrando) arrancar() }, opciones.espera)
    }
    window.addEventListener('touchmove', frenarDesplazamiento, { passive: false })
    window.addEventListener('pointermove', mover, { passive: false })
    window.addEventListener('pointerup', soltar)
    window.addEventListener('pointercancel', cancelar)
  }

  // En una pantalla táctil (celular, tableta) se apaga el arrastre nativo: si el dedo se queda quieto un momento antes de
  // moverse, el navegador empezaba su propio arrastre y cancelaba este (pointercancel). Con ratón se queda el nativo.
  const arrastreNativo = ref(true)
  onMounted(() => { arrastreNativo.value = !window.matchMedia?.('(pointer: coarse)').matches })

  onBeforeUnmount(limpiar)
  return { empezar, arrastreNativo }
}
