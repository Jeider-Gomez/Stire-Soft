<template>
  <div class="relative min-h-screen flex flex-col justify-between overflow-x-hidden text-slate-800 selection:bg-stire-teal/30 selection:text-stire-blue">
    <LayoutFondoTecnologico />

    <!-- Encabezado: marca «ST» con degradado y el nombre de la institución (prototipo de José) -->
    <header class="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <LayoutMarcaST />
        <div class="flex items-baseline gap-1 font-poppins">
          <span class="text-xl font-bold tracking-tight text-stire-blue">STIRE</span>
          <span class="text-xl font-light text-slate-700">Soft</span>
        </div>
      </div>
      <div class="text-xs text-slate-600 font-medium text-center sm:text-right">
        <span class="text-slate-800 font-semibold">Universidad de Córdoba</span>
        <span class="mx-2 text-stire-teal font-bold" aria-hidden="true">•</span>
        <span class="text-stire-blue">Sistema Tutor Inteligente</span>
      </div>
    </header>

    <!-- Contenedor central de la tarjeta -->
    <main class="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
      <slot />
    </main>

    <footer class="relative z-10 w-full max-w-6xl mx-auto px-4 py-5 border-t border-slate-200/90 text-center text-xs text-slate-500">
      © 2026 STIRE-Soft. Todos los derechos reservados. Cumple estándar WCAG 2.1 AA.
    </footer>
  </div>
</template>
