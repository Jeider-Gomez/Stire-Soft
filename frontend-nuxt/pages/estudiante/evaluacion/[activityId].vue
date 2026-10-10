<template>
  <div class="md:h-full flex flex-col md:flex-row md:overflow-hidden bg-base-bg-primario">
    <ExerciseFranjaPanelPlegado v-if="(isCodingActivity || isHtmlCssActivity) && panelPlegado" controla="panel-enunciado" @mostrar="plegarPanel(false)" />
    <!-- COLUMNA IZQUIERDA: Enunciado, Casos de Prueba (solo coding) y Consola. Los demás tipos usan una sola columna. -->
    <div v-if="isCodingActivity || isHtmlCssActivity" v-show="!panelPlegado" id="panel-enunciado" class="w-full md:w-[45%] lg:w-[40%] flex flex-col border-r border-base-borde-sutil bg-base-blanco md:h-full max-h-[55vh] md:max-h-none overflow-hidden">
      <!-- Pestañas de Navegación del Panel Izquierdo -->
      <div class="flex items-center border-b border-base-borde-sutil bg-base-bg-secundario text-xs font-semibold px-2 pt-2 gap-1 flex-shrink-0">
        <button
          @click="leftTab = 'enunciado'"
          class="min-h-[44px] px-3 py-2 rounded-t-md transition-colors"
          :class="leftTab === 'enunciado' ? 'bg-base-blanco text-base-texto-primario border-t-2 border-acento-ambar-fuerte font-bold' : 'text-slate-600 hover:text-base-texto-primario'">
          <span class="inline-flex items-center gap-1.5"><BookOpen :size="14" aria-hidden="true" /> Enunciado</span>
        </button>

        <!-- Pestaña Casos de Prueba: Solo visible para coding -->
        <button
          v-if="isCodingActivity"
          @click="leftTab = 'casos'"
          class="px-3 py-2 rounded-t-md transition-colors flex items-center gap-1.5 min-h-[44px]"
          :class="leftTab === 'casos' ? 'bg-base-blanco text-base-texto-primario border-t-2 border-acento-ambar-fuerte font-bold' : 'text-slate-600 hover:text-base-texto-primario'">
          <span class="inline-flex items-center gap-1.5"><FlaskConical :size="14" aria-hidden="true" /> Casos de prueba</span>
          <span
            v-if="passedCount > 0"
            class="px-1.5 py-0.2 rounded-full text-[10px]"
            :class="passedCount === workspaceStore.publicTestCases.length ? 'bg-semantico-pasa/10 text-semantico-pasa font-bold' : 'bg-acento-ambar/15 text-acento-ambar-fuerte font-bold'">
            {{ passedCount }}/{{ workspaceStore.publicTestCases.length }}
          </span>
        </button>

        <button
          @click="leftTab = 'consola'"
          class="min-h-[44px] px-3 py-2 rounded-t-md transition-colors"
          :class="leftTab === 'consola' ? 'bg-base-blanco text-base-texto-primario border-t-2 border-acento-ambar-fuerte font-bold' : 'text-slate-600 hover:text-base-texto-primario'">
          <span class="inline-flex items-center gap-1.5"><Terminal :size="14" aria-hidden="true" /> Registro</span>
        </button>
        <button type="button" class="ml-auto min-h-[44px] px-2 rounded-md inline-flex items-center gap-1 text-slate-600 hover:text-base-texto-primario"
          :aria-expanded="true" aria-controls="panel-enunciado" title="Plegar el panel para escribir con más espacio" @click="plegarPanel(true)">
          <PanelLeftClose :size="15" aria-hidden="true" /> Plegar<span class="sr-only"> el enunciado</span>
        </button>
      </div>

      <!-- Contenido de las Pestañas -->
      <div class="flex-1 overflow-y-auto p-5 text-xs text-base-texto-primario leading-relaxed">
        <!-- 1. Pestaña Enunciado -->
        <div v-if="leftTab === 'enunciado'" class="space-y-4">
          <ExerciseSinIntentos v-if="avisoEjercicio" :motivo="avisoEjercicio" :activity-id="workspaceStore.currentExercise.activityId" :learning-unit-id="workspaceStore.currentExercise.learningUnitId" />
          <div class="prose prose-xs" v-html="formatMarkdown(workspaceStore.currentExercise.description)"></div>
          <ExerciseConceptosEjercicio v-if="isCodingActivity" :enunciado="workspaceStore.currentExercise.description" :plantilla="workspaceStore.currentExercise.initialCode" :ejemplo="workspaceStore.publicTestCases[0]" :unidad="workspaceStore.currentExercise.unitTitle" :learning-unit-id="workspaceStore.currentExercise.learningUnitId" :ya-aprobado="workspaceStore.currentExercise.yaAprobada" />
          <ExercisePasosCodigo v-if="isCodingActivity" :codigo="workspaceStore.currentExercise.initialCode" :ejemplo="workspaceStore.publicTestCases[0]" :ya-aprobado="workspaceStore.currentExercise.yaAprobada" @por-pasos="resolverPorPasos" />

          <ExerciseComoSeCalifica :codigo="isCodingActivity" :html-css="isHtmlCssActivity" />
        </div>

        <!-- 2. Pestaña Casos de Prueba (P02 — Solo coding) -->
        <div v-else-if="leftTab === 'casos' && isCodingActivity" class="space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-base-borde-sutil">
            <h3 class="font-bold text-xs text-base-texto-primario">Casos públicos de verificación</h3>
            <span class="text-[11px] text-base-texto-secundario">
              Evaluados con [▶ Probar código]
            </span>
          </div>

          <div class="space-y-3">
            <ExerciseCasoPrueba v-for="tc in workspaceStore.publicTestCases" :key="tc.id" :tc="tc" :diagnostico="tc.passed === false ? diagnostico(tc) : null" :limite-ms="workspaceStore.timeLimitMs" />
          </div>

          <!-- Algún caso falló: se ofrece ayuda en ese momento (utils/ofertaTutor.ts). UI-05: escala con los fallos seguidos y
               cambia de táctica; UNA acción principal y las demás plegadas, para no abrumar. Se puede cerrar. -->
          <div
            v-if="ofrecerTutor"
            id="oferta-tutor"
            role="status"
            class="p-3 rounded-lg border-2 border-stire-purple/40 bg-stire-purple/5 text-xs space-y-2">
            <p class="flex items-start gap-2 font-semibold text-base-texto-primario">
              <Sparkles :size="16" class="shrink-0 text-stire-purple" aria-hidden="true" />
              {{ ayuda.mensaje }}
            </p>
            <div class="flex flex-wrap gap-2">
              <button type="button" class="min-h-[44px] px-3 py-1.5 rounded-md bg-stire-purple text-white font-bold hover:opacity-90" @click="usarAyuda(ayuda.principal)">
                {{ TEXTO_AYUDA[ayuda.principal] }}
              </button>
              <button type="button" class="min-h-[44px] px-3 py-1.5 rounded-md font-semibold text-slate-600 hover:text-base-texto-primario hover:bg-base-bg-secundario" @click="ofertaCerrada = true">
                Ahora no
              </button>
            </div>
            <details v-if="ayuda.otras.length">
              <summary class="min-h-[44px] inline-flex items-center cursor-pointer font-semibold text-stire-purple hover:underline">Otras formas de destrabarte</summary>
              <div class="flex flex-wrap gap-2 pt-1">
                <button v-for="o in ayuda.otras" :key="o" type="button" class="min-h-[44px] px-3 py-1.5 rounded-md border border-stire-purple/40 text-stire-purple font-semibold hover:bg-stire-purple/10" @click="usarAyuda(o)">
                  {{ TEXTO_AYUDA[o] }}
                </button>
              </div>
            </details>
          </div>

          <div
            v-if="workspaceStore.hiddenTestCaseCount > 0"
            class="p-3 bg-base-bg-secundario rounded border border-base-borde-sutil text-[11px] text-slate-600 flex items-center gap-2">
            <Lock :size="14" aria-hidden="true" />
            <span>{{ workspaceStore.hiddenTestCaseCount }} caso(s) privado(s) permanecen ocultos para evaluar la generalización de la solución.</span>
          </div>
        </div>

        <!-- 3. Pestaña Consola / Registro de Ejecución -->
        <div v-else class="space-y-2">
          <div class="flex items-center justify-between pb-1 border-b border-base-borde-sutil">
            <span class="font-bold text-xs">Historial de calificación</span>
            <button
              @click="workspaceStore.consoleLog = ['Historial limpiado.']"
              class="text-[11px] text-base-texto-secundario hover:text-base-texto-primario underline">
              Limpiar
            </button>
          </div>

          <div class="bg-editor-bg text-editor-text p-3 rounded-lg font-codigo text-xs space-y-1 min-h-[220px] max-h-[350px] overflow-y-auto">
            <div v-for="(log, idx) in workspaceStore.consoleLog" :key="idx" class="leading-relaxed">
              <span v-if="log.startsWith('✔')" class="text-[#5eead4]">{{ log }}</span>
              <span v-else-if="log.startsWith('✖') || log.startsWith('⚠') || log.startsWith('⛔')" class="text-[#f87171]">{{ log }}</span>
              <span v-else-if="log.startsWith('🎯')" class="text-[#fcd34d] font-bold">{{ log }}</span>
              <span v-else class="text-[#7dd3fc]">{{ log }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- COLUMNA DERECHA: Renderizado Reactivo según questionType -->

    <!-- CASO A: Coding — CodeEditor (CodeMirror 6) -->
    <div v-if="isCodingActivity" class="flex-1 flex flex-col md:h-full min-h-[70vh] md:min-h-0 bg-editor-bg text-editor-text overflow-hidden">
      <!-- Barra Superior del Editor -->
      <div class="h-9 bg-editor-header border-b border-editor-border px-4 flex items-center justify-between text-xs text-editor-muted flex-shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-teal-300 font-bold">JS</span>
          <span class="text-white font-medium">solucion.js</span>
          <span class="text-[10px] text-editor-muted">• JavaScript (ES2024)</span>
        </div>

        <div class="flex items-center gap-3 text-[11px]">
          <span>Tabulaciones: 2 espacios</span>
          <span>UTF-8</span>
        </div>
      </div>

      <AvisoBorrador />

      <!-- Área de Edición de Código (CodeMirror 6) -->
      <div class="flex-1 relative overflow-hidden">
        <CodeEditor
          v-model="workspaceStore.code"
          language="javascript"
          aria-label="Editor de código para tu solución"
          placeholder="// Escribe tu solución aquí..."
          class="w-full h-full"
          @update:model-value="workspaceStore.triggerAutosave"
        />
      </div>

      <!-- Barra de Estado Inferior del Editor -->
      <div class="h-7 bg-[#007acc] text-white px-4 flex items-center justify-between text-[11px] flex-shrink-0 font-medium">
        <div class="flex items-center gap-3">
          <span>Tu código se ejecuta en un entorno seguro</span>
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

    <!-- CASO B: HTML / CSS por Reglas (Fase 25 - ocupa toda la altura) -->
    <div v-else-if="isHtmlCssActivity" class="flex-1 flex flex-col md:h-full md:overflow-hidden">
      <ExerciseHtmlCssExercise :question="workspaceStore.currentQuestion" />
    </div>

    <!-- CASO C: opción múltiple, completar código, clasificar, ordenar y emparejar — una sola columna centrada -->
    <div v-else class="flex-1 md:h-full overflow-y-auto bg-base-bg-primario">
      <div class="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <p v-if="typeInfo" class="text-[11px] font-semibold text-acento-ambar-fuerte flex items-center gap-1.5">
          <DocenteExerciseTypeIcon :type="typeInfo.id" :size="14" /> {{ typeInfo.name }}
        </p>

        <section class="bg-base-blanco rounded-2xl border border-base-borde-sutil shadow-sm p-6 space-y-5">
          <div
            v-if="workspaceStore.currentExercise.description"
            class="prose prose-sm max-w-none text-base-texto-primario"
            v-html="statementHtml"></div>

          <template v-if="workspaceStore.currentQuestion">
            <ExerciseMcqExercise
              v-if="workspaceStore.currentExercise.questionType === 'mcq'"
              :question="workspaceStore.currentQuestion"
              :show-statement="!workspaceStore.currentExercise.description" />
            <ExerciseFillCodeExercise
              v-else-if="workspaceStore.currentExercise.questionType === 'fill_code'"
              :question="workspaceStore.currentQuestion"
              :show-statement="!workspaceStore.currentExercise.description" />
            <ExerciseDragDropExercise
              v-else-if="workspaceStore.currentExercise.questionType === 'drag_drop'"
              :question="workspaceStore.currentQuestion"
              :show-statement="!workspaceStore.currentExercise.description" />
            <ExerciseOrderingExercise
              v-else-if="workspaceStore.currentExercise.questionType === 'ordering'"
              :question="workspaceStore.currentQuestion"
              :show-statement="!workspaceStore.currentExercise.description" />
            <ExerciseMatchingExercise
              v-else-if="workspaceStore.currentExercise.questionType === 'matching'"
              :question="workspaceStore.currentQuestion"
              :show-statement="!workspaceStore.currentExercise.description" />
          </template>

          <p v-else-if="workspaceStore.loadError" role="alert" class="text-xs text-semantico-falla py-6">No se pudo cargar el ejercicio: {{ workspaceStore.loadError }}</p>
          <div v-else class="animate-pulse space-y-3 py-6" aria-label="Cargando el ejercicio">
            <div class="h-4 bg-base-bg-secundario rounded w-3/4"></div>
            <div class="h-20 bg-base-bg-secundario rounded"></div>
          </div>
        </section>

        <ExerciseSinIntentos v-if="avisoEjercicio" :motivo="avisoEjercicio" :activity-id="workspaceStore.currentExercise.activityId" :learning-unit-id="workspaceStore.currentExercise.learningUnitId" />
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p class="text-[11px] text-base-texto-secundario">
            <span v-if="typeInfo">{{ typeInfo.grading }} · </span>
            <template v-if="remainingAttempts > 0">Te {{ remainingAttempts === 1 ? 'queda 1 intento' : `quedan ${remainingAttempts} intentos` }}.</template>
            <template v-else>Ya usaste todos tus intentos.</template>
          </p>
          <button
            type="button"
            @click="workspaceStore.submitSolution()"
            :disabled="!canSubmitAnswer"
            class="px-5 py-2.5 rounded-lg bg-acento-ambar-fuerte text-base-blanco text-sm font-bold hover:bg-acento-ambar inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
            <Send :size="16" aria-hidden="true" />
            {{ workspaceStore.isSubmitting ? 'Calificando…' : 'Entregar respuesta' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Resultado de la entrega: qué pasó, cuánto se movió el dominio y a dónde seguir (07/10). -->
    <ExerciseResultadoEntrega v-if="workspaceStore.submissionResult" :exito="isSuccessResult" :reto="route.query.reto === '1'" @tutor="pedirAyudaAlTutor" />
  </div>
</template>

<script setup lang="ts">
import { diagnosticarSalida } from '~/utils/diagnosticoSalida'
import { tituloConNombre } from '~/utils/tituloPagina'
import { BookOpen, FlaskConical, Lock, PanelLeftClose, Send, Sparkles, Terminal } from 'lucide-vue-next'
import { useWorkspaceStore } from '~/stores/workspace'
import { useTutorStore } from '~/stores/tutor'
import { ayudaSegunFallos, debeOfrecerTutor, pistaSegunTipo, TEXTO_AYUDA, type Ayuda } from '~/utils/ofertaTutor'
import { formatMarkdown } from '~/utils/formatMarkdown'
import { exerciseTypeInfo } from '~/utils/exerciseTypes'

definePageMeta({
  layout: 'workspace'
})

const route = useRoute()
const workspaceStore = useWorkspaceStore()
// El nombre del ejercicio en la pestaña y para el lector de pantalla (WCAG 2.4.2).
useHead({ title: computed(() => tituloConNombre(workspaceStore.currentExercise?.title, route.path)) })
const leftTab = ref<'enunciado' | 'casos' | 'consola'>('enunciado')
const { plegado: panelPlegado, plegar: plegarPanel } = usePanelPlegable('stire.ejercicio.panelPlegado')
const tutorStore = useTutorStore()

// Oferta del Tutor al fallar: vuelve a aparecer en cada nueva prueba, salvo que el Tutor ya esté abierto.
const ofertaCerrada = ref(false)
watch(() => workspaceStore.isRunning, (corriendo) => { if (corriendo) ofertaCerrada.value = false })
const ofrecerTutor = computed(() =>
  !tutorStore.isOpen && debeOfrecerTutor(workspaceStore.publicTestCases, workspaceStore.isRunning, ofertaCerrada.value))

const ayuda = computed(() => ayudaSegunFallos(workspaceStore.fallosSeguidos))

/** UI-05: la ayuda elegida. Volver a la explicación lleva a la lección del ejercicio. */
async function usarAyuda(a: Ayuda) {
  if (a === 'pista') return pedirAyudaAlTutor()
  if (a === 'por-pasos') return resolverPorPasos()
  ofertaCerrada.value = true
  if (a === 'ejemplo') {
    workspaceStore.submissionResult = null
    return tutorStore.verEjemploParecido()
  }
  return navigateTo(`/estudiante/unidad/${workspaceStore.currentExercise.learningUnitId}#explicacion`)
}

async function resolverPorPasos() {
  workspaceStore.submissionResult = null
  ofertaCerrada.value = true
  await tutorStore.resolverPorPasos()
}

async function pedirAyudaAlTutor() {
  workspaceStore.submissionResult = null
  ofertaCerrada.value = true
  await tutorStore.openDrawer()
  tutorStore.requestQuickHint(pistaSegunTipo(workspaceStore.currentExercise.questionType))
}

// Al pulsar «Probar código» el resultado aparece en «Casos de Prueba»; antes el
// store cambiaba SU pestaña y esta pantalla se quedaba en «Enunciado»: parecía
// que no pasaba nada.
watch(() => workspaceStore.isRunning, (running) => {
  if (running && isCodingActivity.value) leftTab.value = 'casos'
})

const isCodingActivity = computed(() => workspaceStore.currentExercise.questionType === 'coding')
const isHtmlCssActivity = computed(() => workspaceStore.currentExercise.questionType === 'html_css')

const typeInfo = computed(() => exerciseTypeInfo(workspaceStore.currentExercise.questionType))
const statementHtml = computed(() => formatMarkdown(workspaceStore.currentExercise.description || ''))
const remainingAttempts = computed(() => Math.max(0, (workspaceStore.currentExercise.maxAttempts ?? 0) - (workspaceStore.currentExercise.usedAttempts ?? 0)))
/** Aviso arriba del ejercicio: sin intentos, ya aprobado o (con «revisar», de la lista de la lección) un parecido ya resuelto. */
const avisoEjercicio = computed(() => {
  const ej = workspaceStore.currentExercise
  if (!ej.activityId || workspaceStore.submissionResult) return null
  return remainingAttempts.value === 0 ? 'sin-intentos' : ej.yaAprobada ? 'completado' : 'revisar'
})
const canSubmitAnswer = computed(() => Boolean(workspaceStore.pendingAnswer) && !workspaceStore.isSubmitting && remainingAttempts.value > 0)

const passedCount = computed(() => {
  return workspaceStore.publicTestCases.filter(tc => tc.passed === true).length
})

const isSuccessResult = computed(() => {
  const result = workspaceStore.submissionResult
  if (!result) return false
  if (isCodingActivity.value) {
    return result.totalCount > 0 && result.passedCount === result.totalCount
  }
  // El backend ya normaliza el puntaje contra el total real de la actividad
  // (activity.totalPoints) antes de comparar con el umbral de aprobación —
  // ver submissions.service.ts. No se recalcula acá para no duplicar esa
  // regla de negocio ni desalinearse si cambia en el backend.
  return result.passed === true
})

// Fase 26: el mínimo de 18 servía para pintar el margen de números del textarea anterior; CodeMirror ya los dibuja,
// así que la barra de estado muestra las líneas reales.
const lineCount = computed(() => workspaceStore.code.split('\n').length)

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

/** Diagnóstico de un caso que no coincide (utils/diagnosticoSalida.ts). */
const diagnostico = (tc: { expectedOutput: string; actualOutput?: string; input?: string }) =>
  diagnosticarSalida(String(tc.expectedOutput ?? ''), String(tc.actualOutput ?? ''), String(tc.input ?? ''))
</script>
