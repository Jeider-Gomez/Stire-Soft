<template>
  <!-- Menú de ayuda de la cabecera (docs/PLAN_AYUDA_AL_USUARIO.md, frente C). Antes el «?» solo repetía el recorrido y
       desaparecía en las pantallas sin recorrido; ahora está en todas y reúne la ayuda en un solo lugar, como el «?» de
       Google Classroom o de Canvas. Es un menú desplegable de enlaces (patrón «disclosure» de WAI-ARIA): se abre y
       cierra con el botón, con Escape o tocando fuera. -->
  <div ref="raiz" class="relative">
    <button
      type="button"
      class="p-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
      :aria-expanded="abierto"
      aria-controls="menu-ayuda"
      title="Ayuda"
      @click="abierto = !abierto">
      <CircleHelp :size="18" aria-hidden="true" />
      <span class="sr-only">Ayuda</span>
    </button>

    <div
      v-if="abierto"
      id="menu-ayuda"
      class="absolute right-0 top-12 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50">
      <p class="px-4 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Ayuda</p>
      <ul class="text-sm">
        <li v-if="recorrido.actual.value">
          <button type="button" class="opcion" @click="verRecorrido">
            <Route :size="16" aria-hidden="true" class="shrink-0 text-stire-blue" />
            <span>Recorrido de {{ recorrido.actual.value.pantalla }}</span>
          </button>
        </li>
        <li v-if="tareaDePantalla">
          <a :href="`/ayuda#${tareaDePantalla}`" target="_blank" rel="noopener" class="opcion" @click="abierto = false">
            <FileQuestion :size="16" aria-hidden="true" class="shrink-0 text-stire-blue" />
            <span>Ayuda sobre esta pantalla<span class="sr-only"> (se abre en otra pestaña)</span></span>
          </a>
        </li>
        <li v-if="esEstudiante">
          <button type="button" class="opcion" @click="verPrimerosPasos">
            <ListChecks :size="16" aria-hidden="true" class="shrink-0 text-stire-blue" />
            <span>Primeros pasos</span>
          </button>
        </li>
        <li>
          <a href="/ayuda" target="_blank" rel="noopener" class="opcion" @click="abierto = false">
            <BookOpen :size="16" aria-hidden="true" class="shrink-0 text-stire-blue" />
            <span>Manual de usuario<span class="sr-only"> (se abre en otra pestaña)</span></span>
          </a>
        </li>
        <li>
          <a href="/ayuda#preguntas-frecuentes" target="_blank" rel="noopener" class="opcion" @click="abierto = false">
            <MessageCircleQuestion :size="16" aria-hidden="true" class="shrink-0 text-stire-blue" />
            <span>Preguntas frecuentes<span class="sr-only"> (se abre en otra pestaña)</span></span>
          </a>
        </li>
        <li v-if="conSugerencias" class="border-t border-slate-100 mt-1 pt-1">
          <button type="button" class="opcion" @click="enviarSugerencia">
            <MessageSquarePlus :size="16" aria-hidden="true" class="shrink-0 text-stire-blue" />
            <span>Contar un problema o una idea</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, CircleHelp, FileQuestion, ListChecks, MessageCircleQuestion, MessageSquarePlus, Route } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

// En el ejercicio (layouts/workspace.vue) no está el botón «Sugerencias» que abre la ventana: ahí la opción no sale.
withDefaults(defineProps<{ conSugerencias?: boolean }>(), { conSugerencias: true })

const recorrido = useRecorrido()
const route = useRoute()
const abierto = ref(false)
const raiz = ref<HTMLElement | null>(null)

/** La tarea del manual que explica la pantalla actual (la misma que enlaza su recorrido). */
const tareaDePantalla = computed(() => recorrido.actual.value?.manual ?? null)

const esEstudiante = computed(() => useAuthStore().currentRole === 'estudiante')
const primerosPasos = usePrimerosPasos()
/** Vuelve a mostrar la lista de primeros pasos y lleva al inicio, donde está. */
function verPrimerosPasos() {
  abierto.value = false
  primerosPasos.mostrar()
  void navigateTo('/estudiante')
}

function verRecorrido() {
  abierto.value = false
  recorrido.mostrar()
}

/** Abre la ventana de «Sugerencias» (BotonSugerencias.vue la abre con ?sugerencias=nueva). */
function enviarSugerencia() {
  abierto.value = false
  void navigateTo({ path: route.path, query: { ...route.query, sugerencias: 'nueva' } })
}

useEscapeToClose(() => abierto.value, () => { abierto.value = false })
function alTocarFuera(e: MouseEvent) {
  if (abierto.value && raiz.value && !raiz.value.contains(e.target as Node)) abierto.value = false
}
onMounted(() => document.addEventListener('click', alTocarFuera))
onBeforeUnmount(() => document.removeEventListener('click', alTocarFuera))
// Al cambiar de pantalla, el menú se cierra.
watch(() => route.path, () => { abierto.value = false })
</script>

<style scoped>
.opcion {
  @apply w-full flex items-center gap-2.5 px-4 min-h-[44px] text-left text-slate-700 hover:bg-slate-50 transition-colors;
}
</style>
