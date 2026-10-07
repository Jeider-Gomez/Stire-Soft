<template>
  <!-- B4 D3 bis: eliminar una clase, con las consecuencias del backend y una casilla para confirmar (simplificada el 07/10). -->
  <AdminDialogo
    id-titulo="eliminar-clase-titulo"
    titulo="¿Eliminar esta clase definitivamente?"
    :subtitulo="nombreClase"
    id-descripcion="eliminar-clase-desc"
    clase-icono="bg-semantico-falla/10 text-semantico-falla"
    :ocupado="eliminando"
    @cerrar="$emit('cerrar')"
  >
    <template #icono><Trash2 :size="18" aria-hidden="true" /></template>

    <!-- Calculando impacto -->
    <div v-if="cargandoImpacto" class="flex items-center gap-2 text-xs text-base-texto-secundario py-2" id="eliminar-clase-desc">
      <Loader2 :size="14" class="animate-spin" aria-hidden="true" />
      Calculando las consecuencias…
    </div>

    <!-- No se pudo calcular el impacto: no se ofrece eliminar a ciegas -->
    <div v-else-if="errorImpacto" id="eliminar-clase-desc" class="space-y-3">
      <p role="alert" class="text-semantico-falla text-xs font-semibold p-3 bg-semantico-falla/10 rounded-lg">{{ errorImpacto }}</p>
      <div class="flex items-center justify-end gap-2">
        <button type="button" data-foco-inicial class="min-h-[44px] px-4 rounded-md borde-afordancia text-xs font-semibold" @click="$emit('cerrar')">Cancelar</button>
        <button type="button" class="min-h-[44px] px-4 rounded-md text-xs font-bold border border-base-borde-fuerte text-base-texto-primario hover:bg-base-bg-secundario" @click="cargarImpacto">Reintentar</button>
      </div>
    </div>

    <!-- No se puede eliminar: hay trabajo de estudiantes -->
    <div v-else-if="impacto && !impacto.sePuedeEliminar" id="eliminar-clase-desc" class="space-y-3">
      <div class="p-3 bg-acento-ambar/10 border border-acento-ambar-fuerte/30 rounded-lg text-xs">
        <p class="font-semibold text-acento-ambar-fuerte flex items-center gap-1.5 mb-1">
          <TriangleAlert :size="14" aria-hidden="true" /> No se puede eliminar
        </p>
        <p class="text-base-texto-primario">{{ impacto.motivo }}</p>
      </div>
      <div class="flex items-center justify-end gap-2">
        <button type="button" data-foco-inicial class="min-h-[44px] px-4 rounded-md borde-afordancia text-xs font-semibold" @click="$emit('cerrar')">Cerrar</button>
        <button
          type="button"
          :disabled="archivando"
          class="min-h-[44px] px-4 rounded-md text-xs font-bold bg-acento-ambar-fuerte text-base-blanco hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
          @click="$emit('archivar')"
        >
          <Archive :size="13" aria-hidden="true" />
          Archivar la clase
        </button>
      </div>
    </div>

    <!-- Se puede eliminar: consecuencias + cuenta regresiva + nombre -->
    <div v-else-if="impacto" id="eliminar-clase-desc" class="space-y-4">
      <!-- Consecuencias -->
      <ul class="space-y-1 text-xs text-slate-700">
        <li v-for="linea in lineasConsecuencias" :key="linea" class="flex items-start gap-1.5">
          <span class="text-semantico-falla shrink-0 mt-px">•</span>
          {{ linea }}
        </li>
        <li class="flex items-start gap-1.5">
          <span class="text-semantico-falla shrink-0 mt-px">•</span>
          Esto no se puede deshacer. Si solo quieres guardarla, archívala.
        </li>
      </ul>

      <!-- Botón siempre visible: Archivar en su lugar -->
      <button
        type="button"
        class="w-full min-h-[44px] px-4 rounded-lg text-xs font-bold border border-acento-ambar-fuerte/50 text-acento-ambar-fuerte hover:bg-acento-ambar/10 transition-colors inline-flex items-center justify-center gap-1.5"
        @click="$emit('archivar')"
      >
        <Archive :size="14" aria-hidden="true" />
        Archivar en su lugar
      </button>

      <!-- Confirmar con una casilla (07/10; antes, cuenta regresiva de 8 s y escribir el nombre exacto de la clase). -->
      <div class="space-y-2">
        <label class="flex items-start gap-2 min-h-[44px] cursor-pointer text-xs text-base-texto-primario">
          <input v-model="entendido" type="checkbox" class="mt-0.5 w-4 h-4 accent-semantico-falla" />
          <span>Entiendo que la clase se borra para siempre, con todo lo de arriba.</span>
        </label>
        <p v-if="errorAccion" role="alert" class="text-semantico-falla text-[11px] font-semibold p-2 bg-semantico-falla/10 rounded">{{ errorAccion }}</p>
        <div class="flex items-center justify-end gap-2 pt-1">
          <button type="button" data-foco-inicial class="min-h-[44px] px-4 rounded-md borde-afordancia text-xs font-semibold" :disabled="eliminando" @click="$emit('cerrar')">Cancelar</button>
          <button
            type="button"
            :disabled="!puedeEliminar || eliminando"
            class="min-h-[44px] px-5 rounded-md bg-semantico-falla text-base-blanco font-bold text-xs hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
            @click="$emit('confirmar')"
          >
            <Loader2 v-if="eliminando" :size="14" class="animate-spin" aria-hidden="true" />
            {{ eliminando ? 'Eliminando…' : 'Sí, eliminar la clase' }}
          </button>
        </div>
      </div>
    </div>
  </AdminDialogo>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Archive, Loader2, TriangleAlert, Trash2 } from 'lucide-vue-next'
import { puedeConfirmar, textoConsecuencias, type ImpactoEliminacion } from '~/utils/cuentaRegresiva'

const props = defineProps<{
  claseId: number
  nombreClase: string
  eliminando?: boolean
}>()
defineEmits<{
  (e: 'cerrar'): void
  (e: 'confirmar'): void
  (e: 'archivar'): void
}>()

const acciones = useContenidosAcciones()
const { messageOf } = useApiErrorMessage()

const cargandoImpacto = ref(true)
const impacto = ref<ImpactoEliminacion | null>(null)
const entendido = ref(false)
const archivando = ref(false)
const errorAccion = ref<string | null>(null)
const errorImpacto = ref<string | null>(null)

const lineasConsecuencias = computed(() =>
  impacto.value ? textoConsecuencias(impacto.value, 'clase') : []
)

const puedeEliminar = computed(() => impacto.value?.sePuedeEliminar === true && puedeConfirmar(entendido.value))

// Si no se pudo calcular el impacto no se ofrece eliminar (antes asumía una clase vacía y arrancaba 4 s).
async function cargarImpacto() {
  cargandoImpacto.value = true
  errorImpacto.value = null
  try {
    const result = await acciones.impactoClase(props.claseId)
    impacto.value = result
  } catch (err: unknown) {
    impacto.value = null
    errorImpacto.value = messageOf(err, 'No pude calcular qué se pierde. Revisa tu conexión e inténtalo de nuevo.')
  } finally {
    cargandoImpacto.value = false
  }
}

onMounted(cargarImpacto)
</script>
