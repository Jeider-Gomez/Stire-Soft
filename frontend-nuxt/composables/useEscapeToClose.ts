import { onBeforeUnmount, onMounted } from 'vue'

/**
 * useEscapeToClose — cierra un diálogo con la tecla Escape mientras esté abierto, AUNQUE EL FOCO NO ESTÉ dentro.
 *
 * Los diálogos ya manejaban Escape con `@keydown` sobre su propio elemento, y eso solo funciona si el foco está
 * dentro. Se perdía el foco al deshabilitarse el botón de enviar durante una petición (tras un error, Escape
 * dejaba el diálogo abierto y su capa seguía absorbiendo los clics), y el modal de lecciones nunca recibía el foco.
 *
 * El escuchador va en `document`. Si el foco sí estaba dentro, el manejador del propio diálogo corre primero,
 * lo cierra y aquí `isOpen()` ya es falso: no se cierra dos veces.
 *
 * @param isOpen getter que dice si el diálogo está abierto (p. ej. `() => showRegisterModal.value`)
 * @param close  función que lo cierra (la misma del botón «Cancelar»)
 */
export function useEscapeToClose(isOpen: () => boolean, close: () => void) {
  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape' || event.defaultPrevented) return
    if (isOpen()) close()
  }

  onMounted(() => document.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
}
