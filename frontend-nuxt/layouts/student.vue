<template>
  <div class="min-h-screen bg-stire-canvas flex flex-col">
    <!-- Zona A: Header Invariante -->
    <LayoutHeaderNav />

    <!-- Zona B + Zona C: Menú Lateral y Contenido Principal -->
    <div class="flex-1 flex w-full">
      <!-- Zona B: Menú Lateral 260px con 6 ítems persistentes -->
      <LayoutSidebarNav />

      <!-- Zona C: Contenido Dinámico de la Página -->
      <main class="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        <slot />
      </main>
    </div>

    <!-- Zona E: Footer Invariante -->
    <LayoutFooterBar />

    <!-- EST-V04: Tutor IA Drawer Global -->
    <TutorChatDrawer />
  </div>
</template>

<script setup lang="ts">
import { useStudentStore } from '~/stores/student'

const studentStore = useStudentStore()

onMounted(async () => {
  // Cargar datos de estudiante cuando el store esté vacío (§21.2 T3b), una sola vez
  // `isSyncing` es el indicador que fetchStudentData() realmente activa (`isLoading` nunca se pone en true)
  if (!studentStore.currentClassName && !studentStore.isSyncing) {
    await studentStore.fetchStudentData()
  }
})
</script>
