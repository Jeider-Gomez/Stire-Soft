<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Dónde está: Inicio › Módulo › Tema (si agrupa varias lecciones) › Lección -->
    <nav aria-label="Ubicación" class="flex items-center gap-1.5 flex-wrap text-xs text-base-texto-secundario">
      <NuxtLink to="/estudiante" class="hover:underline">Inicio</NuxtLink>
      <ChevronRight :size="12" aria-hidden="true" />
      <template v-if="ubicacion.modulo">
        <span>{{ ubicacion.modulo }}</span>
        <ChevronRight :size="12" aria-hidden="true" />
      </template>
      <template v-if="ubicacion.tema">
        <span>{{ ubicacion.tema }}</span>
        <ChevronRight :size="12" aria-hidden="true" />
      </template>
      <span class="font-bold text-base-texto-primario" aria-current="page">{{ unitData?.title || 'Cargando…' }}</span>
    </nav>

    <!-- Estado de carga -->
    <p v-if="isLoading" role="status" class="p-12 flex items-center justify-center gap-2 text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil">
      <Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Cargando la lección…
    </p>

    <!-- Lección no encontrada / sin acceso -->
    <div v-else-if="loadError || !unitData" class="p-8 text-center bg-base-blanco rounded-xl border border-base-borde-fuerte text-xs space-y-3">
      <p class="font-bold text-base-texto-primario">No pudimos cargar esta lección.</p>
      <p class="text-base-texto-secundario">Puede que no exista o que no estés matriculado en la clase a la que pertenece.</p>
      <NuxtLink to="/estudiante" class="inline-flex items-center gap-1.5 borde-afordancia px-4 py-2 rounded-md text-xs font-semibold bg-base-blanco text-base-texto-primario">
        <ArrowLeft :size="14" aria-hidden="true" /> Volver al inicio
      </NuxtLink>
    </div>

    <template v-else>
      <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm space-y-3">
        <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info uppercase tracking-wider">
          {{ TERMINOS.leccion.uno }}
        </span>
        <h1 class="text-xl md:text-2xl font-bold text-base-texto-primario tracking-tight">{{ unitData.title }}</h1>
        <p class="text-xs text-base-texto-secundario">{{ unitData.description }}</p>
        <!-- El dominio de la lección se ve desde el principio: practicar es la forma de medirlo. -->
        <div v-if="dominio !== null" class="flex items-center gap-3">
          <div class="w-40 h-2 bg-base-bg-secundario rounded-full overflow-hidden border border-base-borde-sutil" role="progressbar"
            :aria-valuenow="dominio" aria-valuemin="0" aria-valuemax="100" aria-label="Tu dominio de la lección">
            <div class="h-full rounded-full" :class="dominio >= DOMINADO ? 'bg-semantico-pasa' : 'bg-acento-ambar-fuerte'" :style="{ width: `${dominio}%` }"></div>
          </div>
          <span class="text-[11px] font-semibold text-base-texto-primario">
            {{ dominio >= DOMINADO ? `Dominada · ${dominio} %` : dominio > 0 ? `${dominio} % de dominio` : 'Aún sin dominio: empieza a practicar' }}
          </span>
        </div>
      </header>

      <!-- La explicación y los recursos de la lección, tal como los publicó el docente -->
      <article
        v-if="unitContent.length > 0"
        class="bg-base-blanco rounded-xl border border-base-borde-sutil p-6 md:p-8 shadow-sm space-y-6 text-xs text-base-texto-primario leading-relaxed">
        <section v-for="content in unitContent" :key="content.id" class="space-y-2">
          <h2 v-if="content.title" class="text-sm font-bold text-base-texto-primario">
            {{ content.title }}
          </h2>
          <LessonResource v-if="esRecurso(content.type)" :type="content.type ?? ''" :title="content.title" :metadata="content.metadata" />
          <div v-else class="prose prose-xs space-y-3" v-html="formatMarkdown(content.body)" />
        </section>
      </article>
      <article v-else class="bg-base-blanco rounded-xl border border-base-borde-sutil p-6 text-xs text-base-texto-secundario">
        Esta lección todavía no tiene explicación publicada. Puedes pasar directo a practicar.
      </article>

      <!-- Practicar: es la forma de avanzar y de medir lo que sabes (docs/DISENO_INTERVENCION_DOCENTE.md §10.2) -->
      <section class="rounded-lg border border-acento-ambar-fuerte/30 bg-acento-ambar/10 p-5 space-y-3" aria-labelledby="practicar-titulo">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="practicar-titulo" class="text-sm font-bold text-base-texto-primario">Practica</h2>
            <p class="text-xs text-base-texto-secundario">
              {{ recommendedActivity?.reasonMessage ?? 'Cada ejercicio que resuelves suma a tu dominio de la lección.' }}
            </p>
          </div>
          <button
            v-if="recommendedActivity"
            type="button"
            class="text-xs font-semibold text-acento-ambar-fuerte hover:underline"
            @click="toggleManualChoice">
            {{ chooseManually ? 'Usar el recomendado' : 'Elegir yo el ejercicio' }}
          </button>
        </div>

        <div v-if="recommendedActivity && !chooseManually" class="flex items-center gap-2 flex-wrap">
          <NuxtLink
            :to="`/estudiante/evaluacion/${recommendedActivity.activityId}`"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs transition-colors"
          >
            <RotateCcw v-if="recommendedActivity.reason === 'repaso'" :size="14" aria-hidden="true" />
            <TrendingUp v-else-if="recommendedActivity.reason === 'reto' || recommendedActivity.reason === 'sube_nivel'" :size="14" aria-hidden="true" />
            <Play v-else :size="14" aria-hidden="true" />
            {{ dominio ? 'Seguir practicando' : 'Practicar' }}: {{ recommendedActivity.title }}
          </NuxtLink>
          <span
            v-if="recommendedActivity.level"
            class="px-2 py-0.5 rounded text-[10px] font-bold bg-base-blanco border border-base-borde-fuerte text-base-texto-secundario"
          >
            {{ levelLabel(recommendedActivity.level) }}
          </span>
        </div>

        <div v-else-if="chooseManually" class="flex flex-col gap-2">
          <p v-if="isLoadingActivities" class="text-xs text-base-texto-secundario">Cargando ejercicios…</p>
          <NuxtLink
            v-for="activity in unitActivities"
            :key="activity.id"
            :to="`/estudiante/evaluacion/${activity.id}`"
            class="text-xs font-semibold text-acento-ambar-fuerte hover:underline">
            {{ activity.title }}
          </NuxtLink>
        </div>

        <p v-else class="text-xs text-base-texto-secundario">
          Todavía no hay ejercicios publicados para esta lección.
        </p>

        <!-- Saltar con un reto, como «¿Ya sabes esto?» de Duolingo: solo antes de empezar, y sin preguntar cómo se siente. -->
        <div v-if="puedeSaltar" class="pt-2 border-t border-acento-ambar-fuerte/20 text-xs">
          <button type="button" :disabled="saltando" @click="saltarConReto"
            class="font-semibold text-acento-ambar-fuerte hover:underline inline-flex items-center gap-1.5 disabled:opacity-50">
            <Zap :size="13" aria-hidden="true" /> ¿Ya lo sabes? Demuéstralo con un reto y avanza más rápido
          </button>
          <p v-if="saltoError" role="alert" class="text-semantico-falla mt-1">{{ saltoError }}</p>
        </div>
      </section>

      <!-- Entregas de esta lección: el docente las valora (docs/DISENO_INTERVENCION_DOCENTE.md §3) -->
      <section v-if="entregas.length" class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 space-y-2 text-xs" aria-labelledby="entregas-leccion">
        <h2 id="entregas-leccion" class="text-sm font-bold text-base-texto-primario flex items-center gap-1.5"><Inbox :size="15" class="text-acento-ambar-fuerte" aria-hidden="true" /> Entregas de esta lección</h2>
        <NuxtLink v-for="e in entregas" :key="e.id" :to="`/estudiante/entregas/${e.id}`" class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-base-borde-sutil px-3 py-2 hover:border-acento-ambar-fuerte">
          <span class="font-semibold text-base-texto-primario">{{ e.titulo }}</span>
          <span class="text-[11px] text-base-texto-secundario">{{ e.versionesUsadas }} de {{ e.limite }} versiones{{ e.cierraAt ? ` · cierra ${fechaCorta(e.cierraAt)}` : '' }}</span>
        </NuxtLink>
      </section>

      <div class="pt-4 border-t border-base-borde-sutil flex items-center justify-between">
        <NuxtLink
          to="/estudiante"
          class="inline-flex items-center gap-1.5 borde-afordancia px-4 py-2 rounded-md text-xs font-semibold bg-base-blanco text-base-texto-primario">
          <ArrowLeft :size="14" aria-hidden="true" /> Volver al plan del curso
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ChevronRight, Inbox, Loader2, Play, RotateCcw, TrendingUp, Zap } from 'lucide-vue-next'
import { fechaCorta } from '~/utils/entregas'
import { DOMINADO, TERMINOS } from '~/utils/terminos'
import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'
import { useApi } from '~/composables/useApi'
import { formatMarkdown } from '~/utils/formatMarkdown'

