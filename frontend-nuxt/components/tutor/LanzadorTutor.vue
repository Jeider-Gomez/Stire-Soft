<template>
  <!-- Lanzador del Tutor en el celular: abajo a la derecha, con su nombre y siempre a la vista (patrón P-UI-04 de
       docs/investigacion/referentes/PATRONES_DE_INTERFAZ.md). En el encabezado del celular solo cabía un ícono sin texto
       y en el ejercicio se iba con el scroll. Desde sm en adelante el Tutor se abre desde el encabezado. -->
  <button
    v-if="!tutorStore.isOpen"
    id="lanzador-tutor"
    type="button"
    class="sm:hidden fixed right-4 z-40 inline-flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full bg-stire-purple text-white text-sm font-bold shadow-lg shadow-stire-purple/30 active:scale-95 transition-transform"
    style="bottom: calc(1rem + env(safe-area-inset-bottom))"
    aria-label="Abrir el Tutor IA"
    @click="tutorStore.openDrawer()">
    <Sparkles :size="18" aria-hidden="true" />
    Tutor
  </button>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import { useTutorStore } from '~/stores/tutor'

const tutorStore = useTutorStore()
</script>
