<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <DocentePestanasClase v-if="claseId !== null" :class-id="claseId" activa="entregas" :nombre="claseActual?.name" />
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-base-texto-primario tracking-tight flex items-center gap-2">
            <Inbox :size="22" class="text-acento-ambar-fuerte" aria-hidden="true" /> Entregas
          </h1>
          <p class="text-xs text-base-texto-secundario mt-1">
            Espacios donde tus estudiantes entregan un proyecto: dentro de una lección (y si quieres, contando para su dominio) o como
            nota de la materia. Cada versión queda con su fecha, y cada revisión en el historial.
          </p>
        </div>
        <button v-if="claseId !== null && !formulario" type="button" @click="formulario = true"
          class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs inline-flex items-center gap-1.5 shrink-0">
          <Plus :size="14" aria-hidden="true" /> Nueva entrega
        </button>
      </div>
      <div v-if="clases.length > 1" class="flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
        <label for="entregas-clase" class="font-semibold text-base-texto-primario">Clase</label>
        <select id="entregas-clase" v-model="claseId" @change="cargar"
          class="min-w-0 max-w-full w-full sm:w-auto bg-base-blanco text-base-texto-primario border border-base-borde-fuerte rounded-md px-3 py-1.5 outline-none focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30">
          <option v-for="c in clases" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
    </header>

    <DocenteEntregaForm v-if="formulario && claseId !== null" :class-id="claseId" @guardada="alCrear" @cancelar="formulario = false" />

    <p v-if="cargando" role="status" class="flex items-center gap-2 text-xs text-base-texto-secundario">
      <Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Cargando…
    </p>
    <p v-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>
    <p v-if="!cargando && clases.length === 0" class="text-xs text-base-texto-secundario">Todavía no tienes clases.</p>

    <section v-if="!cargando && claseId !== null" aria-label="Entregas de la clase" class="space-y-2">
      <p v-if="entregas.length === 0 && !formulario" class="text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil p-6 text-center">
        Esta clase todavía no tiene entregas. Crea la primera con «Nueva entrega».
      </p>
      <ul v-else class="space-y-2">
        <li v-for="e in entregas" :key="e.id">
          <NuxtLink :to="`/docente/entregas/${e.id}`"
            class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-acento-ambar-fuerte group">
            <span class="min-w-0">
              <span class="font-bold text-sm text-base-texto-primario group-hover:underline flex items-center gap-2 flex-wrap">
                {{ e.titulo }}
                <span v-if="!e.publicada" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-base-bg-secundario text-base-texto-secundario">Borrador</span>
                <span v-if="e.asignadaA?.length" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info">Para {{ e.asignadaA.length }}</span>
              </span>
              <span class="text-[11px] text-base-texto-secundario">
                {{ e.learningUnitId ? leccion(e.learningUnitId) : 'Entrega de la materia' }} · {{ TIPO_ENTREGA[e.tipoProyecto] }}
                <template v-if="e.cierraAt"> · cierra {{ fechaCorta(e.cierraAt) }}</template>
                · hasta {{ e.maxVersiones }} {{ e.maxVersiones === 1 ? 'versión' : 'versiones' }}{{ e.conNota ? ' · con nota' : '' }}
              </span>
            </span>
            <span class="flex items-center gap-3 shrink-0 text-[11px]">
              <span class="font-semibold" :class="e.conteo.por_revisar ? 'text-acento-ambar-fuerte' : 'text-base-texto-secundario'">{{ e.conteo.por_revisar }} por revisar</span>
              <span class="text-base-texto-secundario">{{ e.estudiantes - e.conteo.sin_entregar }} de {{ e.estudiantes }} entregaron</span>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Inbox, Loader2, Plus } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { TIPO_ENTREGA, fechaCorta, type EstadoEntrega, type TipoEntrega } from '~/utils/entregas'

definePageMeta({ layout: 'teacher' })

interface Clase { id: number; name: string }
interface Resumen {
  id: number; titulo: string; learningUnitId: number | null; tipoProyecto: TipoEntrega; cierraAt: string | null; maxVersiones: number
  conNota: boolean; publicada: boolean; asignadaA: number[] | null; estudiantes: number; conteo: Record<EstadoEntrega, number>
}

const api = useApi()
const route = useRoute()
const { messageOf } = useApiErrorMessage()
const clases = ref<Clase[]>([])
const claseId = ref<number | null>(null)
const entregas = ref<Resumen[]>([])
const lecciones = ref(new Map<number, string>())
const cargando = ref(true)
const error = ref<string | null>(null)
const formulario = ref(false)
const claseActual = computed(() => clases.value.find((c) => c.id === claseId.value))

const leccion = (id: number) => `Lección: ${lecciones.value.get(id) ?? '—'}`

async function cargar() {
  if (claseId.value === null) return
  cargando.value = true
  error.value = null
  try {
    const [lista, secciones] = await Promise.all([
      api.get<Resumen[]>(`/entregas/clase/${claseId.value}`),
      api.get<Array<{ topics?: Array<{ learningUnits?: Array<{ id: number; title: string }> }> }>>(`/sections/class/${claseId.value}`),
    ])
    entregas.value = lista
    lecciones.value = new Map(secciones.flatMap((s) => (s.topics ?? []).flatMap((t) => t.learningUnits ?? [])).map((l) => [l.id, l.title]))
  } catch (err) {
    error.value = messageOf(err, 'No se pudieron cargar las entregas.')
  } finally {
    cargando.value = false
  }
}

async function alCrear(e: { id: number }) {
  formulario.value = false
  await navigateTo(`/docente/entregas/${e.id}`)
}

onMounted(async () => {
  try {
    clases.value = await api.get<Clase[]>('/class/my-classes')
    const pedida = Number(route.query.clase)
    claseId.value = clases.value.find((c) => c.id === pedida)?.id ?? clases.value[0]?.id ?? null
    if (claseId.value !== null) await cargar()
    else cargando.value = false
  } catch (err) {
    error.value = messageOf(err, 'No se pudieron cargar tus clases.')
    cargando.value = false
  }
})
</script>
