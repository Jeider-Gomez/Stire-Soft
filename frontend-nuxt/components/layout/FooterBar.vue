<template>
  <!-- Pie (rediseño 26/10): a la izquierda la marca, como firma (logo pequeño y «stire_», con lo que es y de dónde);
       a la derecha lo útil: el estado del servicio y el manual. Antes eran cinco textos sueltos con puntos entre sí y el
       nombre sin el logo. -->
  <footer class="bg-base-blanco border-t border-base-borde-sutil px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-base-texto-secundario">
    <div class="flex items-center gap-2.5 min-w-0">
      <LayoutLogo tamano="mini" con-nombre />
      <span class="hidden md:inline truncate">Sistema tutor inteligente · Universidad de Córdoba</span>
    </div>
    <div class="flex items-center gap-4">
      <span class="inline-flex items-center gap-1.5" title="La aplicación y el Tutor responden">
        <span class="w-1.5 h-1.5 rounded-full bg-semantico-pasa" aria-hidden="true" />
        Conectado
      </span>
      <NuxtLink to="/ayuda" class="min-h-[44px] sm:min-h-0 inline-flex items-center font-semibold text-acento-ambar-fuerte hover:underline">Manual de usuario</NuxtLink>
    </div>
  </footer>
</template>
