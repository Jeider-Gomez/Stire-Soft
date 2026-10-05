<template>
  <!-- Paleta para agregar figuras (antes seis botones copiados dentro de EditorDiagrama.vue). «Inicio» solo aparece si
       el diagrama no tiene uno. -->
  <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-2.5 shadow-sm space-y-2" role="toolbar" aria-label="Herramientas para agregar figuras">
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <span class="text-[11px] font-bold text-base-texto-secundario uppercase tracking-wider">Agregar figura</span>
      <span v-if="lleno" class="text-[11px] font-bold text-semantico-falla bg-semantico-falla/10 px-2 py-0.5 rounded">Límite alcanzado: {{ limite }} figuras</span>
      <span v-else class="text-[11px] text-base-texto-secundario">{{ cantidad }} de {{ limite }} figuras</span>
    </div>
    <div class="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
      <button v-for="b in botones" :key="b.tipo" type="button" :disabled="lleno"
        class="min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-lg border border-base-borde-fuerte bg-base-blanco hover:bg-base-bg-secundario disabled:opacity-50 text-base-texto-primario font-semibold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-sm"
        @click="emit('agregar', b.tipo)">
        <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" class="text-acento-ambar-fuerte">
          <rect v-if="b.forma === 'ovalo'" x="1" y="1" width="16" height="10" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="1.8" />
          <rect v-else-if="b.forma === 'rectangulo'" x="1" y="2" width="16" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8" />
          <polygon v-else-if="b.forma === 'rombo'" points="9,1 17,6 9,11 1,6" fill="none" stroke="currentColor" stroke-width="1.8" />
          <polygon v-else points="4,1 17,1 14,11 1,11" fill="none" stroke="currentColor" stroke-width="1.8" />
        </svg>
        <span>{{ b.nombre }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TIPO_FIGURA, type TipoFigura } from '~/utils/diagramaFlujo'

const props = defineProps<{ cantidad: number; limite: number; hayInicio: boolean }>()
const emit = defineEmits<{ agregar: [tipo: TipoFigura] }>()

// En el orden en que se arma un algoritmo: empieza, pide, calcula, decide, muestra, termina.
const ORDEN: TipoFigura[] = ['inicio', 'entrada', 'proceso', 'decision', 'salida', 'fin']
const botones = computed(() => ORDEN.filter((t) => t !== 'inicio' || !props.hayInicio).map((tipo) => ({ tipo, ...TIPO_FIGURA[tipo] })))
const lleno = computed(() => props.cantidad >= props.limite)
</script>
