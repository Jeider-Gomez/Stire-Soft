<template>
  <!-- La barra lateral ocupa toda la altura, con el logo y el botón de plegar arriba (como Platzi, 26/10); a su derecha,
       el encabezado, el contenido y el pie. -->
  <!-- Con el Asistente abierto en computador, la página entera deja su espacio al panel (como el Tutor del estudiante,
       layouts/student.vue; cuadro D3-Asistente): ya no tapa lo que el docente revisa. -->
  <div data-panel="docente" class="min-h-screen bg-stire-canvas flex transition-[padding] duration-300"
    :class="{ 'lg:pr-[420px]': asistenteAbierto && !asistenteAncho, 'lg:pr-[760px]': asistenteAbierto && asistenteAncho }">
    <!-- WCAG 2.4.1: primer elemento al tabular; lleva directo al contenido sin recorrer el menú -->
    <a href="#contenido" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-base-blanco focus:text-base-texto-primario focus:shadow-lg focus:ring-2 focus:ring-acento-ambar-fuerte">Saltar al contenido</a>
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/40 md:hidden"
      aria-hidden="true"
      @click="closeSidebar"
    />
    <LayoutSidebarNav :class="sidebarClass" />
    <!-- En el celular, el espacio de la barra de abajo (LayoutBarraInferiorDocente, 72 px) para que no tape el pie. -->
    <div class="flex-1 min-w-0 flex flex-col pb-[72px] md:pb-0">
      <LayoutHeaderNav @toggle-sidebar="toggleSidebar" />
      <main id="contenido" tabindex="-1" class="flex-1 min-w-0 p-4 sm:p-6 md:p-8 max-w-[90rem] mx-auto w-full overflow-y-auto">
        <slot />
      </main>
      <LayoutFooterBar />
    </div>
    <AvisosPantalla />
    <DialogoConfirmar />
    <!-- Buscar (Ctrl K): pantallas, clases y ayuda (components/layout/Buscar.vue, v3 Fase B). -->
    <LayoutBuscar />
    <AvisoSinConexion />
    <DocenteAsistenciaFlotante />
    <!-- Asistente STIRE: panel a la derecha (components/docente/asistente/Panel.vue) -->
    <DocenteAsistentePanel />
    <!-- En el celular: Clases, Asistencia, Estudiantes, Mensajes y Asistente (cuadro D3-Cel-Inicio, v3 Fase B). -->
    <LayoutBarraInferiorDocente />
  </div>
</template>

<script setup lang="ts">
const { sidebarOpen, sidebarClass, close: closeSidebar, toggle: toggleSidebar } = useMobileSidebar()
const asistenteAbierto = useState('asistente-abierto', () => false)
const asistenteAncho = useState('asistente-ancho', () => false)

// La primera vez en cada pantalla, el recorrido guiado señala sus partes (S10-J04).
const { primeraVez } = useRecorrido()
const rutaActual = useRoute()
onMounted(() => watch(() => rutaActual.path, primeraVez, { immediate: true }))
</script>
