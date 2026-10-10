<template>
  <div class="min-h-screen md:h-screen bg-base-bg-primario flex flex-col md:overflow-hidden transition-[padding] duration-300" :class="{ 'lg:pr-[400px]': tutorStore.isOpen }">
    <!-- WCAG 2.4.1: primer elemento al tabular; lleva directo al contenido sin recorrer el menú -->
    <a href="#contenido" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-base-blanco focus:text-base-texto-primario focus:shadow-lg focus:ring-2 focus:ring-acento-ambar-fuerte">Saltar al contenido</a>
    <!-- Header del Workspace (Sin sidebar para concentración máxima). En el celular queda fijo arriba con el nombre del
         ejercicio; Probar y Entregar bajan a una barra fija en la zona del pulgar (MOB-02). Sin desenfoque
         (backdrop-filter): haría que la barra fija se ubicara respecto al encabezado y no a la pantalla. -->
    <header class="sticky top-0 md:static min-h-14 md:h-14 py-2 md:py-0 gap-y-2 flex-wrap md:flex-nowrap bg-base-blanco border-b border-base-borde-sutil px-4 flex items-center justify-between z-30 shadow-sm flex-shrink-0">
      <!-- 09/10: en el celular el título largo se salía de la pantalla y «Volver a la lección» se partía en tres líneas. -->
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <NuxtLink
          :to="backLink"
          aria-label="Volver a la lección"
          class="borde-afordancia min-h-[44px] px-2.5 rounded text-xs font-medium text-base-texto-secundario hover:text-base-texto-primario flex items-center gap-1 shrink-0 whitespace-nowrap">
          <ArrowLeft :size="14" aria-hidden="true" />
          <span class="sm:hidden">Volver</span><span class="hidden sm:inline">Volver a la lección</span>
        </NuxtLink>

        <div class="h-4 w-[1px] bg-base-borde-sutil shrink-0"></div>

        <div class="min-w-0">
          <h1 class="text-xs font-bold text-base-texto-primario truncate">
            {{ workspaceStore.currentExercise.title }}
          </h1>
          <!-- Migas: dónde está el ejercicio dentro del curso (UX-01 / PAT-02 de la lista de chequeo). Miden 44 px para el dedo
               (MOB-02) y van por encima del título (z-10): axe las veía tapadas por él (WCAG 2.5.8, 07/10). -->
          <nav aria-label="Ubicación" class="flex items-center gap-1 flex-wrap text-[11px] text-base-texto-secundario">
            <NuxtLink to="/estudiante" class="hover:underline inline-flex items-center min-h-[44px] -my-3.5 relative z-10">Inicio</NuxtLink>
            <ChevronRight :size="11" aria-hidden="true" />
            <NuxtLink :to="backLink" class="hover:underline truncate max-w-[180px] inline-flex items-center min-h-[44px] -my-3.5 relative z-10">{{ workspaceStore.currentExercise.unitTitle }}</NuxtLink>
            <ChevronRight :size="11" aria-hidden="true" />
            <span aria-current="page">Ejercicio · {{ difficultyLabel }}</span>
          </nav>
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
          Intentos: <strong class="text-base-texto-primario">{{ workspaceStore.currentExercise.usedAttempts }}</strong> / {{ workspaceStore.currentExercise.maxAttempts }}<!--
          10/10: con el límite usado, el servidor reabre uno a las 24 h o lo da un refuerzo; «3 / 3» solo confundía. -->
          <template v-if="workspaceStore.currentExercise.usedAttempts >= workspaceStore.currentExercise.maxAttempts && workspaceStore.currentExercise.intentoDisponible"> · <strong class="text-semantico-pasa">1 más disponible</strong></template>
        </span>
      </div>

      <!-- Acciones Principales (Zona D Integrada). En el celular van en una barra fija abajo, en la zona del pulgar
           (MOB-02 de la lista de chequeo, Pressman cap. 13); en computador siguen en el encabezado. -->
      <div
        class="flex items-center gap-2"
        :class="isCodingActivity || isHtmlCssActivity ? 'barra-acciones fixed md:static inset-x-0 bottom-0 z-30 md:z-auto bg-base-blanco md:bg-transparent border-t md:border-0 border-base-borde-sutil px-4 pt-3 md:p-0 shadow-[0_-4px_12px_rgba(15,23,42,0.06)] md:shadow-none' : ''">
        <!-- El Tutor se abre con el lanzador flotante de abajo a la derecha (LanzadorTutor.vue). -->

        <!-- Acción 1: «Probar» (solo código y HTML/CSS) -->
        <button
          v-if="isCodingActivity || isHtmlCssActivity"
          @click="handleRun"
          :disabled="workspaceStore.isRunning || workspaceStore.isSubmitting"
          class="borde-afordancia flex-1 md:flex-none justify-center min-h-[48px] md:min-h-[44px] px-4 rounded-md text-sm md:text-xs font-bold text-base-texto-primario bg-base-bg-secundario hover:bg-base-borde-sutil transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
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
          class="flex-1 md:flex-none justify-center min-h-[48px] md:min-h-[44px] px-4 rounded-md text-sm md:text-xs font-bold text-base-blanco bg-acento-ambar-fuerte hover:bg-acento-ambar transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
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
      <TriangleAlert :size="16" aria-hidden="true" />
      <span>
        Esta actividad es de tipo <strong>{{ workspaceStore.currentExercise.questionType }}</strong>.
        Este tipo aún no cuenta con evaluación automática en la plataforma.
      </span>
    </div>

    <!-- Contenido Workspace -->
    <main id="contenido" tabindex="-1" class="flex-1 md:overflow-hidden" :class="{ 'pb-24 md:pb-0': isCodingActivity || isHtmlCssActivity }">
      <slot />
    </main>

    <!-- Tutor IA Overlay -->
    <TutorChatDrawer />
    <TutorLanzadorTutor :sobre-barra="isCodingActivity || isHtmlCssActivity" />
    <DialogoConfirmar />
    <JuicioConfianza />
    <AvisoSinConexion />
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ChevronRight, Cloud, Loader2, Play, Send, TriangleAlert } from 'lucide-vue-next'
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

<style scoped>
.barra-acciones { padding-bottom: calc(0.75rem + env(safe-area-inset-bottom)); }
@media (min-width: 768px) { .barra-acciones { padding-bottom: 0; } }
</style>
