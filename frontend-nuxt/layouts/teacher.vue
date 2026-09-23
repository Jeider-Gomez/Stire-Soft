<template>
  <div class="min-h-screen bg-stire-canvas flex flex-col">
    <LayoutHeaderNav @toggle-sidebar="toggleSidebar" />
    <div class="flex-1 flex w-full">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-black/40 md:hidden"
        aria-hidden="true"
        @click="closeSidebar"
      />
      <LayoutSidebarNav :class="sidebarClass" />
      <main class="flex-1 min-w-0 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full overflow-y-auto">
        <slot />
      </main>
    </div>
    <LayoutFooterBar />
  </div>
</template>

<script setup lang="ts">
const { sidebarOpen, sidebarClass, close: closeSidebar, toggle: toggleSidebar } = useMobileSidebar()
</script>
