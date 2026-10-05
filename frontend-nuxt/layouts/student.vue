<template>
  <!-- Con el Tutor abierto en computador, la página entera (encabezado incluido) deja su espacio al panel. -->
  <div class="min-h-screen bg-stire-canvas flex flex-col transition-[padding] duration-300" :class="{ 'lg:pr-[400px]': tutorStore.isOpen }">
    <!-- WCAG 2.4.1: primer elemento al tabular; lleva directo al contenido sin recorrer el menú -->
    <a href="#contenido" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-base-blanco focus:text-base-texto-primario focus:shadow-lg focus:ring-2 focus:ring-acento-ambar-fuerte">Saltar al contenido</a>
    <!-- Zona A: Header Invariante -->
    <LayoutHeaderNav @toggle-sidebar="toggleSidebar" />

    <!-- Zona B + Zona C: Menú Lateral y Contenido Principal -->
    <div class="flex-1 flex w-full">
      <!-- Zona B: Menú Lateral 260px con 6 ítems persistentes -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-black/40 md:hidden"
        aria-hidden="true"
        @click="closeSidebar"
      />
      <LayoutSidebarNav :class="sidebarClass" />

      <!-- Zona C: Contenido Dinámico de la Página -->
      <!-- pb-24: el lanzador del Tutor flota abajo a la derecha; sin este margen tapaba el último botón de la página. -->
      <main id="contenido" tabindex="-1" class="flex-1 min-w-0 p-4 sm:p-6 md:p-8 pb-24 sm:pb-24 md:pb-24 max-w-7xl mx-auto w-full overflow-y-auto">
        <slot />
      </main>
    </div>

    <!-- Zona E: Footer Invariante -->
    <LayoutFooterBar />

    <!-- EST-V04: Tutor IA Drawer Global -->
    <TutorChatDrawer />
    <TutorLanzadorTutor />
    <DialogoConfirmar />
    <AvisoSinConexion />
  </div>
</template>

<script setup lang="ts">
import { useStudentStore } from '~/stores/student'
import { useTutorStore } from '~/stores/tutor'

const studentStore = useStudentStore()
const tutorStore = useTutorStore()
const { sidebarOpen, sidebarClass, close: closeSidebar, toggle: toggleSidebar } = useMobileSidebar()

onMounted(async () => {
  // Cargar datos de estudiante cuando el store esté vacío (§21.2 T3b), una sola vez
  // `isSyncing` es el indicador que fetchStudentData() realmente activa (`isLoading` nunca se pone en true)
  if (!studentStore.currentClassName && !studentStore.isSyncing) {
    await studentStore.fetchStudentData()
  }
})
</script>
