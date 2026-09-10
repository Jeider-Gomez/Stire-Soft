<template>
  <div class="space-y-5">
    <!-- Enunciado de la pregunta -->
    <div class="prose prose-xs text-base-texto-primario">
      <p class="text-xs leading-relaxed whitespace-pre-wrap">{{ question.question }}</p>
    </div>

    <!-- Instrucciones -->
    <div class="text-[11px] text-base-texto-secundario bg-base-bg-secundario px-3 py-2 rounded border border-base-borde-sutil">
      Organiza los siguientes bloques en el orden secuencial correcto usando los botones ⬆ y ⬇:
    </div>

    <!-- Lista de bloques reordenables -->
    <div class="space-y-2">
      <div
        v-for="(block, index) in orderedBlocks"
        :key="block.id"
        class="flex items-center justify-between p-3 rounded-lg border border-base-borde-sutil bg-base-blanco transition-all shadow-xs hover:border-acento-ambar/50"
      >
        <div class="flex items-center gap-3 flex-1">
          <!-- Indicador de posición -->
          <span class="w-6 h-6 rounded-full bg-acento-ambar/10 text-acento-ambar-fuerte font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 border border-acento-ambar/30">
            {{ index + 1 }}
          </span>

          <!-- Contenido del bloque -->
          <span class="text-xs text-base-texto-primario font-mono bg-base-bg-secundario px-2.5 py-1.5 rounded border border-base-borde-sutil flex-1">
            {{ block.content }}
          </span>
        </div>

        <!-- Botones para subir / bajar -->
        <div class="flex items-center gap-1 ml-3">
          <button
            type="button"
            @click="moveUp(index)"
            :disabled="index === 0"
            class="p-1.5 rounded text-xs border border-base-borde-sutil hover:bg-base-bg-secundario disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base-texto-primario"
            title="Mover arriba"
          >
            ⬆
          </button>
          <button
            type="button"
            @click="moveDown(index)"
            :disabled="index === orderedBlocks.length - 1"
            class="p-1.5 rounded text-xs border border-base-borde-sutil hover:bg-base-bg-secundario disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base-texto-primario"
            title="Mover abajo"
          >
            ⬇
          </button>
        </div>
      </div>
    </div>

    <!-- Estado -->
    <div class="text-[11px] text-base-texto-secundario flex items-center justify-between pt-1">
      <span class="text-semantico-pasa">
        ✔ {{ orderedBlocks.length }} bloques ordenados. Puedes ajustar el orden o entregar.
      </span>
      <span>
        Presiona <strong>🚀 Entregar solución</strong> en la barra superior para evaluar.
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/workspace'

interface BlockItem {
  id: string
  content: string
}

interface Props {
  question: { id: number; type: string; question: string; config: Record<string, any> }
}

const props = defineProps<Props>()
const workspaceStore = useWorkspaceStore()

const blocks = computed<BlockItem[]>(() => props.question.config?.blocks || [])
const orderedBlocks = ref<BlockItem[]>([])

watch(
  blocks,
  (newBlocks) => {
    orderedBlocks.value = [...newBlocks]
    syncPendingAnswer()
  },
  { immediate: true }
)

function moveUp(index: number) {
  if (index <= 0) return
  const temp = orderedBlocks.value[index]
  orderedBlocks.value[index] = orderedBlocks.value[index - 1]
  orderedBlocks.value[index - 1] = temp
  syncPendingAnswer()
}

function moveDown(index: number) {
  if (index >= orderedBlocks.value.length - 1) return
  const temp = orderedBlocks.value[index]
  orderedBlocks.value[index] = orderedBlocks.value[index + 1]
  orderedBlocks.value[index + 1] = temp
  syncPendingAnswer()
}

function syncPendingAnswer() {
  if (orderedBlocks.value.length > 0) {
    workspaceStore.pendingAnswer = {
      order: orderedBlocks.value.map(b => b.id)
    }
  } else {
    workspaceStore.pendingAnswer = null
  }
}

onMounted(() => {
  syncPendingAnswer()
})
</script>
