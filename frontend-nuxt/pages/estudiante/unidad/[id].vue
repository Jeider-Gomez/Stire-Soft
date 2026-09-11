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
            Lección Teórica • Unidad {{ unitData.id }}
          </span>
        </div>

        <h1 class="text-xl md:text-2xl font-bold text-base-texto-primario tracking-tight">
          Lección: {{ unitData.title }}
        </h1>
        <p class="text-xs text-base-texto-secundario mt-1">
          {{ unitData.description }}
        </p>
      </header>

      <!-- Cuerpo del Contenido: bloques REALES de la unidad, no una plantilla fija -->
      <article
        v-if="unitContent.length > 0"
        class="bg-base-blanco rounded-xl border border-base-borde-sutil p-6 md:p-8 shadow-sm space-y-6 text-xs text-base-texto-primario leading-relaxed">
        <section v-for="content in unitContent" :key="content.id" class="prose prose-xs space-y-3" v-html="formatMarkdown(content.body)" />
      </article>
      <article v-else class="bg-base-blanco rounded-xl border border-base-borde-sutil p-6 text-xs text-base-texto-secundario">
        Esta unidad todavía no tiene material de lectura publicado. Pasa directamente al ejercicio práctico.
      </article>

      <!-- Botón de Navegación al Ejercicio Práctico -->
      <section class="rounded-lg border border-acento-ambar-fuerte/30 bg-acento-ambar/10 p-4 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-sm font-bold text-base-texto-primario">Tu siguiente paso</h2>
            <p class="text-xs text-base-texto-secundario">
              {{ recommendedActivity?.allCompleted ? 'Completaste la unidad. Puedes seguir practicando.' : 'Te recomendamos continuar con esta actividad.' }}
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

        <NuxtLink
          v-if="recommendedActivity && !chooseManually"
          :to="`/estudiante/evaluacion/${recommendedActivity.activityId}`"
          class="inline-flex px-4 py-2 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs transition-colors">
          Continuar donde quedaste: {{ recommendedActivity.title }}
        </NuxtLink>

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
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'student'
})

const route = useRoute()
const authStore = useAuthStore()
const api = useApi()

const unitId = Number(route.params.id) || 0

interface UnitDetail {
  id: number
  title: string
  description: string
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
  questionType: string
  order: number
  allCompleted: boolean
}

const isLoading = ref(true)
const loadError = ref(false)
const unitData = ref<UnitDetail | null>(null)
const unitContent = ref<ContentBlock[]>([])
const recommendedActivity = ref<NextActivityRecommendation | null>(null)
const chooseManually = ref(false)
const unitActivities = ref<ActivitySummary[]>([])
const isLoadingActivities = ref(false)

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
  } catch (error: unknown) {
    console.warn('[STIRE Student] No se pudo cargar la unidad:', error)
    loadError.value = true
  } finally {
    isLoading.value = false
  }

  const studentId = authStore.user?.id
  if (!studentId) return

  try {
    recommendedActivity.value = await api.get<NextActivityRecommendation | null>(
      `/learning-progress/student/${studentId}/unit/${unitId}/next-activity`
    )
  } catch (error: unknown) {
    console.warn('[STIRE Student] No se pudo cargar la actividad recomendada:', error)
  }
})

function formatMarkdown(raw: string) {
  if (!raw) return ''
  return raw
    .replace(/^## (.*?)$/gm, '<h4 class="font-bold text-sm text-base-texto-primario mt-3 mb-1">$1</h4>')
    .replace(/^# (.*?)$/gm, '<h3 class="font-bold text-base text-base-texto-primario mt-1 mb-2">$1</h3>')
    .replace(/`([^`]+)`/g, '<code class="bg-base-bg-secundario px-1.5 py-0.5 rounded text-acento-ambar-fuerte font-codigo text-[11px] border border-base-borde-sutil">$1</code>')
    .replace(/\n\n/g, '<br/><br/>')
}
</script>
