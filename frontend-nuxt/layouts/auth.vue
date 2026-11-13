<template>
  <!-- v3 (Fase C; cuadro «Entrar» del lienzo): fondo claro con un halo menta detrás de la tarjeta, el logo a la
       izquierda, la institución al centro y Apariencia a la derecha. El pie lleva Términos, Privacidad, el manual y
       «Para mayores de 18 años» (desde el 22/10 STIRE es solo para mayores de edad). -->
  <div class="fondo-entrar relative min-h-screen flex flex-col overflow-x-hidden text-base-texto-primario">
    <header class="cabecera-entrar w-full px-4 sm:px-12 min-h-[64px] sm:min-h-[76px] flex items-center justify-between gap-x-4 gap-y-1 py-3">
      <NuxtLink to="/" class="inline-flex items-center min-h-[44px]" aria-label="STIRE, ir al inicio">
        <LayoutLogo tamano="grande" con-nombre />
      </NuxtLink>
      <p class="hidden sm:block text-center text-[13px] font-semibold">
        Universidad de Córdoba <span class="text-sec-menta" aria-hidden="true">•</span> Sistema Tutor Inteligente
      </p>
      <LayoutBotonApariencia />
    </header>

    <main class="flex-1 flex items-center justify-center px-4 sm:px-12 lg:px-24 pb-8">
      <slot />
    </main>

    <footer class="w-full px-4 sm:px-12 pb-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-base-texto-secundario">
      <NuxtLink to="/terminos" class="underline">Términos</NuxtLink>
      <NuxtLink to="/privacidad" class="underline">Privacidad</NuxtLink>
      <NuxtLink to="/ayuda" class="underline">Manual de usuario</NuxtLink>
      <span>· Accesible (WCAG 2.1 AA) · © 2026 Universidad de Córdoba</span>
      <span class="sm:ml-auto">Para mayores de 18 años</span>
    </footer>
  </div>
</template>

<style scoped>
.fondo-entrar {
  background:
    radial-gradient(circle at 78% 30%, rgb(var(--c-sec-menta-fondo)) 0, transparent 38%),
    rgb(var(--c-base-bg-primario));
}
.text-sec-menta { color: rgb(var(--c-sec-menta)); }
</style>
