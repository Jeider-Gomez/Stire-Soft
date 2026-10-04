import { ref } from 'vue'

/**
 * Confirmación con un diálogo propio en lugar de `window.confirm()` (UX-02 de la lista de chequeo, regla de oro 1 de
 * Mandel). El cuadro del navegador no se puede leer con calma, no dice qué se pierde y en el celular aparece con el
 * nombre del sitio en lugar de STIRE. Este diálogo pone el foco en «Cancelar» (la opción segura), se cierra con Escape
 * y se monta una sola vez en cada diseño de página (`<DialogoConfirmar />`).
 *
 *   const { confirmar } = useConfirmar()
 *   if (!(await confirmar({ titulo: '¿Borrar la asistencia?', mensaje: 'Se pierden sus marcas.', accion: 'Borrar', peligro: true }))) return
 */
export interface PedidoConfirmacion {
  titulo: string
  mensaje: string
  /** Texto del botón que confirma, en infinitivo y con la acción concreta («Borrar», «Salir sin guardar»). */
  accion: string
  /** Texto del botón que cancela. Por defecto, «Cancelar». */
  cancelar?: string
  /** Pinta la acción en rojo: para lo que no se puede deshacer. */
  peligro?: boolean
}

const pedido = ref<(PedidoConfirmacion & { responder: (ok: boolean) => void }) | null>(null)

export function useConfirmar() {
  function confirmar(datos: PedidoConfirmacion): Promise<boolean> {
    // Si ya había uno abierto, se responde «no» antes de mostrar el nuevo: nunca quedan dos diálogos encima.
    pedido.value?.responder(false)
    return new Promise((resolve) => {
      pedido.value = {
        ...datos,
        responder: (ok: boolean) => {
          pedido.value = null
          resolve(ok)
        },
      }
    })
  }
  return { pedido, confirmar }
}
