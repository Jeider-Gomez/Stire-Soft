<template>
  <!-- META-02 (Caro, 2015: juicios metacognitivos): antes de la PRIMERA entrega del ejercicio, «¿Qué tan seguro estás?».
       Tres opciones y «Omitir»; no se vuelve a preguntar en los intentos siguientes. Al calificar se muestra la
       calibración y el Tutor la usa. -->
  <div v-if="workspaceStore.pidiendoConfianza" class="fixed inset-0 z-[90] bg-slate-900/40 flex items-end sm:items-center justify-center p-4" @mousedown.self="omitir">
    <div role="dialog" aria-modal="true" aria-labelledby="confianza-titulo" aria-describedby="confianza-ayuda" class="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-base-blanco rounded-xl shadow-xl border border-base-borde-sutil p-5 space-y-3">
      <h2 id="confianza-titulo" class="text-sm font-bold text-base-texto-primario">Antes de entregar: ¿qué tan seguro estás de tu solución?</h2>
      <p id="confianza-ayuda" class="text-xs text-slate-600">Al calificar te mostramos si tu juicio coincidió. Aprender a saber cuándo sabes también es aprender.</p>
      <div class="grid gap-2">
        <button
          v-for="(op, i) in OPCIONES_CONFIANZA"
          :key="op.valor"
          :ref="(el) => { if (i === 0) primera = el as HTMLButtonElement }"
          type="button"
          class="min-h-[48px] px-4 rounded-lg border border-base-borde-fuerte text-left hover:border-acento-ambar-fuerte hover:bg-acento-ambar/5 focus-visible:ring-2 focus-visible:ring-acento-ambar-fuerte"
          @click="workspaceStore.responderConfianza(op.valor)">
          <span class="block text-sm font-semibold text-base-texto-primario">{{ op.texto }}</span>
          <span class="block text-[11px] text-slate-600">{{ op.ayuda }}</span>
        </button>
      </div>
      <button type="button" class="w-full min-h-[44px] text-xs font-semibold text-slate-600 hover:text-base-texto-primario" @click="omitir">
        Omitir y entregar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useWorkspaceStore } from '~/stores/workspace'
import { OPCIONES_CONFIANZA } from '~/utils/confianza'

const workspaceStore = useWorkspaceStore()
const primera = ref<HTMLButtonElement | null>(null)
const omitir = () => workspaceStore.responderConfianza(null)

watch(() => workspaceStore.pidiendoConfianza, async (abierto) => {
  if (abierto) { await nextTick(); primera.value?.focus() }
})
// Escape cierra sin entregar: el estudiante quizá quería seguir editando.
useEscapeToClose(() => workspaceStore.pidiendoConfianza, () => { workspaceStore.pidiendoConfianza = false })
</script>
