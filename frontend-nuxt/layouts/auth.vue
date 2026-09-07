<template>
  <div class="min-h-screen bg-base-bg-primario flex flex-col justify-between p-6">
    <!-- Header simple de Auth -->
    <div class="flex items-center justify-between max-w-4xl w-full mx-auto">
      <div class="flex items-center gap-2 font-bold text-lg text-base-texto-primario">
        <div class="w-8 h-8 rounded-md bg-acento-ambar flex items-center justify-center text-base-blanco font-bold text-sm shadow-sm">
          ST
        </div>
        <span class="tracking-tight">STIRE<span class="text-acento-ambar-fuerte font-semibold text-sm ml-1">Soft</span></span>
      </div>
      <div class="text-xs text-base-texto-secundario">
        Universidad de Córdoba • Sistema Tutor Inteligente
      </div>
    </div>

    <!-- Contenedor Central para la Tarjeta de Login -->
    <main class="flex-1 flex items-center justify-center py-10">
      <slot />
    </main>

    <!-- Footer simple -->
    <div class="text-center text-xs text-base-texto-secundario">
      © 2026 STIRE-Soft. Todos los derechos reservados. Cumple estándar WCAG 2.1 AA.
    </div>
  </div>
</template>
