import { onMounted } from 'vue'
import { acotarMedida } from '~/utils/mesaEjercicio'

/**
 * Un ancho (en %) que el estudiante acomoda arrastrando un divisor y que se recuerda en este navegador (mesa de trabajo del
 * ejercicio, 14/11, Jeider: «mover la disposición como si fueran ventanas»). Compartido por clave, como usePanelPlegable.
 */
export function useMedidaRecordada(clave: string, inicial: number, min: number, max: number) {
  const valor = useState<number>(clave, () => inicial)
  onMounted(() => {
    try {
      const guardado = Number(localStorage.getItem(clave))
      if (guardado) valor.value = acotarMedida(guardado, min, max)
    } catch { /* sin almacenamiento */ }
  })
  function fijar(v: number) {
    valor.value = acotarMedida(v, min, max)
    try { localStorage.setItem(clave, String(valor.value)) } catch { /* sin almacenamiento: no se recuerda */ }
  }
  return { valor, fijar }
}
