<template>
  <!-- Relacionar uniendo con líneas (17/11, Jeider: «que ya estén y solo unas los lazos»): las dos columnas a la vista y cada
       elemento se une con su pareja trazando una línea, como en un ejercicio de unir en papel. Se arrastra de uno al otro
       (ratón o dedo) o se toca uno y luego el otro; tocar uno ya unido suelta su línea para volver a elegir. Antes se
       elegía de una lista de fichas abajo (v3, cuadro «E-Tipo-Emparejar»). La respuesta que se entrega es la misma:
       { pairs: { izquierda: derecha } }. -->
  <div class="space-y-4">
    <div v-if="showStatement" class="prose prose-xs text-base-texto-primario">
      <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ question.question }}</p>
    </div>

    <p id="emparejar-ayuda" class="m-0 text-[15px] text-base-texto-primario">
      Une cada elemento con su pareja: arrastra de uno al otro para trazar la línea, o toca uno y luego el otro.
    </p>

    <div ref="tablero" class="tablero-unir relative grid grid-cols-[1fr_36px_1fr] sm:grid-cols-[1fr_72px_1fr] items-start" aria-describedby="emparejar-ayuda">
      <!-- Las líneas, debajo de las piezas; no reciben el puntero. -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none overflow-visible" aria-hidden="true">
        <path v-for="l in lineas" :key="l.izq" :d="curva(l.x1, l.y1, l.x2, l.y2)" :stroke="l.color" stroke-width="3" fill="none" stroke-linecap="round" />
        <path v-if="trazo" :d="curva(trazo.x1, trazo.y1, trazo.x2, trazo.y2)" stroke="rgb(var(--c-base-texto-primario))" stroke-width="2.5"
          stroke-dasharray="6 5" fill="none" stroke-linecap="round" />
      </svg>

      <ul class="m-0 p-0 list-none space-y-2.5" aria-label="Elementos">
        <li v-for="l in leftColumn" :key="l.id">
          <button type="button" class="pieza-unir izquierda font-codigo font-semibold" data-lado="izq" :data-id="l.id"
            :class="{ elegida: elegida?.lado === 'izq' && elegida.id === l.id, puesta: !!pairs[l.id], encima: encima === 'izq:' + l.id }"
            :style="pairs[l.id] ? { borderColor: colorDe(l.id) } : undefined"
            :aria-pressed="elegida?.lado === 'izq' && elegida.id === l.id"
            :aria-label="`«${itemText(l)}», unido con: ${pairs[l.id] ? textoDe(pairs[l.id]) : 'nada todavía'}`"
            @pointerdown="empezarTrazo($event, 'izq', l.id)" @click="tocar('izq', l.id)" @contextmenu.prevent>
            {{ itemText(l) }}
            <span class="punto-unir" :style="pairs[l.id] ? { background: colorDe(l.id) } : undefined" aria-hidden="true" />
          </button>
        </li>
      </ul>
      <span aria-hidden="true" />
      <ul class="m-0 p-0 list-none space-y-2.5" aria-label="Parejas">
        <li v-for="r in rightColumn" :key="r.id">
          <button type="button" class="pieza-unir derecha" data-lado="der" :data-id="r.id"
            :class="{ elegida: elegida?.lado === 'der' && elegida.id === r.id, puesta: !!izquierdaDe(r.id), encima: encima === 'der:' + r.id }"
            :style="izquierdaDe(r.id) ? { borderColor: colorDe(izquierdaDe(r.id)!) } : undefined"
            :aria-pressed="elegida?.lado === 'der' && elegida.id === r.id"
            :aria-label="`«${itemText(r)}», unido con: ${izquierdaDe(r.id) ? textoDe(izquierdaDe(r.id)!, leftColumn) : 'nada todavía'}`"
            @pointerdown="empezarTrazo($event, 'der', r.id)" @click="tocar('der', r.id)" @contextmenu.prevent>
            <span class="punto-unir" :style="izquierdaDe(r.id) ? { background: colorDe(izquierdaDe(r.id)!) } : undefined" aria-hidden="true" />
            {{ itemText(r) }}
          </button>
        </li>
      </ul>
    </div>

    <p class="m-0 text-xs" :class="allPaired ? 'text-semantico-pasa font-semibold' : 'text-base-texto-secundario'" role="status">
      <template v-if="allPaired">Todos unidos ({{ pairedCount }} de {{ leftColumn.length }}). Revisa y entrega.</template>
      <template v-else-if="elegida">Ahora toca su pareja en la otra columna.</template>
      <template v-else>Llevas {{ pairedCount }} de {{ leftColumn.length }}.</template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/workspace'
