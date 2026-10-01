<template>
  <div class="max-w-4xl mx-auto space-y-5">
    <p v-if="cargando" role="status" class="flex items-center gap-2 text-xs text-base-texto-secundario">
      <Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Cargando la entrega…
    </p>
    <div v-else-if="error && !entrega" class="p-8 text-center bg-base-blanco rounded-xl border border-base-borde-fuerte text-xs space-y-3">
      <p role="alert" class="font-bold text-base-texto-primario">{{ error }}</p>
      <NuxtLink to="/estudiante" class="inline-flex items-center gap-1.5 borde-afordancia px-4 py-2 rounded-md font-semibold"><ArrowLeft :size="14" aria-hidden="true" /> Volver al inicio</NuxtLink>
    </div>

    <template v-else-if="entrega">
      <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm space-y-3">
        <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-acento-ambar/15 text-acento-ambar-fuerte uppercase tracking-wider">Entrega</span>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">{{ entrega.titulo }}</h1>
        <p class="text-xs text-base-texto-secundario flex flex-wrap gap-x-3 gap-y-1">
          <span>{{ TIPO_ENTREGA[entrega.tipoProyecto] }}</span>
          <span>{{ entrega.versiones.length }} de {{ entrega.limite }} {{ entrega.limite === 1 ? 'versión' : 'versiones' }}</span>
          <span v-if="entrega.cierraAt" :class="cerrada ? 'text-semantico-falla font-semibold' : ''">
            {{ cerrada ? 'Cerró' : 'Cierra' }} {{ fechaCorta(entrega.cierraAt) }}{{ cerrada && entrega.aceptaTarde ? ' (aún recibe, marcada como tarde)' : '' }}
          </span>
          <span>{{ entrega.conNota ? 'Con nota' : 'Con comentario de tu docente' }}</span>
        </p>
        <div v-if="entrega.consigna" class="prose prose-xs text-xs text-base-texto-primario border-t border-base-borde-sutil pt-3" v-html="formatMarkdown(entrega.consigna)" />
      </header>

      <!-- Entregar -->
      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-3 text-xs" aria-labelledby="entregar-titulo">
        <h2 id="entregar-titulo" class="text-sm font-bold text-base-texto-primario flex items-center gap-1.5"><Send :size="15" class="text-acento-ambar-fuerte" aria-hidden="true" /> Entregar</h2>
        <p v-if="!puedeEntregar" class="text-base-texto-secundario bg-base-bg-secundario rounded-md p-3">{{ motivoSinEntregar }}</p>
        <template v-else>
          <p class="text-base-texto-secundario">Se envía una copia de tu proyecto tal como está guardado. Puedes seguir editándolo: lo que entregas no cambia.</p>
          <form v-if="misProyectos.length" novalidate @submit.prevent="enviar" class="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div class="flex-1 min-w-0">
              <label for="entrega-proyecto" class="block font-semibold text-base-texto-primario mb-1">Proyecto</label>
              <select id="entrega-proyecto" v-model="proyectoElegido" class="w-full max-w-full px-2 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco">
                <option v-for="p in misProyectos" :key="p.id" :value="p.id">{{ p.titulo }} · editado {{ fechaCorta(p.updatedAt) }}</option>
              </select>
            </div>
            <button type="submit" :disabled="enviando || proyectoElegido === null"
              class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50">
              <Loader2 v-if="enviando" :size="14" class="animate-spin" aria-hidden="true" /><Send v-else :size="14" aria-hidden="true" />
              Entregar versión {{ entrega.versiones.length + 1 }}
            </button>
          </form>
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" @click="empezar" :disabled="empezando" class="font-semibold text-acento-ambar-fuerte hover:underline inline-flex items-center gap-1.5 disabled:opacity-50">
              <FolderPlus :size="14" aria-hidden="true" /> {{ entrega.tienePlantilla ? 'Empezar desde el código de tu docente' : 'Crear un proyecto nuevo para esta entrega' }}
            </button>
            <NuxtLink v-if="proyectoElegido !== null" :to="`/estudiante/proyectos/${proyectoElegido}`" class="font-semibold text-base-texto-secundario hover:underline">Abrir el proyecto elegido</NuxtLink>
          </div>
        </template>
        <p v-if="mensaje" role="status" class="text-semantico-exito font-semibold">{{ mensaje }}</p>
        <p v-if="error" role="alert" class="text-semantico-falla">{{ error }}</p>
      </section>

      <!-- Lo entregado: comentario primero, luego la nota -->
      <section v-if="entrega.versiones.length" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-3 text-xs" aria-labelledby="versiones-titulo">
        <h2 id="versiones-titulo" class="text-sm font-bold text-base-texto-primario">Lo que has entregado</h2>
        <ul class="space-y-2">
          <li v-for="v in entrega.versiones" :key="v.id" class="rounded-md border border-base-borde-sutil p-3 space-y-1.5">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="font-semibold text-base-texto-primario">Versión {{ v.version }} · «{{ v.titulo }}»</span>
              <span class="text-[11px] text-base-texto-secundario">enviada {{ fechaCorta(v.createdAt) }}{{ v.tarde ? ' (tarde)' : '' }}</span>
            </div>
            <p v-if="!v.revisadoAt" class="text-[11px] text-base-texto-secundario">Tu docente aún no la revisa.</p>
            <p v-if="v.comentario" class="text-base-texto-primario whitespace-pre-wrap bg-base-bg-secundario rounded p-2">{{ v.comentario }}</p>
            <p v-if="v.nota !== null" class="text-base-texto-primario">Nota: <strong>{{ notaTexto(v.nota) }}</strong> de 5,0</p>
            <p v-if="v.revisadoAt" class="text-[11px] text-base-texto-secundario">Revisada {{ fechaCorta(v.revisadoAt) }}</p>
            <button type="button" @click="descargarVersion(v.id)" class="text-[11px] font-semibold text-acento-ambar-fuerte hover:underline inline-flex items-center gap-1">
              <Download :size="12" aria-hidden="true" /> Descargar esta versión (.zip)
            </button>
          </li>
        </ul>
      </section>

      <section v-if="entrega.historial.length" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm text-xs space-y-2" aria-labelledby="historial-est">
        <h2 id="historial-est" class="text-sm font-bold text-base-texto-primario flex items-center gap-1.5"><History :size="15" aria-hidden="true" /> Historial</h2>
        <ol class="space-y-2">
          <li v-for="h in entrega.historial" :key="h.id" class="border-l-2 border-base-borde-fuerte pl-2">
            <p class="font-semibold text-base-texto-primario">{{ textoEvento(h) }}</p>
            <p class="text-[11px] text-base-texto-secundario">{{ fechaCorta(h.createdAt) }}{{ h.actor ? ` · ${h.actor}` : '' }}</p>
          </li>
        </ol>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, Download, FolderPlus, History, Loader2, Send } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { formatMarkdown } from '~/utils/formatMarkdown'
