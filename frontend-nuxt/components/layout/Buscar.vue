<template>
  <!-- «Buscar» (Ctrl K) del docente y del administrador (v3, Fase B). La misma ventana que «Ir a una lección» del estudiante
       (estudiante/IrALeccion.vue): se escribe una palabra o una frase y Enter lleva a la pantalla, a la clase o a la tarea
       del manual. Qué busca y en qué orden: utils/buscar.ts. -->
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-100" leave-to-class="opacity-0">
      <div v-if="abierto" class="fixed inset-0 z-[70] bg-base-texto-primario/30 backdrop-blur-[2px] flex items-start justify-center p-4 pt-[12vh]" @click.self="cerrar">
        <div role="dialog" aria-modal="true" aria-labelledby="buscar-titulo" class="paleta w-full max-w-lg rounded-2xl bg-base-blanco border border-base-borde-sutil shadow-2xl overflow-hidden">
          <h2 id="buscar-titulo" class="sr-only">Buscar en STIRE</h2>
          <div class="flex items-center gap-2.5 px-4 border-b border-base-borde-sutil">
            <Search :size="16" class="shrink-0 text-base-texto-secundario" aria-hidden="true" />
            <input id="buscar-campo" ref="campo" v-model="texto" type="search" autocomplete="off"
              :placeholder="authStore.currentRole === 'docente' ? 'Busca una clase, una pantalla o una pregunta' : 'Busca una pantalla o una pregunta'"
              class="flex-1 min-h-[52px] bg-transparent text-sm outline-none" role="combobox" aria-expanded="true" aria-controls="buscar-lista"
              aria-label="Buscar" :aria-activedescendant="lista[elegida] ? `buscar-${lista[elegida].id}` : undefined" @keydown="teclas" />
            <kbd class="hidden sm:inline text-[10px] text-base-texto-secundario border border-base-borde-sutil rounded px-1.5 py-0.5">Esc</kbd>
          </div>
          <ul id="buscar-lista" role="listbox" aria-label="Resultados" class="max-h-[50vh] overflow-y-auto py-1.5">
            <li v-for="(r, i) in lista" :id="`buscar-${r.id}`" :key="r.id" role="option" :aria-selected="i === elegida"
              class="mx-1.5 flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer" :class="i === elegida ? 'bg-base-bg-secundario' : ''"
              @mousemove="elegida = i" @click="ir(r)">
              <component :is="ICONO[r.tipo]" :size="16" class="shrink-0 text-base-texto-secundario" aria-hidden="true" />
              <span class="flex-1 min-w-0">
                <span class="block text-sm truncate text-base-texto-primario" :class="{ 'font-semibold': i === elegida }">{{ r.titulo }}</span>
                <span class="block text-[11px] text-base-texto-secundario truncate">{{ r.detalle }}</span>
              </span>
            </li>
            <li v-if="!lista.length" class="px-4 py-6 text-center text-sm text-base-texto-secundario">
              No encontramos nada con esas palabras. Prueba con otras o mira la <NuxtLink to="/ayuda" class="font-semibold" @click="cerrar">ayuda</NuxtLink>.
            </li>
          </ul>
          <p class="px-4 py-2 border-t border-base-borde-sutil text-[11px] text-base-texto-secundario flex flex-wrap gap-x-3">
            <span>↑ ↓ para moverte</span><span>Enter para abrir</span>
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { CircleHelp, GraduationCap, PanelLeft, Search } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { MANUAL } from '~/utils/manual'
import { ayudaDeRol, buscar, clasesComoResultados, pantallasDeRol, type Resultado, type TipoResultado } from '~/utils/buscar'
import { recordarFoco } from '~/utils/devolverFoco'

const authStore = useAuthStore()
const abierto = useState('buscar-abierto', () => false)
const texto = ref('')
const elegida = ref(0)
const campo = ref<HTMLInputElement | null>(null)
const clases = ref<Array<{ id: number; name: string; code?: string }>>([])
const { misClases } = useMisClases()

const ICONO: Record<TipoResultado, typeof Search> = { pantalla: PanelLeft, clase: GraduationCap, ayuda: CircleHelp }
const todo = computed<Resultado[]>(() => [
  ...pantallasDeRol(authStore.currentRole),
  ...clasesComoResultados(clases.value),
  ...ayudaDeRol(MANUAL, authStore.currentRole),
])
const lista = computed(() => buscar(todo.value, texto.value))

watch(texto, () => { elegida.value = 0 })
let devolver = () => {}
watch(abierto, async (a) => {
  if (!a) { devolver(); return }
  devolver = recordarFoco()
  texto.value = ''
  elegida.value = 0
  nextTick(() => campo.value?.focus())
  // Las clases del docente se piden al abrir: si falla, se busca igual entre las pantallas y la ayuda.
  if (authStore.currentRole === 'docente' && !clases.value.length) {
    try { clases.value = await misClases() } catch { clases.value = [] }
  }
})

function cerrar() { abierto.value = false }
function ir(r: Resultado) {
  cerrar()
  navigateTo(r.ir)
}
function teclas(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); elegida.value = Math.min(lista.value.length - 1, elegida.value + 1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); elegida.value = Math.max(0, elegida.value - 1) }
  else if (e.key === 'Enter' && lista.value[elegida.value]) { e.preventDefault(); ir(lista.value[elegida.value]) }
  else if (e.key === 'Escape') { e.preventDefault(); cerrar() }
  nextTick(() => document.getElementById(`buscar-${lista.value[elegida.value]?.id}`)?.scrollIntoView({ block: 'nearest' }))
}
/** Ctrl+K (⌘K en Mac) abre o cierra el buscador desde cualquier pantalla del docente o del administrador. */
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
