<!-- La fuerza de la clave al registrarse (JEIDER-S08-12): una barra que se llena con los colores de STIRE y dice en
     palabras qué tan fuerte es, y debajo las reglas del servidor, siempre a la vista (utils/fuerzaClave.ts). Solo tokens
     de la identidad visual (tailwind.config.ts de José); no toca sus archivos. -->
<template>
  <div class="space-y-1.5">
    <div v-if="fuerza.nivel > 0" class="flex items-center gap-2">
      <div class="flex-1 grid grid-cols-4 gap-1" aria-hidden="true">
        <span v-for="i in 4" :key="i" class="h-1.5 rounded-full bg-base-bg-secundario overflow-hidden">
          <span class="block h-full rounded-full transition-all duration-300 ease-out" :class="i <= fuerza.nivel ? COLOR[fuerza.nivel] : ''" :style="{ width: i <= fuerza.nivel ? '100%' : '0%' }" />
        </span>
      </div>
      <span class="text-[11px] font-bold whitespace-nowrap" :class="TEXTO[fuerza.nivel]">{{ fuerza.texto }}</span>
    </div>
    <p v-if="fuerza.nivel > 0" class="text-[11px] text-base-texto-secundario" aria-live="polite">
      <span class="sr-only">Contraseña {{ fuerza.texto.toLowerCase() }}. </span>{{ fuerza.consejo }}
    </p>
    <ul class="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
      <li v-for="regla in reglas" :key="regla.texto" class="flex items-center gap-1" :class="regla.cumple ? 'text-semantico-pasa font-semibold' : falta ? 'text-semantico-falla font-semibold' : 'text-base-texto-secundario'">
        <Check v-if="regla.cumple" :size="11" aria-hidden="true" />
        <span v-else class="w-[11px] text-center" aria-hidden="true">·</span>
        {{ regla.texto }}<span class="sr-only">{{ regla.cumple ? ' (cumplido)' : ' (pendiente)' }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { fuerzaDeClave, reglasDeClave } from '~/utils/fuerzaClave'

const props = defineProps<{ clave: string; falta?: boolean }>()
const reglas = computed(() => reglasDeClave(props.clave))
const fuerza = computed(() => fuerzaDeClave(props.clave))

/** Débil en rojo, aceptable en el azul de acento, buena en el azul de STIRE y fuerte con el degradado de la marca. */
const COLOR: Record<number, string> = {
  1: 'bg-semantico-falla',
  2: 'bg-acento-ambar-fuerte',
  3: 'bg-stire-blue',
  4: 'bg-gradient-to-r from-stire-blue to-stire-purple',
}
const TEXTO: Record<number, string> = {
  1: 'text-semantico-falla',
  2: 'text-acento-ambar-fuerte',
  3: 'text-acento-ambar-fuerte',
  4: 'text-semantico-pasa',
}
</script>
