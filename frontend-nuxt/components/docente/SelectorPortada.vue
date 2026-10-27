<template>
  <!-- Color de portada de la clase (src/class/portadas.ts): uno de seis colores oscuros, donde el nombre en blanco
       siempre se lee, o «Automático» (el que le toca por su orden). Se ve en sus tarjetas, el menú y su presentación. -->
  <fieldset>
    <legend class="block text-xs font-semibold text-base-texto-primario mb-1.5">
      Portada <span class="text-base-texto-secundario font-normal">(opcional)</span>
    </legend>
    <div class="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Color de portada">
      <button v-for="c in COLORES_CLASE" :key="c" type="button" role="radio" :aria-checked="modelValue === c" :aria-label="NOMBRES[c]" :title="NOMBRES[c]"
        class="muestra w-9 h-9 rounded-lg grid place-items-center text-white" :class="{ elegida: modelValue === c }" :style="{ backgroundColor: c }"
        @click="$emit('update:modelValue', c)">
        <Check v-if="modelValue === c" :size="16" aria-hidden="true" />
      </button>
      <button type="button" role="radio" :aria-checked="modelValue === null"
        class="min-h-[36px] px-3 rounded-lg border text-xs font-semibold"
        :class="modelValue === null ? 'border-stire-blue text-stire-blue bg-stire-blue/5' : 'border-base-borde-fuerte text-base-texto-secundario'"
        @click="$emit('update:modelValue', null)">
        Automático
      </button>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { COLORES_CLASE } from '~/utils/pestanasClase'

defineProps<{ modelValue: string | null }>()
defineEmits<{ 'update:modelValue': [valor: string | null] }>()

const NOMBRES: Record<string, string> = {
  '#0B3D91': 'Azul', '#0F766E': 'Verde azulado', '#7B2FBF': 'Morado', '#B45309': 'Ámbar', '#334155': 'Pizarra', '#BE185D': 'Fucsia',
}
</script>

<style scoped>
.muestra { transition: transform 150ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 150ms ease; }
.muestra:active { transform: scale(0.94); }
.muestra.elegida { box-shadow: 0 0 0 2px rgb(var(--c-base-blanco)), 0 0 0 4px currentColor; color: #fff; }
.muestra.elegida { box-shadow: 0 0 0 2px rgb(var(--c-base-blanco)), 0 0 0 4px rgb(var(--c-base-texto-primario)); }
@media (prefers-reduced-motion: reduce) { .muestra { transition: none; } .muestra:active { transform: none; } }
</style>
