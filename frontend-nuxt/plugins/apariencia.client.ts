// Aplica la apariencia guardada (tema, contraste, tamaño del texto, espaciado) apenas carga la aplicación, antes de
// mostrar las pantallas, para que no se vea primero el tema claro y luego cambie (utils/apariencia.ts). Si el
// dispositivo cambia a oscuro mientras STIRE está abierto, «Como mi dispositivo» lo sigue sin recargar.
import { aplicarApariencia } from '~/utils/apariencia'

export default defineNuxtPlugin(() => {
  const { apariencia } = useApariencia()
  aplicarApariencia(apariencia.value)
  seguirAlSistema(() => aplicarApariencia(apariencia.value))
})
