// Despierta el audio con el primer toque o tecla, para que los sonidos de probar, entregar y ubicar piezas se oigan
// también en el celular (utils/sonidos.ts).
import { prepararSonidos } from '~/utils/sonidos'

export default defineNuxtPlugin(() => {
  prepararSonidos()
})
