<template>
  <!-- Árbol del curso a la izquierda (prototipo del panel v2): Módulo › Tema › Lección, cada nivel se pliega, y cada lección
       lleva un punto de color: verde lista, naranja le falta algo, gris oculta. Tocar el nombre del curso abre el mapa;
       tocar una lección la abre a la derecha, sin ventanas encima. Se reorganiza arrastrando entre hermanos (o con Alt+↑/↓
       desde el teclado); «+ Módulo», «+ Tema» y «+ Lección» crean al instante y abren lo nuevo para nombrarlo. -->
  <nav aria-label="Estructura del curso" class="arbol-lateral text-sm">
    <button type="button" class="nodo w-full font-semibold" :class="{ elegido: seleccion === null }" @click="$emit('elegir', null)">
      <Map :size="15" aria-hidden="true" class="shrink-0" /><span class="truncate">{{ curso || 'Curso' }}</span>
    </button>
    <div class="mt-2 flex items-center gap-1">
      <label class="relative flex-1 min-w-0">
        <span class="sr-only">Buscar en el curso</span>
        <Search :size="13" class="absolute left-2 top-1/2 -translate-y-1/2 text-base-texto-secundario" aria-hidden="true" />
        <input v-model="busqueda" type="search" placeholder="Buscar en el curso"
          class="w-full min-h-[32px] pl-7 pr-2 rounded-md border border-base-borde-sutil bg-base-blanco text-xs text-base-texto-primario focus:outline-none focus:ring-2 focus:ring-stire-blue/30" />
      </label>
      <button type="button" class="pliegue w-8 h-8" :title="todoPlegado ? 'Desplegar todo' : 'Plegar todo'" :aria-label="todoPlegado ? 'Desplegar todo' : 'Plegar todo'" @click="plegarTodo">
        <component :is="todoPlegado ? ChevronsUpDown : ChevronsDownUp" :size="14" aria-hidden="true" />
      </button>
    </div>
    <p v-if="busqueda && !visibles.length" class="mt-2 px-2 text-xs text-base-texto-secundario">Nada coincide con «{{ busqueda }}».</p>
    <ul class="mt-1 space-y-0.5">
      <li v-for="(m, im) in visibles" :key="m.id" v-bind="arrastre('modulo', null, im)" :class="marca('modulo', null, im)">
        <div class="fila flex items-center">
          <GripVertical v-if="ordenable" :size="12" class="asa" aria-hidden="true" />
          <button type="button" class="pliegue" :aria-expanded="abierto(`m${m.id}`)" :aria-label="`${plegados.has(`m${m.id}`) ? 'Mostrar' : 'Ocultar'} el módulo ${m.title}`" :title="plegados.has(`m${m.id}`) ? 'Mostrar' : 'Ocultar'" @click="alternar(`m${m.id}`)">
            <ChevronRight :size="14" class="transition-transform" :class="{ 'rotate-90': !plegados.has(`m${m.id}`) }" aria-hidden="true" />
          </button>
          <button type="button" class="grupo font-semibold" :class="{ elegido: grupo?.nivel === 'modulo' && grupo.id === m.id }" :title="m.title" :aria-keyshortcuts="ordenable ? 'Alt+ArrowUp Alt+ArrowDown' : undefined"
            @click="$emit('elegir-grupo', 'modulo', m.id)" @keydown.alt.up.prevent="teclado('modulo', null, im, -1)" @keydown.alt.down.prevent="teclado('modulo', null, im, 1)"><span class="truncate">{{ m.title }}</span></button>
          <EyeOff v-if="!m.isPublished" :size="13" class="shrink-0 mr-2 text-base-texto-secundario" aria-label="Módulo sin publicar" />
        </div>
        <ul v-if="abierto(`m${m.id}`)" class="ml-4 border-l border-base-borde-sutil pl-1.5 space-y-0.5">
          <li v-for="(t, it) in m.topics ?? []" :key="t.id" v-bind="arrastre('tema', m.id, it)" :class="marca('tema', m.id, it)">
            <div class="fila flex items-center">
              <GripVertical v-if="ordenable" :size="12" class="asa" aria-hidden="true" />
              <button type="button" class="pliegue" :aria-expanded="abierto(`t${t.id}`)" :aria-label="`${plegados.has(`t${t.id}`) ? 'Mostrar' : 'Ocultar'} el tema ${t.title}`" :title="plegados.has(`t${t.id}`) ? 'Mostrar' : 'Ocultar'" @click="alternar(`t${t.id}`)">
                <ChevronRight :size="13" class="transition-transform" :class="{ 'rotate-90': !plegados.has(`t${t.id}`) }" aria-hidden="true" />
              </button>
              <button type="button" class="grupo" :class="{ elegido: grupo?.nivel === 'tema' && grupo.id === t.id }" :title="t.title" :aria-keyshortcuts="ordenable ? 'Alt+ArrowUp Alt+ArrowDown' : undefined"
                @click="$emit('elegir-grupo', 'tema', t.id)" @keydown.alt.up.prevent="teclado('tema', m.id, it, -1)" @keydown.alt.down.prevent="teclado('tema', m.id, it, 1)"><span class="truncate">{{ t.title }}</span></button>
            </div>
            <ul v-if="abierto(`t${t.id}`)" class="ml-4 space-y-0.5">
              <li v-for="(l, il) in t.learningUnits ?? []" :key="l.id" v-bind="arrastre('leccion', t.id, il)" :class="marca('leccion', t.id, il)">
                <button type="button" class="nodo fila w-full" :class="{ elegido: seleccion === l.id }" :aria-current="seleccion === l.id ? 'true' : undefined"
                  :aria-keyshortcuts="ordenable ? 'Alt+ArrowUp Alt+ArrowDown' : undefined"
                  @click="$emit('elegir', l.id)" @keydown.alt.up.prevent="teclado('leccion', t.id, il, -1)" @keydown.alt.down.prevent="teclado('leccion', t.id, il, 1)">
                  <span class="punto" :class="`punto-${estadoDeLeccion(l)}`" :title="TEXTO_ESTADO[estadoDeLeccion(l)]" aria-hidden="true" />
                  <span class="truncate text-left">{{ l.title }}</span>
                  <span class="sr-only">: {{ TEXTO_ESTADO[estadoDeLeccion(l)] }}</span>
                </button>
              </li>
              <li><button type="button" class="agregar" @click="$emit('nueva-leccion', m.id, t.id)"><Plus :size="12" aria-hidden="true" /> Lección</button></li>
            </ul>
          </li>
          <li><button type="button" class="agregar" @click="$emit('nuevo-tema', m.id)"><Plus :size="12" aria-hidden="true" /> Tema</button></li>
        </ul>
      </li>
    </ul>
    <button type="button" class="agregar mt-1" @click="$emit('nuevo-modulo')"><Plus :size="12" aria-hidden="true" /> Módulo</button>
    <p v-if="ordenable" class="mt-3 text-[11px] text-base-texto-secundario">Arrastra para cambiar el orden (o Alt+↑/↓).</p>
    <p class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-base-texto-secundario" aria-hidden="true">
      <span class="inline-flex items-center gap-1"><span class="punto punto-lista" />Lista</span>
      <span class="inline-flex items-center gap-1"><span class="punto punto-falta" />Le falta algo</span>
      <span class="inline-flex items-center gap-1"><span class="punto punto-oculta" />Oculta</span>
    </p>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, type LiHTMLAttributes } from 'vue'
