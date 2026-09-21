<template>
  <div class="min-h-screen bg-stire-canvas flex flex-col">
    <LayoutHeaderNav @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <div class="flex-1 flex w-full">
      <!-- Sidebar con colapso mobile -->
      <LayoutSidebarNav :class="{ 'hidden md:flex': !sidebarOpen }" />
      <main class="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full overflow-y-auto">
        <slot />
      </main>
    </div>
    <LayoutFooterBar />
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false)
</script>