definePageMeta({
  layout: 'student'
})

const route = useRoute()
const authStore = useAuthStore()
const studentStore = useStudentStore()
const api = useApi()

const unitId = Number(route.params.id) || 0

interface UnitDetail {
  id: number
  title: string
  description: string
  /** Clase a la que pertenece la unidad. */
  classId?: number
}

interface ContentBlock {
  id: number
  title: string
  body: string
  type?: string
  metadata?: Record<string, unknown> | null
}

/** Video, PDF, imagen o recurso insertado (paso 6); el resto es texto en Markdown. */
const esRecurso = (type?: string) => ['video', 'pdf', 'image', 'embed'].includes(type ?? '')

interface ActivitySummary {
  id: number
  title: string
}

interface NextActivityRecommendation {
  activityId: number
  title: string
  questionType: string | null
  order: number
  allCompleted: boolean
  level: string
  reason: string
  /** Por qué se recomienda, en una línea (docs/DISENO_PRACTICA_ADAPTATIVA.md §3.3). */
  reasonMessage: string
}

const isLoading = ref(true)
const loadError = ref(false)
const unitData = ref<UnitDetail | null>(null)
const unitContent = ref<ContentBlock[]>([])
const recommendedActivity = ref<NextActivityRecommendation | null>(null)
const chooseManually = ref(false)
const unitActivities = ref<ActivitySummary[]>([])
const isLoadingActivities = ref(false)

