import { onBeforeUnmount, onMounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { PREGUNTA_SALIR, vigilarCambios } from '~/utils/cambiosSinGuardar'

/**
 * Pregunta antes de perder lo escrito en un editor (ítem 13): al cambiar de página, al cerrar la ventana con la X,
 * Escape, el fondo o «Cancelar», y al cerrar o recargar la pestaña (ahí el aviso es el del navegador).
 *
 *   const { puedeSalir, guardado } = useSalirSinGuardar(() => ({ ...f }))
 *   <AdminDialogo :antes-de-cerrar="puedeSalir" …>   ·   tras guardar: guardado()
 */
export function useSalirSinGuardar(datos: () => unknown) {
  const { sucio, guardado } = vigilarCambios(datos)
  const { confirmar } = useConfirmar()
  // Escape llega a la vez a la ventana y al diálogo de la pregunta: mientras se pregunta, no se vuelve a preguntar.
  let preguntando = false

  async function puedeSalir(): Promise<boolean> {
    if (!sucio()) return true
    if (preguntando) return false
    preguntando = true
    try {
      return await confirmar({ ...PREGUNTA_SALIR })
    } finally {
      preguntando = false
    }
  }

  function alCerrarPestana(e: BeforeUnloadEvent) {
    if (!sucio()) return
    e.preventDefault()
    e.returnValue = ''
  }
  onMounted(() => window.addEventListener('beforeunload', alCerrarPestana))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', alCerrarPestana))
  onBeforeRouteLeave(() => puedeSalir())

  return { sucio, guardado, puedeSalir }
}
