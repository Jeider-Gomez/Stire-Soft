<template>
  <!-- Diálogo de confirmación propio (useConfirmar). Uno por diseño de página; nunca se abre uno encima de otro. -->
  <div v-if="pedido" class="fixed inset-0 z-[90] bg-slate-900/50 flex items-center justify-center p-4" @mousedown.self="pedido.responder(false)">
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirmar-titulo"
      aria-describedby="confirmar-mensaje"
      class="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-base-blanco rounded-xl shadow-xl border border-base-borde-sutil p-5 space-y-4">
      <div class="flex items-start gap-3">
        <span class="shrink-0 w-9 h-9 rounded-full flex items-center justify-center" :class="pedido.peligro ? 'bg-red-50 text-red-700' : 'bg-acento-ambar/10 text-acento-ambar-fuerte'">
          <TriangleAlert v-if="pedido.peligro" :size="18" aria-hidden="true" />
          <CircleHelp v-else :size="18" aria-hidden="true" />
        </span>
        <div class="space-y-1">
          <h2 id="confirmar-titulo" class="text-sm font-bold text-base-texto-primario">{{ pedido.titulo }}</h2>
          <p id="confirmar-mensaje" class="text-xs text-slate-600 leading-relaxed">{{ pedido.mensaje }}</p>
        </div>
      </div>
      <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <button
          ref="botonCancelar"
          type="button"
          class="min-h-[44px] px-4 rounded-md text-sm font-semibold border border-base-borde-fuerte text-base-texto-primario hover:bg-base-bg-secundario"
          @click="pedido.responder(false)">
          {{ pedido.cancelar ?? 'Cancelar' }}
        </button>
        <button
          type="button"
          class="min-h-[44px] px-4 rounded-md text-sm font-bold text-white"
          :class="pedido.peligro ? 'bg-red-700 hover:bg-red-800' : 'bg-acento-ambar-fuerte hover:bg-acento-ambar'"
          @click="pedido.responder(true)">
          {{ pedido.accion }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { CircleHelp, TriangleAlert } from 'lucide-vue-next'
import { useConfirmar } from '~/composables/useConfirmar'
import { useEscapeToClose } from '~/composables/useEscapeToClose'

const { pedido } = useConfirmar()
const botonCancelar = ref<HTMLButtonElement | null>(null)
let focoAnterior: HTMLElement | null = null

// El foco va a «Cancelar» (lo seguro) y vuelve a donde estaba al cerrar.
watch(pedido, async (actual, antes) => {
  if (actual && !antes) {
    focoAnterior = document.activeElement as HTMLElement | null
    await nextTick()
    botonCancelar.value?.focus()
  } else if (!actual && antes) {
    focoAnterior?.focus?.()
  }
})
useEscapeToClose(() => pedido.value !== null, () => pedido.value?.responder(false))
</script>
