<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <h4 ref="titulo" tabindex="-1" class="text-[11px] font-bold uppercase tracking-wider text-base-texto-secundario focus:outline-none">
        Ejercicios <span v-if="!loading">({{ activities.length }})</span>
      </h4>
      <div class="flex items-center gap-1.5">
        <!-- Botón Mi banco (T4) -->
        <button
          :id="`abrir-banco-${unitId}`"
          type="button"
          @click="openBankModal"
          class="min-h-[44px] sm:min-h-0 px-2.5 py-1 rounded-md text-[11px] font-semibold borde-afordancia bg-base-blanco text-base-texto-primario hover:bg-base-bg-secundario transition-colors inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
          aria-label="Agregar desde mi banco">
          <Library :size="14" class="text-acento-ambar-fuerte" aria-hidden="true" />
          <span>Mi banco</span>
        </button>
        <NuxtLink
          :to="`/docente/ejercicios/crear?classId=${classId}&unitId=${unitId}`"
          class="min-h-[44px] sm:min-h-0 px-2.5 py-1 rounded-md text-[11px] font-bold bg-acento-ambar-fuerte text-base-blanco hover:bg-acento-ambar transition-colors inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
          <Plus :size="14" aria-hidden="true" /> Ejercicio
        </NuxtLink>
      </div>
    </div>

    <!-- Qué conviene que tenga la lección (09/10): opcional, no bloquea nada. -->
    <DocenteGuiaLeccion v-if="explicaciones" :explicaciones="explicaciones" :ejercicios="deLaUnidadEnBanco" />

    <!-- Texto de ayuda variantes (T5) -->
    <p class="text-[11px] text-base-texto-secundario">
      Las variantes son otro ejercicio del mismo tipo y nivel. STIRE las usa para reintentos y repasos, para que el estudiante no repita la misma respuesta.
    </p>

    <!-- Avisos de casillas con 1 solo ejercicio (T6) -->
    <div v-if="singleExerciseSlots.length > 0" class="space-y-1.5 pt-1">
      <div
        v-for="slot in singleExerciseSlots"
        :key="slot.activityId"
        class="p-2.5 rounded-md bg-acento-ambar/10 border border-acento-ambar/30 text-[11px] flex items-center justify-between gap-3 text-base-texto-primario">
        <span>
          {{ slot.typeName }}, nivel {{ slot.level }}: {{ slot.tiene === 1 ? 'tiene 1 ejercicio' : `tiene ${slot.tiene} ejercicios` }}; se recomiendan {{ slot.recomendados }}.
          {{ slot.recomendados === 3 ? 'Con un solo intento, los parecidos son la forma de volver a intentarlo sin repetir la misma pregunta.' : 'Una variante ayuda en los reintentos y repasos.' }}
        </span>
        <button
          type="button"
          @click="duplicateVariant(slot.activityId)"
          :disabled="isDuplicating"
          class="min-h-[44px] sm:min-h-0 shrink-0 font-bold text-acento-ambar-fuerte hover:underline flex items-center gap-1 disabled:opacity-50">
          <Copy :size="12" aria-hidden="true" />
          <span>Crear variante</span>
        </button>
      </div>
    </div>

    <p v-if="loading" class="text-[11px] text-base-texto-secundario animate-pulse">Cargando ejercicios…</p>
    <p v-else-if="loadError" role="alert" class="text-[11px] text-semantico-falla">{{ loadError }}</p>
    <p v-else-if="activities.length === 0" class="text-[11px] text-base-texto-secundario italic">
      Todavía no hay ejercicios. Empieza por uno sencillo: una pregunta de opción múltiple sobre la explicación.
    </p>

    <ul v-else class="divide-y divide-base-borde-sutil rounded-lg border border-base-borde-sutil bg-base-blanco">
      <li v-for="act in visibleActivities" :key="act.id" class="flex items-center justify-between gap-3 px-3 py-2 text-xs">
        <div class="min-w-0">
          <p class="font-semibold text-base-texto-primario truncate">{{ act.title }}</p>
          <p class="text-[10px] text-base-texto-secundario">
            {{ act.activityType?.name || 'Práctica' }} · {{ nombreNivel(act.difficulty) }} · {{ act.totalPoints }} pts
          </p>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-bold"
            :class="act.status === 'published' ? 'bg-semantico-pasa/10 text-semantico-pasa' : 'bg-acento-ambar/15 text-acento-ambar-fuerte'">
            {{ act.status === 'published' ? 'Visible' : 'Borrador' }}
          </span>
          <button
            v-if="act.status === 'draft'"
            @click="publish(act)"
            class="min-h-[44px] sm:min-h-0 px-2 py-0.5 rounded text-[11px] font-semibold border border-semantico-pasa/40 text-semantico-pasa hover:bg-semantico-pasa/10 focus:outline-none focus:ring-2 focus:ring-semantico-pasa"
            :aria-label="`Publicar ${act.title}`">
            Publicar
          </button>
          <button
            @click="openEdit(act)"
            :id="`editar-ejercicio-${act.id}`"
            class="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center p-1 rounded text-slate-600 hover:text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
            :aria-label="`Editar ${act.title}`" title="Editar">
            <Pencil :size="14" aria-hidden="true" />
          </button>
          <!-- Duplicar como variante (T5) -->
          <button
            @click="duplicateVariant(act.id)"
            :disabled="isDuplicating"
            class="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center p-1 rounded text-slate-600 hover:text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte disabled:opacity-50"
            :aria-label="`Duplicar como variante ${act.title}`"
            title="Duplicar como variante">
            <Copy :size="14" aria-hidden="true" />
          </button>
          <button
            :id="`archivar-ejercicio-${act.id}`"
            @click="askArchive(act)"
            class="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center p-1 rounded text-base-texto-secundario hover:text-semantico-falla hover:bg-semantico-falla/10 focus:outline-none focus:ring-2 focus:ring-semantico-falla"
            :aria-label="`Archivar ${act.title}`" title="Archivar">
            <Archive :size="14" aria-hidden="true" />
          </button>
        </div>
      </li>
    </ul>
    <p v-if="feedback" role="status" class="text-[11px] text-semantico-pasa">{{ feedback }}</p>
    <p v-if="feedbackAviso" role="status" class="text-[11px] text-acento-ambar-fuerte font-semibold">{{ feedbackAviso }}</p>

    <!-- Ventanas (components/docente/ejercicios/), sobre la base común de ventanas; una a la vez. -->
    <DocenteEjerciciosVentanaEditarEjercicio v-if="ventana?.tipo === 'editar'" :key="ventana.ejercicio.id" :ejercicio="ventana.ejercicio" :variante="ventana.variante"
      @cerrar="ventana = null" @duplicar="duplicar" />
    <DocenteEjerciciosVentanaArchivarEjercicio v-else-if="ventana?.tipo === 'archivar'" :ejercicio="ventana.ejercicio"
      @cerrar="ventana = null" @archivado="alArchivar" />
    <DocenteEjerciciosVentanaBancoEjercicios v-else-if="ventana?.tipo === 'banco'" @cerrar="ventana = null" />
  </div>
