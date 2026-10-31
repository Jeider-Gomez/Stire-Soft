<!-- Las vistas del ejercicio de programar (31/10/2026, Jeider: «quisiera tener diferentes vistas para más comodidad»). Tres acomodos que
     combinan lo que ya se podía plegar: el enunciado (panel izquierdo) y la salida (bajo el editor). Se recuerdan en este navegador.
     utils/vistaEjercicio.ts. -->
<template>
  <div class="flex items-center gap-1" role="group" aria-label="Vista del ejercicio">
    <span class="hidden lg:inline text-[10px] text-editor-muted mr-1">Vista</span>
    <button
      v-for="v in VISTAS"
      :key="v.id"
      type="button"
      class="min-h-[28px] px-2 rounded-md inline-flex items-center gap-1 text-[11px] font-semibold transition-colors"
      :class="actual === v.id ? 'bg-white/15 text-white' : 'text-editor-muted hover:text-white hover:bg-white/10'"
      :aria-pressed="actual === v.id"
      :title="v.ayuda"
      @click="$emit('elegir', v.id)">
      <component :is="v.icono" :size="13" aria-hidden="true" />
      <span class="hidden xl:inline">{{ v.nombre }}</span>
      <span class="xl:hidden sr-only">{{ v.nombre }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Code2, Columns2, Maximize2 } from 'lucide-vue-next'
import { vistaActual, VISTAS_DEL_EJERCICIO, type IdVista } from '~/utils/vistaEjercicio'

const props = defineProps<{ panelPlegado: boolean; salidaPlegada: boolean }>()
defineEmits<{ elegir: [id: IdVista] }>()

const ICONOS = { estandar: Columns2, codigo: Code2, solo: Maximize2 } as const
const VISTAS = VISTAS_DEL_EJERCICIO.map((v) => ({ ...v, icono: ICONOS[v.id] }))
const actual = computed(() => vistaActual(props.panelPlegado, props.salidaPlegada))
</script>
