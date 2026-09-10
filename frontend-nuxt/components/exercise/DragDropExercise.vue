<template>
  <div class="space-y-5">
    <!-- Enunciado de la pregunta -->
    <div class="prose prose-xs text-base-texto-primario">
      <p class="text-xs leading-relaxed whitespace-pre-wrap">{{ question.question }}</p>
    </div>

    <!-- Instrucciones -->
    <div class="text-[11px] text-base-texto-secundario bg-base-bg-secundario px-3 py-2 rounded border border-base-borde-sutil">
      Asigna cada elemento a su categoría o zona correspondiente:
    </div>

    <!-- Lista de elementos y sus zonas de destino -->
    <div class="space-y-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="p-3 rounded-lg border border-base-borde-sutil bg-base-blanco flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all hover:border-acento-ambar/50"
      >
        <!-- Contenido del elemento -->
        <div class="flex items-center gap-2 flex-1">
          <span class="w-2 h-2 rounded-full bg-acento-ambar-fuerte flex-shrink-0"></span>
          <span class="text-xs text-base-texto-primario font-mono bg-base-bg-secundario px-2 py-1 rounded border border-base-borde-sutil">
            {{ item.content }}
          </span>
        </div>

        <!-- Selector de destino -->
        <div class="flex items-center gap-2">
          <span class="text-[11px] text-base-texto-secundario font-medium">Asignar a:</span>
          <select
            :id="`select-${item.id}`"
            v-model="mappings[item.id]"
            class="text-xs bg-base-blanco text-base-texto-primario border border-base-borde-sutil rounded px-2.5 py-1.5 focus:border-acento-ambar-fuerte focus:outline-none focus:ring-1 focus:ring-acento-ambar-fuerte transition-colors"
            :class="mappings[item.id] ? 'border-acento-ambar-fuerte text-acento-ambar-fuerte font-semibold' : 'text-base-texto-secundario'"
          >
            <option value="" disabled>-- Selecciona destino --</option>
            <option
              v-for="target in targets"
              :key="target.id"
              :value="target.id"
            >
              {{ target.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Estado de completitud -->
    <div class="text-[11px] text-base-texto-secundario flex items-center justify-between pt-1">
      <span v-if="allAssigned" class="text-semantico-pasa">
        ✔ Todos los elementos han sido asignados ({{ Object.keys(mappings).length }}/{{ items.length }}).
      </span>
      <span v-else class="text-acento-ambar-fuerte">
        ⚠ Asigna todos los elementos antes de entregar ({{ assignedCount }}/{{ items.length }} asignados).
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/workspace'

interface DragItem {
  id: string
  content: string
}

interface DropTarget {
  id: string
  label: string
}

interface Props {
  question: { id: number; type: string; question: string; config: Record<string, any> }
}

const props = defineProps<Props>()
const workspaceStore = useWorkspaceStore()

const items = computed<DragItem[]>(() => props.question.config?.items || [])
const targets = computed<DropTarget[]>(() => props.question.config?.targets || [])

const mappings = reactive<Record<string, string>>({})

watch(
  items,
  (newItems) => {
    Object.keys(mappings).forEach(k => delete mappings[k])
    newItems.forEach(item => {
      mappings[item.id] = ''
    })
  },
  { immediate: true }
)

const assignedCount = computed(() => {
  return items.value.filter(item => Boolean(mappings[item.id])).length
})

const allAssigned = computed(() => {
  return items.value.length > 0 && assignedCount.value === items.value.length
})

// Sincronizar con pendingAnswer del store: { mappings: { item_1: "zone_a" } }
watch(
  mappings,
  () => {
    if (allAssigned.value) {
      const cleanMappings: Record<string, string> = {}
      items.value.forEach(item => {
        cleanMappings[item.id] = mappings[item.id]
      })
      workspaceStore.pendingAnswer = { mappings: cleanMappings }
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
