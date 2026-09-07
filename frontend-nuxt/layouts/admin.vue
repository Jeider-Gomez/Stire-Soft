<template>
  <div class="min-h-screen bg-base-bg-primario flex flex-col">
    <LayoutHeaderNav />
    <div class="flex-1 flex w-full">
      <LayoutSidebarNav />
      <main class="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        <slot />
      </main>
    </div>
    <LayoutFooterBar />
  </div>
</template>
