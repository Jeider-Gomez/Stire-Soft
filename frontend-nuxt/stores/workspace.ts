import { defineStore } from 'pinia'
import type { TestCase, SubmissionResult } from '~/types'
import { useAuthStore } from './auth'
import { useApi } from '~/composables/useApi'

export interface WorkspaceExercise {
  activityId: number
  questionId: number
  title: string
  unitTitle: string
  difficulty: string
  maxAttempts: number
  usedAttempts: number
  description: string
  initialCode: string
}

export const useWorkspaceStore = defineStore('workspace', () => {
  const api = useApi()
  const authStore = useAuthStore()

  const currentExercise = ref<WorkspaceExercise>({
    activityId: 0,
    questionId: 0,
    title: 'Cargando ejercicio...',
    unitTitle: '',
    difficulty: 'Básico',
    maxAttempts: 3,
    usedAttempts: 0,
    description: 'Cargando enunciado desde la base de datos de STIRE...',
    initialCode: '// Cargando plantilla...\n'
  })

  const code = ref(currentExercise.value.initialCode)
  const isRunning = ref(false)
  const isSubmitting = ref(false)
  const isLoadingExercise = ref(false)
  const lastAutosave = ref<string>('Autoguardado sincronizado ✔')
  const activeTab = ref<'consola' | 'casos' | 'tutor'>('casos')
  const currentSubmissionId = ref<string | null>(null)
  const publicTestCases = ref<TestCase[]>([])

  const consoleLog = ref<string[]>([
    'STIRE Sandbox v2.0 — Conectado a la plataforma STIRE.',
    'Presiona [▶ Probar código] para evaluar contra casos de prueba públicos sin consumir intentos.'
  ])

  const submissionResult = ref<SubmissionResult | null>(null)

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
        // Encontrar pregunta de código o la primera pregunta
        const codingQuestion = questions.find(q => q.type === 'CODING') || questions[0]
        const config = codingQuestion.config || {}

        const starter = config.starterCode || 
          `const fs = require('fs');\n\n// Leer entrada estándar\nconst input = fs.readFileSync(0, 'utf-8').trim();\n\n// Escribe tu algoritmo aquí:\n`

        currentExercise.value = {
          activityId: activity.id,
          questionId: codingQuestion.id,
          title: activity.title,
          unitTitle: activity.learningUnit?.title || 'Unidad de Aprendizaje',
          difficulty: activity.difficulty || 'Básico',
          maxAttempts: activity.attemptsAllowed || 3,
          usedAttempts: 0,
          description: activity.description || codingQuestion.question || 'Sin enunciado disponible.',
          initialCode: starter
        }

        code.value = starter

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

        consoleLog.value.push(`✔ Actividad "${activity.title}" cargada exitosamente.`)
        consoleLog.value.push(`  → ${publicTestCases.value.length} caso(s) de prueba público(s) disponible(s).`)
      }
    } catch (err: any) {
      console.error('[STIRE Workspace] Error cargando actividad:', err)
      consoleLog.value.push(`⚠ Error al cargar actividad #${activityId}: ${err?.data?.message || err?.message}`)
    } finally {
      isLoadingExercise.value = false
    }
  }

  /**
   * Asegura que exista un intento activo de la actividad en el backend NestJS.
   */
  async function ensureActiveSubmission(): Promise<string> {
    if (currentSubmissionId.value) {
      return currentSubmissionId.value
    }
    const res = await api.post<{ id: string }>('/submissions/start', {
      activityId: currentExercise.value.activityId
    })
    if (!res?.id) {
      throw new Error('No se pudo obtener el identificador del intento')
    }
    currentSubmissionId.value = res.id
    return res.id
  }

  // Acción 1: "▶ Probar código" — Evaluación en sandbox libre sin consumir intento
  async function runIsolatedCode() {
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
      const status = err?.response?.status || err?.statusCode
      const msg = err?.data?.message || err?.message || 'Error de conexión con el sandbox del backend'
      consoleLog.value.push(`⚠ Error al ensayar código (${status || 'red'}): ${msg}`)
      publicTestCases.value.forEach(tc => {
        tc.actualOutput = 'Error de ejecución'
        tc.passed = false
      })
    } finally {
      isRunning.value = false
    }
  }

  // Acción 2: "🚀 Entregar solución" — Calificación formal contra el backend NestJS
  async function submitSolution() {
    isSubmitting.value = true
    submissionResult.value = null
    consoleLog.value.push(`[${new Date().toLocaleTimeString()}] Enviando solución formal para calificación (POST /submissions/:id/submit)...`)

    try {
      const subId = await ensureActiveSubmission()
      consoleLog.value.push(`  → Calificando intento formal #${subId}...`)

      const submitRes = await api.post<SubmissionResult>(`/submissions/${subId}/submit`, {
        answers: [
          {
            questionId: currentExercise.value.questionId,
            answer: { code: code.value }
          }
        ]
      })

      if (submitRes) {
        submissionResult.value = submitRes
        currentExercise.value.usedAttempts += 1
        currentSubmissionId.value = null // Intento cerrado
        consoleLog.value.push(`🎯 Solución calificada con ${submitRes.totalScore}/100 puntos por el backend.`)
        return
      }
    } catch (err: any) {
      const status = err?.response?.status || err?.statusCode
      const msg = err?.data?.message || err?.message || 'Error de red o backend no disponible'
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

  // Autosave: PUT /submissions/:id/autosave
  async function triggerAutosave() {
    lastAutosave.value = `Autoguardando...`

    try {
      const subId = await ensureActiveSubmission()
      await api.put(`/submissions/${subId}/autosave`, {
        answers: [
          {
            questionId: currentExercise.value.questionId,
            answer: { code: code.value }
          }
        ]
      })
      lastAutosave.value = `Autoguardado a las ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✔`
    } catch (err: any) {
      lastAutosave.value = `Error al autoguardar`
      console.warn('[STIRE Autosave] No se pudo autoguardar:', err?.message)
    }
  }

  return {
    currentExercise,
    code,
    isRunning,
    isSubmitting,
    isLoadingExercise,
    lastAutosave,
    activeTab,
    currentSubmissionId,
    publicTestCases,
    consoleLog,
    submissionResult,
    loadActivity,
    runIsolatedCode,
    submitSolution,
    triggerAutosave
  }
})
