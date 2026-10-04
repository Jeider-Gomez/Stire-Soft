import { onBeforeUnmount, onMounted, ref } from 'vue'

/** Si el navegador tiene conexión (MOB-04 de la lista de chequeo). Arranca con navigator.onLine y sigue los eventos. */
export function useConexion() {
  const enLinea = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
  const actualizar = () => { enLinea.value = navigator.onLine }
  onMounted(() => {
    actualizar()
    window.addEventListener('online', actualizar)
    window.addEventListener('offline', actualizar)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('online', actualizar)
    window.removeEventListener('offline', actualizar)
  })
  return { enLinea }
}
