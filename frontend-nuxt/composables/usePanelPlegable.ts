import { onMounted } from 'vue'

/**
 * Un panel que el usuario puede plegar y que se recuerda en este navegador (por ejemplo, el enunciado del ejercicio,
 * para que el editor tenga más espacio: hallazgo de José en S08-E01). El estado se comparte por clave (useState): la
 * página y el ejercicio de página web pliegan los mismos paneles desde su propia barra (mesa de trabajo, 14/11).
 */
export function usePanelPlegable(clave: string) {
  const plegado = useState<boolean>(clave, () => false)
  onMounted(() => { try { plegado.value = localStorage.getItem(clave) === '1' } catch { /* sin almacenamiento */ } })
  function plegar(valor: boolean) {
    plegado.value = valor
    try { localStorage.setItem(clave, valor ? '1' : '0') } catch { /* sin almacenamiento: no se recuerda */ }
  }
  return { plegado, plegar }
}
