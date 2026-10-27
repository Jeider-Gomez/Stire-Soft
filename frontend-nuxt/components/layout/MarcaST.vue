<template>
  <!-- Logo de STIRE: la pantalla con gafas, el mismo personaje que el Tutor (components/tutor/Mascota.vue). Reemplaza el
       distintivo «ST» del prototipo de José. Con `escudo` (el foco está en la contraseña) cierra los ojos: no mira lo que
       escribes. -->
  <span class="marca-stire inline-flex shrink-0" :class="{ 'marca-pulso': escudo }">
    <TutorMascota
      :expresion="escudo ? 'durmiendo' : 'normal'"
      :forma="tamano === 'grande' ? 'completa' : 'compacta'"
      :tamano="tamano === 'grande' ? 48 : 28"
      :mirar-cursor="tamano === 'grande'"
      etiqueta="STIRE"
      aria-hidden="true"
    />
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ tamano?: 'grande' | 'normal'; escudo?: boolean }>(), { tamano: 'normal', escudo: false })
</script>

<style scoped>
.marca-pulso {
  animation: marca-pulso 0.3s ease-out;
}
@keyframes marca-pulso {
  0% { transform: scale(1); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .marca-pulso { animation: none; }
}
</style>