const { messageOf } = useApiErrorMessage()

/** Dominio de la lección (null si aún no hay progreso: se muestra desde que empieza a practicar). */
const dominio = ref<number | null>(null)
/**
 * Saltar con un reto (docs/DISENO_INTERVENCION_DOCENTE.md §10.2): reemplaza la pregunta «¿Cómo te sientes con este tema?».
 * Por dentro es el mismo reto de salto (confianza 3): si lo resuelve al primer intento, se salta lo básico.
 */
const puedeSaltar = ref(false)
const entregas = ref<Array<{ id: number; titulo: string; learningUnitId: number | null; cierraAt: string | null; versionesUsadas: number; limite: number }>>([])
const saltando = ref(false)
const saltoError = ref<string | null>(null)

/** Módulo y tema de la lección, del plan ya cargado; el tema solo si agrupa más de una lección. */
const ubicacion = computed(() => {
  for (const mod of studentStore.modules) {
    for (const tema of mod.topics) {
      if (tema.units.some((u) => u.id === unitId)) {
        return { modulo: mod.title, tema: tema.units.length > 1 ? tema.title : null }
      }
    }
  }
  return { modulo: null, tema: null }
})

async function saltarConReto() {
  saltando.value = true
  saltoError.value = null
  try {
    await api.put(`/learning-progress/unit/${unitId}/confidence`, { confianza: 3 })
    const studentId = authStore.user?.id
    const reto = studentId
      ? await api.get<NextActivityRecommendation | null>(`/learning-progress/student/${studentId}/unit/${unitId}/next-activity`)
      : null
    if (reto?.activityId) {
      await navigateTo(`/estudiante/evaluacion/${reto.activityId}`)
      return
    }
    recommendedActivity.value = reto
    puedeSaltar.value = false
  } catch (error: unknown) {
    saltoError.value = messageOf(error, 'No se pudo preparar el reto. Prueba con «Practicar».')
  } finally {
    saltando.value = false
  }
}

