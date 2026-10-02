// v-crece: la caja de texto crece sola mientras se escribe, hasta el 60 % de la pantalla, y vuelve a su tamaño cuando
// se vacía (al enviar un mensaje). Recomendación de José (02/10): los textos largos se escribían en una caja diminuta.
export function ajustarAltura(el: HTMLTextAreaElement, alto: number = window.innerHeight): void {
  el.style.height = 'auto'
  const bordes = el.offsetHeight - el.clientHeight
  const maximo = Math.round(alto * 0.6)
  const necesario = el.scrollHeight + bordes
  el.style.height = `${Math.min(necesario, maximo)}px`
  el.style.overflowY = necesario > maximo ? 'auto' : 'hidden'
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive<HTMLTextAreaElement>('crece', {
    mounted(el) {
      el.addEventListener('input', () => ajustarAltura(el))
      requestAnimationFrame(() => ajustarAltura(el))
    },
    // v-model cambiado desde el código (vaciar tras enviar, cargar un texto guardado)
    updated(el) {
      ajustarAltura(el)
    },
  })
})
