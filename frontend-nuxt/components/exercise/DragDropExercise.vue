<template>
  <div class="space-y-5">
    <p v-if="showStatement" class="text-sm leading-relaxed whitespace-pre-wrap text-base-texto-primario">{{ question.question }}</p>

    <p class="text-xs text-base-texto-secundario">
      Arrastra cada elemento a su categoría, o tócalo y luego toca la categoría.
    </p>

    <!-- Elementos sin ubicar -->
    <div
      class="min-h-[3.5rem] rounded-xl border-2 border-dashed p-3 flex flex-wrap gap-2 transition-colors"
      :class="dragOver === TRAY ? 'border-acento-ambar-fuerte bg-acento-ambar/5' : 'border-base-borde-sutil bg-base-bg-secundario/50'"
      @dragover.prevent="dragOver = TRAY"
      @dragleave="dragOver = null"
      @drop.prevent="dropOn(null)"
      aria-label="Elementos por ubicar">
      <button
        v-for="item in unplaced"
        :key="item.id"
        type="button"
        draggable="true"
        @dragstart="onDragStart(item.id)"
        @dragend="dragOver = null"
        @click="toggleSelect(item.id)"
        :aria-pressed="selected === item.id"
        class="px-3 py-1.5 rounded-lg border text-xs font-mono cursor-grab active:cursor-grabbing shadow-xs transition focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
        :class="selected === item.id ? 'bg-acento-ambar-fuerte text-base-blanco border-acento-ambar-fuerte' : 'bg-base-blanco text-base-texto-primario border-base-borde-fuerte hover:border-acento-ambar-fuerte'">
        {{ item.content }}
      </button>
      <p v-if="unplaced.length === 0" class="text-xs text-semantico-pasa self-center">Ubicaste todos los elementos. Revisa y entrega cuando quieras.</p>
    </div>

    <!-- Categorías -->
    <div class="grid gap-3" :class="targets.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'">
      <div
        v-for="target in targets"
        :key="target.id"
        class="rounded-xl border-2 p-3 min-h-[7rem] flex flex-col gap-2 transition-colors"
        :class="dragOver === target.id ? 'border-acento-ambar-fuerte bg-acento-ambar/5' : 'border-base-borde-sutil bg-base-blanco'"
        @dragover.prevent="dragOver = target.id"
        @dragleave="dragOver = null"
        @drop.prevent="dropOn(target.id)">
        <button
          type="button"
          @click="placeSelected(target.id)"
          :disabled="!selected"
          class="text-left text-xs font-bold text-base-texto-primario rounded focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte disabled:cursor-default"
          :aria-label="selected ? `Poner el elemento seleccionado en ${target.label}` : target.label">
          {{ target.label }}
          <span v-if="selected" class="block text-[10px] font-normal text-acento-ambar-fuerte">Toca aquí para ponerlo</span>
        </button>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="item in placedIn(target.id)"
            :key="item.id"
            type="button"
            draggable="true"
            @dragstart="onDragStart(item.id)"
            @dragend="dragOver = null"
            @click="unplace(item.id)"
            class="px-2.5 py-1 rounded-md border border-acento-ambar-fuerte/40 bg-acento-ambar/10 text-xs font-mono text-base-texto-primario hover:bg-acento-ambar/20 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
            :aria-label="`${item.content}, en ${target.label}. Toca para devolverlo`"
            title="Toca para devolverlo">
            {{ item.content }}
          </button>
        </div>
      </div>
    </div>

    <p class="text-[11px]" :class="allAssigned ? 'text-semantico-pasa' : 'text-base-texto-secundario'" aria-live="polite">
      {{ assignedCount }} de {{ items.length }} ubicados
    </p>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/workspace'

interface DragItem { id: string; content: string }
interface DropTarget { id: string; label: string }

const props = withDefaults(defineProps<{
  question: { id: number; type: string; question: string; config: Record<string, any> }
  /** La pantalla del ejercicio ya muestra el enunciado con formato arriba. */
  showStatement?: boolean
}>(), { showStatement: true })

const workspaceStore = useWorkspaceStore()
const TRAY = '__bandeja__'

const items = computed<DragItem[]>(() => props.question.config?.items || [])
const targets = computed<DropTarget[]>(() => props.question.config?.targets || [])

const mappings = reactive<Record<string, string>>({})
const selected = ref<string | null>(null)
const dragging = ref<string | null>(null)
const dragOver = ref<string | null>(null)

watch(items, (newItems) => {
  Object.keys(mappings).forEach((k) => delete mappings[k])
  newItems.forEach((item) => { mappings[item.id] = '' })
  selected.value = null
}, { immediate: true })

const unplaced = computed(() => items.value.filter((i) => !mappings[i.id]))
const placedIn = (targetId: string) => items.value.filter((i) => mappings[i.id] === targetId)
const assignedCount = computed(() => items.value.filter((i) => Boolean(mappings[i.id])).length)
const allAssigned = computed(() => items.value.length > 0 && assignedCount.value === items.value.length)

function toggleSelect(id: string) {
  selected.value = selected.value === id ? null : id
}

function placeSelected(targetId: string) {
  if (!selected.value) return
  mappings[selected.value] = targetId
  selected.value = null
}

function unplace(id: string) {
  mappings[id] = ''
}

function onDragStart(id: string) {
  dragging.value = id
  selected.value = null
}

function dropOn(targetId: string | null) {
  if (dragging.value) mappings[dragging.value] = targetId ?? ''
  dragging.value = null
  dragOver.value = null
}

// Respuesta para el servidor: { mappings: { item_1: "zona_a" } }, solo cuando todo está ubicado.
watch(mappings, () => {
  if (allAssigned.value) {
    const clean: Record<string, string> = {}
    items.value.forEach((item) => { clean[item.id] = mappings[item.id] })
    workspaceStore.pendingAnswer = { mappings: clean }
  } else {
    workspaceStore.pendingAnswer = null
  }
}, { deep: true })

onMounted(() => { workspaceStore.pendingAnswer = null })
</script>
