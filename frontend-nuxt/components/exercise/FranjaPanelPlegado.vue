<template>
  <!-- El enunciado plegado (hallazgo de José, S08-E01: «demasiados elementos compitiendo por la atención»): una franja con
       «Ver el enunciado» y el editor ocupa el resto. Desde el 14/11 también la vista previa de la página web, a la derecha. -->
  <div class="franja-plegada flex md:flex-col items-center bg-base-bg-secundario border-b md:border-b-0 border-base-borde-sutil md:w-12 flex-shrink-0 p-1"
    :class="lado === 'derecha' ? 'md:border-l' : 'md:border-r'">
    <button type="button" class="min-h-[44px] min-w-[44px] px-2 rounded-md inline-flex md:flex-col items-center gap-1.5 text-xs font-semibold text-base-texto-primario hover:bg-base-blanco"
      :aria-expanded="false" :aria-controls="controla" @click="emit('mostrar')">
      <PanelRightOpen v-if="lado === 'derecha'" :size="16" aria-hidden="true" />
      <PanelLeftOpen v-else :size="16" aria-hidden="true" />
      <span class="md:[writing-mode:vertical-rl] md:rotate-180">{{ texto }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { PanelLeftOpen, PanelRightOpen } from 'lucide-vue-next'

withDefaults(defineProps<{ controla: string; texto?: string; lado?: 'izquierda' | 'derecha' }>(), { texto: 'Ver el enunciado', lado: 'izquierda' })
const emit = defineEmits<{ mostrar: [] }>()
</script>

<style scoped>
/* Aparece deslizándose desde su lado, para que se entienda adónde fue el panel. */
.franja-plegada { animation: franja-entra 0.22s ease-out; }
@keyframes franja-entra { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .franja-plegada { animation: none; } }
</style>
