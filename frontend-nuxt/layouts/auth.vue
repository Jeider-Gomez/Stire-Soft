<template>
  <div class="relative min-h-screen flex flex-col justify-between overflow-x-hidden text-slate-800 selection:bg-stire-teal/30 selection:text-stire-blue">
    <LayoutFondoTecnologico />

    <!-- Encabezado: logo de STIRE y el nombre de la institución (prototipo de José) -->
    <header class="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-4 pb-2 sm:pt-6 sm:pb-3 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <LayoutLogo con-nombre />
      </div>
      <div class="text-xs text-slate-600 font-medium text-center sm:text-right">
        <span class="text-slate-800 font-semibold">Universidad de Córdoba</span>
        <span class="mx-2 text-teal-300 font-bold" aria-hidden="true">•</span>
        <span class="text-stire-blue">Sistema Tutor Inteligente</span>
      </div>
    </header>

    <!-- Contenedor central de la tarjeta -->
    <main class="relative z-10 flex-1 flex items-center justify-center px-4 py-3 sm:py-6">
      <slot />
    </main>

    <!-- Pie con la misma firma que el de la aplicación (components/layout/FooterBar.vue). -->
    <footer class="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 py-4 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
      <div class="flex items-center gap-2.5">
        <LayoutLogo tamano="mini" con-nombre />
        <span>© 2026 · Universidad de Córdoba</span>
      </div>
      <div class="flex items-center gap-3">
        <span>Accesible (WCAG 2.1 AA)</span>
        <NuxtLink to="/ayuda" class="font-semibold text-stire-blue hover:underline">Manual de usuario</NuxtLink>
      </div>
    </footer>
  </div>
</template>
