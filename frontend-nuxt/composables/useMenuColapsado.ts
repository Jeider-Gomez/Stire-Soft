import { onMounted } from 'vue'

const CLAVE_MENU = 'stire-menu-colapsado'

/**
 * Menú lateral plegado (solo computador): queda con íconos y se recuerda en este navegador. El botón vive en el
 * encabezado (HeaderNav.vue) y la barra (SidebarNav.vue) solo lee el estado.
 */
export function useMenuColapsado() {
  const colapsado = useState('menu-colapsado', () => false)
  onMounted(() => {
    try { colapsado.value = localStorage.getItem(CLAVE_MENU) === '1' } catch { /* sin almacenamiento */ }
  })
  function alternarMenu() {
    colapsado.value = !colapsado.value
    try { localStorage.setItem(CLAVE_MENU, colapsado.value ? '1' : '0') } catch { /* se usa sin recordar */ }
  }
  return { colapsado, alternarMenu }
}
