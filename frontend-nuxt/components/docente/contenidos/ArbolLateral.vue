<template>
  <!-- Árbol del curso a la izquierda (prototipo del panel v2): Módulo › Tema › Lección, cada nivel se pliega, y cada lección
       lleva un punto de color: verde lista, naranja le falta algo, gris oculta. Tocar el nombre del curso abre el mapa;
       tocar una lección la abre a la derecha, sin ventanas encima. -->
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
      <li v-for="m in visibles" :key="m.id">
        <div class="flex items-center">
          <button type="button" class="pliegue" :aria-expanded="abierto(`m${m.id}`)" :aria-label="`${plegados.has(`m${m.id}`) ? 'Mostrar' : 'Ocultar'} el módulo ${m.title}`" :title="plegados.has(`m${m.id}`) ? 'Mostrar' : 'Ocultar'" @click="alternar(`m${m.id}`)">
            <ChevronRight :size="14" class="transition-transform" :class="{ 'rotate-90': !plegados.has(`m${m.id}`) }" aria-hidden="true" />
          </button>
          <button type="button" class="grupo font-semibold" :class="{ elegido: grupo?.nivel === 'modulo' && grupo.id === m.id }" :title="m.title" @click="$emit('elegir-grupo', 'modulo', m.id)"><span class="truncate">{{ m.title }}</span></button>
          <EyeOff v-if="!m.isPublished" :size="13" class="shrink-0 mr-2 text-base-texto-secundario" aria-label="Módulo sin publicar" />
        </div>
        <ul v-if="abierto(`m${m.id}`)" class="ml-4 border-l border-base-borde-sutil pl-1.5 space-y-0.5">
          <li v-for="t in m.topics ?? []" :key="t.id">
            <div class="flex items-center">
              <button type="button" class="pliegue" :aria-expanded="abierto(`t${t.id}`)" :aria-label="`${plegados.has(`t${t.id}`) ? 'Mostrar' : 'Ocultar'} el tema ${t.title}`" :title="plegados.has(`t${t.id}`) ? 'Mostrar' : 'Ocultar'" @click="alternar(`t${t.id}`)">
                <ChevronRight :size="13" class="transition-transform" :class="{ 'rotate-90': !plegados.has(`t${t.id}`) }" aria-hidden="true" />
              </button>
              <button type="button" class="grupo" :class="{ elegido: grupo?.nivel === 'tema' && grupo.id === t.id }" :title="t.title" @click="$emit('elegir-grupo', 'tema', t.id)"><span class="truncate">{{ t.title }}</span></button>
            </div>
            <ul v-if="abierto(`t${t.id}`)" class="ml-4 space-y-0.5">
              <li v-for="l in t.learningUnits ?? []" :key="l.id">
                <button type="button" class="nodo w-full" :class="{ elegido: seleccion === l.id }" :aria-current="seleccion === l.id ? 'true' : undefined" @click="$emit('elegir', l.id)">
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
    <p class="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-base-texto-secundario" aria-hidden="true">
      <span class="inline-flex items-center gap-1"><span class="punto punto-lista" />Lista</span>
      <span class="inline-flex items-center gap-1"><span class="punto punto-falta" />Le falta algo</span>
      <span class="inline-flex items-center gap-1"><span class="punto punto-oculta" />Oculta</span>
    </p>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronRight, ChevronsDownUp, ChevronsUpDown, EyeOff, Map, Plus, Search } from 'lucide-vue-next'
import { TEXTO_ESTADO, estadoDeLeccion, filtrarArbol, type ModuloConConteos } from '~/utils/estadoCurso'

const props = defineProps<{ modulos: ModuloConConteos[]; seleccion: number | null; grupo?: { nivel: 'modulo' | 'tema'; id: number } | null; curso?: string }>()
defineEmits<{ elegir: [id: number | null]; 'elegir-grupo': [nivel: 'modulo' | 'tema', id: number]; 'nueva-leccion': [moduloId: number, temaId: number]; 'nuevo-tema': [moduloId: number]; 'nuevo-modulo': [] }>()

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
.punto { @apply inline-block w-2 h-2 rounded-full shrink-0; }
.punto-lista { background: rgb(var(--c-semantico-pasa)); }
.punto-falta { background: #d97706; }
.punto-oculta { background: rgb(var(--c-base-borde-fuerte)); }
</style>
