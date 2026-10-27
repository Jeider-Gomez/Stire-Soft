<template>
  <!-- Barra lateral a toda altura con el logo arriba; a su derecha, encabezado, contenido y pie. -->
  <div class="min-h-screen bg-base-bg-primario flex">
    <!-- WCAG 2.4.1: primer elemento al tabular; lleva directo al contenido sin recorrer el menú -->
    <a href="#contenido" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-base-blanco focus:text-base-texto-primario focus:shadow-lg focus:ring-2 focus:ring-acento-ambar-fuerte">Saltar al contenido</a>
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/40 md:hidden"
      aria-hidden="true"
      @click="closeSidebar"
    />
    <LayoutSidebarNav :class="sidebarClass" />
    <div class="flex-1 min-w-0 flex flex-col">
      <LayoutHeaderNav @toggle-sidebar="toggleSidebar" />
      <main id="contenido" tabindex="-1" class="flex-1 min-w-0 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        <slot />
      </main>
      <LayoutFooterBar />
    </div>
    <DialogoConfirmar />
    <AvisoSinConexion />
  </div>
</template>

<script setup lang="ts">
const { sidebarOpen, sidebarClass, close: closeSidebar, toggle: toggleSidebar } = useMobileSidebar()

// La primera vez en cada pantalla, el recorrido guiado señala sus partes (S10-J04).
const { primeraVez } = useRecorrido()
const rutaActual = useRoute()
onMounted(() => watch(() => rutaActual.path, primeraVez, { immediate: true }))
</script>
