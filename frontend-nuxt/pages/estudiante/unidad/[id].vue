<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Migajas de Pan / Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-base-texto-secundario">
      <NuxtLink to="/estudiante" class="hover:underline">Inicio</NuxtLink>
      <span>›</span>
      <span>Plan de Estudio</span>
      <span>›</span>
      <span class="font-bold text-base-texto-primario">{{ unitData?.title || 'Cargando…' }}</span>
    </nav>

    <!-- Estado de carga -->
    <div v-if="isLoading" class="p-12 text-center text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil">
      <span class="inline-block animate-spin mr-2">⏳</span> Cargando unidad de aprendizaje...
    </div>

    <!-- Unidad no encontrada / sin acceso -->
    <div v-else-if="loadError || !unitData" class="p-8 text-center bg-base-blanco rounded-xl border border-base-borde-fuerte text-xs space-y-3">
      <p class="font-bold text-base-texto-primario">No pudimos cargar esta unidad.</p>
      <p class="text-base-texto-secundario">Puede que no exista o que no estés matriculado en la clase a la que pertenece.</p>
      <NuxtLink to="/estudiante" class="inline-block borde-afordancia px-4 py-2 rounded-md text-xs font-semibold bg-base-blanco text-base-texto-primario">
        ◀ Volver al Menú
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Cabecera de la Lección (EST-V02) -->
      <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm">
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info uppercase tracking-wider">
            Lección
          </span>
        </div>

        <h1 class="text-xl md:text-2xl font-bold text-base-texto-primario tracking-tight">
          {{ unitData.title }}
        </h1>
        <p class="text-xs text-base-texto-secundario mt-1">
          {{ unitData.description }}
        </p>
      </header>

      <!-- Cuerpo del Contenido: bloques REALES de la unidad, no una plantilla fija -->
      <article
        v-if="unitContent.length > 0"
        class="bg-base-blanco rounded-xl border border-base-borde-sutil p-6 md:p-8 shadow-sm space-y-6 text-xs text-base-texto-primario leading-relaxed">
        <section v-for="content in unitContent" :key="content.id" class="space-y-2">
          <h2 v-if="content.title" class="text-sm font-bold text-base-texto-primario">
            {{ content.title }}
          </h2>
          <div class="prose prose-xs space-y-3" v-html="formatMarkdown(content.body)" />
        </section>
      </article>
      <article v-else class="bg-base-blanco rounded-xl border border-base-borde-sutil p-6 text-xs text-base-texto-secundario">
        Esta unidad todavía no tiene material de lectura publicado. Pasa directamente al ejercicio práctico.
      </article>

      <!-- Tarjeta de Confianza Inicial (T1 — ¿Cómo te sientes con este tema?) -->
      <section
        v-if="showConfidenceCard"
        class="bg-base-blanco rounded-xl border border-acento-ambar-fuerte/40 p-5 shadow-sm space-y-3"
      >
        <div>
          <h2 id="confidence-title" class="text-sm font-bold text-base-texto-primario">
            ¿Cómo te sientes con «{{ unitData.title }}»?
          </h2>
          <p class="text-[11px] text-base-texto-secundario mt-0.5">
            Nos ayuda a proponerte por dónde empezar. Puedes saltarla.
          </p>
        </div>

        <div
          role="group"
          aria-labelledby="confidence-title"
          class="flex flex-wrap items-center gap-2.5 pt-1"
        >
          <button
            type="button"
            :disabled="isSubmittingConfidence"
            @click="submitConfidence(1)"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-base-borde-fuerte bg-base-blanco text-base-texto-primario hover:bg-base-bg-secundario hover:border-acento-ambar-fuerte transition-colors disabled:opacity-50"
          >
            Es nuevo para mí
          </button>
          <button
            type="button"
            :disabled="isSubmittingConfidence"
            @click="submitConfidence(2)"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-base-borde-fuerte bg-base-blanco text-base-texto-primario hover:bg-base-bg-secundario hover:border-acento-ambar-fuerte transition-colors disabled:opacity-50"
          >
            Tengo dudas
          </button>
          <button
            type="button"
            :disabled="isSubmittingConfidence"
            @click="submitConfidence(3)"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-base-borde-fuerte bg-base-blanco text-base-texto-primario hover:bg-base-bg-secundario hover:border-acento-ambar-fuerte transition-colors disabled:opacity-50"
          >
            Me siento seguro
          </button>
        </div>

        <p v-if="confidenceError" role="alert" class="text-xs text-semantico-falla pt-1">
          {{ confidenceError }}
        </p>
      </section>

      <!-- Botón de Navegación al Ejercicio Práctico -->
      <section class="rounded-lg border border-acento-ambar-fuerte/30 bg-acento-ambar/10 p-4 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-sm font-bold text-base-texto-primario">Tu siguiente paso</h2>
            <p class="text-xs text-base-texto-secundario">
              {{ recommendedActivity?.reasonMessage ?? 'Te recomendamos continuar con esta actividad.' }}
            </p>
          </div>
          <button
            v-if="recommendedActivity"
            type="button"
            class="text-xs font-semibold text-acento-ambar-fuerte hover:underline"
            @click="toggleManualChoice">
            {{ chooseManually ? 'Usar recomendado para ti' : 'Elegir yo mismo' }}
          </button>
        </div>

        <div v-if="recommendedActivity && !chooseManually" class="flex items-center gap-2 flex-wrap">
          <!-- Icono de motivo (T2) -->
          <RotateCcw
            v-if="recommendedActivity.reason === 'repaso'"
            :size="14"
            class="text-semantico-info shrink-0"
            aria-label="Repaso"
          />
          <TrendingUp
            v-else-if="recommendedActivity.reason === 'reto' || recommendedActivity.reason === 'sube_nivel'"
            :size="14"
            class="text-semantico-pasa shrink-0"
            aria-label="Subir nivel"
          />
          <NuxtLink
            :to="`/estudiante/evaluacion/${recommendedActivity.activityId}`"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs transition-colors"
          >
            Continuar: {{ recommendedActivity.title }}
          </NuxtLink>
          <!-- Nivel del ejercicio (T2) -->
          <span
            v-if="recommendedActivity.level"
            class="px-2 py-0.5 rounded text-[10px] font-bold bg-base-blanco border border-base-borde-fuerte text-base-texto-secundario capitalize"
          >
            {{ levelLabel(recommendedActivity.level) }}
          </span>
        </div>

        <div v-else-if="chooseManually" class="flex flex-col gap-2">
          <p v-if="isLoadingActivities" class="text-xs text-base-texto-secundario">Cargando actividades...</p>
          <NuxtLink
            v-for="activity in unitActivities"
            :key="activity.id"
            :to="`/estudiante/evaluacion/${activity.id}`"
            class="text-xs font-semibold text-acento-ambar-fuerte hover:underline">
            {{ activity.title }}
          </NuxtLink>
        </div>

        <p v-else class="text-xs text-base-texto-secundario">
          Todavía no hay una actividad publicada para esta unidad.
        </p>
      </section>

      <div class="pt-4 border-t border-base-borde-sutil flex items-center justify-between">
        <NuxtLink
          to="/estudiante"
          class="borde-afordancia px-4 py-2 rounded-md text-xs font-semibold bg-base-blanco text-base-texto-primario">
          ◀ Volver al Menú
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { RotateCcw, TrendingUp } from 'lucide-vue-next'
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
}

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

