<template>
  <!-- B4 D3 bis: ventana de eliminar clase con cuenta regresiva + nombre escrito + consecuencias del backend. -->
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

      <!-- Cuenta regresiva accesible -->
      <div v-if="segundosRestantes > 0">
        <!-- Anuncio para lectores de pantalla: una sola vez al inicio -->
        <div aria-live="polite" class="sr-only">
          <span v-if="anunciarInicio">Podrás eliminar en {{ duracion }} segundos</span>
        </div>
        <div class="flex items-center gap-3">
          <!-- Barra de progreso visual -->
          <div class="flex-1 bg-base-borde-sutil rounded-full h-1.5 overflow-hidden">
            <div
              class="h-full bg-semantico-falla transition-all"
              :style="{ width: `${(1 - segundosRestantes / duracion) * 100}%` }"
            />
          </div>
          <span class="text-xs font-mono text-base-texto-secundario tabular-nums shrink-0">{{ segundosRestantes }}s</span>
        </div>
        <button
          type="button"
          disabled
          aria-disabled="true"
          :aria-describedby="'espera-desc-' + claseId"
          class="mt-2 w-full min-h-[44px] px-4 rounded-lg text-xs font-bold bg-semantico-falla/30 text-semantico-falla/60 cursor-not-allowed"
        >
          Lee antes de continuar ({{ segundosRestantes }})
        </button>
        <span :id="'espera-desc-' + claseId" class="sr-only">
          El botón se habilitará en {{ segundosRestantes }} segundos y cuando escribas el nombre de la clase
        </span>
      </div>

      <!-- Cuando terminó la cuenta: campo de nombre + botón confirmar -->
      <div v-else class="space-y-2">
        <div aria-live="polite" class="sr-only">
          <span v-if="anunciarFin">Ya puedes escribir el nombre para confirmar</span>
        </div>
        <label :for="'confirmar-nombre-' + claseId" class="block text-xs font-semibold text-base-texto-primario">
          Escribe el nombre de la clase para confirmar
        </label>
        <input
          :id="'confirmar-nombre-' + claseId"
          v-model="nombreEscrito"
          type="text"
          autocomplete="off"
          :placeholder="nombreClase"
          class="w-full min-h-[44px] px-3 py-2 text-sm rounded-md border border-base-borde-fuerte bg-base-blanco focus:border-semantico-falla focus:ring-2 focus:ring-semantico-falla/30 outline-none"
        />
        <p v-if="errorAccion" role="alert" class="text-semantico-falla text-[11px] font-semibold p-2 bg-semantico-falla/10 rounded">{{ errorAccion }}</p>
        <div class="flex items-center justify-end gap-2">
          <button type="button" data-foco-inicial class="min-h-[44px] px-4 rounded-md borde-afordancia text-xs font-semibold" :disabled="eliminando" @click="$emit('cerrar')">Cancelar</button>
          <button
            type="button"
            :disabled="!puedeEliminar || eliminando"
            :aria-disabled="!puedeEliminar || eliminando"
            class="min-h-[44px] px-5 rounded-lg bg-semantico-falla text-base-blanco font-bold text-xs hover:opacity-90 disabled:opacity-40 inline-flex items-center gap-2"
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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Archive, Loader2, TriangleAlert, Trash2 } from 'lucide-vue-next'
import {
  duracionSegundos,
  puedeConfirmar,
  textoConsecuencias,
  type ImpactoEliminacion,
} from '~/utils/cuentaRegresiva'

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

const api = useApi()

const cargandoImpacto = ref(true)
const impacto = ref<ImpactoEliminacion | null>(null)
const duracion = ref(8)
const segundosRestantes = ref(0)
const nombreEscrito = ref('')
const archivando = ref(false)
const errorAccion = ref<string | null>(null)
const anunciarInicio = ref(false)
const anunciarFin = ref(false)

let intervalo: ReturnType<typeof setInterval> | null = null

const lineasConsecuencias = computed(() =>
  impacto.value ? textoConsecuencias(impacto.value, 'clase') : []
)

const puedeEliminar = computed(() =>
  impacto.value?.sePuedeEliminar === true &&
  puedeConfirmar(segundosRestantes.value, nombreEscrito.value, props.nombreClase)
)

function iniciarCuenta(imp: ImpactoEliminacion) {
  duracion.value = duracionSegundos(imp, 'clase')
  segundosRestantes.value = duracion.value
  anunciarInicio.value = true
  setTimeout(() => { anunciarInicio.value = false }, 500)

  intervalo = setInterval(() => {
    segundosRestantes.value -= 1
    if (segundosRestantes.value <= 0) {
      if (intervalo) clearInterval(intervalo)
      anunciarFin.value = true
      setTimeout(() => { anunciarFin.value = false }, 500)
    }
  }, 1000)
}

onMounted(async () => {
  try {
    const result = await api.get<ImpactoEliminacion>(`/class/${props.claseId}/impacto`)
    impacto.value = result
    if (result.sePuedeEliminar) iniciarCuenta(result)
  } catch {
    impacto.value = { sePuedeEliminar: true }
    iniciarCuenta({ sePuedeEliminar: true })
  } finally {
    cargandoImpacto.value = false
  }
})

onUnmounted(() => {
  if (intervalo) clearInterval(intervalo)
})
</script>
