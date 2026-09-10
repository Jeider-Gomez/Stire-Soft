<template>
  <div class="space-y-5">
    <!-- Enunciado de la pregunta -->
    <div class="prose prose-xs text-base-texto-primario">
      <p class="text-xs leading-relaxed whitespace-pre-wrap">{{ question.question }}</p>
    </div>

    <!-- Instrucciones -->
    <div class="text-[11px] text-base-texto-secundario bg-base-bg-secundario px-3 py-2 rounded border border-base-borde-sutil">
      Empareja cada concepto de la columna izquierda con su correspondiente definición o valor en la columna derecha:
    </div>

    <!-- Filas de emparejamiento -->
    <div class="space-y-3">
      <div
        v-for="leftItem in leftColumn"
        :key="leftItem.id"
        class="p-3 rounded-lg border border-base-borde-sutil bg-base-blanco flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all hover:border-acento-ambar/50"
      >
        <!-- Elemento de la izquierda -->
        <div class="flex items-center gap-2 flex-1">
          <span class="w-2 h-2 rounded-full bg-acento-ambar-fuerte flex-shrink-0"></span>
          <span class="text-xs text-base-texto-primario font-mono bg-base-bg-secundario px-2.5 py-1.5 rounded border border-base-borde-sutil flex-1">
            {{ leftItem.content }}
          </span>
        </div>

        <!-- Flecha o separador -->
        <span class="text-base-texto-secundario hidden sm:inline text-xs font-bold">➔</span>

        <!-- Selector de la columna derecha -->
        <div class="flex-1 sm:max-w-xs">
          <select
            :id="`matching-select-${leftItem.id}`"
            v-model="pairs[leftItem.id]"
            class="w-full text-xs bg-base-blanco text-base-texto-primario border border-base-borde-sutil rounded px-2.5 py-1.5 focus:border-acento-ambar-fuerte focus:outline-none focus:ring-1 focus:ring-acento-ambar-fuerte transition-colors"
            :class="pairs[leftItem.id] ? 'border-acento-ambar-fuerte text-acento-ambar-fuerte font-semibold' : 'text-base-texto-secundario'"
          >
            <option value="" disabled>-- Selecciona coincidencia --</option>
            <option
              v-for="rightItem in rightColumn"
              :key="rightItem.id"
              :value="rightItem.id"
            >
              {{ rightItem.content }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Estado de completitud -->
    <div class="text-[11px] text-base-texto-secundario flex items-center justify-between pt-1">
      <span v-if="allPaired" class="text-semantico-pasa">
        ✔ Todos los elementos emparejados ({{ Object.keys(pairs).length }}/{{ leftColumn.length }}).
      </span>
      <span v-else class="text-acento-ambar-fuerte">
        ⚠ Empareja todos los elementos antes de entregar ({{ pairedCount }}/{{ leftColumn.length }} emparejados).
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/workspace'

interface ColumnItem {
  id: string
  content: string
}

interface Props {
  question: { id: number; type: string; question: string; config: Record<string, any> }
}

const props = defineProps<Props>()
const workspaceStore = useWorkspaceStore()

const leftColumn = computed<ColumnItem[]>(() => props.question.config?.leftColumn || [])
const rightColumn = computed<ColumnItem[]>(() => props.question.config?.rightColumn || [])

const pairs = reactive<Record<string, string>>({})

watch(
  leftColumn,
  (newLeft) => {
    Object.keys(pairs).forEach(k => delete pairs[k])
    newLeft.forEach(item => {
      pairs[item.id] = ''
    })
  },
  { immediate: true }
)

const pairedCount = computed(() => {
  return leftColumn.value.filter(item => Boolean(pairs[item.id])).length
})

const allPaired = computed(() => {
  return leftColumn.value.length > 0 && pairedCount.value === leftColumn.value.length
})

// Sincronizar con pendingAnswer del store: { pairs: { left_1: "right_a" } }
watch(
  pairs,
  () => {
    if (allPaired.value) {
      const cleanPairs: Record<string, string> = {}
      leftColumn.value.forEach(item => {
        cleanPairs[item.id] = pairs[item.id]
      })
      workspaceStore.pendingAnswer = { pairs: cleanPairs }
    } else {
      workspaceStore.pendingAnswer = null
    }
  },
  { deep: true }
)

onMounted(() => {
  workspaceStore.pendingAnswer = null
})
</script>
