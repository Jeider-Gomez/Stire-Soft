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

    <!-- No se pudo calcular el impacto: no se ofrece eliminar a ciegas -->
    <div v-else-if="errorImpacto" :id="`eliminar-${nivel}-desc`" class="space-y-3">
      <p role="alert" class="text-semantico-falla text-xs font-semibold p-3 bg-semantico-falla/10 rounded-lg">{{ errorImpacto }}</p>
      <div class="flex items-center justify-end gap-2">
        <button type="button" data-foco-inicial class="min-h-[44px] px-4 rounded-md borde-afordancia text-xs font-semibold" @click="$emit('cerrar')">Cancelar</button>
        <button type="button" class="min-h-[44px] px-4 rounded-md text-xs font-bold border border-base-borde-fuerte text-base-texto-primario hover:bg-base-bg-secundario" @click="cargarImpacto">Reintentar</button>
      </div>
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

      <!-- Un módulo con contenido: una casilla para confirmar (antes, cuenta regresiva y escribir el nombre exacto). -->
      <div v-if="requiereConfirmacion" class="space-y-2">
        <label class="flex items-start gap-2 min-h-[44px] cursor-pointer text-xs text-base-texto-primario">
          <input v-model="entendido" type="checkbox" class="mt-0.5 w-4 h-4 accent-semantico-falla" />
          <span>Entiendo que el módulo se borra para siempre, con todo lo de arriba.</span>
        </label>
        <p v-if="errorAccion" role="alert" class="text-semantico-falla text-[11px] font-semibold p-2 bg-semantico-falla/10 rounded">{{ errorAccion }}</p>
        <div class="flex items-center justify-end gap-2 pt-1">
          <button type="button" data-foco-inicial class="min-h-[44px] px-4 rounded-md borde-afordancia text-xs font-semibold" :disabled="eliminando" @click="$emit('cerrar')">Cancelar</button>
          <button
            type="button"
            :disabled="!puedeConfirmarEliminar || eliminando"
            class="min-h-[44px] px-5 rounded-md bg-semantico-falla text-base-blanco font-bold text-xs hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
            @click="$emit('confirmar')"
          >
            <Loader2 v-if="eliminando" :size="14" class="animate-spin" aria-hidden="true" />
            {{ eliminando ? 'Eliminando…' : labelConfirmar[nivel] }}
          </button>
        </div>
      </div>

      <!-- Eliminación directa para tema, lección o módulo vacío -->
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
import { computed, onMounted, ref } from 'vue'
import { Archive, Loader2, TriangleAlert, Trash2 } from 'lucide-vue-next'
import { puedeConfirmar, textoConsecuencias, type ImpactoEliminacion } from '~/utils/cuentaRegresiva'
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

const acciones = useContenidosAcciones()
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

const cargandoImpacto = ref(true)
const impacto = ref<ImpactoEliminacion | null>(null)
const archivando = ref(false)
const errorAccion = ref<string | null>(null)
/** Si no se pudo calcular el impacto, no se ofrece eliminar a ciegas: se dice y se ofrece reintentar. */
const errorImpacto = ref<string | null>(null)

const entendido = ref(false)

const lineasConsecuencias = computed(() =>
  impacto.value ? textoConsecuencias(impacto.value, props.nivel) : []
)

const requiereConfirmacion = computed(() =>
  props.nivel === 'modulo' &&
  Boolean(impacto.value && ((impacto.value.temas || 0) > 0 || (impacto.value.lecciones || 0) > 0 || (impacto.value.ejercicios || 0) > 0))
)

const puedeConfirmarEliminar = computed(() => {
  if (!requiereConfirmacion.value) return true
  return puedeConfirmar(entendido.value)
})

async function cargarImpacto() {
  cargandoImpacto.value = true
  try {
    errorImpacto.value = null
    impacto.value = await acciones.impacto(props.nivel, props.id)
  } catch (err: unknown) {
    impacto.value = null
    errorImpacto.value = messageOf(err, 'No pude calcular qué se pierde. Revisa tu conexión e inténtalo de nuevo.')
  } finally {
    cargandoImpacto.value = false
  }
}

async function archivarEnSuLugar() {
  archivando.value = true
  errorAccion.value = null
  try {
    await acciones.archivar(props.nivel, props.id)
    avisar({ tipo: 'exito', texto: `«${props.titulo}» quedó archivado.` })
    emit('archivar')
    emit('cerrar')
  } catch (err: unknown) {
    errorAccion.value = messageOf(err, 'No se pudo archivar.')
  } finally {
    archivando.value = false
  }
}

onMounted(cargarImpacto)
</script>
