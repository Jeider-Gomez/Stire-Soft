<!-- Las distribuciones de la página web (mesa de trabajo, 14/11, Jeider: «reglas por cumplir… a la izquierda… algo bien dinámico»).
     Cada una pliega o muestra el enunciado y la vista previa, y decide de qué lado van las reglas. Se recuerdan en este navegador.
     utils/mesaEjercicio.ts. -->
<template>
  <div class="flex items-center gap-1" role="group" aria-label="Distribución del ejercicio">
    <span class="hidden xl:inline text-[10px] text-editor-muted mr-1">Vista</span>
    <button
      v-for="v in VISTAS"
      :key="v.id"
      type="button"
      class="min-h-[28px] px-2 rounded-md inline-flex items-center gap-1 text-[11px] font-semibold transition-colors"
      :class="actual === v.id ? 'bg-white/15 text-white' : 'text-editor-muted hover:text-white hover:bg-white/10'"
      :aria-pressed="actual === v.id"
      :title="`${v.nombre}: ${v.ayuda}`"
      @click="elegir(v.id)">
      <component :is="v.icono" :size="13" aria-hidden="true" />
      <span class="sr-only">{{ v.nombre }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Code2, Columns3, Maximize2, PanelLeftDashed } from 'lucide-vue-next'
import { VISTAS_WEB, vistaWebActual, vistaWebDe, type IdVistaWeb } from '~/utils/mesaEjercicio'

const ICONOS = { clasica: Columns3, reglas: PanelLeftDashed, codigo: Code2, solo: Maximize2 } as const
const VISTAS = VISTAS_WEB.map((v) => ({ ...v, icono: ICONOS[v.id] }))

const { plegado: panelPlegado, plegar: plegarPanel } = usePanelPlegable('stire.ejercicio.panelPlegado')
const { plegado: previaPlegada, plegar: plegarPrevia } = usePanelPlegable('stire.ejercicio.previaPlegada')
const { plegado: reglasIzquierda, plegar: ponerReglasIzquierda } = usePanelPlegable('stire.ejercicio.reglasIzquierda')
const actual = computed(() => vistaWebActual(panelPlegado.value, previaPlegada.value, reglasIzquierda.value))

function elegir(id: IdVistaWeb) {
  const v = vistaWebDe(id)
  plegarPanel(v.panelPlegado)
  plegarPrevia(v.previaPlegada)
  ponerReglasIzquierda(v.reglasIzquierda)
}
</script>
