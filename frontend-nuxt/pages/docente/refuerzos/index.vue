<template>
  <div class="max-w-5xl mx-auto space-y-5">
    <DocentePestanasClase v-if="claseId" :class-id="claseId" activa="refuerzos" :nombre="claseActual?.name" />
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-5 shadow-sm space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-base-texto-primario flex items-center gap-2"><LifeBuoy :size="22" class="text-acento-ambar-fuerte" aria-hidden="true" /> Refuerzos y retos</h1>
          <p class="text-xs text-base-texto-secundario mt-1">Lo que asignaste a estudiantes concretos y si funcionó: los pasos que hicieron y su dominio antes y ahora.</p>
        </div>
        <NuxtLink v-if="claseId" :to="enlaceNuevoRefuerzo(claseId, 'refuerzo', [])" class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs inline-flex items-center gap-1.5 shrink-0">
          <Plus :size="14" aria-hidden="true" /> Nuevo refuerzo o reto
        </NuxtLink>
      </div>
      <div v-if="clases.length > 1" class="flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
        <label for="ref-lista-clase" class="font-semibold text-base-texto-primario">Clase</label>
        <select id="ref-lista-clase" v-model="claseId" @change="cargar" class="min-w-0 max-w-full w-full sm:w-auto bg-base-blanco border border-base-borde-fuerte rounded-md px-3 py-1.5">
          <option v-for="c in clases" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <p class="text-[11px] text-base-texto-secundario">También puedes asignar desde <NuxtLink :to="claseId ? `/docente/clase/${claseId}` : '/docente'" class="underline">Hoy</NuxtLink> o desde el mapa de <NuxtLink :to="claseId ? `/docente/rendimiento?classId=${claseId}` : '/docente/rendimiento'" class="underline">Estudiantes</NuxtLink>: en «Bloqueados» y «Listos para más».</p>
    </header>

    <p v-if="cargando" role="status" class="flex items-center gap-2 text-xs text-base-texto-secundario"><Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Cargando…</p>
    <p v-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>
    <p v-if="!cargando && claseId && lista.length === 0" class="text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil p-6 text-center">
      Todavía no has asignado refuerzos ni retos en esta clase.
    </p>

    <article v-for="r in lista" :key="r.id" class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm text-xs" :class="r.archivado ? 'opacity-60' : ''">
      <div class="px-4 py-3 border-b border-base-borde-sutil flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="min-w-0">
          <h2 class="text-sm font-bold text-base-texto-primario flex items-center gap-2 flex-wrap">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold" :class="r.tipo === 'reto' ? 'bg-semantico-pasa/15 text-semantico-pasa' : 'bg-acento-ambar/15 text-acento-ambar-fuerte'">{{ r.tipo === 'reto' ? 'Reto' : 'Refuerzo' }}</span>
            {{ r.titulo }}
            <span v-if="r.archivado" class="text-[10px] font-semibold text-base-texto-secundario">Archivado</span>
          </h2>
          <p class="text-[11px] text-base-texto-secundario">
            {{ r.lecciones.map((l) => l.titulo).join(', ') }} · {{ r.totalPasos }} {{ r.totalPasos === 1 ? 'paso' : 'pasos' }} · asignado {{ fechaCorta(r.createdAt) }}<template v-if="r.fechaLimite"> · hasta {{ fechaCorta(r.fechaLimite) }}</template>
          </p>
        </div>
        <button v-if="!r.archivado" type="button" @click="archivar(r.id)" class="px-2.5 py-1.5 rounded-md borde-afordancia font-semibold shrink-0">Archivar</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <caption class="sr-only">Avance de cada estudiante en {{ r.titulo }}</caption>
          <thead class="text-[10px] uppercase tracking-wider text-base-texto-secundario">
            <tr>
              <th scope="col" class="px-4 py-2 font-semibold">Estudiante</th>
              <th scope="col" class="px-4 py-2 font-semibold">Pasos</th>
              <th scope="col" class="px-4 py-2 font-semibold">¿Funcionó? Dominio antes → ahora</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-base-borde-sutil">
            <tr v-for="e in r.estudiantes" :key="e.studentId">
              <td class="px-4 py-2 font-semibold text-base-texto-primario whitespace-nowrap">
                <NuxtLink :to="`/docente/estudiante/${e.studentId}?clase=${claseId}`" class="hover:underline">{{ e.nombre }}</NuxtLink>
              </td>
              <td class="px-4 py-2 whitespace-nowrap" :class="e.pasosHechos === r.totalPasos ? 'text-semantico-pasa font-semibold' : 'text-base-texto-secundario'">
                {{ e.pasosHechos === r.totalPasos ? 'Hecho' : e.pasosHechos === 0 ? 'Sin empezar' : `${e.pasosHechos} de ${r.totalPasos}` }}
              </td>
              <td class="px-4 py-2">
                <span v-for="d in e.dominio" :key="d.learningUnitId" class="inline-flex items-center gap-1 mr-3 whitespace-nowrap">
                  <span v-if="r.lecciones.length > 1" class="text-base-texto-secundario">{{ tituloCorto(r, d.learningUnitId) }}:</span>
                  {{ d.antes }} % <ArrowRight :size="11" aria-hidden="true" />
                  <strong :class="d.ahora > d.antes ? 'text-semantico-pasa' : d.ahora < d.antes ? 'text-semantico-falla' : 'text-base-texto-primario'">{{ d.ahora }} %</strong>
                  <span class="sr-only">{{ d.ahora > d.antes ? 'subió' : d.ahora < d.antes ? 'bajó' : 'igual' }}</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, LifeBuoy, Loader2, Plus } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { fechaCorta } from '~/utils/entregas'
