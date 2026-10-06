<template>
  <!-- VentanaEliminar: única ventana para módulo, tema y lección. Pide el impacto al abrirse. -->
  <!-- Si sePuedeEliminar es falso, muestra el motivo y ofrece «Archivar en su lugar». -->
  <AdminDialogo
    :id-titulo="`eliminar-${nivel}-titulo`"
    :titulo="titulos[nivel]"
    :subtitulo="titulo"
    :id-descripcion="`eliminar-${nivel}-desc`"
    clase-icono="bg-semantico-falla/10 text-semantico-falla"
    :ocupado="eliminando"
    @cerrar="$emit('cerrar')"
  >
    <template #icono><Trash2 :size="18" aria-hidden="true" /></template>

    <!-- Calculando impacto -->
    <div v-if="cargandoImpacto" class="flex items-center gap-2 text-xs text-base-texto-secundario py-2" :id="`eliminar-${nivel}-desc`">
      <Loader2 :size="14" class="animate-spin" aria-hidden="true" />
      Calculando el impacto…
    </div>

    <!-- No se puede eliminar: hay trabajo de estudiantes -->
    <div v-else-if="impacto && !impacto.sePuedeEliminar" :id="`eliminar-${nivel}-desc`" class="space-y-3">
      <div class="p-3 bg-acento-ambar/10 border border-acento-ambar-fuerte/30 rounded-lg text-xs text-base-texto-primario">
        <p class="font-semibold text-acento-ambar-fuerte flex items-center gap-1.5 mb-1">
          <TriangleAlert :size="14" aria-hidden="true" /> No se puede eliminar
        </p>
        <p>{{ impacto.motivo }}</p>
      </div>
      <p v-if="errorAccion" role="alert" class="text-semantico-falla text-[11px]">{{ errorAccion }}</p>
      <div class="flex items-center justify-end gap-2">
        <button type="button" data-foco-inicial class="min-h-[44px] px-4 rounded-md borde-afordancia text-xs font-semibold" @click="$emit('cerrar')">Cerrar</button>
        <button
          type="button"
          :disabled="archivando"
          class="min-h-[44px] px-4 rounded-md text-xs font-bold bg-acento-ambar-fuerte text-base-blanco hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
          @click="archivarEnSuLugar"
        >
          <Loader2 v-if="archivando" :size="13" class="animate-spin" aria-hidden="true" />
          <Archive v-else :size="13" aria-hidden="true" />
          Archivar en su lugar
        </button>
      </div>
    </div>

    <!-- Se puede eliminar: muestra consecuencias -->
    <div v-else-if="impacto" :id="`eliminar-${nivel}-desc`" class="space-y-3">
      <ul class="space-y-1 text-xs text-slate-700">
        <li v-for="linea in lineasConsecuencias" :key="linea" class="flex items-start gap-1.5">
          <span class="text-semantico-falla shrink-0 mt-px">•</span>
          {{ linea }}
        </li>
        <li class="flex items-start gap-1.5">
          <span class="text-semantico-falla shrink-0 mt-px">•</span>
          Esto no se puede deshacer. Si solo quieres ocultarlo, archívalo.
        </li>
      </ul>

      <!-- Botón Archivar en su lugar siempre accesible -->
      <button
        type="button"
        class="w-full min-h-[44px] px-4 rounded-lg text-xs font-bold border border-acento-ambar-fuerte/50 text-acento-ambar-fuerte hover:bg-acento-ambar/10 transition-colors inline-flex items-center justify-center gap-1.5"
        @click="archivarEnSuLugar"
      >
        <Archive :size="14" aria-hidden="true" />
        Archivar en su lugar
      </button>

      <!-- Cuenta regresiva si es un módulo con contenido -->
      <div v-if="requiereConfirmacionNombre && segundosRestantes > 0">
        <div aria-live="polite" class="sr-only">
          <span v-if="anunciarInicio">Podrás eliminar en {{ duracion }} segundos</span>
        </div>
        <div class="flex items-center gap-3">
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
          class="mt-2 w-full min-h-[44px] px-4 rounded-lg text-xs font-bold bg-semantico-falla/30 text-semantico-falla/60 cursor-not-allowed"
        >
          Lee antes de continuar ({{ segundosRestantes }})
        </button>
      </div>

      <!-- Campo de confirmación por nombre si es módulo con contenido y terminó la cuenta -->
      <div v-else-if="requiereConfirmacionNombre" class="space-y-2">
        <div aria-live="polite" class="sr-only">
          <span v-if="anunciarFin">Ya puedes escribir el nombre para confirmar</span>
        </div>
        <label :for="'confirmar-nombre-' + id" class="block text-xs font-semibold text-base-texto-primario">
          Escribe el nombre del módulo para confirmar
        </label>
        <input
          :id="'confirmar-nombre-' + id"
          v-model="nombreEscrito"
          type="text"
          autocomplete="off"
          :placeholder="titulo"
          class="w-full min-h-[44px] px-3 py-2 text-sm rounded-md border border-base-borde-fuerte bg-base-blanco focus:border-semantico-falla focus:ring-2 focus:ring-semantico-falla/30 outline-none"
        />
        <p v-if="errorAccion" role="alert" class="text-semantico-falla text-[11px] font-semibold p-2 bg-semantico-falla/10 rounded">{{ errorAccion }}</p>
        <div class="flex items-center justify-end gap-2 pt-1">
          <button type="button" data-foco-inicial class="min-h-[44px] px-4 rounded-md borde-afordancia text-xs font-semibold" :disabled="eliminando" @click="$emit('cerrar')">Cancelar</button>
          <button
            type="button"
            :disabled="!puedeConfirmarEliminar || eliminando"
            :aria-disabled="!puedeConfirmarEliminar || eliminando"
            class="min-h-[44px] px-5 rounded-md bg-semantico-falla text-base-blanco font-bold text-xs hover:opacity-90 disabled:opacity-40 inline-flex items-center gap-2"
            @click="$emit('confirmar')"
          >
            <Loader2 v-if="eliminando" :size="14" class="animate-spin" aria-hidden="true" />
            {{ eliminando ? 'Eliminando…' : labelConfirmar[nivel] }}
          </button>
        </div>
      </div>

      <!-- Eliminación directa (sin nombre ni cuenta) para tema, lección o módulo vacío -->
      <div v-else>
        <p v-if="errorAccion" role="alert" class="text-semantico-falla text-[11px] font-semibold p-2 bg-semantico-falla/10 rounded">{{ errorAccion }}</p>
        <div class="flex items-center justify-end gap-2 pt-1">
          <button type="button" data-foco-inicial class="min-h-[44px] px-4 rounded-md borde-afordancia text-xs font-semibold" :disabled="eliminando" @click="$emit('cerrar')">Cancelar</button>
          <button
            type="button"
            :disabled="eliminando"
            class="min-h-[44px] px-5 rounded-md bg-semantico-falla text-base-blanco font-bold text-xs hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
            @click="$emit('confirmar')"
          >
            <Loader2 v-if="eliminando" :size="14" class="animate-spin" aria-hidden="true" />
            {{ eliminando ? 'Eliminando…' : labelConfirmar[nivel] }}
          </button>
        </div>
      </div>
    </div>
  </AdminDialogo>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Archive, Loader2, TriangleAlert, Trash2 } from 'lucide-vue-next'
