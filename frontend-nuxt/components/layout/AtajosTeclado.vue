<template>
  <!-- Atajos de teclado (utils/atajos.ts), desde el menú de ayuda. <dialog> nativo: atrapa el foco y se cierra con Esc. -->
  <dialog ref="dialogo" aria-labelledby="atajos-titulo" class="w-[min(28rem,calc(100vw-2rem))] rounded-2xl p-0 shadow-xl backdrop:bg-slate-900/40" @close="emit('cerrar')">
    <div class="p-5 space-y-4">
      <div class="flex items-start justify-between gap-3">
        <h2 id="atajos-titulo" class="font-poppins text-lg font-bold text-base-texto-primario">Atajos de teclado</h2>
        <button title="Cerrar" type="button" class="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Cerrar" @click="dialogo?.close()">
          <X :size="18" aria-hidden="true" />
        </button>
      </div>
      <dl class="space-y-3 text-sm">
        <div v-for="a in ATAJOS" :key="a.accion" class="flex items-start justify-between gap-4">
          <dt class="text-base-texto-primario">
            <span class="font-semibold">{{ a.accion }}</span>
            <span class="block text-xs text-slate-600">{{ a.donde }}</span>
          </dt>
          <dd class="flex items-center gap-1 shrink-0">
            <template v-for="(t, i) in a.teclas" :key="t">
              <span v-if="i" class="text-xs text-slate-500" aria-hidden="true">+</span>
              <kbd class="px-2 py-0.5 rounded-md border border-slate-300 bg-slate-50 text-xs font-mono font-semibold text-slate-700">{{ t }}</kbd>
            </template>
          </dd>
        </div>
      </dl>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { ATAJOS } from '~/utils/atajos'

const props = defineProps<{ abierto: boolean }>()
const emit = defineEmits<{ cerrar: [] }>()
const dialogo = ref<HTMLDialogElement | null>(null)
watch(() => props.abierto, (v) => {
  if (v && !dialogo.value?.open) dialogo.value?.showModal()
  if (!v && dialogo.value?.open) dialogo.value.close()
})
</script>
