/**
 * Mientras un panel que ocupa la pantalla del celular está abierto, la página de atrás no se desplaza (07/10, Jeider: al
 * bajar por las notificaciones también bajaba el inicio). `overscroll-behavior` no alcanza: si la lista es corta, o en
 * Safari de iPhone, el gesto pasa igual a la página. En el computador el panel es flotante y la página sigue libre.
 */
export const MEDIA_MOVIL = '(max-width: 639px)'

export function useBloqueoScrollMovil(abierto: () => boolean) {
  let bloqueado = false
  const soltar = () => {
    if (!bloqueado) return
    document.documentElement.style.overflow = ''
    bloqueado = false
  }
  watch(abierto, (si) => {
    if (typeof window === 'undefined') return
    if (si && window.matchMedia(MEDIA_MOVIL).matches) {
      document.documentElement.style.overflow = 'hidden'
      bloqueado = true
    } else {
      soltar()
    }
  })
  onUnmounted(soltar)
}
