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

  // En móvil el menú se superpone como cajón; desde md en adelante es una columna fija.
  const sidebarClass = computed(() =>
    sidebarOpen.value
      ? 'fixed inset-y-0 left-0 z-50 flex overflow-y-auto shadow-2xl md:static md:z-auto md:shadow-none'
      : 'hidden md:flex'
  )

  return { sidebarOpen, sidebarClass, close, toggle }
}
