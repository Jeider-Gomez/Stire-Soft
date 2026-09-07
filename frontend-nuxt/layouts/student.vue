<template>
  <div class="min-h-screen bg-base-bg-primario flex flex-col">
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
