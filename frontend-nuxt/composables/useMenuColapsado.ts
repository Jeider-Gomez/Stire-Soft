import { computed, onMounted, watch } from 'vue'

const CLAVE_MENU = 'stire-menu-colapsado'

/**
 * Menú lateral plegado (solo computador): queda con íconos y se recuerda en este navegador. El botón vive en el
 * encabezado (HeaderNav.vue) y la barra (SidebarNav.vue) solo lee el estado.
 *
 * v3 (Fase D, cuadro «E-Leccion»): al estudiar una lección el menú va en íconos, para dejar sitio a «Contenido del curso»,
 * sin tocar lo que el estudiante eligió para el resto de pantallas. Si lo abre ahí, vale solo mientras estudia.
 */
export function useMenuColapsado() {
  /** Lo que ve: lo que eligió o, en una lección, en íconos. ClasesDelMenu.vue lo lee con el mismo nombre. */
  const colapsado = useState('menu-colapsado', () => false)
  const elegido = useState('menu-colapsado-elegido', () => false)
  const abiertoEnLeccion = useState('menu-abierto-en-leccion', () => false)
  const route = useRoute()
  const enLeccion = computed(() => route.path.startsWith('/estudiante/unidad/'))
  const ajustar = () => { colapsado.value = enLeccion.value ? !abiertoEnLeccion.value : elegido.value }

  onMounted(() => {
    try { elegido.value = localStorage.getItem(CLAVE_MENU) === '1' } catch { /* sin almacenamiento */ }
    ajustar()
  })
  watch(enLeccion, () => { abiertoEnLeccion.value = false; ajustar() })

  function alternarMenu() {
    if (enLeccion.value) {
      abiertoEnLeccion.value = !abiertoEnLeccion.value
    } else {
      elegido.value = !elegido.value
      try { localStorage.setItem(CLAVE_MENU, elegido.value ? '1' : '0') } catch { /* se usa sin recordar */ }
    }
    ajustar()
  }
  return { colapsado, alternarMenu }
}
