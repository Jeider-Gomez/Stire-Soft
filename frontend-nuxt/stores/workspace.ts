import { defineStore } from 'pinia'
import type { TestCase, SubmissionResult } from '~/types'
import { useAuthStore } from './auth'
import { useApi } from '~/composables/useApi'

export const useWorkspaceStore = defineStore('workspace', () => {
  const api = useApi()
  const authStore = useAuthStore()

  const currentExercise = ref({
    activityId: 103,
    title: 'Ejercicio: Sumatoria de Elementos Pares en un Rango',
    unitTitle: 'Unidad 3: Ciclos e Iteraciones',
    difficulty: 'Intermedio',
    maxAttempts: 3,
    usedAttempts: 1,
    description: `### Enunciado del Problema
Escribe una función \`sumarPares(inicio, fin)\` que reciba dos números enteros positivos \`inicio\` y \`fin\` (\`inicio <= fin\`) y retorne la suma acumulada de todos los números pares contenidos dentro de dicho rango (incluyendo los extremos si son pares).

#### Requisitos:
1. Si no existen números pares en el rango, la función debe retornar \`0\`.
2. Utiliza una estructura de ciclo (\`for\` o \`while\`) para acumular el resultado.`,
    initialCode: `/**
 * Retorna la suma de los pares entre inicio y fin inclusive.
 * @param {number} inicio
 * @param {number} fin
 * @returns {number}
 */
function sumarPares(inicio, fin) {
  let suma = 0;
  for (let i = inicio; i <= fin; i++) {
    if (i % 2 === 0) {
      suma += i;
    }
  }
  return suma;
}`
  })

  const code = ref(currentExercise.value.initialCode)
  const isRunning = ref(false)
  const isSubmitting = ref(false)
  const lastAutosave = ref<string>('Autoguardado sincronizado ✔')
  const activeTab = ref<'consola' | 'casos' | 'tutor'>('casos')
  const currentSubmissionId = ref<string | null>(null)

  const publicTestCases = ref<TestCase[]>([
    {
      id: 1,
      input: 'sumarPares(1, 10)',
      expectedOutput: '30',
      actualOutput: '',
      isPublic: true,
      passed: undefined
    },
    {
      id: 2,
      input: 'sumarPares(3, 7)',
      expectedOutput: '10',
      actualOutput: '',
      isPublic: true,
      passed: undefined
    },
    {
      id: 3,
      input: 'sumarPares(5, 5)',
      expectedOutput: '0',
      actualOutput: '',
      isPublic: true,
      passed: undefined
    }
  ])

  const consoleLog = ref<string[]>([
    'STIRE Sandbox v1.0 — Conectado a la plataforma STIRE.',
    'Presiona [▶ Probar código] para evaluar contra casos de prueba públicos sin consumir intentos.'
  ])

  const submissionResult = ref<SubmissionResult | null>(null)

  /**
   * Asegura que exista un intento activo de la actividad en el backend NestJS.
   * Si ya existe un intento en progreso para el estudiante, startSubmission lo retorna
   * sin consumir ni incrementar intentos.
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

  // Acción 1: "▶ Probar código" — Acción libre sin consumir intento (Insumo 15 §7.1 / §12 Fase A)
  // Backend real: POST /submissions/:id/run
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

  // Acción 2: "🚀 Entregar solución" — Calificación formal contra el backend NestJS (Insumo 15 §12 Fase B)
  // Contrato real: POST /submissions/start → obtener submissionId → POST /submissions/:id/submit
  // SIN FALLBACK FALSO: si el backend o la red fallan, se reporta error real al estudiante.
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
            questionId: 1,
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
            questionId: 1,
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
    lastAutosave,
    activeTab,
    currentSubmissionId,
    publicTestCases,
    consoleLog,
    submissionResult,
    runIsolatedCode,
    submitSolution,
    triggerAutosave
  }
})

