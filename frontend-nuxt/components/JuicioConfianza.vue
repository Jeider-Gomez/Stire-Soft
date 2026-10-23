<template>
  <!-- META-02 (Caro, 2015: juicios metacognitivos): antes de la PRIMERA entrega del ejercicio, «¿Qué tan seguro estás?».
       Tres opciones, «Volver a editar» y «Omitir y entregar»; no se vuelve a preguntar en los intentos siguientes. Al calificar se muestra la
       calibración y el Tutor la usa. «No volver a preguntarme» la apaga para siempre en este navegador; se vuelve a encender en
       Apariencia › Al practicar (23/10, pedido del dueño). -->
  <div v-if="workspaceStore.pidiendoConfianza" class="fixed inset-0 z-[90] bg-slate-900/40 flex items-end sm:items-center justify-center p-4" @mousedown.self="volverAEditar">
    <div role="dialog" aria-modal="true" aria-labelledby="confianza-titulo" aria-describedby="confianza-ayuda" class="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-base-blanco rounded-xl shadow-xl border border-base-borde-sutil p-5 space-y-3">
      <h2 id="confianza-titulo" class="text-sm font-bold text-base-texto-primario">Antes de entregar: ¿qué tan seguro estás de {{ workspaceStore.currentExercise.questionType === 'coding' ? 'que pasa todos los casos' : 'tu respuesta' }}?</h2>
      <!-- Para qué sirve, en palabras (07/10, Jeider: «¿qué es eso de calibrar mi juicio?»). -->
      <p id="confianza-ayuda" class="text-xs text-slate-600">Sirve para dos cosas: si estabas seguro y aciertas, la lección tarda más en volver a tus repasos; y al calificar ves si tu seguridad coincidió con el resultado. Saber cuándo sabes también es aprender.</p>
      <div class="grid gap-2">
        <button
          v-for="(op, i) in OPCIONES_CONFIANZA"
          :key="op.valor"
          :ref="(el) => { if (i === 0) primera = el as HTMLButtonElement }"
          type="button"
          class="min-h-[48px] px-4 rounded-lg border border-base-borde-fuerte text-left hover:border-acento-ambar-fuerte hover:bg-acento-ambar/5 focus-visible:ring-2 focus-visible:ring-acento-ambar-fuerte"
          @click="responder(op.valor)">
          <span class="block text-sm font-semibold text-base-texto-primario">{{ op.texto }}</span>
          <span class="block text-[11px] text-slate-600">{{ op.ayuda }}</span>
        </button>
      </div>
      <label class="flex items-start gap-2 min-h-[44px] cursor-pointer text-xs">
        <input id="no-volver-a-preguntar" v-model="noVolver" type="checkbox" class="mt-0.5 w-4 h-4 accent-acento-ambar-fuerte" />
        <span><span class="font-semibold text-base-texto-primario">No volver a preguntarme</span>
          <span class="block text-[11px] text-slate-600">Sin tu respuesta, ningún repaso se marca como «Fácil» y tu calibración deja de llenarse. Lo vuelves a activar en Apariencia › Al practicar.</span></span>
      </label>
      <!-- UX-02 (Jorge, 14/10): salir sin entregar tiene que estar a la vista; tocar fuera tampoco entrega. -->
      <div class="grid grid-cols-2 gap-2">
        <button type="button" class="min-h-[44px] rounded-lg border border-base-borde-fuerte text-xs font-semibold text-base-texto-primario hover:bg-slate-50" @click="volverAEditar">
          Volver a editar
        </button>
        <button type="button" class="min-h-[44px] text-xs font-semibold text-slate-600 hover:text-base-texto-primario" @click="omitir">
          Omitir y entregar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useWorkspaceStore } from '~/stores/workspace'
import { OPCIONES_CONFIANZA, type Confianza } from '~/utils/confianza'

const workspaceStore = useWorkspaceStore()
const { cambiar } = useApariencia()
const primera = ref<HTMLButtonElement | null>(null)
const noVolver = ref(false)
// La casilla solo cuenta al entregar (responder u omitir); «Volver a editar» no cambia nada.
function responder(c: Confianza | null) {
  if (noVolver.value) cambiar({ preguntarConfianza: false })
  workspaceStore.responderConfianza(c)
}
const omitir = () => responder(null)
// Cierra sin entregar: el estudiante vio algo que quiere corregir antes de gastar el intento.
const volverAEditar = () => { workspaceStore.pidiendoConfianza = false }

watch(() => workspaceStore.pidiendoConfianza, async (abierto) => {
  if (abierto) { await nextTick(); primera.value?.focus() }
})
// Escape cierra sin entregar: el estudiante quizá quería seguir editando.
useEscapeToClose(() => workspaceStore.pidiendoConfianza, volverAEditar)
</script>