async function toggleManualChoice() {
  chooseManually.value = !chooseManually.value
  if (chooseManually.value && unitActivities.value.length === 0) {
    isLoadingActivities.value = true
    try {
      const res = await api.get<{ data: ActivitySummary[] }>(`/activities?learningUnitId=${unitId}`)
      unitActivities.value = res?.data || []
    } catch (error: unknown) {
      console.warn('[STIRE Student] No se pudo cargar la lista de actividades de la unidad:', error)
    } finally {
      isLoadingActivities.value = false
    }
  }
}

onMounted(async () => {
  if (!unitId) {
    loadError.value = true
    isLoading.value = false
    return
  }

  try {
    const [unit, contents] = await Promise.all([
      api.get<UnitDetail>(`/learning-unit/${unitId}`),
      api.get<ContentBlock[]>(`/content/unit/${unitId}`)
    ])
    unitData.value = unit
    unitContent.value = contents || []
    // Si la unidad es de otra de sus clases (llegó desde un repaso o una notificación), el encabezado y el
    // plan de estudio pasan a esa clase.
    if (unit?.classId) {
      api.get<typeof entregas.value>(`/entregas/mias?classId=${unit.classId}`)
        .then((lista) => { entregas.value = lista.filter((e) => e.learningUnitId === unitId) })
        .catch(() => undefined)
    }
    if (unit?.classId && unit.classId !== studentStore.currentClassId) {
      studentStore.selectClass(unit.classId).catch(() => undefined)
    }
  } catch (error: unknown) {
    console.warn('[STIRE Student] No se pudo cargar la lección:', error)
    loadError.value = true
  } finally {
    isLoading.value = false
  }

  const studentId = authStore.user?.id
  if (!studentId) return

  try {
    const [progress, rec] = await Promise.all([
      api.get<{ entryConfidence: number | null; mastery?: number; attemptsCount?: number } | null>(
        `/learning-progress/student/${studentId}/unit/${unitId}`
      ),
      api.get<NextActivityRecommendation | null>(
        `/learning-progress/student/${studentId}/unit/${unitId}/next-activity`
      )
    ])
    recommendedActivity.value = rec
    dominio.value = progress && (progress.attemptsCount ?? 0) > 0 ? Math.round(progress.mastery ?? 0) : null
    // El reto de salto solo tiene sentido antes de empezar a practicar la lección.
    puedeSaltar.value = !!rec && (!progress || ((progress.attemptsCount ?? 0) === 0 && progress.entryConfidence !== 3))
  } catch (error: unknown) {
    console.warn('[STIRE Student] No se pudo cargar el progreso o la actividad recomendada:', error)
  }
})

function levelLabel(level: string) {
  if (level === 'basico') return 'Básico'
  if (level === 'intermedio') return 'Intermedio'
  if (level === 'avanzado') return 'Avanzado'
  return level
}
</script>
