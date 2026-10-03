// Estado del menú lateral en pantallas < md: se abre con la hamburguesa del
// encabezado y se cierra al navegar, al pulsar Escape o al tocar el fondo.
export function useMobileSidebar() {
  const sidebarOpen = ref(false)
  const route = useRoute()

  const close = () => { sidebarOpen.value = false }
  const toggle = () => { sidebarOpen.value = !sidebarOpen.value }
  const onKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }

  watch(() => route.path, close)
  onMounted(() => document.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

  // En móvil el menú se superpone como cajón. Desde md es una columna que se queda fija al bajar, con su propio scroll,
  // como el índice de Platzi, Coursera o Udemy (P-UI-02 en docs/investigacion/referentes/PATRONES_DE_INTERFAZ.md).
  const FIJA = 'md:sticky md:top-16 md:self-start md:h-[calc(100vh-4rem)] md:overflow-y-auto'
  const sidebarClass = computed(() =>
    sidebarOpen.value
      ? `fixed inset-y-0 left-0 z-50 flex overflow-y-auto shadow-2xl md:z-auto md:shadow-none ${FIJA}`
      : `hidden md:flex ${FIJA}`
  )

  return { sidebarOpen, sidebarClass, close, toggle }
}
