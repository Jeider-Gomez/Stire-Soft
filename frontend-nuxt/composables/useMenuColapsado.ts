import { computed, onMounted, watch } from 'vue'
import { useTutorStore } from '~/stores/tutor'

const CLAVE_MENU = 'stire-menu-colapsado'

/**
 * Menú lateral plegado (solo computador): queda con íconos y se recuerda en este navegador. El botón vive en el
 * encabezado (HeaderNav.vue) y la barra (SidebarNav.vue) solo lee el estado.
 *
 * v3 (Fase D, cuadro «E-Leccion»): al estudiar una lección el menú va en íconos, para dejar sitio a «Contenido del curso»,
 * sin tocar lo que el estudiante eligió para el resto de pantallas. Si lo abre ahí, vale solo mientras estudia.
 *
 * 17/11: con el Tutor abierto al lado en una pantalla de menos de 1440 px, el menú también va en íconos. A 1024 px, con el
 * menú abierto y el Tutor, a la página le quedaban 285 px y el inicio se leía una palabra por línea. Al cerrar el Tutor
 * vuelve a lo que estaba; si lo abre con el Tutor abierto, se respeta mientras siga abierto.
 */
export function useMenuColapsado() {
  /** Lo que ve: lo que eligió o, en una lección, en íconos. ClasesDelMenu.vue lo lee con el mismo nombre. */
  const colapsado = useState('menu-colapsado', () => false)
  const elegido = useState('menu-colapsado-elegido', () => false)
  const abiertoEnLeccion = useState('menu-abierto-en-leccion', () => false)
  const abiertoConTutor = useState('menu-abierto-con-tutor', () => false)
  const estrecha = useState('pantalla-estrecha-para-tutor', () => false)
  const tutorStore = useTutorStore()
  const tutorAlLado = computed(() => tutorStore.isOpen && estrecha.value)
  const route = useRoute()
  const enLeccion = computed(() => route.path.startsWith('/estudiante/unidad/'))
  const ajustar = () => {
    if (tutorAlLado.value && !abiertoConTutor.value) { colapsado.value = true; return }
    colapsado.value = enLeccion.value ? !abiertoEnLeccion.value : elegido.value
  }

  onMounted(() => {
    try { elegido.value = localStorage.getItem(CLAVE_MENU) === '1' } catch { /* sin almacenamiento */ }
    if (typeof window.matchMedia === 'function') {
      // Entre 1024 (el Tutor va al lado) y 1439 px.
      const consulta = window.matchMedia('(min-width: 1024px) and (max-width: 1439px)')
      estrecha.value = consulta.matches
      consulta.addEventListener('change', (e) => { estrecha.value = e.matches })
    }
    ajustar()
  })
  watch(tutorAlLado, (alLado) => { if (!alLado) abiertoConTutor.value = false; ajustar() })
  watch(enLeccion, () => { abiertoEnLeccion.value = false; ajustar() })

  function alternarMenu() {
    if (tutorAlLado.value) {
      abiertoConTutor.value = !abiertoConTutor.value
      if (abiertoConTutor.value) colapsado.value = false
      else ajustar()
      return
    }
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
