<template>
  <div class="min-h-screen bg-base-bg-primario flex flex-col">
    <!-- WCAG 2.4.1: primer elemento al tabular; lleva directo al contenido sin recorrer el menú -->
    <a href="#contenido" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-base-blanco focus:text-base-texto-primario focus:shadow-lg focus:ring-2 focus:ring-acento-ambar-fuerte">Saltar al contenido</a>
    <LayoutHeaderNav @toggle-sidebar="toggleSidebar" />
    <div class="flex-1 flex w-full">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-black/40 md:hidden"
        aria-hidden="true"
        @click="closeSidebar"
      />
      <LayoutSidebarNav :class="sidebarClass" />
      <main id="contenido" tabindex="-1" class="flex-1 min-w-0 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        <slot />
      </main>
    </div>
    <LayoutFooterBar />
    <DialogoConfirmar />
    <AvisoSinConexion />
  </div>
</template>

<script setup lang="ts">
const { sidebarOpen, sidebarClass, close: closeSidebar, toggle: toggleSidebar } = useMobileSidebar()
</script>
