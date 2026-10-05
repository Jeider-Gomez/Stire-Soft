// Aplica la apariencia guardada (tema, contraste, tamaño del texto, espaciado) apenas carga la aplicación, antes de
// mostrar las pantallas, para que no se vea primero el tema claro y luego cambie (utils/apariencia.ts).
import { aplicarApariencia, CLAVE_APARIENCIA, leerApariencia } from '~/utils/apariencia'

export default defineNuxtPlugin(() => {
  let guardado: string | null = null
  try {
    guardado = localStorage.getItem(CLAVE_APARIENCIA)
  } catch {
    /* sin almacenamiento: apariencia por defecto */
  }
  aplicarApariencia(leerApariencia(guardado))
})
