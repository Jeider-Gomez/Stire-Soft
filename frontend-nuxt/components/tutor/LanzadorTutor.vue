<template>
  <!-- Lanzador del Tutor: abajo a la derecha, con su nombre, en el mismo sitio en todas las pantallas y siempre a la
       vista (P-UI-04 en docs/investigacion/referentes/PATRONES_DE_INTERFAZ.md). Recomendación de José: «cambiar la
       ventana o el acceso al Tutor hacia una zona más natural y cómoda para la interacción constante». La ventana ya
       es un panel al lado (P-UI-06); el acceso es este botón. Antes estaba en el encabezado: en el celular era un ícono
       sin nombre y en el ejercicio se iba con el scroll. -->
  <button
    v-if="!tutorStore.isOpen"
    id="lanzador-tutor"
    :class="{ 'sobre-barra': sobreBarra }"
    type="button"
    class="lanzador-tutor fixed right-4 sm:right-6 z-40 inline-flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full bg-stire-purple text-white text-sm font-bold shadow-lg shadow-stire-purple/30 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stire-purple/40 transition-all"
    aria-label="Abrir el Tutor IA"
    @click="tutorStore.openDrawer()">
    <Sparkles :size="18" aria-hidden="true" />
    Tutor
  </button>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import { useTutorStore } from '~/stores/tutor'

// En el ejercicio, en el celular, Probar y Entregar van en una barra fija abajo: el lanzador sube para no taparla.
defineProps<{ sobreBarra?: boolean }>()
const tutorStore = useTutorStore()
</script>

<style scoped>
.lanzador-tutor {
  bottom: calc(1rem + env(safe-area-inset-bottom));
}
@media (min-width: 640px) {
  .lanzador-tutor { bottom: 1.5rem; }
}
@media (max-width: 767px) {
  .lanzador-tutor.sobre-barra { bottom: calc(5.5rem + env(safe-area-inset-bottom)); }
}
</style>
