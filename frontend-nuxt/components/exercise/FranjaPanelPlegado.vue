<template>
  <!-- El enunciado plegado (hallazgo de José, S08-E01: «demasiados elementos compitiendo por la atención»): una franja con
       «Ver el enunciado» y el editor ocupa el resto. -->
  <div class="flex md:flex-col items-center bg-base-bg-secundario border-b md:border-b-0 md:border-r border-base-borde-sutil md:w-12 flex-shrink-0 p-1">
    <button type="button" class="min-h-[44px] min-w-[44px] px-2 rounded-md inline-flex md:flex-col items-center gap-1.5 text-xs font-semibold text-base-texto-primario hover:bg-base-blanco"
      :aria-expanded="false" :aria-controls="controla" @click="emit('mostrar')">
      <PanelLeftOpen :size="16" aria-hidden="true" /><span class="md:[writing-mode:vertical-rl] md:rotate-180">Ver el enunciado</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { PanelLeftOpen } from 'lucide-vue-next'

defineProps<{ controla: string }>()
const emit = defineEmits<{ mostrar: [] }>()
</script>
