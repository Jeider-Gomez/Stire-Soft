<template>
  <div class="max-w-5xl mx-auto space-y-5">
    <p v-if="cargando" role="status" class="flex items-center gap-2 text-xs text-base-texto-secundario">
      <Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Cargando la entrega…
    </p>
    <p v-else-if="error && !entrega" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>

    <template v-else-if="entrega">
      <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-5 shadow-sm space-y-3 text-xs">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div class="flex items-start gap-3 min-w-0">
            <NuxtLink :to="`/docente/entregas?clase=${entrega.classId}`" class="p-1.5 rounded borde-afordancia shrink-0" aria-label="Volver a las entregas" title="Volver">
              <ArrowLeft :size="16" aria-hidden="true" />
            </NuxtLink>
            <div class="min-w-0">
              <h1 class="text-lg font-bold text-base-texto-primario flex items-center gap-2 flex-wrap">
                {{ entrega.titulo }}
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold" :class="entrega.publicada ? 'bg-semantico-pasa/15 text-semantico-pasa' : 'bg-base-bg-secundario text-base-texto-secundario'">
                  {{ entrega.publicada ? 'Publicada' : 'Borrador' }}
                </span>
              </h1>
              <p class="text-[11px] text-base-texto-secundario">
                {{ TIPO_ENTREGA[entrega.tipoProyecto] }} · hasta {{ entrega.maxVersiones }} {{ entrega.maxVersiones === 1 ? 'versión' : 'versiones' }}
                · {{ entrega.conNota ? 'con nota' : 'solo comentario' }}{{ entrega.cuentaParaDominio ? ' · cuenta para el dominio' : '' }}
                <template v-if="entrega.cierraAt"> · cierra {{ fechaCorta(entrega.cierraAt) }}{{ entrega.aceptaTarde ? ' (acepta tarde)' : '' }}</template>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" @click="alternarPublicada" :disabled="cambiando" class="px-3 py-1.5 rounded-md borde-afordancia font-semibold disabled:opacity-50">
              {{ entrega.publicada ? 'Despublicar' : 'Publicar' }}
            </button>
            <button type="button" @click="editando = !editando" class="px-3 py-1.5 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1">
              <Pencil :size="13" aria-hidden="true" /> Editar
            </button>
          </div>
        </div>
        <details v-if="entrega.consigna" class="group">
          <summary class="cursor-pointer font-semibold text-acento-ambar-fuerte select-none w-fit">Ver la consigna</summary>
          <div class="prose prose-xs mt-2 text-base-texto-primario" v-html="formatMarkdown(entrega.consigna)" />
        </details>
      </header>

      <DocenteEntregaForm v-if="editando" :class-id="entrega.classId" :inicial="entrega" @guardada="alGuardar" @cancelar="editando = false" />
      <p v-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>
      <p v-if="aviso" role="status" class="text-xs text-semantico-exito font-semibold">{{ aviso }}</p>

      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm text-xs" aria-labelledby="estudiantes-titulo">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b border-base-borde-sutil">
          <h2 id="estudiantes-titulo" class="text-sm font-bold text-base-texto-primario">Estudiantes ({{ entrega.filas.length }})</h2>
          <fieldset class="flex flex-wrap gap-3">
            <legend class="sr-only">Mostrar</legend>
            <label v-for="op in FILTROS" :key="op.valor" class="flex items-center gap-1.5 cursor-pointer">
              <input v-model="filtro" type="radio" :value="op.valor" name="filtro-entrega" class="accent-acento-ambar-fuerte" /> {{ op.texto }} ({{ cuantos(op.valor) }})
            </label>
          </fieldset>
        </div>
        <p v-if="visibles.length === 0" class="p-6 text-center text-base-texto-secundario">Nadie en este grupo.</p>
        <ul v-else class="divide-y divide-base-borde-sutil">
          <li v-for="f in visibles" :key="f.studentId" class="px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div class="min-w-0">
              <p class="font-semibold text-base-texto-primario">{{ f.estudiante }}</p>
              <p class="text-[11px] text-base-texto-secundario">
                <template v-if="f.versiones.length">
                  {{ f.versiones.length }} de {{ entrega.maxVersiones + f.reaperturas }} versiones · última {{ fechaCorta(ultima(f).createdAt) }}{{ ultima(f).tarde ? ' (tarde)' : '' }}
                </template>
                <template v-else>Todavía no entrega</template>
              </p>
            </div>
            <div class="flex items-center gap-2 flex-wrap shrink-0">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="CLASE_ESTADO[f.estado]">
                {{ ESTADO_ENTREGA[f.estado] }}<template v-if="f.estado === 'revisada' && ultima(f).nota !== null"> · {{ notaTexto(ultima(f).nota) }}</template>
              </span>
              <NuxtLink v-if="f.versiones.length" :to="`/docente/entregas/revision/${ultima(f).id}`"
                class="px-3 py-1.5 rounded-md font-bold" :class="f.estado === 'por_revisar' ? 'bg-acento-ambar-fuerte text-base-blanco' : 'borde-afordancia'">
                {{ f.estado === 'por_revisar' ? 'Revisar' : 'Ver' }}
              </NuxtLink>
              <button v-if="f.versiones.length >= entrega.maxVersiones + f.reaperturas" type="button" @click="reabrir(f.studentId, f.estudiante)"
                class="px-2.5 py-1.5 rounded-md borde-afordancia font-semibold" :aria-label="`Darle una versión más a ${f.estudiante}`">+1 versión</button>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, Loader2, Pencil } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { formatMarkdown } from '~/utils/formatMarkdown'
