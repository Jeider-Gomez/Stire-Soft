// true en computador (≥ 1024 px). Ahí el Tutor y el menú se comportan como paneles que conviven con la página; en
// celular y tableta siguen como cajones que se superponen.
export function usePantallaAncha() {
  const ancha = useState('pantalla-ancha', () => false)
  onMounted(() => {
    const consulta = window.matchMedia('(min-width: 1024px)')
    const actualizar = () => { ancha.value = consulta.matches }
    actualizar()
    consulta.addEventListener('change', actualizar)
    onBeforeUnmount(() => consulta.removeEventListener('change', actualizar))
  })
  return ancha
}