</template>

<script setup lang="ts">
// Los ejercicios de una lección en «Contenidos»: la lista y sus acciones. Los datos y la API están en
// composables/useEjerciciosUnidad.ts; editar, archivar y «Mi banco», en sus ventanas (PAT-01 y PAT-04; antes 852 líneas
// con las tres ventanas dentro, sin atrapar el foco).
import { nextTick, onMounted, provide, ref } from 'vue'
import { Archive, Copy, Library, Pencil, Plus } from 'lucide-vue-next'
import { CLAVE_EJERCICIOS_UNIDAD, useEjerciciosUnidad } from '~/composables/useEjerciciosUnidad'
import { nombreNivel, type EjercicioDeLaLeccion } from '~/utils/ejerciciosUnidad'
import type { ExplicacionParaGuia } from '~/utils/guiaLeccion'

const props = defineProps<{ unitId: number; classId: number; explicaciones?: ExplicacionParaGuia[] }>()
const emit = defineEmits<{ (e: 'count', n: number): void }>()

const estado = useEjerciciosUnidad(props.unitId, (n) => emit('count', n))
provide(CLAVE_EJERCICIOS_UNIDAD, estado)
const { ejercicios: activities, visibles: visibleActivities, cargando: loading, error: loadError, aviso: feedback, advertencia: feedbackAviso,
  duplicando: isDuplicating, casillasSolas: singleExerciseSlots, cargar: load, publicar: publish, deLaUnidadEnBanco } = estado

type Ventana =
  | { tipo: 'editar'; ejercicio: EjercicioDeLaLeccion; variante: boolean }
  | { tipo: 'archivar'; ejercicio: EjercicioDeLaLeccion }
  | { tipo: 'banco' }
const ventana = ref<Ventana | null>(null)
const titulo = ref<HTMLElement | null>(null)

function openEdit(ejercicio: EjercicioDeLaLeccion) {
  feedbackAviso.value = null
  ventana.value = { tipo: 'editar', ejercicio, variante: false }
}
const askArchive = (ejercicio: EjercicioDeLaLeccion) => { ventana.value = { tipo: 'archivar', ejercicio } }
const openBankModal = () => { ventana.value = { tipo: 'banco' } }

/** Duplicar como variante y abrirla para cambiar sus datos (desde la lista, el aviso T6 o un ejercicio con entregas). */
async function duplicar(id: number) {
  ventana.value = null
  const nueva = await estado.duplicarVariante(id)
  if (nueva) {
    feedbackAviso.value = null
    ventana.value = { tipo: 'editar', ejercicio: nueva, variante: true }
  }
}
const duplicateVariant = (id: number) => duplicar(id)

// Tras archivar, su botón ya no existe: el foco va al título «Ejercicios» en vez de perderse en la página.
function alArchivar() {
  ventana.value = null
  nextTick(() => titulo.value?.focus())
}

onMounted(load)
defineExpose({ reload: load })
</script>