import { ESTADO_ENTREGA, TIPO_ENTREGA, fechaCorta, notaTexto, type EntregaEditable, type EstadoEntrega } from '~/utils/entregas'

definePageMeta({ layout: 'teacher' })

interface Version { id: number; version: number; tarde: boolean; nota: number | null; revisadoAt: string | null; createdAt: string }
interface Fila { studentId: number; estudiante: string; estado: EstadoEntrega; reaperturas: number; versiones: Version[] }
type Detalle = EntregaEditable & { classId: number; filas: Fila[] }

const FILTROS: Array<{ valor: EstadoEntrega | 'todos'; texto: string }> = [
  { valor: 'por_revisar', texto: 'Por revisar' },
  { valor: 'sin_entregar', texto: 'Sin entregar' },
  { valor: 'revisada', texto: 'Revisadas' },
  { valor: 'todos', texto: 'Todos' },
]
const CLASE_ESTADO: Record<EstadoEntrega, string> = {
  sin_entregar: 'bg-base-bg-secundario text-base-texto-secundario',
  por_revisar: 'bg-acento-ambar/15 text-acento-ambar-fuerte',
  revisada: 'bg-semantico-pasa/15 text-semantico-pasa',
}

const route = useRoute()
const api = useApi()
const { messageOf } = useApiErrorMessage()
const entrega = ref<Detalle | null>(null)
const cargando = ref(true)
const error = ref<string | null>(null)
const aviso = ref<string | null>(null)
const editando = ref(false)
const cambiando = ref(false)
const filtro = ref<EstadoEntrega | 'todos'>('todos')

const ultima = (f: Fila) => f.versiones[f.versiones.length - 1]!
const cuantos = (v: EstadoEntrega | 'todos') => (entrega.value?.filas ?? []).filter((f) => v === 'todos' || f.estado === v).length
const visibles = computed(() => (entrega.value?.filas ?? []).filter((f) => filtro.value === 'todos' || f.estado === filtro.value))

async function cargar() {
  try {
    entrega.value = await api.get<Detalle>(`/entregas/${Number(route.params.id)}/detalle`)
    if (cuantos('por_revisar') > 0 && filtro.value === 'todos' && !aviso.value) filtro.value = 'por_revisar'
  } catch (err) {
    error.value = messageOf(err, 'No se pudo cargar la entrega.')
  } finally {
    cargando.value = false
  }
}

async function alGuardar() {
  editando.value = false
  aviso.value = 'Cambios guardados.'
  await cargar()
}

async function alternarPublicada() {
  if (!entrega.value) return
  cambiando.value = true
  error.value = null
  try {
    await api.patch(`/entregas/${entrega.value.id}`, { publicada: !entrega.value.publicada })
    aviso.value = entrega.value.publicada ? 'Ya no la ven los estudiantes (lo entregado se conserva).' : 'Publicada: los estudiantes ya la ven.'
    await cargar()
  } catch (err) {
    error.value = messageOf(err, 'No se pudo cambiar la publicación.')
  } finally {
    cambiando.value = false
  }
}

async function reabrir(studentId: number, nombre: string) {
  if (!entrega.value) return
  error.value = null
  try {
    await api.post(`/entregas/${entrega.value.id}/reabrir`, { studentId })
    aviso.value = `${nombre} puede enviar una versión más.`
    await cargar()
  } catch (err) {
    error.value = messageOf(err, 'No se pudo dar la versión extra.')
  }
}

onMounted(cargar)
</script>
