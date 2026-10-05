// Mantiene el Tab dentro de una ventana modal (WCAG 2.4.3, orden del foco): del último control vuelve al primero y al
// revés. Antes estaba copiado cinco veces en el panel del admin.

const ENFOCABLES = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'

export function atraparFoco(evento: KeyboardEvent, contenedor: HTMLElement | null): void {
  if (evento.key !== 'Tab' || !contenedor) return
  const enfocables = Array.from(contenedor.querySelectorAll<HTMLElement>(ENFOCABLES))
  if (!enfocables.length) return
  const primero = enfocables[0]
  const ultimo = enfocables[enfocables.length - 1]
  if (evento.shiftKey && document.activeElement === primero) {
    evento.preventDefault()
    ultimo.focus()
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault()
    primero.focus()
  }
}
