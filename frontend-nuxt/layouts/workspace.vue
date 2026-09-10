<template>
  <div class="h-screen bg-base-bg-primario flex flex-col overflow-hidden">
    <!-- Header del Workspace (Sin sidebar para concentración máxima) -->
    <header class="h-14 bg-base-blanco border-b border-base-borde-sutil px-4 flex items-center justify-between z-30 shadow-sm flex-shrink-0">
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/estudiante"
          class="borde-afordancia px-2.5 py-1 rounded text-xs font-medium text-base-texto-secundario hover:text-base-texto-primario flex items-center gap-1">
          <span>◀</span>
          <span>Volver al curso</span>
        </NuxtLink>

        <div class="h-4 w-[1px] bg-base-borde-sutil"></div>

        <div>
          <h1 class="text-xs font-bold text-base-texto-primario truncate">
            {{ workspaceStore.currentExercise.title }}
          </h1>
          <p class="text-[10px] text-base-texto-secundario">
            {{ workspaceStore.currentExercise.unitTitle }} • Dificultad: {{ workspaceStore.currentExercise.difficulty }}
          </p>
        </div>
      </div>

      <!-- Estado de Autoguardado e Intentos -->
      <div class="hidden sm:flex items-center gap-4 text-xs">
        <span class="text-semantico-pasa font-medium text-[11px] flex items-center gap-1">
          <span>☁️</span>
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
          <span>✨</span>
          <span class="hidden md:inline">Tutor IA</span>
        </button>

        <!-- Acción 1: "▶ Probar código" (Solo para coding - Insumo 15 §7.1) -->
        <button
          @click="workspaceStore.runIsolatedCode()"
          :disabled="workspaceStore.isRunning || workspaceStore.isSubmitting || !isCodingActivity"
          class="borde-afordancia px-3 py-1.5 rounded text-xs font-bold text-base-texto-primario bg-base-bg-secundario hover:bg-base-borde-sutil transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          :title="isCodingActivity ? 'Evalúa contra casos de prueba públicos sin consumir intentos' : 'Esta actividad se califica directamente al entregar'">
          <span v-if="workspaceStore.isRunning" class="animate-spin">⚙️</span>
          <span v-else>▶</span>
          <span>Probar código</span>
        </button>

        <!-- Acción 2: "🚀 Entregar solución" (Calificación formal definitiva para todos los tipos) -->
        <button
          @click="workspaceStore.submitSolution()"
          :disabled="!canSubmit"
          class="px-3.5 py-1.5 rounded text-xs font-bold text-base-blanco bg-acento-ambar-fuerte hover:bg-acento-ambar transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          :title="canSubmit ? 'Envía tu solución formalmente para calificación' : 'Completa la respuesta antes de entregar'">
          <span v-if="workspaceStore.isSubmitting" class="animate-spin">⏳</span>
          <span v-else>🚀</span>
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
    <main class="flex-1 overflow-hidden">
      <slot />
    </main>

    <!-- Tutor IA Overlay -->
    <TutorChatDrawer />
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/workspace'
import { useTutorStore } from '~/stores/tutor'

const workspaceStore = useWorkspaceStore()
const tutorStore = useTutorStore()

const supportedTypes = ['coding', 'mcq', 'fill_code', 'drag_drop', 'ordering', 'matching']

const isCodingActivity = computed(() => workspaceStore.currentExercise.questionType === 'coding')
const isUnsupportedType = computed(() => !supportedTypes.includes(workspaceStore.currentExercise.questionType))

const canSubmit = computed(() => {
  if (workspaceStore.isRunning || workspaceStore.isSubmitting) return false
  if (isUnsupportedType.value) return false
  if (isCodingActivity.value) return true
  return Boolean(workspaceStore.pendingAnswer)
})
</script>