import type { TipoProyecto } from '~/utils/proyectoNavegador'
import { descargarZip } from '~/utils/descargaProyecto'
import { TIPO_ENTREGA, fechaCorta, notaTexto, textoEvento, type EventoHistorial, type TipoEntrega } from '~/utils/entregas'
import type { ArchivoProyecto } from '~/utils/proyectoNavegador'

definePageMeta({ layout: 'student' })

interface Version { id: number; version: number; titulo: string; tarde: boolean; nota: number | null; comentario: string | null; revisadoAt: string | null; createdAt: string }
interface Entrega {
  id: number; classId: number; titulo: string; consigna: string; tipoProyecto: TipoEntrega; tienePlantilla: boolean
  abreAt: string | null; cierraAt: string | null; aceptaTarde: boolean; conNota: boolean; limite: number
  versiones: Version[]; historial: EventoHistorial[]
}
interface Proyecto { id: number; titulo: string; tipo: TipoProyecto; updatedAt: string }

const route = useRoute()
const api = useApi()
const { messageOf } = useApiErrorMessage()
const entrega = ref<Entrega | null>(null)
const proyectos = ref<Proyecto[]>([])
const proyectoElegido = ref<number | null>(null)
const cargando = ref(true)
const enviando = ref(false)
const empezando = ref(false)
const error = ref<string | null>(null)
const mensaje = ref<string | null>(null)
const id = Number(route.params.id)

const ahora = () => new Date()
const cerrada = computed(() => !!entrega.value?.cierraAt && new Date(entrega.value.cierraAt) < ahora())
const misProyectos = computed(() => proyectos.value.filter((p) => entrega.value?.tipoProyecto === 'cualquiera' || p.tipo === entrega.value?.tipoProyecto))
const puedeEntregar = computed(() => {
  const e = entrega.value
  if (!e) return false
  if (e.abreAt && new Date(e.abreAt) > ahora()) return false
  if (cerrada.value && !e.aceptaTarde) return false
  return e.versiones.length < e.limite
})
const motivoSinEntregar = computed(() => {
  const e = entrega.value
  if (!e) return ''
  if (e.abreAt && new Date(e.abreAt) > ahora()) return `Abre el ${fechaCorta(e.abreAt)}.`
  if (cerrada.value && !e.aceptaTarde) return 'Esta entrega ya cerró.'
  return `Ya usaste tus ${e.limite} versiones. Si necesitas otra, pídesela a tu docente.`
})

async function cargar() {
  try {
    const [e, lista] = await Promise.all([
      api.get<Entrega>(`/entregas/${id}`),
      api.get<Proyecto[]>('/proyectos').catch(() => [] as Proyecto[]),
    ])
    entrega.value = e
    proyectos.value = lista
    if (proyectoElegido.value === null || !misProyectos.value.some((p) => p.id === proyectoElegido.value)) {
      proyectoElegido.value = misProyectos.value[0]?.id ?? null
    }
  } catch (err) {
    error.value = messageOf(err, 'No se pudo abrir la entrega.')
  } finally {
    cargando.value = false
  }
}

async function enviar() {
  if (proyectoElegido.value === null) return
  enviando.value = true
  mensaje.value = null
  error.value = null
  try {
    const r = await api.post<{ version: number }>(`/entregas/${id}/enviar`, { proyectoId: proyectoElegido.value })
    mensaje.value = `Entregaste la versión ${r.version}.`
    await cargar()
  } catch (err) {
    error.value = messageOf(err, 'No se pudo entregar.')
  } finally {
    enviando.value = false
  }
}

async function empezar() {
  empezando.value = true
  error.value = null
  try {
    const p = await api.post<{ id: number }>(`/entregas/${id}/empezar`)
    await navigateTo(`/estudiante/proyectos/${p.id}`)
  } catch (err) {
    error.value = messageOf(err, 'No se pudo crear el proyecto.')
  } finally {
    empezando.value = false
  }
}

async function descargarVersion(envioId: number) {
  try {
    const v = await api.get<{ titulo: string; version: number; archivos: ArchivoProyecto[] }>(`/proyecto-envios/${envioId}`)
    descargarZip(`${v.titulo} v${v.version}`, v.archivos)
  } catch (err) {
    error.value = messageOf(err, 'No se pudo descargar la versión.')
  }
}

onMounted(cargar)
</script>