import { enlaceNuevoRefuerzo, type TipoRefuerzo } from '~/utils/refuerzos'

definePageMeta({ layout: 'teacher' })

interface Fila { studentId: number; nombre: string; pasosHechos: number; dominio: Array<{ learningUnitId: number; antes: number; ahora: number }> }
interface Resumen { id: number; tipo: TipoRefuerzo; titulo: string; fechaLimite: string | null; archivado: boolean; createdAt: string; totalPasos: number; lecciones: Array<{ id: number; titulo: string }>; estudiantes: Fila[] }

const route = useRoute()
const api = useApi()
const { messageOf } = useApiErrorMessage()
const clases = ref<Array<{ id: number; name: string }>>([])
const claseId = ref<number | null>(null)
const lista = ref<Resumen[]>([])
const cargando = ref(true)
const error = ref<string | null>(null)
const claseActual = computed(() => clases.value.find((c) => c.id === claseId.value))

const tituloCorto = (r: Resumen, id: number) => (r.lecciones.find((l) => l.id === id)?.titulo ?? '').slice(0, 24)

async function cargar() {
  if (claseId.value === null) return
  cargando.value = true
  error.value = null
  try {
    lista.value = await api.get<Resumen[]>(`/refuerzos/clase/${claseId.value}`)
  } catch (err) {
    error.value = messageOf(err, 'No se pudieron cargar los refuerzos.')
  } finally {
    cargando.value = false
  }
}

async function archivar(id: number) {
  try {
    await api.patch(`/refuerzos/${id}/archivar`, {})
    await cargar()
  } catch (err) {
    error.value = messageOf(err, 'No se pudo archivar.')
  }
}

onMounted(async () => {
  try {
    clases.value = await api.get('/class/my-classes')
    const pedida = Number(route.query.clase)
    claseId.value = clases.value.find((c) => c.id === pedida)?.id ?? clases.value[0]?.id ?? null
    await cargar()
  } catch (err) {
    error.value = messageOf(err, 'No se pudieron cargar tus clases.')
    cargando.value = false
  }
})
</script>