import { esArrastre } from '~/composables/useArrastreTactil'

interface ColumnItem {
  id: string
  content?: string
  /** Algunos ejercicios guardados antes del 28-sep-2026 usan `text` en lugar de `content`. */
  text?: string
}
type Lado = 'izq' | 'der'

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
/** El elemento (de cualquiera de las dos columnas) que espera su pareja. */
const elegida = ref<{ lado: Lado; id: string } | null>(null)

const textoDe = (id: string, lista: ColumnItem[] = rightColumn.value) => itemText(lista.find((x) => x.id === id) ?? { id })
/** Cada pareja con su color: el borde de las dos piezas, sus puntos y la línea que las une. */
const COLORES_PAREJA = ['#0A7F70', '#1D6FD1', '#7B2FBF', '#B45309', '#BE185D', '#4D7C0F']
const colorDe = (izquierda: string) => COLORES_PAREJA[Math.max(0, leftColumn.value.findIndex((l) => l.id === izquierda)) % COLORES_PAREJA.length]
const izquierdaDe = (derecha: string) => Object.keys(pairs).find((k) => pairs[k] === derecha) ?? null

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

/** Une un elemento con su pareja; si la pareja estaba unida con otro, ese queda libre. */
function unir(izquierda: string, derecha: string) {
  const antes = izquierdaDe(derecha)
  if (antes) pairs[antes] = ''
  pairs[izquierda] = derecha
  elegida.value = null
}

/** Tocar: elige; con uno de la otra columna ya elegido, los une; uno ya unido suelta su línea y queda elegido. */
function tocar(lado: Lado, id: string) {
  const e = elegida.value
  if (e && e.lado !== lado) {
    if (lado === 'izq') unir(id, e.id)
    else unir(e.id, id)
    return
  }
  if (e?.lado === lado && e.id === id) { elegida.value = null; return }
  if (lado === 'izq' && pairs[id]) pairs[id] = ''
  if (lado === 'der') { const i = izquierdaDe(id); if (i) pairs[i] = '' }
  elegida.value = { lado, id }
}

// ─── Trazar la línea arrastrando (ratón y dedo, con eventos de puntero) ───
const tablero = ref<HTMLElement | null>(null)
const trazo = ref<{ x1: number; y1: number; x2: number; y2: number } | null>(null)
/** La pieza de la otra columna que está debajo del puntero mientras se traza («izq:id» o «der:id»). */
const encima = ref<string | null>(null)
let origen: { lado: Lado; id: string; x: number; y: number } | null = null
let trazando = false

function piezaEn(x: number, y: number): { lado: Lado; id: string } | null {
  const el = document.elementFromPoint(x, y)?.closest('[data-lado]') as HTMLElement | null
  return el ? { lado: el.dataset.lado as Lado, id: el.dataset.id ?? '' } : null
}
/** El punto de una pieza en coordenadas del tablero: el borde que mira a la otra columna. */
function puntoDe(lado: Lado, id: string) {
  const caja = tablero.value?.getBoundingClientRect()
  const el = tablero.value?.querySelector(`[data-lado="${lado}"][data-id="${CSS.escape(id)}"]`)?.getBoundingClientRect()
  if (!caja || !el) return null
  return { x: (lado === 'izq' ? el.right : el.left) - caja.left, y: el.top + el.height / 2 - caja.top }
}

