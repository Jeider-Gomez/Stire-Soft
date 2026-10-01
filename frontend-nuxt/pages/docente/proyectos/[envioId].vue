<template>
  <div class="max-w-7xl mx-auto space-y-4">
    <p v-if="cargando" role="status" class="flex items-center gap-2 text-xs text-base-texto-secundario">
      <Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Abriendo el proyecto…
    </p>
    <p v-else-if="error && !envio" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>

    <template v-else-if="envio">
      <header class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-3 min-w-0">
          <NuxtLink :to="`/docente/proyectos?clase=${envio.classId}`" class="p-1.5 rounded borde-afordancia shrink-0" aria-label="Volver a los proyectos recibidos" title="Volver">
            <ArrowLeft :size="16" aria-hidden="true" />
          </NuxtLink>
          <div class="min-w-0">
            <h1 class="text-sm font-bold text-base-texto-primario truncate">{{ envio.titulo }} <span class="font-normal text-base-texto-secundario">· versión {{ envio.version }}</span></h1>
            <p class="text-[11px] text-base-texto-secundario">{{ envio.estudiante }} · {{ envio.clase }} · enviado {{ fecha(envio.createdAt) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-[11px] text-base-texto-secundario">Solo lectura: es la copia que te enviaron.</span>
          <button type="button" @click="descargarZip(nombre, envio.archivos)" class="px-2.5 py-1.5 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1">
            <Download :size="13" aria-hidden="true" /> .zip
          </button>
          <button v-if="envio.tipo === 'web'" type="button" @click="descargarHtml(nombre, envio.archivos)" class="px-2.5 py-1.5 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1">
            <Download :size="13" aria-hidden="true" /> .html
          </button>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-hidden flex flex-col min-h-[24rem]" aria-label="Código">
          <div class="flex items-center gap-1 border-b border-base-borde-sutil px-2 py-1.5 overflow-x-auto text-[11px]" role="tablist" aria-label="Archivos">
            <button v-for="(a, i) in envio.archivos" :key="a.nombre" type="button" role="tab" :aria-selected="i === actual" @click="actual = i"
              class="px-2.5 py-1 rounded font-mono whitespace-nowrap"
              :class="i === actual ? 'bg-acento-ambar/15 text-acento-ambar-fuerte font-bold' : 'text-base-texto-secundario hover:bg-base-bg-secundario'">
              {{ a.nombre }}
            </button>
          </div>
          <div class="flex-1 min-h-0">
            <CodeEditor :key="archivoActual.nombre" :model-value="archivoActual.contenido" read-only :language="lenguaje(archivoActual.nombre)"
              :aria-label="`Código de ${archivoActual.nombre} (solo lectura)`" min-height="22rem" class="w-full h-full" />
          </div>
        </section>

        <ProyectosResultadoProyecto :tipo="envio.tipo" :archivos="envio.archivos" titulo-vista="Vista previa de la página del estudiante" />
      </div>

      <form novalidate @submit.prevent="guardar" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm space-y-3 text-xs" aria-labelledby="revision-titulo">
        <h2 id="revision-titulo" class="text-sm font-bold text-base-texto-primario">Tu revisión</h2>
        <p class="text-base-texto-secundario">Pon una nota, un comentario o ambos. El estudiante los ve junto a esta versión.</p>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="sm:w-32">
            <label for="revision-nota" class="block font-semibold text-base-texto-primario mb-1">Nota (0,0 a 5,0)</label>
            <input id="revision-nota" v-model="nota" type="text" inputmode="decimal" placeholder="Sin nota" maxlength="4"
              :aria-invalid="!!errorNota" aria-describedby="revision-nota-error"
              class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
            <p id="revision-nota-error" v-if="errorNota" class="text-semantico-falla text-[11px] mt-1">{{ errorNota }}</p>
          </div>
          <div class="flex-1">
            <label for="revision-comentario" class="block font-semibold text-base-texto-primario mb-1">Comentario</label>
            <textarea id="revision-comentario" v-model="comentario" rows="4" maxlength="2000" placeholder="Qué está bien y qué mejorar…"
              class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30"></textarea>
            <p class="text-[11px] text-base-texto-secundario text-right">{{ comentario.length }} / 2000</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button type="submit" :disabled="guardando" class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold inline-flex items-center gap-1.5 disabled:opacity-50">
            <Loader2 v-if="guardando" :size="14" class="animate-spin" aria-hidden="true" /><Save v-else :size="14" aria-hidden="true" />
            Guardar revisión
          </button>
          <span role="status" class="text-[11px]" :class="mensaje ? 'text-semantico-exito font-semibold' : 'text-base-texto-secundario'">
            {{ mensaje || (envio.revisadoAt ? `Revisado ${fecha(envio.revisadoAt)}` : 'Sin revisar') }}
          </span>
          <span v-if="error" role="alert" class="text-semantico-falla">{{ error }}</span>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, Download, Loader2, Save } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { descargarHtml, descargarZip } from '~/utils/descargaProyecto'
import type { ArchivoProyecto } from '~/utils/proyectoNavegador'

definePageMeta({ layout: 'teacher' })

interface Envio {
  id: number; classId: number; version: number; titulo: string; tipo: 'web' | 'javascript'; archivos: ArchivoProyecto[]
  estudiante: string; clase: string; nota: number | null; comentario: string | null; revisadoAt: string | null; createdAt: string
}

const route = useRoute()
const api = useApi()
const { messageOf } = useApiErrorMessage()
const envio = ref<Envio | null>(null)
const cargando = ref(true)
const error = ref<string | null>(null)
const actual = ref(0)
const nota = ref('')
const comentario = ref('')
const errorNota = ref<string | null>(null)
const guardando = ref(false)
const mensaje = ref<string | null>(null)

const archivoActual = computed(() => envio.value!.archivos[Math.min(actual.value, envio.value!.archivos.length - 1)]!)
const nombre = computed(() => (envio.value ? `${envio.value.estudiante} ${envio.value.titulo} v${envio.value.version}` : 'proyecto'))
const fecha = (iso: string) => new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function lenguaje(n: string) {
  const ext = n.split('.').pop()
  return ext === 'html' ? 'html' : ext === 'css' ? 'css' : ext === 'js' ? 'javascript' : 'text'
}

function rellenar(e: Envio) {
  nota.value = e.nota === null ? '' : e.nota.toFixed(1).replace('.', ',')
  comentario.value = e.comentario ?? ''
}

onMounted(async () => {
  try {
    envio.value = await api.get<Envio>(`/proyecto-envios/${Number(route.params.envioId)}`)
    rellenar(envio.value)
  } catch (err) {
    error.value = messageOf(err, 'No se pudo abrir el proyecto.')
  } finally {
    cargando.value = false
  }
})

async function guardar() {
  if (!envio.value) return
  errorNota.value = null
  mensaje.value = null
  error.value = null
  const texto = nota.value.trim().replace(',', '.')
  const n = texto === '' ? null : Number(texto)
  if (n !== null && (!Number.isFinite(n) || n < 0 || n > 5)) { errorNota.value = 'Escribe una nota entre 0,0 y 5,0, o déjala vacía.'; return }
  guardando.value = true
  try {
    const r = await api.patch<Pick<Envio, 'nota' | 'comentario' | 'revisadoAt'>>(`/proyecto-envios/${envio.value.id}/revision`, { nota: n, comentario: comentario.value })
    Object.assign(envio.value, r)
    rellenar(envio.value)
    mensaje.value = r.revisadoAt ? 'Revisión guardada.' : 'Revisión borrada: queda «sin revisar».'
  } catch (err) {
    error.value = messageOf(err, 'No se pudo guardar la revisión.')
  } finally {
    guardando.value = false
  }
}
</script>
