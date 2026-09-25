import { defineStore } from 'pinia'
import type { TestCase, SubmissionResult, HtmlCssRunResult } from '~/types'
import { useAuthStore } from './auth'
import { useApi } from '~/composables/useApi'
import { useApiErrorMessage } from '~/composables/useApiErrorMessage'

export interface WorkspaceExercise {
  activityId: number
  questionId: number
  questionType: string
  title: string
  unitTitle: string
  learningUnitId: number
  difficulty: string
  maxAttempts: number
  usedAttempts: number
  description: string
  initialCode: string
  /** Puntaje máximo real de la actividad (activity.totalPoints) — nunca asumir 100. */
  maxScore: number
}

/** Config saneada que llega del backend para cada tipo de pregunta */
export interface WorkspaceQuestion {
  id: number
  type: string
  question: string
  config: Record<string, any>
}

export const useWorkspaceStore = defineStore('workspace', () => {
  const api = useApi()
  const authStore = useAuthStore()

  const currentExercise = ref<WorkspaceExercise>({
    activityId: 0,
    questionId: 0,
    questionType: 'coding',
    title: 'Cargando ejercicio...',
    unitTitle: '',
    learningUnitId: 0,
    difficulty: 'Básico',
    maxAttempts: 3,
    usedAttempts: 0,
    description: 'Cargando enunciado desde la base de datos de STIRE...',
    initialCode: '// Cargando plantilla...\n',
    maxScore: 100
  })

  /** Pregunta completa (config saneada) para tipos distintos de coding */
  const currentQuestion = ref<WorkspaceQuestion | null>(null)

  /**
   * Respuesta pendiente para tipos MCQ / FILL_CODE / DRAG_DROP / ORDERING / MATCHING.
   * Cada componente de ejercicio la actualiza conforme el estudiante interactúa.
   * submitSolution() la consume al entregar.
   */
  const pendingAnswer = ref<Record<string, any> | null>(null)

  const code = ref(currentExercise.value.initialCode)
  const htmlCode = ref('')
  const cssCode = ref('')
  const htmlCssResults = ref<HtmlCssRunResult | null>(null)
  const isRunning = ref(false)
  const isSubmitting = ref(false)
  const isLoadingExercise = ref(false)
  // Estado REAL del autoguardado (antes era un texto fijo «sincronizado ✔» desde
  // antes de escribir nada). Solo aplica a actividades de código.
  const autosaveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const autosavedAt = ref<string>('')
  const lastAutosave = computed(() => {
    switch (autosaveState.value) {
      case 'saving': return 'Guardando cambios…'
      case 'saved': return `Autoguardado a las ${autosavedAt.value} ✔`
      case 'error': return 'No se pudo autoguardar'
      default: return 'Sin cambios por guardar'
    }
  })
  // Hay cambios que todavía no llegaron al servidor (guardando o con error)
  const hasUnsavedChanges = computed(() => autosaveState.value === 'saving' || autosaveState.value === 'error')
  let autosaveTimer: ReturnType<typeof setTimeout> | undefined
  // Datos reales del ejercicio de código que muestra el panel «Enunciado»
  const hiddenTestCaseCount = ref(0)
  const timeLimitMs = ref<number | null>(null)
  const activeTab = ref<'consola' | 'casos' | 'tutor'>('casos')
  const currentSubmissionId = ref<string | null>(null)
  const publicTestCases = ref<TestCase[]>([])

  const consoleLog = ref<string[]>([
    'STIRE Sandbox v2.0 — Conectado a la plataforma STIRE.',
    'Presiona [▶ Probar código] para evaluar contra casos de prueba públicos sin consumir intentos.'
  ])

  const submissionResult = ref<SubmissionResult | null>(null)

  /**
   * Dominio (mastery %) del estudiante en la unidad de aprendizaje de esta
   * actividad, antes y después de calificar. Permite mostrarle al estudiante
   * cuánto avanzó su dominio real en vez de solo un puntaje crudo confuso.
   */
  const masteryBefore = ref<number | null>(null)
  const masteryAfter = ref<number | null>(null)

  async function fetchUnitMastery(unitId: number): Promise<number | null> {
    const studentId = authStore.user?.id
    if (!studentId || !unitId) return null
    try {
      const progress = await api.get<{ mastery: number } | null>(
        `/learning-progress/student/${studentId}/unit/${unitId}`
      )
      return progress?.mastery ?? 0
    } catch {
      // Sin progreso registrado aún, o error puntual de red: no bloquea la
      // experiencia principal, simplemente no se muestra el delta de dominio.
      return null
    }
  }

  /**
   * Carga una actividad real desde el backend NestJS
   * 1. GET /activities/:activityId
   * 2. GET /activity-questions/activity/:activityId
   */
  async function loadActivity(activityId: number) {
    if (!activityId) return
    isLoadingExercise.value = true
    currentSubmissionId.value = null
    submissionResult.value = null
    pendingAnswer.value = null
    currentQuestion.value = null
    masteryBefore.value = null
    masteryAfter.value = null
    htmlCode.value = ''
    cssCode.value = ''
    htmlCssResults.value = null

    consoleLog.value = [
      'STIRE Sandbox v2.0 — Conectado a la plataforma STIRE.',
      `Cargando actividad académica #${activityId}...`
    ]

    try {
      // 1. Metadatos de la actividad
      const activity = await api.get<any>(`/activities/${activityId}`)
      
      // 2. Preguntas asociadas
      const questions = await api.get<any[]>(`/activity-questions/activity/${activityId}`)
      
      if (activity && Array.isArray(questions) && questions.length > 0) {
        // La actividad puede tener preguntas de distintos tipos (CODING, HTML_CSS,
        // FILL_CODE, MCQ, DRAG_DROP, MATCHING...).
        const primaryQuestion = questions.find(q => q.type === 'coding' || q.type === 'html_css') || questions[0]
        const isCoding = primaryQuestion.type === 'coding'
        const isHtmlCss = primaryQuestion.type === 'html_css'
        const config = primaryQuestion.config || {}

        let starter = ''
        if (isCoding) {
          starter = config.starterCode || `const fs = require('fs');\n\n// Leer entrada estándar\nconst input = fs.readFileSync(0, 'utf-8').trim();\n\n// Escribe tu algoritmo aquí:\n`
        } else if (isHtmlCss) {
          starter = '<!-- HTML y CSS calificado por reglas -->'
          htmlCode.value = typeof config.starterHtml === 'string' ? config.starterHtml : ''
          cssCode.value = typeof config.starterCss === 'string' ? config.starterCss : ''
        } else {
          starter = `// Esta actividad es de tipo "${primaryQuestion.type}", no de código libre.\n// Usa el panel izquierdo para responder.\n`
        }

        currentExercise.value = {
          activityId: activity.id,
          questionId: primaryQuestion.id,
          questionType: primaryQuestion.type,
          title: activity.title,
          unitTitle: activity.learningUnit?.title || 'Unidad de Aprendizaje',
          learningUnitId: activity.learningUnitId,
          difficulty: activity.difficulty || 'Básico',
          maxAttempts: activity.attemptsAllowed || 3,
          usedAttempts: 0,
          description: activity.description || primaryQuestion.question || 'Sin enunciado disponible.',
          initialCode: starter,
          maxScore: activity.totalPoints ?? 100
        }

        // Dominio actual de la unidad ANTES de este intento, para poder
        // mostrar el delta real una vez calificado.
        masteryBefore.value = await fetchUnitMastery(activity.learningUnitId)

        // Guardar pregunta completa para los componentes de ejercicio
        currentQuestion.value = {
          id: primaryQuestion.id,
          type: primaryQuestion.type,
          question: primaryQuestion.question || '',
          config
        }

        code.value = starter

        if (isCoding) {
          // Cargar casos de prueba públicos
          const rawCases = config.testCases || config.publicTestCases || []
          publicTestCases.value = rawCases.map((tc: any, index: number) => ({
            id: index + 1,
            input: tc.input || tc.label || `Caso #${index + 1}`,
            expectedOutput: String(tc.expected !== undefined ? tc.expected : tc.expectedOutput || ''),
            actualOutput: '',
            isPublic: true,
            passed: undefined
          }))
          hiddenTestCaseCount.value = Number(config.hiddenTestCaseCount ?? 0)
          timeLimitMs.value = typeof config.timeLimitMs === 'number' ? config.timeLimitMs : null
          consoleLog.value.push(`✔ Actividad "${activity.title}" cargada exitosamente.`)
          consoleLog.value.push(`  → ${publicTestCases.value.length} caso(s) de prueba público(s) disponible(s).`)
        } else if (isHtmlCss) {
          publicTestCases.value = []
          hiddenTestCaseCount.value = Number(config.hiddenRuleCount ?? 0)
          timeLimitMs.value = null
          const pubCount = Array.isArray(config.publicRules) ? config.publicRules.length : 0
          consoleLog.value.push(`✔ Actividad "${activity.title}" cargada (tipo: html_css).`)
          consoleLog.value.push(`  → ${pubCount} regla(s) pública(s) disponible(s).`)
        } else {
          publicTestCases.value = []
          hiddenTestCaseCount.value = 0
          timeLimitMs.value = null
          consoleLog.value.push(`✔ Actividad "${activity.title}" cargada (tipo: ${primaryQuestion.type}).`)
          consoleLog.value.push(`  → Completa la respuesta en el panel izquierdo y presiona "Entregar solución".`)
        }
      }
    } catch (err: any) {
      console.error('[STIRE Workspace] Error cargando actividad:', err)
      const { messageOf } = useApiErrorMessage()
      const msg = messageOf(err, 'Error al cargar actividad')
      consoleLog.value.push(`⚠ Error al cargar actividad #${activityId}: ${msg}`)
    } finally {
      isLoadingExercise.value = false
    }
  }

  /**
   * Asegura que exista un intento activo de la actividad en el backend NestJS.
   */
  // Una sola petición en vuelo: si dos acciones piden el intento a la vez (p. ej. al
  // cargar y al autoguardar) no se llama dos veces a POST /submissions/start.
  let pendingStart: Promise<string> | null = null

  async function ensureActiveSubmission(): Promise<string> {
    if (currentSubmissionId.value) {
      return currentSubmissionId.value
    }
    if (!pendingStart) {
      pendingStart = (async () => {
        const res = await api.post<{ id: string }>('/submissions/start', {
          activityId: currentExercise.value.activityId
        })
        if (!res?.id) {
          throw new Error('No se pudo obtener el identificador del intento')
        }
        currentSubmissionId.value = res.id
        return res.id
      })().finally(() => { pendingStart = null })
    }
    return pendingStart
  }

  // Acción 1: "▶ Probar código" — Evaluación en sandbox libre sin consumir intento
  async function runIsolatedCode() {
    if (currentExercise.value.questionType !== 'coding') {
      consoleLog.value.push(`⚠ "Probar código" no aplica: esta actividad es de tipo "${currentExercise.value.questionType}", no de código libre.`)
      return
    }
    isRunning.value = true
    activeTab.value = 'casos'
    consoleLog.value.push(`[${new Date().toLocaleTimeString()}] Solicitando ejecución en sandbox real (POST /submissions/:id/run)...`)

    try {
      const subId = await ensureActiveSubmission()
      consoleLog.value.push(`  → Evaluando contra casos públicos en sandbox aislado (Intento #${subId})...`)

      const res = await api.post<{
        submissionId: string
        results: Array<{
          label?: string
          input?: string
          expected?: string
          expectedOutput?: string
          actualOutput?: string
          passed: boolean
        }>
        allPassed: boolean
      }>(`/submissions/${subId}/run`, {
        code: code.value
      })

      if (res && Array.isArray(res.results)) {
        publicTestCases.value = res.results.map((r, index) => ({
          id: index + 1,
          input: r.input || r.label || `Caso #${index + 1}`,
          expectedOutput: r.expected || r.expectedOutput || '',
          actualOutput: r.actualOutput !== undefined ? String(r.actualOutput) : '',
          isPublic: true,
          passed: r.passed
        }))

        if (res.allPassed) {
          consoleLog.value.push(`✔ Todos los casos públicos aprobados (${res.results.length}/${res.results.length}).`)
        } else {
          const passedCount = res.results.filter(r => r.passed).length
          consoleLog.value.push(`✖ Discrepancias encontradas: ${passedCount}/${res.results.length} casos aprobados. Revisa la pestaña de casos.`)
        }
      }
    } catch (err: any) {
      const { messageOf, extract } = useApiErrorMessage()
      const { status } = extract(err)
      const msg = messageOf(err, 'Error de conexión con el sandbox del backend')
      consoleLog.value.push(`⚠ Error al ensayar código (${status || 'red'}): ${msg}`)
      publicTestCases.value.forEach(tc => {
        tc.actualOutput = 'Error de ejecución'
        tc.passed = false
      })
    } finally {
      isRunning.value = false
    }
  }

  // Acción: "▶ Probar" para HTML y CSS — Evaluación de reglas públicas sin consumir intento
  async function runHtmlCss(): Promise<HtmlCssRunResult | null> {
    if (currentExercise.value.questionType !== 'html_css') {
      consoleLog.value.push(`⚠ "Probar" no aplica: esta actividad no es de tipo html_css.`)
      return null
    }
    if (!htmlCode.value || !htmlCode.value.trim()) {
      consoleLog.value.push('⚠ El HTML no puede estar vacío para probar.')
      return null
    }

    isRunning.value = true
    consoleLog.value.push(`[${new Date().toLocaleTimeString()}] Solicitando evaluación de reglas públicas (POST /submissions/:id/run)...`)

    try {
      const subId = await ensureActiveSubmission()
      consoleLog.value.push(`  → Evaluando reglas públicas en el servidor (Intento #${subId})...`)

      const res = await api.post<HtmlCssRunResult & { submissionId?: string }>(`/submissions/${subId}/run`, {
        html: htmlCode.value,
        css: cssCode.value
      })

      if (res && Array.isArray(res.results)) {
        htmlCssResults.value = {
          results: res.results,
          allPassed: res.allPassed,
          passedWeight: res.passedWeight,
          totalWeight: res.totalWeight
        }
        if (res.allPassed) {
          consoleLog.value.push(`✔ Todas las reglas públicas aprobadas (${res.results.length}/${res.results.length}).`)
        } else {
          const passedCount = res.results.filter(r => r.passed).length
          consoleLog.value.push(`✖ Discrepancias encontradas: ${passedCount}/${res.results.length} reglas públicas aprobadas.`)
        }
      }
      return htmlCssResults.value
    } catch (err: any) {
      const { messageOf, extract } = useApiErrorMessage()
      const { status } = extract(err)
      const msg = messageOf(err, 'Error de conexión con el evaluador del backend')
      consoleLog.value.push(`⚠ Error al evaluar reglas (${status || 'red'}): ${msg}`)
      throw err
    } finally {
      isRunning.value = false
    }
  }

  // Sondea GET /submissions/:id hasta que el backend termine de calificar de
  // forma asíncrona (preguntas CODING) o se agote el número de intentos.
  async function pollSubmissionStatus(subId: string, maxAttempts = 10, intervalMs = 1200): Promise<SubmissionResult | null> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
      try {
        const res = await api.get<SubmissionResult>(`/submissions/${subId}`)
        if (res?.status === 'graded') return res
      } catch {
        // Error puntual de sondeo: se reintenta en la siguiente iteración.
      }
    }
    return null
  }

  // Acción 2: "🚀 Entregar solución" — Calificación formal contra el backend NestJS
  // Para CODING: usa code.value. Para HTML_CSS: usa { html, css }. Para el resto: usa pendingAnswer.value.
  async function submitSolution() {
    const qType = currentExercise.value.questionType

    if (qType === 'html_css') {
      if (!htmlCode.value || !htmlCode.value.trim()) {
        consoleLog.value.push(`⚠ El HTML no puede estar vacío para entregar.`)
        return
      }
    } else if (qType !== 'coding' && !pendingAnswer.value) {
      consoleLog.value.push(`⚠ Completa la respuesta antes de entregar.`)
      return
    }

    isSubmitting.value = true
    submissionResult.value = null
    consoleLog.value.push(`[${new Date().toLocaleTimeString()}] Enviando solución formal para calificación (POST /submissions/:id/submit)...`)

    try {
      const subId = await ensureActiveSubmission()
      consoleLog.value.push(`  → Calificando intento formal #${subId}...`)

      // Construir el answer según el tipo
      const answer = qType === 'coding'
        ? { code: code.value }
        : qType === 'html_css'
          ? { html: htmlCode.value, css: cssCode.value }
          : pendingAnswer.value!

      const submitRes = await api.post<SubmissionResult>(`/submissions/${subId}/submit`, {
        answers: [
          {
            questionId: currentExercise.value.questionId,
            answer
          }
        ]
      })

      if (submitRes) {
        currentExercise.value.usedAttempts += 1
        currentSubmissionId.value = null // Intento cerrado
        pendingAnswer.value = null

        const maxScore = submitRes.maxScore ?? currentExercise.value.maxScore

        if (submitRes.status === 'graded') {
          submissionResult.value = submitRes
          consoleLog.value.push(`🎯 Solución calificada con ${submitRes.totalScore}/${maxScore} puntos por el backend.`)
          masteryAfter.value = await fetchUnitMastery(currentExercise.value.learningUnitId)
          return
        }

        // CODING asíncrono: sondear resultado
        if (qType === 'coding') {
          consoleLog.value.push(`  → Calificación en proceso en el sandbox aislado, esperando resultado real...`)
          const finalResult = await pollSubmissionStatus(subId)
          if (finalResult) {
            submissionResult.value = finalResult
            const finalMaxScore = finalResult.maxScore ?? maxScore
            consoleLog.value.push(`🎯 Solución calificada con ${finalResult.totalScore}/${finalMaxScore} puntos por el backend.`)
            masteryAfter.value = await fetchUnitMastery(currentExercise.value.learningUnitId)
          } else {
            consoleLog.value.push(`⚠ La calificación está tardando más de lo esperado. Revisa tus notificaciones en unos minutos.`)
          }
        }
      }
    } catch (err: any) {
      const { messageOf, extract } = useApiErrorMessage()
      const { status } = extract(err)
      const msg = messageOf(err, 'Error de red o backend no disponible')
      console.warn('[STIRE Submissions] Error al calificar solución:', msg)

      if (status === 403 || status === 409) {
        consoleLog.value.push(`⛔ Límite alcanzado o acceso no autorizado: ${msg}`)
      } else {
        consoleLog.value.push(`✖ No se pudo procesar la entrega formal (${status || 'offline'}): ${msg}`)
      }
    } finally {
      isSubmitting.value = false
    }
  }

  // Autosave: PUT /submissions/:id/autosave (aplica a coding y html_css). Con debounce.
  function triggerAutosave() {
    const qType = currentExercise.value.questionType
    if (qType !== 'coding' && qType !== 'html_css') return
    autosaveState.value = 'saving'
    if (autosaveTimer) clearTimeout(autosaveTimer)
    autosaveTimer = setTimeout(saveNow, 800)
  }

  async function saveNow() {
    try {
      const subId = await ensureActiveSubmission()
      const qType = currentExercise.value.questionType
      const answer = qType === 'coding'
        ? { code: code.value }
        : { html: htmlCode.value, css: cssCode.value }

      await api.put(`/submissions/${subId}/autosave`, {
        answers: [
          {
            questionId: currentExercise.value.questionId,
            answer
          }
        ]
      })
      autosavedAt.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      autosaveState.value = 'saved'
    } catch (err: any) {
      autosaveState.value = 'error'
      console.warn('[STIRE Autosave] No se pudo autoguardar:', err?.message)
    }
  }

  return {
    currentExercise,
    currentQuestion,
    pendingAnswer,
    code,
    htmlCode,
    cssCode,
    htmlCssResults,
    isRunning,
    isSubmitting,
    isLoadingExercise,
    lastAutosave,
    autosaveState,
    hasUnsavedChanges,
    hiddenTestCaseCount,
    timeLimitMs,
    activeTab,
    currentSubmissionId,
    publicTestCases,
    consoleLog,
    submissionResult,
    masteryBefore,
    masteryAfter,
    loadActivity,
    runIsolatedCode,
    runHtmlCss,
    submitSolution,
    triggerAutosave
  }
})
