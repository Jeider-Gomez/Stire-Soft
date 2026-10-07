import { onMounted, ref } from 'vue'

/**
 * Un panel que el usuario puede plegar y que se recuerda en este navegador (por ejemplo, el enunciado del ejercicio,
 * para que el editor tenga más espacio: hallazgo de José en S08-E01).
 */
export function usePanelPlegable(clave: string) {
  const plegado = ref(false)
  onMounted(() => { try { plegado.value = localStorage.getItem(clave) === '1' } catch { /* sin almacenamiento */ } })
  function plegar(valor: boolean) {
    plegado.value = valor
    try { localStorage.setItem(clave, valor ? '1' : '0') } catch { /* sin almacenamiento: no se recuerda */ }
  }
  return { plegado, plegar }
}
