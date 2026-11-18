<template>
  <div class="space-y-5">
    <p v-if="showStatement" class="text-sm leading-relaxed whitespace-pre-wrap text-base-texto-primario">{{ question.question }}</p>

    <p class="text-xs text-base-texto-secundario">
      Arrastra cada elemento a su categoría (también con el dedo), o tócalo y luego toca la categoría.
    </p>

    <!-- Elementos sin ubicar -->
    <div
      class="min-h-[3.5rem] rounded-xl border-2 border-dashed p-3 flex flex-wrap gap-2 transition-all duration-150"
      :class="dragOver === TRAY && dragging ? ESTILO_ZONA.encima : 'border-base-borde-sutil bg-base-bg-secundario/50'"
      @dragover.prevent="dragOver = TRAY"
      @dragleave="salir($event)"
      @drop.prevent="dropOn(null)"
      :data-zona="TRAY"
      aria-label="Elementos por ubicar">
      <button
        v-for="item in unplaced"
        :key="item.id"
        type="button"
        :draggable="arrastreNativo"
        @dragstart="onDragStart(item.id)"
        @dragend="terminar"
        @pointerdown="tactil.empezar($event, item.id)"
        @contextmenu.prevent
        @click="toggleSelect(item.id)"
        :aria-pressed="selected === item.id"
        class="arrastre-tactil min-h-[44px] md:min-h-0 px-3 py-1.5 rounded-lg border text-xs font-mono cursor-grab active:cursor-grabbing shadow-xs transition focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
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
        class="rounded-xl border-2 p-3 min-h-[7rem] flex flex-col gap-2 transition-all duration-150"
        :class="ESTILO_ZONA[estado(target.id)]"
        @dragover.prevent="dragOver = target.id"
        @dragleave="salir($event)"
        @drop.prevent="dropOn(target.id)"
        :data-zona="target.id">
        <button
          type="button"
          @click="placeSelected(target.id)"
          :disabled="!selected"
          class="text-left text-xs font-bold text-base-texto-primario rounded focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte disabled:cursor-default"
          :aria-label="selected ? `Poner el elemento seleccionado en ${target.label}` : target.label">
          {{ target.label }}
          <span v-if="estado(target.id) === 'encima'" class="block text-[10px] font-bold text-acento-ambar-fuerte">Suelta aquí</span>
          <span v-else-if="selected" class="block text-[10px] font-normal text-acento-ambar-fuerte">Toca aquí para ponerlo</span>
        </button>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="item in placedIn(target.id)"
            :key="item.id"
            type="button"
            :draggable="arrastreNativo"
            @dragstart="onDragStart(item.id)"
            @dragend="terminar"
            @pointerdown="tactil.empezar($event, item.id)"
        @contextmenu.prevent
            @click="unplace(item.id)"
            class="arrastre-tactil min-h-[40px] md:min-h-0 px-2.5 py-1 rounded-md border border-acento-ambar-fuerte/40 bg-acento-ambar/10 text-xs font-mono text-base-texto-primario hover:bg-acento-ambar/20 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
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
import { estadoZona, saleDeLaZona, type EstadoZona } from '~/utils/zonaArrastre'
import { sonarToque } from '~/utils/sonidos'

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
  sonarToque()
}

function unplace(id: string) {
  mappings[id] = ''
}

// Mientras hay una pieza en la mano, todas las zonas se marcan con borde punteado; la que tiene la pieza encima se
// resalta con borde, fondo, un anillo y «Suelta aquí» (hallazgo de José, 09/10). utils/zonaArrastre.ts.
const ESTILO_ZONA: Record<EstadoZona, string> = {
  encima: 'border-acento-ambar-fuerte bg-acento-ambar/15 ring-4 ring-acento-ambar/30',
  disponible: 'border-dashed border-acento-ambar-fuerte/60 bg-base-blanco',
  normal: 'border-base-borde-sutil bg-base-blanco',
}
const estado = (zona: string) => estadoZona(zona, { sobre: dragOver.value, arrastrando: dragging.value, seleccionado: selected.value })

function salir(e: DragEvent) {
  if (saleDeLaZona(e.currentTarget as Element | null, e.relatedTarget)) dragOver.value = null
}

function terminar() {
  dragging.value = null
  dragOver.value = null
}

function onDragStart(id: string) {
  dragging.value = id
  selected.value = null
}

// Con el dedo (composables/useArrastreTactil.ts): lo mismo que el arrastre del ratón. Soltar fuera de toda zona la
// deja donde estaba.
const tactil = useArrastreTactil({
  alEmpezar: onDragStart,
  alMover: (zona) => { dragOver.value = zona },
  alSoltar: (zona) => (zona === null ? terminar() : dropOn(zona === TRAY ? null : zona)),
})
const arrastreNativo = tactil.arrastreNativo

function dropOn(targetId: string | null) {
  if (dragging.value) mappings[dragging.value] = targetId ?? ''
  if (dragging.value && targetId) sonarToque()
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

<style scoped>
/* El dedo sobre una pieza la arrastra; no desplaza la página (useArrastreTactil.ts). */
.arrastre-tactil { touch-action: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
</style>
