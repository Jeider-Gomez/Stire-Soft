<template>
  <div class="max-w-3xl mx-auto space-y-5">
    <p v-if="cargando" role="status" class="flex items-center gap-2 text-xs text-base-texto-secundario"><Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Cargando…</p>
    <div v-else-if="error && !r" class="p-8 text-center bg-base-blanco rounded-xl border border-base-borde-fuerte text-xs space-y-3">
      <p role="alert" class="font-bold text-base-texto-primario">{{ error }}</p>
      <NuxtLink to="/estudiante" class="inline-flex items-center gap-1.5 borde-afordancia px-4 py-2 rounded-md font-semibold"><ArrowLeft :size="14" aria-hidden="true" /> Volver al inicio</NuxtLink>
    </div>

    <template v-else-if="r">
      <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm space-y-3">
        <span class="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" :class="r.tipo === 'reto' ? 'bg-semantico-pasa/15 text-semantico-pasa' : 'bg-acento-ambar/15 text-acento-ambar-fuerte'">
          {{ r.tipo === 'reto' ? 'Reto de tu docente' : 'Refuerzo de tu docente' }}
        </span>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">{{ r.titulo }}</h1>
        <p v-if="r.mensaje" class="text-xs text-base-texto-primario whitespace-pre-wrap bg-base-bg-secundario rounded-md p-3">{{ r.mensaje }}</p>
        <p class="text-[11px] text-base-texto-secundario">
          Cuenta en: {{ r.lecciones.map((l) => l.titulo).join(', ') }}<template v-if="r.fechaLimite"> · hasta {{ fechaCorta(r.fechaLimite) }}</template>
        </p>
        <div class="flex items-center gap-3">
          <div class="w-48 h-2 bg-base-bg-secundario rounded-full overflow-hidden" role="progressbar" :aria-valuenow="hechos" aria-valuemin="0" :aria-valuemax="r.pasos.length" aria-label="Pasos hechos">
            <div class="h-full bg-semantico-pasa rounded-full" :style="{ width: `${(hechos / r.pasos.length) * 100}%` }"></div>
          </div>
          <span class="text-[11px] font-semibold text-base-texto-primario">{{ hechos === r.pasos.length ? '¡Terminaste!' : `${hechos} de ${r.pasos.length} pasos` }}</span>
        </div>
      </header>

      <ol class="space-y-3">
        <li v-for="(p, i) in r.pasos" :key="i" class="bg-base-blanco rounded-xl border p-4 shadow-sm space-y-2 text-xs" :class="p.hecho ? 'border-semantico-pasa/40' : 'border-base-borde-sutil'">
          <h2 class="text-sm font-bold text-base-texto-primario flex items-center gap-2">
            <CheckCircle2 v-if="p.hecho" :size="16" class="text-semantico-pasa shrink-0" aria-hidden="true" />
            <Circle v-else :size="16" class="text-base-borde-fuerte shrink-0" aria-hidden="true" />
            <span>Paso {{ i + 1 }} · {{ p.titulo }}</span>
            <span class="sr-only">{{ p.hecho ? '(hecho)' : '(pendiente)' }}</span>
          </h2>
          <div v-if="p.tipo === 'explicacion'" class="prose prose-xs text-base-texto-primario" v-html="formatMarkdown(p.texto)" />
          <LessonResource v-else-if="p.tipo === 'recurso'" type="embed" :title="p.titulo" :metadata="{ url: p.url, provider: p.provider, embedUrl: p.embedUrl }" />
          <NuxtLink v-else-if="p.tipo === 'ejercicio'" :to="`/estudiante/evaluacion/${p.activityId}`"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-md font-bold" :class="p.hecho ? 'borde-afordancia' : 'bg-acento-ambar-fuerte text-base-blanco'">
            <Play :size="13" aria-hidden="true" /> {{ p.hecho ? 'Practicar otra vez' : 'Hacer el ejercicio' }}
          </NuxtLink>
          <NuxtLink v-else-if="p.tipo === 'entrega'" :to="`/estudiante/entregas/${p.entregaId}`"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-md font-bold" :class="p.hecho ? 'borde-afordancia' : 'bg-acento-ambar-fuerte text-base-blanco'">
            <Inbox :size="13" aria-hidden="true" /> {{ p.hecho ? 'Ver la entrega' : 'Ir a la entrega' }}
          </NuxtLink>
          <button v-if="(p.tipo === 'explicacion' || p.tipo === 'recurso') && !p.hecho" type="button" @click="marcar(i)" :disabled="marcando === i"
            class="px-3 py-1.5 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1 disabled:opacity-50">
            <Check :size="13" aria-hidden="true" /> Ya lo vi
          </button>
        </li>
      </ol>
      <p v-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, Check, CheckCircle2, Circle, Inbox, Loader2, Play } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { formatMarkdown } from '~/utils/formatMarkdown'
import { fechaCorta } from '~/utils/entregas'

definePageMeta({ layout: 'student' })

type PasoVisto =
  | { tipo: 'explicacion'; titulo: string; texto: string; hecho: boolean }
  | { tipo: 'recurso'; titulo: string; url: string; provider: string; embedUrl: string | null; hecho: boolean }
  | { tipo: 'ejercicio'; activityId: number; titulo: string; hecho: boolean }
  | { tipo: 'entrega'; entregaId: number; titulo: string; hecho: boolean }
interface Refuerzo { id: number; tipo: 'refuerzo' | 'reto'; titulo: string; mensaje: string | null; fechaLimite: string | null; lecciones: Array<{ id: number; titulo: string }>; pasos: PasoVisto[] }

const route = useRoute()
const api = useApi()
const { messageOf } = useApiErrorMessage()
const r = ref<Refuerzo | null>(null)
const cargando = ref(true)
const error = ref<string | null>(null)
const marcando = ref<number | null>(null)
const id = Number(route.params.id)

const hechos = computed(() => r.value?.pasos.filter((p) => p.hecho).length ?? 0)

async function cargar() {
  try {
    r.value = await api.get<Refuerzo>(`/refuerzos/${id}`)
  } catch (err) {
    error.value = messageOf(err, 'No se pudo abrir.')
  } finally {
    cargando.value = false
  }
}

async function marcar(i: number) {
  marcando.value = i
  try {
    await api.post(`/refuerzos/${id}/pasos/${i}/hecho`, {})
    await cargar()
  } catch (err) {
    error.value = messageOf(err, 'No se pudo marcar el paso.')
  } finally {
    marcando.value = null
  }
}

onMounted(cargar)
</script>
