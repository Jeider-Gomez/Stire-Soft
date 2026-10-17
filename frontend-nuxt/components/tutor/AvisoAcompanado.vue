<template>
  <!-- Modo acompañado (UI-05): mientras dura, el Tutor dirige paso a paso; el estudiante lo termina cuando quiera. -->
  <div v-if="tutorStore.modoAcompanado" role="status" class="flex items-center gap-2 px-3 py-2 border-b border-stire-purple/20 bg-stire-purple/10 text-xs text-base-texto-primario">
    <HeartHandshake :size="15" class="shrink-0 text-stire-purple" aria-hidden="true" />
    <span class="flex-1">Te acompaño paso a paso hasta que te salga. Responde con tus palabras, sin miedo a equivocarte.</span>
    <button type="button" class="shrink-0 min-h-[36px] px-2 rounded-md font-semibold text-stire-purple hover:bg-stire-purple/10" @click="tutorStore.terminarAcompanamiento()">
      Terminar acompañamiento
    </button>
  </div>
</template>

<script setup lang="ts">
import { HeartHandshake } from 'lucide-vue-next'
import { useTutorStore } from '~/stores/tutor'

const tutorStore = useTutorStore()
</script>