import { duracionSegundos, puedeConfirmar, textoConsecuencias, type ImpactoEliminacion } from '~/utils/cuentaRegresiva'
import { useAvisos } from '~/composables/useAvisos'

const props = defineProps<{
  nivel: 'modulo' | 'tema' | 'leccion'
  id: number
  titulo: string
  eliminando?: boolean
}>()
const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'confirmar'): void
  (e: 'archivar'): void
}>()

const api = useApi()
const { messageOf } = useApiErrorMessage()
const { avisar } = useAvisos()

const titulos: Record<string, string> = {
  modulo: '¿Eliminar este módulo?',
  tema: '¿Eliminar este tema?',
  leccion: '¿Eliminar esta lección?',
}
const labelConfirmar: Record<string, string> = {
  modulo: 'Sí, eliminar el módulo',
  tema: 'Sí, eliminar el tema',
  leccion: 'Sí, eliminar la lección',
}
const rutaImpacto: Record<string, string> = {
  modulo: '/sections',
  tema: '/topic',
  leccion: '/learning-unit',
}
const rutaArchivar: Record<string, string> = {
  modulo: '/sections',
  tema: '/topic',
  leccion: '/learning-unit',
}

const cargandoImpacto = ref(true)
const impacto = ref<ImpactoEliminacion | null>(null)
const archivando = ref(false)
const errorAccion = ref<string | null>(null)

const duracion = ref(5)
const segundosRestantes = ref(0)
const nombreEscrito = ref('')
const anunciarInicio = ref(false)
const anunciarFin = ref(false)
let intervalo: ReturnType<typeof setInterval> | null = null

const lineasConsecuencias = computed(() =>
  impacto.value ? textoConsecuencias(impacto.value, props.nivel) : []
)

const requiereConfirmacionNombre = computed(() =>
  props.nivel === 'modulo' &&
  Boolean(impacto.value && ((impacto.value.temas || 0) > 0 || (impacto.value.lecciones || 0) > 0 || (impacto.value.ejercicios || 0) > 0))
)

const puedeConfirmarEliminar = computed(() => {
  if (!requiereConfirmacionNombre.value) return true
  return puedeConfirmar(segundosRestantes.value, nombreEscrito.value, props.titulo)
})

function iniciarCuenta(imp: ImpactoEliminacion) {
  duracion.value = duracionSegundos(imp, 'modulo')
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

async function cargarImpacto() {
  cargandoImpacto.value = true
  try {
    impacto.value = await api.get<ImpactoEliminacion>(`${rutaImpacto[props.nivel]}/${props.id}/impacto`)
    if (impacto.value.sePuedeEliminar && requiereConfirmacionNombre.value) {
      iniciarCuenta(impacto.value)
    }
  } catch {
    impacto.value = { sePuedeEliminar: true }
  } finally {
    cargandoImpacto.value = false
  }
}

async function archivarEnSuLugar() {
  archivando.value = true
  errorAccion.value = null
  try {
    await api.patch(`${rutaArchivar[props.nivel]}/${props.id}/archivar`, {})
    avisar({ tipo: 'exito', texto: `${props.titulo} archivado.` })
    emit('archivar')
    emit('cerrar')
  } catch (err: unknown) {
    errorAccion.value = messageOf(err, 'No se pudo archivar.')
  } finally {
    archivando.value = false
  }
}

onMounted(cargarImpacto)
onUnmounted(() => {
  if (intervalo) clearInterval(intervalo)
})
</script>
