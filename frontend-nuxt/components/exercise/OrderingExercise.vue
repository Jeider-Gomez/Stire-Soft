<template>
  <div class="space-y-5">
    <!-- Enunciado de la pregunta -->
    <div v-if="showStatement" class="prose prose-xs text-base-texto-primario">
      <p class="text-xs leading-relaxed whitespace-pre-wrap">{{ question.question }}</p>
    </div>

    <p class="m-0 text-[15px] text-base-texto-primario">Arrastra los pasos para ponerlos en orden, o usa las flechas.</p>

    <!-- v3 (cuadro «E-Tipo-Ordenar»): se arrastran con el ratón; las flechas siguen para el teclado y el celular. -->
    <ol class="m-0 p-0 list-none space-y-2">
      <li
        v-for="(block, index) in orderedBlocks"
        :key="block.id"
        draggable="true"
        class="fila-ordenar flex items-center gap-2.5 min-h-[48px] pl-3 pr-1 py-1 rounded-xl"
        :class="{ arrastrando: arrastrado === index, destino: sobre === index && arrastrado !== index }"
        @dragstart="arrastrado = index"
        @dragover.prevent="sobre = index"
        @dragleave="sobre = sobre === index ? null : sobre"
        @drop.prevent="soltar(index)"
        @dragend="arrastrado = null; sobre = null"
      >
        <GripVertical :size="16" class="shrink-0 text-base-texto-secundario cursor-grab" aria-hidden="true" />
        <span class="w-7 h-7 rounded-full bg-base-bg-secundario text-xs font-bold flex items-center justify-center flex-shrink-0" aria-hidden="true">{{ index + 1 }}</span>
        <span class="font-codigo text-sm text-base-texto-primario flex-1 min-w-0 break-words">{{ block.content }}</span>
        <span class="flex items-center gap-1">
          <button
            type="button"
            @click="moveUp(index)"
            :disabled="index === 0"
            class="w-11 h-11 md:w-9 md:h-9 rounded-lg inline-flex items-center justify-center text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-borde-sutil disabled:opacity-0 disabled:cursor-not-allowed transition-colors"
            :aria-label="`Subir «${block.content}»`"
            title="Mover arriba"
          >
            <ArrowUp :size="16" aria-hidden="true" />
          </button>
          <button
            type="button"
            @click="moveDown(index)"
            :disabled="index === orderedBlocks.length - 1"
            class="w-11 h-11 md:w-9 md:h-9 rounded-lg inline-flex items-center justify-center text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-borde-sutil disabled:opacity-0 disabled:cursor-not-allowed transition-colors"
            :aria-label="`Bajar «${block.content}»`"
            title="Mover abajo"
          >
            <ArrowDown :size="16" aria-hidden="true" />
          </button>
        </span>
      </li>
    </ol>

  </div>
</template>

<script setup lang="ts">
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-vue-next'
import { useWorkspaceStore } from '~/stores/workspace'

interface BlockItem {
  id: string
  content: string
}

interface Props {
  question: { id: number; type: string; question: string; config: Record<string, any> }
  /** La pantalla del ejercicio ya muestra el enunciado con formato arriba. */
  showStatement?: boolean
}

const props = withDefaults(defineProps<Props>(), { showStatement: true })
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

/** Arrastrar y soltar: el bloque arrastrado pasa al lugar donde se suelta. */
const arrastrado = ref<number | null>(null)
const sobre = ref<number | null>(null)
function soltar(destino: number) {
  const origen = arrastrado.value
  arrastrado.value = null
  sobre.value = null
  if (origen === null || origen === destino) return
  const lista = [...orderedBlocks.value]
  const [movido] = lista.splice(origen, 1)
  lista.splice(destino, 0, movido)
  orderedBlocks.value = lista
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

<style scoped>
.fila-ordenar { border: 1px solid rgb(var(--c-base-borde-fuerte)); background: rgb(var(--c-base-blanco)); transition: border-color 0.15s ease, opacity 0.15s ease; }
.fila-ordenar.arrastrando { opacity: 0.5; }
.fila-ordenar.destino { border: 2px dashed rgb(var(--c-base-texto-primario)); }
</style>
