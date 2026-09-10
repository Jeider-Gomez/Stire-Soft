<template>
  <div class="h-full flex flex-col md:flex-row overflow-hidden bg-base-bg-primario">
    <!-- COLUMNA IZQUIERDA: Enunciado, Casos de Prueba (solo coding) y Consola -->
    <div class="w-full md:w-[45%] lg:w-[40%] flex flex-col border-r border-base-borde-sutil bg-base-blanco h-full overflow-hidden">
      <!-- Pestañas de Navegación del Panel Izquierdo -->
      <div class="flex items-center border-b border-base-borde-sutil bg-base-bg-secundario text-xs font-semibold px-2 pt-2 gap-1 flex-shrink-0">
        <button
          @click="leftTab = 'enunciado'"
          class="px-3 py-2 rounded-t-md transition-colors"
          :class="leftTab === 'enunciado' ? 'bg-base-blanco text-base-texto-primario border-t-2 border-acento-ambar-fuerte font-bold' : 'text-base-texto-secundario hover:text-base-texto-primario'">
          📖 Enunciado
        </button>

        <!-- Pestaña Casos de Prueba: Solo visible para coding -->
        <button
          v-if="isCodingActivity"
          @click="leftTab = 'casos'"
          class="px-3 py-2 rounded-t-md transition-colors flex items-center gap-1.5"
          :class="leftTab === 'casos' ? 'bg-base-blanco text-base-texto-primario border-t-2 border-acento-ambar-fuerte font-bold' : 'text-base-texto-secundario hover:text-base-texto-primario'">
          <span>🧪 Casos de Prueba</span>
          <span
            v-if="passedCount > 0"
            class="px-1.5 py-0.2 rounded-full text-[10px]"
            :class="passedCount === workspaceStore.publicTestCases.length ? 'bg-semantico-pasa/15 text-semantico-pasa font-bold' : 'bg-acento-ambar/15 text-acento-ambar-fuerte font-bold'">
            {{ passedCount }}/{{ workspaceStore.publicTestCases.length }}
          </span>
        </button>

        <button
          @click="leftTab = 'consola'"
          class="px-3 py-2 rounded-t-md transition-colors"
          :class="leftTab === 'consola' ? 'bg-base-blanco text-base-texto-primario border-t-2 border-acento-ambar-fuerte font-bold' : 'text-base-texto-secundario hover:text-base-texto-primario'">
          💻 Registro
        </button>
      </div>

      <!-- Contenido de las Pestañas -->
      <div class="flex-1 overflow-y-auto p-5 text-xs text-base-texto-primario leading-relaxed">
        <!-- 1. Pestaña Enunciado -->
        <div v-if="leftTab === 'enunciado'" class="space-y-4">
          <div class="prose prose-xs" v-html="formatMarkdown(workspaceStore.currentExercise.description)"></div>

          <div class="p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil space-y-1">
            <span class="font-bold text-base-texto-primario block">Criterio de Evaluación:</span>
            <ul v-if="isCodingActivity" class="list-disc pl-4 space-y-1 text-base-texto-secundario text-[11px]">
              <li>3 Casos de prueba públicos visibles.</li>
              <li>2 Casos de prueba privados de validación ciega.</li>
              <li>Límite de tiempo por ejecución: 1000 ms.</li>
            </ul>
            <ul v-else class="list-disc pl-4 space-y-1 text-base-texto-secundario text-[11px]">
              <li>Evaluación formal inmediata al entregar.</li>
              <li>Consumo de intento al enviar solución definitiva.</li>
              <li>Puntaje sobre 100 ponderado según tu respuesta.</li>
            </ul>
          </div>
        </div>

        <!-- 2. Pestaña Casos de Prueba (P02 — Solo coding) -->
        <div v-else-if="leftTab === 'casos' && isCodingActivity" class="space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-base-borde-sutil">
            <h3 class="font-bold text-xs text-base-texto-primario">Casos Públicos de Verificación</h3>
            <span class="text-[11px] text-base-texto-secundario">
              Evaluados con [▶ Probar código]
            </span>
          </div>

          <div class="space-y-3">
            <div
              v-for="tc in workspaceStore.publicTestCases"
              :key="tc.id"
              class="border rounded-lg p-3 space-y-2 transition-colors"
              :class="{
                'border-semantico-pasa/40 bg-semantico-pasa/5': tc.passed === true,
                'border-semantico-falla/40 bg-semantico-falla/5': tc.passed === false,
                'border-base-borde-sutil bg-base-bg-secundario/40': tc.passed === undefined
              }">
              <div class="flex items-center justify-between font-bold text-xs">
                <span>Caso #{{ tc.id }}: <code class="font-codigo text-acento-ambar-fuerte">{{ tc.input }}</code></span>
                <span v-if="tc.passed === true" class="text-semantico-pasa flex items-center gap-1">
                  <span>✔</span>
                  <span>Superado</span>
                </span>
                <span v-else-if="tc.passed === false" class="text-semantico-falla flex items-center gap-1">
                  <span>✖</span>
                  <span>Falla en salida</span>
                </span>
                <span v-else class="text-base-texto-secundario text-[11px]">
                  Sin evaluar
                </span>
              </div>

              <!-- Diff Visual: Esperado vs Obtenido -->
              <div class="grid grid-cols-2 gap-2 text-[11px] font-codigo pt-1">
                <div class="p-2 bg-base-blanco rounded border border-base-borde-sutil">
                  <span class="text-base-texto-secundario text-[10px] block font-sans">Salida Esperada:</span>
                  <span class="font-bold text-semantico-pasa">{{ tc.expectedOutput }}</span>
                </div>
                <div class="p-2 bg-base-blanco rounded border border-base-borde-sutil">
                  <span class="text-base-texto-secundario text-[10px] block font-sans">Salida de tu Código:</span>
                  <span :class="tc.passed ? 'text-semantico-pasa font-bold' : tc.passed === false ? 'text-semantico-falla font-bold' : 'text-base-texto-secundario'">
                    {{ tc.actualOutput || '—' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="p-3 bg-base-bg-secundario rounded border border-base-borde-sutil text-[11px] text-base-texto-secundario flex items-center gap-2">
            <span>🔒</span>
            <span>2 Casos privados permanecen ocultos para evaluar generalización de la solución.</span>
          </div>
        </div>

        <!-- 3. Pestaña Consola / Registro de Ejecución -->
        <div v-else class="space-y-2">
          <div class="flex items-center justify-between pb-1 border-b border-base-borde-sutil">
            <span class="font-bold text-xs">Historial de Calificación</span>
            <button
              @click="workspaceStore.consoleLog = ['Historial limpiado.']"
              class="text-[11px] text-base-texto-secundario hover:text-base-texto-primario underline">
              Limpiar
            </button>
          </div>

          <div class="bg-[#1e1e1e] text-[#d4d4d4] p-3 rounded-lg font-codigo text-xs space-y-1 min-h-[220px] max-h-[350px] overflow-y-auto">
            <div v-for="(log, idx) in workspaceStore.consoleLog" :key="idx" class="leading-relaxed">
              <span v-if="log.startsWith('✔')" class="text-[#4ec9b0]">{{ log }}</span>
              <span v-else-if="log.startsWith('✖') || log.startsWith('⚠') || log.startsWith('⛔')" class="text-[#f14c4c]">{{ log }}</span>
              <span v-else-if="log.startsWith('🎯')" class="text-[#dcdcaa] font-bold">{{ log }}</span>
              <span v-else class="text-[#9cdcfe]">{{ log }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- COLUMNA DERECHA: Renderizado Reactivo según questionType -->

    <!-- CASO A: Coding (Monaco textarea tradicional) -->
    <div v-if="isCodingActivity" class="flex-1 flex flex-col h-full bg-[#1e1e1e] text-[#d4d4d4] overflow-hidden">
      <!-- Barra Superior del Editor -->
      <div class="h-9 bg-[#252526] border-b border-[#333333] px-4 flex items-center justify-between text-xs text-[#858585] flex-shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-acento-ambar font-bold">JS</span>
          <span class="text-white font-medium">solucion.js</span>
          <span class="text-[10px] text-[#858585]">• JavaScript (ES2024)</span>
        </div>

        <div class="flex items-center gap-3 text-[11px]">
          <span>Tabulaciones: 2 espacios</span>
          <span>UTF-8</span>
        </div>
      </div>

      <!-- Área de Edición de Código -->
      <div class="flex-1 relative flex">
        <div class="w-10 bg-[#1e1e1e] py-3 text-right pr-2 text-[#5a5a5a] font-codigo text-xs select-none border-r border-[#2d2d2d] flex flex-col">
          <span v-for="n in lineCount" :key="n">{{ n }}</span>
        </div>

        <textarea
          v-model="workspaceStore.code"
          @input="workspaceStore.triggerAutosave"
          spellcheck="false"
          class="flex-1 h-full bg-transparent text-[#d4d4d4] font-codigo text-xs p-3 leading-relaxed outline-none resize-none selection:bg-[#264f78]"
          placeholder="// Escribe tu solución aquí..."></textarea>
      </div>

      <!-- Barra de Estado Inferior del Editor -->
      <div class="h-7 bg-[#007acc] text-white px-4 flex items-center justify-between text-[11px] flex-shrink-0 font-medium">
        <div class="flex items-center gap-3">
          <span>STIRE Sandbox Endurecido</span>
          <span>•</span>
          <span>{{ workspaceStore.lastAutosave }}</span>
        </div>

        <div class="flex items-center gap-2">
          <span>Líneas: {{ lineCount }}</span>
          <span>•</span>
          <span>Caracteres: {{ workspaceStore.code.length }}</span>
        </div>
      </div>
    </div>

    <!-- CASO B: Tipos Interactivos de Actividad (MCQ, FillCode, DragDrop, Ordering, Matching) -->
    <div v-else class="flex-1 flex flex-col h-full bg-base-blanco overflow-hidden">
      <!-- Barra Superior de Actividad Interactiva -->
      <div class="h-9 bg-base-bg-secundario border-b border-base-borde-sutil px-4 flex items-center justify-between text-xs text-base-texto-secundario flex-shrink-0">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-acento-ambar/15 text-acento-ambar-fuerte">
            {{ typeBadgeLabel }}
          </span>
          <span class="text-base-texto-primario font-semibold">{{ workspaceStore.currentExercise.title }}</span>
        </div>

        <div class="text-[11px] text-base-texto-secundario">
          Responde en este panel y usa <strong>🚀 Entregar solución</strong>
        </div>
      </div>

      <!-- Contenedor del Componente Específico -->
      <div class="flex-1 overflow-y-auto p-6 max-w-3xl w-full mx-auto">
        <!-- MCQ -->
        <ExerciseMcqExercise
          v-if="workspaceStore.currentExercise.questionType === 'mcq' && workspaceStore.currentQuestion"
          :question="workspaceStore.currentQuestion"
        />

        <!-- Fill Code -->
        <ExerciseFillCodeExercise
          v-else-if="workspaceStore.currentExercise.questionType === 'fill_code' && workspaceStore.currentQuestion"
          :question="workspaceStore.currentQuestion"
        />

        <!-- Drag & Drop -->
        <ExerciseDragDropExercise
          v-else-if="workspaceStore.currentExercise.questionType === 'drag_drop' && workspaceStore.currentQuestion"
          :question="workspaceStore.currentQuestion"
        />

        <!-- Ordering -->
        <ExerciseOrderingExercise
          v-else-if="workspaceStore.currentExercise.questionType === 'ordering' && workspaceStore.currentQuestion"
          :question="workspaceStore.currentQuestion"
        />

        <!-- Matching -->
        <ExerciseMatchingExercise
          v-else-if="workspaceStore.currentExercise.questionType === 'matching' && workspaceStore.currentQuestion"
          :question="workspaceStore.currentQuestion"
        />

        <!-- Fallback si la pregunta aún no cargó -->
        <div v-else class="py-12 text-center text-base-texto-secundario">
          <div class="animate-pulse space-y-3">
            <div class="h-4 bg-base-bg-secundario rounded w-3/4 mx-auto"></div>
            <div class="h-20 bg-base-bg-secundario rounded w-full"></div>
            <p class="text-xs">Cargando datos interactivos de la pregunta...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Resultado de Entrega (refleja el resultado real del backend) -->
    <div
      v-if="workspaceStore.submissionResult"
      class="fixed inset-0 bg-base-texto-primario/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
        <div
          class="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto font-bold"
          :class="isSuccessResult ? 'bg-semantico-pasa/15 text-semantico-pasa' : 'bg-acento-ambar/15 text-acento-ambar-fuerte'">
          {{ isSuccessResult ? '🎉' : '📋' }}
        </div>

        <h3 class="text-lg font-bold text-base-texto-primario">
          {{ isSuccessResult ? '¡Actividad Completada con Éxito!' : 'Intento Calificado' }}
        </h3>

        <div class="p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil">
          <p class="text-2xl font-bold" :class="workspaceStore.submissionResult?.totalScore >= 70 ? 'text-semantico-pasa' : 'text-semantico-falla'">
            {{ workspaceStore.submissionResult?.totalScore ?? 0 }} / 100 pts
          </p>
          <p v-if="isCodingActivity" class="text-xs text-base-texto-secundario mt-1">
            Superaste {{ workspaceStore.submissionResult?.passedCount ?? 0 }} de {{ workspaceStore.submissionResult?.totalCount ?? 0 }} casos de prueba.
          </p>
          <p v-else class="text-xs text-base-texto-secundario mt-1">
            Evaluación registrada formalmente en tu progreso STIRE.
          </p>
        </div>

        <p v-if="workspaceStore.submissionResult?.feedback" class="text-xs text-base-texto-secundario">
          {{ workspaceStore.submissionResult.feedback }}
        </p>

        <div class="flex items-center gap-2 pt-2">
          <button
            @click="workspaceStore.submissionResult = null"
            class="flex-1 py-2 rounded-md borde-afordancia text-xs font-semibold bg-base-blanco text-base-texto-primario hover:bg-base-bg-secundario transition-colors">
            Seguir practicando
          </button>

          <NuxtLink
            to="/estudiante"
            class="flex-1 py-2 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco text-xs font-bold transition-colors">
            Volver al Inicio
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/workspace'

definePageMeta({
  layout: 'workspace'
})

const route = useRoute()
const workspaceStore = useWorkspaceStore()
const leftTab = ref<'enunciado' | 'casos' | 'consola'>('enunciado')

const isCodingActivity = computed(() => workspaceStore.currentExercise.questionType === 'coding')

const typeBadgeLabel = computed(() => {
  const typeMap: Record<string, string> = {
    mcq: 'Quiz Conceptual (MCQ)',
    fill_code: 'Completar Código',
    drag_drop: 'Clasificación Drag & Drop',
    ordering: 'Secuencia / Ordenamiento',
    matching: 'Emparejamiento de Conceptos'
  }
  return typeMap[workspaceStore.currentExercise.questionType] || workspaceStore.currentExercise.questionType
})

const passedCount = computed(() => {
  return workspaceStore.publicTestCases.filter(tc => tc.passed === true).length
})

const isSuccessResult = computed(() => {
  const result = workspaceStore.submissionResult
  if (!result) return false
  if (isCodingActivity.value) {
    return result.totalCount > 0 && result.passedCount === result.totalCount
  }
  return (result.totalScore ?? 0) >= 70
})

const lineCount = computed(() => {
  return Math.max(workspaceStore.code.split('\n').length, 18)
})

function formatMarkdown(raw: string) {
  if (!raw) return ''
  return raw
    .replace(/### (.*?)\n/g, '<h4 class="font-bold text-xs text-base-texto-primario mt-2 mb-1">$1</h4>')
    .replace(/#### (.*?)\n/g, '<h5 class="font-bold text-xs text-base-texto-primario mt-2 mb-1">$1</h5>')
    .replace(/`([^`]+)`/g, '<code class="bg-base-bg-secundario px-1.5 py-0.5 rounded text-acento-ambar-fuerte font-codigo text-[11px] border border-base-borde-sutil">$1</code>')
    .replace(/\n\n/g, '<br/><br/>')
}

async function initActivity() {
  const actId = Number(route.params.activityId)
  if (actId) {
    await workspaceStore.loadActivity(actId)
    if (!isCodingActivity.value && leftTab.value === 'casos') {
      leftTab.value = 'enunciado'
    }
  }
}

onMounted(() => {
  initActivity()
})

watch(() => route.params.activityId, (newId) => {
  if (newId) {
    initActivity()
  }
})
</script>
