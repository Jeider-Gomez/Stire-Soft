<template>
  <div class="min-h-screen md:h-screen bg-base-bg-primario flex flex-col md:overflow-hidden">
    <!-- Header del Workspace (Sin sidebar para concentración máxima) -->
    <header class="min-h-14 md:h-14 py-2 md:py-0 gap-y-2 flex-wrap md:flex-nowrap bg-base-blanco border-b border-base-borde-sutil px-4 flex items-center justify-between z-30 shadow-sm flex-shrink-0">
      <div class="flex items-center gap-3">
        <NuxtLink
          :to="backLink"
          class="borde-afordancia px-2.5 py-1 rounded text-xs font-medium text-base-texto-secundario hover:text-base-texto-primario flex items-center gap-1">
          <ArrowLeft :size="14" aria-hidden="true" />
          <span>Volver a la unidad</span>
        </NuxtLink>

        <div class="h-4 w-[1px] bg-base-borde-sutil"></div>

        <div>
          <h1 class="text-xs font-bold text-base-texto-primario truncate">
            {{ workspaceStore.currentExercise.title }}
          </h1>
          <p class="text-[10px] text-base-texto-secundario">
            {{ workspaceStore.currentExercise.unitTitle }} · {{ difficultyLabel }}
          </p>
        </div>
      </div>

      <!-- Estado de Autoguardado e Intentos -->
      <div class="hidden sm:flex items-center gap-4 text-xs">
        <span
          v-if="isCodingActivity || isHtmlCssActivity"
          class="font-medium text-[11px] flex items-center gap-1"
          :class="workspaceStore.autosaveState === 'error' ? 'text-semantico-falla' : workspaceStore.autosaveState === 'saved' ? 'text-semantico-pasa' : 'text-base-texto-secundario'"
          aria-live="polite">
          <Cloud :size="14" aria-hidden="true" />
          <span>{{ workspaceStore.lastAutosave }}</span>
        </span>

        <span class="text-base-texto-secundario text-[11px]">
          Intentos: <strong class="text-base-texto-primario">{{ workspaceStore.currentExercise.usedAttempts }}</strong> / {{ workspaceStore.currentExercise.maxAttempts }}
        </span>
      </div>

      <!-- Acciones Principales (Zona D Integrada) -->
      <div class="flex items-center gap-2">
        <!-- Tutor IA Trigger -->
        <button
          @click="tutorStore.toggleDrawer()"
          class="borde-afordancia px-2.5 py-1.5 rounded text-xs font-semibold text-acento-ambar-fuerte hover:bg-acento-ambar/10 flex items-center gap-1">
          <Sparkles :size="14" aria-hidden="true" />
          <span class="hidden md:inline">Tutor IA</span>
        </button>

        <!-- Acción 1: «Probar» (solo código y HTML/CSS) -->
        <button
          v-if="isCodingActivity || isHtmlCssActivity"
          @click="handleRun"
          :disabled="workspaceStore.isRunning || workspaceStore.isSubmitting"
          class="borde-afordancia px-3 py-1.5 rounded text-xs font-bold text-base-texto-primario bg-base-bg-secundario hover:bg-base-borde-sutil transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          :title="isCodingActivity || isHtmlCssActivity ? 'Evalúa contra casos de prueba/reglas públicas sin consumir intentos' : 'Esta actividad se califica directamente al entregar'">
          <Loader2 v-if="workspaceStore.isRunning" :size="14" class="animate-spin" aria-hidden="true" />
          <Play v-else :size="14" aria-hidden="true" />
          <span>{{ isHtmlCssActivity ? 'Probar' : 'Probar código' }}</span>
        </button>

        <!-- Acción 2: «Entregar» arriba solo en código y HTML/CSS; los demás tipos lo tienen al final de su columna -->
        <button
          v-if="isCodingActivity || isHtmlCssActivity"
          @click="workspaceStore.submitSolution()"
          :disabled="!canSubmit"
          class="px-3.5 py-1.5 rounded text-xs font-bold text-base-blanco bg-acento-ambar-fuerte hover:bg-acento-ambar transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          :title="canSubmit ? 'Envía tu solución formalmente para calificación' : 'Completa la respuesta antes de entregar'">
          <Loader2 v-if="workspaceStore.isSubmitting" :size="14" class="animate-spin" aria-hidden="true" />
          <Send v-else :size="14" aria-hidden="true" />
          <span>Entregar solución</span>
        </button>
      </div>
    </header>

    <!-- Aviso solo si el tipo no está soportado en la plataforma -->
    <div
      v-if="isUnsupportedType"
      class="bg-acento-ambar/10 border-b border-acento-ambar-fuerte/30 px-4 py-2 text-xs text-base-texto-primario flex items-center gap-2 flex-shrink-0">
      <span>⚠</span>
      <span>
        Esta actividad es de tipo <strong>{{ workspaceStore.currentExercise.questionType }}</strong>.
        Este tipo aún no cuenta con evaluación automática en la plataforma.
      </span>
    </div>

    <!-- Contenido Workspace -->
    <main class="flex-1 md:overflow-hidden">
      <slot />
    </main>

    <!-- Tutor IA Overlay -->
    <TutorChatDrawer />
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Cloud, Sparkles, Play, Send, Loader2 } from 'lucide-vue-next'
import { useWorkspaceStore } from '~/stores/workspace'
import { useTutorStore } from '~/stores/tutor'

const workspaceStore = useWorkspaceStore()
const tutorStore = useTutorStore()

const supportedTypes = ['coding', 'mcq', 'fill_code', 'drag_drop', 'ordering', 'matching', 'html_css']

const backLink = computed(() => {
  const unitId = workspaceStore.currentExercise.learningUnitId
  return unitId ? `/estudiante/unidad/${unitId}` : '/estudiante'
})

const difficultyLabel = computed(() => {
  const d = workspaceStore.currentExercise.difficulty
  return d === 'intermedio' ? 'Intermedio' : d === 'avanzado' ? 'Avanzado' : 'Básico'
})

const isCodingActivity = computed(() => workspaceStore.currentExercise.questionType === 'coding')
const isHtmlCssActivity = computed(() => workspaceStore.currentExercise.questionType === 'html_css')

function handleRun() {
  if (isHtmlCssActivity.value) {
    workspaceStore.runHtmlCss()
  } else if (isCodingActivity.value) {
    workspaceStore.runIsolatedCode()
  }
}

const isUnsupportedType = computed(() => !supportedTypes.includes(workspaceStore.currentExercise.questionType))

const canSubmit = computed(() => {
  if (workspaceStore.isRunning || workspaceStore.isSubmitting) return false
  if (isUnsupportedType.value) return false
  if (isCodingActivity.value) return true
  if (isHtmlCssActivity.value) return Boolean(workspaceStore.htmlCode && workspaceStore.htmlCode.trim())
  return Boolean(workspaceStore.pendingAnswer)
})
</script>
