<template>
  <!-- Con el Tutor abierto en computador, la página entera (encabezado incluido) deja su espacio al panel. -->
  <div class="min-h-screen bg-stire-canvas flex transition-[padding] duration-300" :class="{ 'lg:pr-[400px]': tutorStore.isOpen }">
    <!-- WCAG 2.4.1: primer elemento al tabular; lleva directo al contenido sin recorrer el menú -->
    <a href="#contenido" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-base-blanco focus:text-base-texto-primario focus:shadow-lg focus:ring-2 focus:ring-acento-ambar-fuerte">Saltar al contenido</a>
    <!-- Zona B: menú lateral a toda la altura, con el logo y el botón de plegar arriba (como Platzi, 26/10) -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/40 md:hidden"
      aria-hidden="true"
      @click="closeSidebar"
    />
    <LayoutSidebarNav :class="sidebarClass" />

    <!-- Zona A + C + E: encabezado, contenido y pie, a la derecha del menú -->
    <div class="flex-1 min-w-0 flex flex-col">
      <LayoutHeaderNav @toggle-sidebar="toggleSidebar" />

      <!-- Zona C: Contenido Dinámico de la Página -->
      <!-- pb-24: el lanzador del Tutor flota abajo a la derecha; sin este margen tapaba el último botón de la página. -->
      <main id="contenido" tabindex="-1" class="flex-1 min-w-0 p-4 sm:p-6 md:p-8 pb-24 sm:pb-24 md:pb-24 max-w-7xl mx-auto w-full overflow-y-auto">
        <!-- Primeros pasos, solo en el inicio (components/estudiante/PrimerosPasos.vue). -->
        <EstudiantePrimerosPasos v-if="route.path === '/estudiante'" class="mb-6" />
        <slot />
      </main>
      <LayoutFooterBar />
    </div>

    <!-- EST-V04: Tutor IA Drawer Global -->
    <TutorChatDrawer />
    <!-- «Ir a una lección» con Ctrl+K desde cualquier pantalla (components/estudiante/IrALeccion.vue) -->
    <EstudianteIrALeccion />
    <!-- En una lección, en el celular, el Tutor va en la barra de abajo (EstudianteNavegacionLeccion). -->
    <TutorLanzadorTutor :solo-computador="enLeccion" />
    <DialogoConfirmar />
    <AvisoSinConexion />
  </div>
</template>

<script setup lang="ts">
import { useStudentStore } from '~/stores/student'
import { useTutorStore } from '~/stores/tutor'

const studentStore = useStudentStore()
const tutorStore = useTutorStore()
const route = useRoute()
const enLeccion = computed(() => route.path.startsWith('/estudiante/unidad/'))
// WCAG 2.4.11 (foco no tapado): al avanzar con Tab, lo enfocado se desplaza por encima del lanzador flotante del Tutor.
useHead({ htmlAttrs: { class: 'scroll-pb-24' } })
const { sidebarOpen, sidebarClass, close: closeSidebar, toggle: toggleSidebar } = useMobileSidebar()

// La primera vez en cada pantalla, el recorrido guiado señala sus partes (S10-J04).
const { primeraVez } = useRecorrido()
const rutaActual = useRoute()
onMounted(() => watch(() => rutaActual.path, primeraVez, { immediate: true }))
// La lista de primeros pasos se marca sola al hacer cada cosa (composables/usePrimerosPasos.ts).
usePrimerosPasos().seguir()

onMounted(async () => {
  // Cargar datos de estudiante cuando el store esté vacío (§21.2 T3b), una sola vez
  // `isSyncing` es el indicador que fetchStudentData() realmente activa (`isLoading` nunca se pone en true)
  if (!studentStore.currentClassName && !studentStore.isSyncing) {
    await studentStore.fetchStudentData()
  }
})
</script>
