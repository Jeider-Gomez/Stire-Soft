<template>
  <!-- Mi banco de ejercicios (T4): los ejercicios del docente en otras lecciones, para agregar una copia a esta. Base
       común de ventanas: el foco entra a «Buscar», Tab no se sale, Escape cierra y el foco vuelve a «Mi banco». -->
  <Teleport to="body">
    <AdminDialogo id-titulo="bank-dialog-title" titulo="Mi banco de ejercicios" subtitulo="Agrega a esta lección una copia de un ejercicio tuyo."
      ancho="3xl" :devolver-foco="`abrir-banco-${unidadId}`" @cerrar="emit('cerrar')">
      <template #icono><Library :size="18" aria-hidden="true" /></template>
      <div class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label for="bank-filter-type" class="block font-semibold text-base-texto-primario text-[11px] mb-1">Tipo</label>
            <select id="bank-filter-type" v-model="filtros.type" class="input-stire min-h-[44px]">
              <option value="">Todos los tipos</option>
              <option v-for="t in EXERCISE_TYPES" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div>
            <label for="bank-filter-difficulty" class="block font-semibold text-base-texto-primario text-[11px] mb-1">Nivel</label>
            <select id="bank-filter-difficulty" v-model="filtros.difficulty" class="input-stire min-h-[44px]">
              <option value="">Todos los niveles</option>
              <option value="basico">Básico</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
          <div>
            <label for="bank-filter-q" class="block font-semibold text-base-texto-primario text-[11px] mb-1">Buscar</label>
            <div class="relative">
              <input id="bank-filter-q" v-model="filtros.q" data-foco-inicial type="search" placeholder="Título o lección…" class="input-stire min-h-[44px] !pl-8" />
              <Search :size="13" aria-hidden="true" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
        </div>

        <p v-if="error" role="alert" class="text-semantico-falla text-[11px]">{{ error }}</p>

        <div class="overflow-y-auto border border-base-borde-sutil rounded-lg divide-y divide-base-borde-sutil min-h-[220px] max-h-[380px]" aria-live="polite" :aria-busy="buscando">
          <p v-if="buscando" class="p-8 text-center text-slate-600">
            <Loader2 :size="14" class="inline-block animate-spin mr-2 align-middle" aria-hidden="true" /> Buscando en el banco…
          </p>
          <p v-else-if="items.length === 0" class="p-8 text-center text-slate-600">
            {{ sinFiltros(filtros) ? 'Todavía no tienes ejercicios en otras lecciones.' : 'Ningún ejercicio coincide con los filtros.' }}
          </p>
          <div v-for="item in items" v-else :key="item.activityId"
            class="p-3 hover:bg-base-bg-secundario/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
            <div class="min-w-0 space-y-1 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-base-texto-primario">{{ item.title }}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-base-bg-secundario border border-base-borde-sutil text-slate-600">{{ nombreTipo(item.questionType) }}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-base-bg-secundario border border-base-borde-sutil text-slate-600">{{ nombreNivel(item.difficulty) }}</span>
              </div>
              <p class="text-[11px] text-acento-ambar-fuerte font-medium">{{ item.className }} · {{ item.learningUnitTitle }}</p>
              <p v-if="item.questionPreview" class="text-[11px] text-slate-600 truncate max-w-xl">{{ item.questionPreview }}</p>
            </div>
            <button type="button" :disabled="copiandoId !== null"
              class="min-h-[44px] px-3 py-1.5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold hover:bg-acento-ambar transition-colors disabled:opacity-50 shrink-0 self-end sm:self-auto flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
              :aria-label="`Agregar «${item.title}» a esta lección`" @click="copiar(item)">
              <Loader2 v-if="copiandoId === item.activityId" :size="12" class="animate-spin" aria-hidden="true" />
              <span>{{ copiandoId === item.activityId ? 'Agregando…' : 'Agregar a esta lección' }}</span>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-base-borde-sutil">
          <span class="text-[11px] text-slate-600">{{ plural(items.length, 'ejercicio encontrado', 'ejercicios encontrados') }}</span>
          <button type="button" class="btn-stire-secondary min-h-[44px]" @click="emit('cerrar')">Cerrar</button>
        </div>
      </div>
    </AdminDialogo>
  </Teleport>
</template>

<script setup lang="ts">
import { inject, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { Library, Loader2, Search } from 'lucide-vue-next'
import { CLAVE_EJERCICIOS_UNIDAD } from '~/composables/useEjerciciosUnidad'
import { EXERCISE_TYPES } from '~/utils/exerciseTypes'
import { nombreNivel, nombreTipo, sinFiltros, type EjercicioDelBanco, type FiltrosBanco } from '~/utils/ejerciciosUnidad'

const emit = defineEmits<{ cerrar: [] }>()
const estado = inject(CLAVE_EJERCICIOS_UNIDAD)
if (!estado) throw new Error('VentanaBancoEjercicios necesita useEjerciciosUnidad() con provide(CLAVE_EJERCICIOS_UNIDAD).')
const { unidadId, buscarEnBanco, copiarDelBanco } = estado

const filtros = reactive<FiltrosBanco>({ type: '', difficulty: '', q: '' })
const items = ref<EjercicioDelBanco[]>([])
const buscando = ref(false)
const error = ref<string | null>(null)
const copiandoId = ref<number | null>(null)

let pedido = 0
async function buscar() {
  const este = ++pedido
  buscando.value = true
  const r = await buscarEnBanco(filtros)
  if (este !== pedido) return // llegó tarde: ya se pidió otra búsqueda
  items.value = r.items
  error.value = r.error
  buscando.value = false
}
let reloj: ReturnType<typeof setTimeout> | undefined
watch(() => [filtros.type, filtros.difficulty, filtros.q], () => {
  clearTimeout(reloj)
  reloj = setTimeout(buscar, 300)
})
onBeforeUnmount(() => clearTimeout(reloj))
void buscar()

async function copiar(item: EjercicioDelBanco) {
  copiandoId.value = item.activityId
  error.value = await copiarDelBanco(item)
  copiandoId.value = null
  if (!error.value) emit('cerrar')
}
</script>
