<template>
  <!-- «Entrando» (cuadro «Entrar-estados» del lienzo v3): mientras se abre el inicio, la mascota con sus ecos —los mismos
       de los repasos— en lugar de una ruedita. Tapa la tarjeta; con «reducir movimiento» los ecos quedan quietos. -->
  <div class="abriendo absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 sm:rounded-[28px]" role="status">
    <span class="relative inline-block pt-[34px] pr-[34px]" aria-hidden="true">
      <span v-for="(e, i) in ECOS" :key="i" class="eco" :style="{ '--d': `${e.d}px`, animationDelay: `${e.t}s` }" />
      <span class="relative"><TutorMascota expresion="contento" :tamano="84" forma="completa" /></span>
    </span>
    <p class="m-0 text-base font-semibold">Abriendo tu inicio…</p>
  </div>
</template>

<script setup lang="ts">
const ECOS = [{ d: 10, t: 0 }, { d: 20, t: 0.25 }, { d: 32, t: 0.5 }]
</script>

<style scoped>
.abriendo { background: rgb(var(--c-base-bg-primario)); }
@media (min-width: 640px) { .abriendo { background: rgb(var(--c-base-blanco)); } }
.eco {
  position: absolute; left: 2px; top: 36px; width: 120px; height: 82px; border-radius: 16px; border: 2px solid #00c2a8;
  opacity: 0; animation: eco-ola 1.4s ease-out 3; /* 4,2 s: nada se mueve más de 5 s (regla 19) */
}
@keyframes eco-ola { 0% { opacity: 0; transform: translate(0, 0); } 30% { opacity: 0.8; } 100% { opacity: 0; transform: translate(var(--d), calc(var(--d) * -1)); } }
@media (prefers-reduced-motion: reduce) {
  .eco { animation: none; opacity: 0.35; transform: translate(var(--d), calc(var(--d) * -1)); }
}
</style>
