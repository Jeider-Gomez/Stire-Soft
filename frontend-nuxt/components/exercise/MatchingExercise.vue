<template>
  <!-- Emparejar tocando (v3, Fase D, paso 3; cuadro «E-Tipo-Emparejar»): se toca un elemento de la izquierda y luego su
       pareja de las que quedan abajo; tocar una pareja ya puesta la devuelve. Antes eran listas desplegables, incómodas
       en el celular. La respuesta que se entrega es la misma: { pairs: { izquierda: derecha } }. -->
  <div class="space-y-4">
    <div v-if="showStatement" class="prose prose-xs text-base-texto-primario">
      <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ question.question }}</p>
    </div>

    <p id="emparejar-ayuda" class="m-0 text-[15px] text-base-texto-primario">Toca un elemento de la izquierda y luego su pareja.</p>

    <ul class="m-0 p-0 list-none space-y-2.5" aria-describedby="emparejar-ayuda">
      <li v-for="leftItem in leftColumn" :key="leftItem.id" class="grid grid-cols-[1fr_28px_1fr] sm:grid-cols-[1fr_40px_1fr] items-center">
        <button type="button" class="pieza-emparejar font-codigo font-semibold"
          :class="{ elegida: elegida === leftItem.id, puesta: !!pairs[leftItem.id] }"
          :style="pairs[leftItem.id] ? { borderColor: colorDe(leftItem.id) } : undefined"
          :aria-pressed="elegida === leftItem.id"
          :aria-label="`Pareja de «${itemText(leftItem)}»: ${pairs[leftItem.id] ? textoDe(pairs[leftItem.id]) : 'sin elegir'}`"
          @click="elegir(leftItem.id)">
          {{ itemText(leftItem) }}
        </button>
        <span class="linea-emparejar" :style="{ background: pairs[leftItem.id] ? colorDe(leftItem.id) : 'transparent' }" aria-hidden="true" />
        <button v-if="pairs[leftItem.id]" type="button" class="pieza-emparejar puesta" :style="{ borderColor: colorDe(leftItem.id) }"
          :aria-label="`Quitar «${textoDe(pairs[leftItem.id])}» de «${itemText(leftItem)}»`" @click="quitar(leftItem.id)">
          {{ textoDe(pairs[leftItem.id]) }}
        </button>
        <span v-else class="hueco-emparejar" aria-hidden="true">Elige su pareja</span>
      </li>
    </ul>

    <div v-if="libres.length" class="flex flex-wrap gap-2" role="group" aria-label="Parejas que quedan">
      <button v-for="r in libres" :key="r.id" type="button" class="ficha-emparejar" @click="poner(r.id)">
        {{ itemText(r) }}
      </button>
    </div>

    <p class="m-0 text-xs" :class="allPaired ? 'text-semantico-pasa font-semibold' : 'text-base-texto-secundario'" role="status">
      <template v-if="allPaired">Todos emparejados ({{ pairedCount }} de {{ leftColumn.length }}). Revisa y entrega.</template>
      <template v-else-if="elegida">Ahora toca la pareja de «{{ textoDe(elegida, leftColumn) }}».</template>
      <template v-else>Llevas {{ pairedCount }} de {{ leftColumn.length }}.</template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/workspace'

interface ColumnItem {
  id: string
  content?: string
  /** Algunos ejercicios guardados antes del 28-sep-2026 usan `text` en lugar de `content`. */
  text?: string
}

const itemText = (item: ColumnItem) => item.content ?? item.text ?? ''

interface Props {
  question: { id: number; type: string; question: string; config: Record<string, any> }
  /** La pantalla del ejercicio ya muestra el enunciado con formato arriba. */
  showStatement?: boolean
}

const props = withDefaults(defineProps<Props>(), { showStatement: true })
const workspaceStore = useWorkspaceStore()

const leftColumn = computed<ColumnItem[]>(() => props.question.config?.leftColumn || [])
const rightColumn = computed<ColumnItem[]>(() => props.question.config?.rightColumn || [])

const pairs = reactive<Record<string, string>>({})
/** El elemento de la izquierda que está esperando su pareja. */
const elegida = ref<string | null>(null)

const textoDe = (id: string, lista: ColumnItem[] = rightColumn.value) => itemText(lista.find((x) => x.id === id) ?? { id })
/** Cada pareja con su color (cuadro «E-Tipo-Emparejar»): el borde de las dos piezas y la línea que las une. */
const COLORES_PAREJA = ['#0A7F70', '#1D6FD1', '#7B2FBF', '#B45309', '#BE185D', '#4D7C0F']
const colorDe = (izquierda: string) => COLORES_PAREJA[Math.max(0, leftColumn.value.findIndex((l) => l.id === izquierda)) % COLORES_PAREJA.length]
const libres = computed(() => rightColumn.value.filter((r) => !Object.values(pairs).includes(r.id)))

watch(
  leftColumn,
  (newLeft) => {
    Object.keys(pairs).forEach(k => delete pairs[k])
    newLeft.forEach(item => {
      pairs[item.id] = ''
    })
    elegida.value = null
  },
  { immediate: true }
)

function elegir(id: string) {
  elegida.value = elegida.value === id ? null : id
}
/** Pone la pareja en el elemento elegido; si no hay uno elegido, en el primero que falte. */
function poner(derecha: string) {
  const izquierda = elegida.value ?? leftColumn.value.find((l) => !pairs[l.id])?.id
  if (!izquierda) return
  pairs[izquierda] = derecha
  elegida.value = null
}
function quitar(izquierda: string) {
  pairs[izquierda] = ''
  elegida.value = izquierda
}

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

<style scoped>
.pieza-emparejar { min-height: 48px; padding: 8px 12px; border-radius: 12px; border: 2px solid rgb(var(--c-base-borde-fuerte)); background: rgb(var(--c-base-blanco)); text-align: left; font-size: 14px; color: rgb(var(--c-base-texto-primario)); transition: border-color 0.15s ease, background-color 0.15s ease; }
.pieza-emparejar:hover { border-color: rgb(var(--c-base-texto-secundario)); }
.pieza-emparejar.elegida { border-color: rgb(var(--c-base-texto-primario)); background: rgb(var(--c-sec-cielo-fondo)); }
.pieza-emparejar.puesta { border-color: #00c2a8; }
.linea-emparejar { height: 2px; }
.hueco-emparejar { min-height: 48px; display: flex; align-items: center; padding: 8px 12px; border-radius: 12px; border: 1px dashed rgb(var(--c-base-borde-fuerte)); font-size: 14px; color: rgb(var(--c-base-texto-secundario)); }
.ficha-emparejar { min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1px solid rgb(var(--c-base-borde-fuerte)); background: rgb(var(--c-base-bg-secundario)); font-size: 14px; font-weight: 600; color: rgb(var(--c-base-texto-primario)); }
.ficha-emparejar:hover { background: rgb(var(--c-base-blanco)); }
</style>
