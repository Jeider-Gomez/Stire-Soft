// La parte de la pantalla que se ve en el celular, al día con el teclado (window.visualViewport). Hallazgo de José,
// 09/10: el teclado tapaba los últimos mensajes del Tutor. Cálculo en utils/areaVisible.ts.
import { estiloPanelVisible, type AreaVisible } from '~/utils/areaVisible'

/** Estilo para un panel fijo que debe quedar entero a la vista; `alCambiar` se llama cuando cambia el alto visible. */
export function useAreaVisible(pantallaAncha: Ref<boolean>, alCambiar: () => void) {
  const area = ref<AreaVisible | null>(null)
  function medir() {
    const vv = window.visualViewport
    if (!vv) return
    const antes = area.value?.alto
    area.value = { alto: vv.height, arriba: vv.offsetTop, altoPantalla: window.innerHeight }
    if (antes !== vv.height) alCambiar()
  }
  onMounted(() => {
    medir()
    window.visualViewport?.addEventListener('resize', medir)
    window.visualViewport?.addEventListener('scroll', medir)
  })
  onBeforeUnmount(() => {
    window.visualViewport?.removeEventListener('resize', medir)
    window.visualViewport?.removeEventListener('scroll', medir)
  })
  return computed(() => estiloPanelVisible(area.value, pantallaAncha.value))
}