function empezarTrazo(e: PointerEvent, lado: Lado, id: string) {
  if (e.button > 0) return
  origen = { lado, id, x: e.clientX, y: e.clientY }
  window.addEventListener('pointermove', moverTrazo)
  window.addEventListener('pointerup', soltarTrazo)
  window.addEventListener('pointercancel', cancelarTrazo)
}
function moverTrazo(e: PointerEvent) {
  if (!origen) return
  if (!trazando) {
    if (!esArrastre(e.clientX - origen.x, e.clientY - origen.y)) return
    trazando = true
    elegida.value = null
    navigator.vibrate?.(8)
  }
  const p = puntoDe(origen.lado, origen.id)
  const caja = tablero.value?.getBoundingClientRect()
  if (p && caja) trazo.value = { x1: p.x, y1: p.y, x2: e.clientX - caja.left, y2: e.clientY - caja.top }
  const debajo = piezaEn(e.clientX, e.clientY)
  encima.value = debajo && debajo.lado !== origen.lado ? `${debajo.lado}:${debajo.id}` : null
}
function soltarTrazo(e: PointerEvent) {
  if (origen && trazando) {
    const destino = piezaEn(e.clientX, e.clientY)
    if (destino && destino.lado !== origen.lado) {
      if (origen.lado === 'izq') unir(origen.id, destino.id)
      else unir(destino.id, origen.id)
    }
    // El puntero que suelta puede «tocar» una pieza: ese clic no cuenta.
    const bloquear = (c: Event) => { c.stopPropagation(); c.preventDefault() }
    window.addEventListener('click', bloquear, { capture: true, once: true })
    setTimeout(() => window.removeEventListener('click', bloquear, { capture: true }), 60)
  }
  cancelarTrazo()
}
function cancelarTrazo() {
  origen = null
  trazando = false
  trazo.value = null
  encima.value = null
  window.removeEventListener('pointermove', moverTrazo)
  window.removeEventListener('pointerup', soltarTrazo)
  window.removeEventListener('pointercancel', cancelarTrazo)
}
onBeforeUnmount(cancelarTrazo)

// ─── Las líneas de las parejas: se miden de nuevo al cambiar las parejas o el tamaño ───
const medida = ref(0)
const lineas = computed(() => {
  void medida.value
  return leftColumn.value.flatMap((l) => {
    const r = pairs[l.id]
    const a = r ? puntoDe('izq', l.id) : null
    const b = r ? puntoDe('der', r) : null
    return a && b ? [{ izq: l.id, x1: a.x, y1: a.y, x2: b.x, y2: b.y, color: colorDe(l.id) }] : []
  })
})
/** Una curva suave de un punto al otro (como una línea a mano), no un trazo recto. */
function curva(x1: number, y1: number, x2: number, y2: number) {
  const m = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${m} ${y1}, ${m} ${y2}, ${x2} ${y2}`
}
let observador: ResizeObserver | null = null
onMounted(() => {
  nextTick(() => { medida.value++ })
  observador = new ResizeObserver(() => { medida.value++ })
  if (tablero.value) observador.observe(tablero.value)
})
onBeforeUnmount(() => observador?.disconnect())
watch(pairs, () => nextTick(() => { medida.value++ }), { deep: true })

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
/* Las piezas: el dedo sobre una traza la línea (no desplaza la página); entre las columnas sí se desplaza. */
.pieza-unir {
  position: relative; width: 100%; min-height: 48px; padding: 8px 14px; border-radius: 12px; border: 2px solid rgb(var(--c-base-borde-fuerte));
  background: rgb(var(--c-base-blanco)); text-align: left; font-size: 14px; color: rgb(var(--c-base-texto-primario)); overflow-wrap: anywhere;
  touch-action: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; cursor: grab;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.pieza-unir:hover { border-color: rgb(var(--c-base-texto-secundario)); }
.pieza-unir.elegida { border-color: rgb(var(--c-base-texto-primario)); background: rgb(var(--c-sec-cielo-fondo)); }
.pieza-unir.encima { border-color: rgb(var(--c-acento-ambar-fuerte)); background: rgb(var(--c-acento-ambar) / 0.15); }
.pieza-unir:focus-visible { outline: 2px solid rgb(var(--c-acento-ambar-fuerte)); outline-offset: 2px; }
/* El punto de donde sale la línea, en el borde que mira a la otra columna. */
.punto-unir {
  position: absolute; top: 50%; width: 12px; height: 12px; margin-top: -6px; border-radius: 999px;
  background: rgb(var(--c-base-blanco)); border: 2px solid rgb(var(--c-base-texto-secundario));
}
.izquierda .punto-unir { right: -8px; }
.derecha .punto-unir { left: -8px; }
.puesta .punto-unir { border-color: transparent; }
</style>