import { ChevronRight, ChevronsDownUp, ChevronsUpDown, EyeOff, GripVertical, Map, Plus, Search } from 'lucide-vue-next'
import { TEXTO_ESTADO, estadoDeLeccion, filtrarArbol, type ModuloConConteos } from '~/utils/estadoCurso'

const props = defineProps<{ modulos: ModuloConConteos[]; seleccion: number | null; grupo?: { nivel: 'modulo' | 'tema'; id: number } | null; curso?: string }>()
const emit = defineEmits<{ elegir: [id: number | null]; 'elegir-grupo': [nivel: 'modulo' | 'tema', id: number]; 'nueva-leccion': [moduloId: number, temaId: number]; 'nuevo-tema': [moduloId: number]; 'nuevo-modulo': []
  mover: [nivel: Nivel, padreId: number | null, desde: number, hasta: number] }>()
type Nivel = 'modulo' | 'tema' | 'leccion'

// Reorganizar arrastrando (como en el prototipo): solo entre hermanos del mismo nivel y del mismo padre, y sin búsqueda
// (con el árbol filtrado las posiciones no son las reales). La línea azul marca dónde caerá.
const ordenable = computed(() => !busqueda.value.trim())
const tomado = ref<{ nivel: Nivel; padre: number | null; desde: number } | null>(null)
const sobre = ref<number | null>(null)
const mismoGrupo = (nivel: Nivel, padre: number | null) => tomado.value?.nivel === nivel && tomado.value.padre === padre
function arrastre(nivel: Nivel, padre: number | null, i: number): LiHTMLAttributes {
  if (!ordenable.value) return {}
  return {
    draggable: true,
    onDragstart: (e: DragEvent) => { e.stopPropagation(); tomado.value = { nivel, padre, desde: i }; e.dataTransfer?.setData('text/plain', String(i)); if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move' },
    onDragover: (e: DragEvent) => { if (!mismoGrupo(nivel, padre)) return; e.preventDefault(); e.stopPropagation(); sobre.value = i },
    onDrop: (e: DragEvent) => {
      if (!mismoGrupo(nivel, padre) || !tomado.value) return
      e.preventDefault(); e.stopPropagation()
      if (tomado.value.desde !== i) emit('mover', nivel, padre, tomado.value.desde, i)
      tomado.value = null; sobre.value = null
    },
    onDragend: () => { tomado.value = null; sobre.value = null },
  }
}
const marca = (nivel: Nivel, padre: number | null, i: number) => ({
  arrastrando: mismoGrupo(nivel, padre) && tomado.value?.desde === i,
  'cae-arriba': mismoGrupo(nivel, padre) && sobre.value === i && (tomado.value?.desde ?? 0) > i,
  'cae-abajo': mismoGrupo(nivel, padre) && sobre.value === i && (tomado.value?.desde ?? 0) < i,
})
function teclado(nivel: Nivel, padre: number | null, i: number, paso: -1 | 1) {
  if (ordenable.value) emit('mover', nivel, padre, i, i + paso)
}

const plegados = ref(new Set<string>())
// Buscando, todo se ve desplegado: lo que coincide no puede quedar escondido en un módulo plegado.
const busqueda = ref('')
const visibles = computed(() => filtrarArbol(props.modulos, busqueda.value))
const abierto = (clave: string) => !!busqueda.value.trim() || !plegados.value.has(clave)
const todoPlegado = computed(() => props.modulos.length > 0 && props.modulos.every((m) => plegados.value.has(`m${m.id}`)))
function plegarTodo() {
  plegados.value = todoPlegado.value ? new Set() : new Set(props.modulos.map((m) => `m${m.id}`))
}
function alternar(clave: string) {
  const s = new Set(plegados.value)
  if (s.has(clave)) s.delete(clave)
  else s.add(clave)
  plegados.value = s
}
</script>

<style scoped>
.nodo { @apply flex items-center gap-2 min-h-[34px] px-2 rounded-md text-base-texto-primario hover:bg-base-bg-secundario/70; }
.nodo.elegido { @apply bg-stire-blue/10 text-stire-blue font-semibold; }
.grupo { @apply flex-1 min-w-0 flex items-center min-h-[30px] px-1.5 rounded-md text-left text-base-texto-primario hover:bg-base-bg-secundario/70; }
.grupo.elegido { @apply bg-stire-blue/10 text-stire-blue; }
.pliegue { @apply w-6 h-7 shrink-0 grid place-items-center rounded text-base-texto-secundario hover:text-base-texto-primario; }
.agregar { @apply inline-flex items-center gap-1 min-h-[28px] px-2 rounded text-xs font-semibold text-stire-blue hover:bg-stire-blue/5; }
.asa { @apply shrink-0 -ml-1 text-base-texto-secundario opacity-0 cursor-grab; }
.fila:hover .asa, li:focus-within > .fila .asa { @apply opacity-100; }
.arrastrando { @apply opacity-40; }
.cae-arriba { box-shadow: inset 0 2px 0 theme('colors.stire-blue'); }
.cae-abajo { box-shadow: inset 0 -2px 0 theme('colors.stire-blue'); }
.punto { @apply inline-block w-2 h-2 rounded-full shrink-0; }
.punto-lista { background: rgb(var(--c-semantico-pasa)); }
.punto-falta { background: #d97706; }
.punto-oculta { background: rgb(var(--c-base-borde-fuerte)); }
</style>