// T1 — «¿Cómo te sientes con este tema?»
const { messageOf } = useApiErrorMessage()
const showConfidenceCard = ref(false)
const isSubmittingConfidence = ref(false)
const confidenceError = ref<string | null>(null)

async function submitConfidence(valor: 1 | 2 | 3) {
  isSubmittingConfidence.value = true
  confidenceError.value = null
  try {
    await api.put(`/learning-progress/unit/${unitId}/confidence`, { confianza: valor })
    showConfidenceCard.value = false
    // Se vuelve a pedir la recomendación: con «Me siento seguro» cambia a un reto y el motivo se ve al instante
    const studentId = authStore.user?.id
    if (studentId) {
      recommendedActivity.value = await api.get<NextActivityRecommendation | null>(
        `/learning-progress/student/${studentId}/unit/${unitId}/next-activity`
      )
    }
  } catch (error: unknown) {
    confidenceError.value = messageOf(error, 'No se pudo guardar tu nivel de confianza.')
  } finally {
    isSubmittingConfidence.value = false
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
    if (unit?.classId && unit.classId !== studentStore.currentClassId) {
      studentStore.selectClass(unit.classId).catch(() => undefined)
    }
  } catch (error: unknown) {
    console.warn('[STIRE Student] No se pudo cargar la unidad:', error)
    loadError.value = true
  } finally {
    isLoading.value = false
  }

  const studentId = authStore.user?.id
  if (!studentId) return

  try {
    const [progress, rec] = await Promise.all([
      api.get<{ entryConfidence: number | null } | null>(
        `/learning-progress/student/${studentId}/unit/${unitId}`
      ),
      api.get<NextActivityRecommendation | null>(
        `/learning-progress/student/${studentId}/unit/${unitId}/next-activity`
      )
    ])
    recommendedActivity.value = rec
    // Si el progreso de la unidad no tiene entryConfidence (es null o no hay progreso), muestra la tarjeta
    if (!progress || progress.entryConfidence === null || progress.entryConfidence === undefined) {
      showConfidenceCard.value = true
    }
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
