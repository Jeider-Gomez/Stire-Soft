<template>
  <!-- «Ir a una lección» (26/10, Jeider: «que cambie de lección fácilmente sin importar su posición»). Como el buscador de
       Cursor (Ctrl+K) o la lista «Clases» de Platzi: desde cualquier pantalla del estudiante se abre con Ctrl+K (⌘K en
       Mac) o con el botón del menú, se escribe parte del nombre y Enter lleva a la lección. Muestra el estado de cada una
       y dónde está el estudiante («Lección 7 de 24»). utils/navegacionLeccion.ts. -->
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-100" leave-to-class="opacity-0">
      <div v-if="abierto" class="fixed inset-0 z-[70] bg-base-texto-primario/30 backdrop-blur-[2px] flex items-start justify-center p-4 pt-[12vh]" @click.self="cerrar">
        <div role="dialog" aria-modal="true" aria-labelledby="ir-leccion-titulo" class="paleta w-full max-w-lg rounded-2xl bg-base-blanco border border-base-borde-sutil shadow-2xl overflow-hidden">
          <h2 id="ir-leccion-titulo" class="sr-only">Ir a una lección</h2>
          <div class="flex items-center gap-2.5 px-4 border-b border-base-borde-sutil">
            <Search :size="16" class="shrink-0 text-base-texto-secundario" aria-hidden="true" />
            <input id="buscar-leccion" ref="campo" v-model="texto" type="search" autocomplete="off" placeholder="Busca una lección o un módulo"
              class="flex-1 min-h-[52px] bg-transparent text-sm outline-none" role="combobox" aria-expanded="true" aria-controls="ir-leccion-lista"
              :aria-activedescendant="lista[elegida] ? `ir-leccion-${lista[elegida].id}` : undefined" @keydown="teclas" />
            <kbd class="hidden sm:inline text-[10px] text-base-texto-secundario border border-base-borde-sutil rounded px-1.5 py-0.5">Esc</kbd>
          </div>
          <ul id="ir-leccion-lista" role="listbox" aria-label="Lecciones" class="max-h-[50vh] overflow-y-auto py-1.5">
            <li v-for="(l, i) in lista" :id="`ir-leccion-${l.id}`" :key="l.id" role="option" :aria-selected="i === elegida"
              class="mx-1.5 flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer" :class="i === elegida ? 'bg-stire-blue/10' : ''"
              @mousemove="elegida = i" @click="ir(l)">
              <component :is="!l.abierta ? Lock : ICONO[l.estado]" :size="16" class="shrink-0" :class="!l.abierta ? 'text-base-texto-secundario' : COLOR[l.estado]" aria-hidden="true" />
              <span class="flex-1 min-w-0">
                <span class="block text-sm truncate" :class="l.actual ? 'font-semibold text-stire-blue' : 'text-base-texto-primario'">{{ l.titulo }}</span>
                <span class="block text-[11px] text-base-texto-secundario truncate">{{ l.modulo }}{{ !l.abierta ? ' · módulo cerrado' : '' }}</span>
              </span>
              <span v-if="l.actual" class="shrink-0 text-[10px] font-semibold text-stire-blue">Estás aquí</span>
            </li>
            <li v-if="!lista.length" class="px-4 py-6 text-center text-sm text-base-texto-secundario">Ninguna lección se llama así.</li>
          </ul>
          <p class="px-4 py-2 border-t border-base-borde-sutil text-[11px] text-base-texto-secundario flex flex-wrap gap-x-3">
            <span>↑ ↓ para moverte</span><span>Enter para abrir</span>
            <span v-if="posicion" class="ml-auto">Lección {{ posicion.n }} de {{ posicion.total }}</span>
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { CheckCircle2, Circle, CircleDot, Lock, Search } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import { buscarLecciones, navegacionLeccion, posicionEnCurso, type LeccionBuscada } from '~/utils/navegacionLeccion'
import type { UnitStatus } from '~/types'

const studentStore = useStudentStore()
const route = useRoute()
const abierto = useState('ir-a-leccion', () => false)
const texto = ref('')
const elegida = ref(0)
const campo = ref<HTMLInputElement | null>(null)

const actual = computed(() => Number(/^\/estudiante\/unidad\/(\d+)/.exec(route.path)?.[1] ?? 0))
const modulos = computed(() => navegacionLeccion(studentStore.modules, studentStore.estadosModulos, actual.value).modulos)
const lista = computed(() => buscarLecciones(modulos.value, texto.value))
const posicion = computed(() => (actual.value ? posicionEnCurso(modulos.value, actual.value) : null))

const ICONO: Record<UnitStatus, typeof Circle> = { dominado: CheckCircle2, 'en-progreso': CircleDot, 'por-iniciar': Circle, bloqueado: Lock }
const COLOR: Record<UnitStatus, string> = { dominado: 'text-semantico-pasa', 'en-progreso': 'text-acento-ambar-fuerte', 'por-iniciar': 'text-base-texto-secundario', bloqueado: 'text-base-texto-secundario' }

watch(texto, () => { elegida.value = 0 })
watch(abierto, (a) => {
  if (!a) return
  texto.value = ''
  // Empieza en la lección donde está, para que Enter + ↓ sea «la siguiente».
  elegida.value = Math.max(0, lista.value.findIndex((l) => l.actual))
  nextTick(() => campo.value?.focus())
})

function cerrar() { abierto.value = false }
function ir(l: LeccionBuscada) {
  cerrar()
  if (!l.actual) navigateTo(`/estudiante/unidad/${l.id}`)
}
function teclas(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); elegida.value = Math.min(lista.value.length - 1, elegida.value + 1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); elegida.value = Math.max(0, elegida.value - 1) }
  else if (e.key === 'Enter' && lista.value[elegida.value]) { e.preventDefault(); ir(lista.value[elegida.value]) }
  else if (e.key === 'Escape') { e.preventDefault(); cerrar() }
  nextTick(() => document.getElementById(`ir-leccion-${lista.value[elegida.value]?.id}`)?.scrollIntoView({ block: 'nearest' }))
}
/** Ctrl+K (⌘K en Mac) abre o cierra el buscador desde cualquier pantalla del estudiante. */
function atajo(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); abierto.value = !abierto.value }
}
onMounted(() => document.addEventListener('keydown', atajo))
onBeforeUnmount(() => document.removeEventListener('keydown', atajo))
</script>

<style scoped>
.paleta { animation: aparecer 160ms cubic-bezier(0.23, 1, 0.32, 1); }
@keyframes aparecer { from { opacity: 0; transform: translateY(-6px) scale(0.98); } }
@media (prefers-reduced-motion: reduce) { .paleta { animation: none; } }
</style>
