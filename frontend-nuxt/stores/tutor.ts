import { defineStore } from 'pinia'
import type { TutorMessage, TutorSuggestedActivity, TutorApiKey, TutorGuidance } from '~/types'
import { useAuthStore } from './auth'
import { useWorkspaceStore } from './workspace'
import { useStudentStore } from './student'
import { useApi } from '~/composables/useApi'
import { useApiErrorMessage } from '~/composables/useApiErrorMessage'

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export const useTutorStore = defineStore('tutor', () => {
  const api = useApi()
  const { friendlyTutorError } = useApiErrorMessage()
  const authStore = useAuthStore()
  const workspaceStore = useWorkspaceStore()
  const studentStore = useStudentStore()
  const route = useRoute()

  // ─── Estado del drawer ──────────────────────────────────────────────────────
  const isOpen = ref(false)
  const isThinking = ref(false)
  const hasGreeted = ref(false)
  /** Segundos que lleva el tutor pensando; para escalar el mensaje de espera. */
  const thinkingSeconds = ref(0)
  let thinkingTimer: ReturnType<typeof setInterval> | null = null

  // ─── Mensajes ───────────────────────────────────────────────────────────────
  const messages = ref<TutorMessage[]>([])
  /** Último texto del estudiante — para reintentar sin volver a escribirlo. */
  const lastUserMessage = ref<string | null>(null)
  /** true mientras el panel de clave está abierto por un 428/422 pendiente de reintento. */
  const pendingRetryAfterKey = ref(false)

  // ─── Nivel de guía y orientación (§18.4, §21.2) ───────────────────────────
  /** null = no hay actividad activa (chips ocultos) */
  const guidanceLevel = ref<1 | 2 | 3 | null>(null)
  const tutorEnabled = ref(true)
  const dueReviews = ref<TutorGuidance['dueReviews']>(null)
  const contentLink = ref<TutorGuidance['contentLink']>(null)

  // ─── Clave de Google AI Studio (§19) ────────────────────────────────────────
  const hasLoadedHistory = ref(false)
  const hasKey = ref<boolean | null>(null)   // null = aún no cargado
  const last4 = ref<string | null>(null)
  /** true = mostrar TutorKeyPanel en lugar del campo de pregunta */
  const showKeyPanel = ref(false)

  // ─── Temporizador de pensamiento escalado (§18.6) ───────────────────────────
  function startThinkingTimer() {
    thinkingSeconds.value = 0
    thinkingTimer = setInterval(() => {
      thinkingSeconds.value += 1
    }, 1000)
  }
  function stopThinkingTimer() {
    if (thinkingTimer) {
      clearInterval(thinkingTimer)
      thinkingTimer = null
    }
    thinkingSeconds.value = 0
  }

  // ─── Historial (§18.7) ──────────────────────────────────────────────────────
  async function fetchHistory() {
    if (hasLoadedHistory.value) return
    hasLoadedHistory.value = true
    try {
      const res = await api.get<{
        success: boolean
        messages: Array<{ id: number; role: 'user' | 'assistant'; content: string; createdAt: string }>
      }>('/tutor/history?limit=20')
      if (res?.messages?.length) {
        const historicalMsgs: TutorMessage[] = res.messages.map((m) => ({
          id: `hist-${m.id}`,
          sender: m.role === 'assistant' ? 'tutor' : 'student',
          text: m.content, // Llega saneado del backend; igual pasa por formatTutorMessage al renderizar
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
        messages.value = historicalMsgs
      }
    } catch (err) {
      // Si falla, el chat abre vacío — no bloquear el drawer (§18.7)
      console.warn('[STIRE Tutor] No se pudo cargar el historial:', err)
    }
  }

  // ─── Estado de la clave de API (§19) ────────────────────────────────────────
  async function fetchApiKeyStatus() {
    try {
      const res = await api.get<TutorApiKey>('/tutor/api-key')
      hasKey.value = res?.hasKey ?? false
      last4.value = res?.last4 ?? null
      // Si no tiene clave, mostrar el panel automáticamente
      if (!hasKey.value) showKeyPanel.value = true
    } catch (err) {
      console.warn('[STIRE Tutor] No se pudo verificar el estado de la clave:', err)
      hasKey.value = false
    }
  }

  async function saveApiKey(apiKey: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await api.put<TutorApiKey>('/tutor/api-key', { apiKey })
      hasKey.value = res?.hasKey ?? true
      last4.value = res?.last4 ?? null
      showKeyPanel.value = false
      // Reintento automático si el panel se abrió por un 428/422 (§19.2)
      if (pendingRetryAfterKey.value && lastUserMessage.value) {
        pendingRetryAfterKey.value = false
        await sendMessage(lastUserMessage.value)
      }
      return { ok: true }
    } catch (err: any) {
      const { extract } = useApiErrorMessage()
      const { detail, status } = extract(err)
      const errTexts: Record<number, string> = {
        400: detail || 'Formato de clave inválido.',
        422: 'Google no reconoce esa clave. Revisa que la copiaste completa.',
        503: 'No pude verificar la clave ahora. Inténtalo de nuevo en un minuto.',
        429: 'Demasiados intentos. Espera un minuto.'
      }
      return { ok: false, error: errTexts[status] || 'Error al guardar la clave.' }
    }
  }

  async function deleteApiKey(): Promise<{ ok: boolean; error?: string }> {
    try {
      await api.del('/tutor/api-key')
      hasKey.value = false
      last4.value = null
      showKeyPanel.value = true
      return { ok: true }
    } catch {
      return { ok: false, error: 'No se pudo eliminar la clave. Inténtalo de nuevo.' }
    }
  }

  // ─── Nivel de guía y orientación (§18.4, §21.2 T4a) ─────────────────────────
  async function fetchGuidanceLevel(activityId?: number) {
    const id = activityId ?? workspaceStore.currentExercise?.activityId
    const endpoint = id ? `/tutor/guidance?activityId=${id}` : '/tutor/guidance'
    try {
      const res = await api.get<TutorGuidance>(endpoint)
      guidanceLevel.value = res?.guidanceLevel ?? null
      tutorEnabled.value = res?.tutorEnabled ?? true
      dueReviews.value = res?.dueReviews ?? null
      contentLink.value = res?.contentLink ?? null
    } catch {
      // Si la llamada falla, dueReviews y contentLink quedan null y el chat sigue funcionando
      guidanceLevel.value = null
      tutorEnabled.value = true
      dueReviews.value = null
      contentLink.value = null
    }
  }

  // ─── Saludo proactivo ────────────────────────────────────────────────────────
  async function fetchGreeting() {
    if (hasGreeted.value) return
    hasGreeted.value = true
    isThinking.value = true
    startThinkingTimer()

    try {
      const res = await api.get<{ success: boolean; message: string; suggestedActivity: TutorSuggestedActivity | null }>('/tutor/greeting')
      messages.value.push({
        id: `msg-${Date.now()}-greeting`,
        sender: 'tutor',
        text: res?.message || '¡Hola! Soy tu Tutor IA de STIRE. ¿En qué necesitas orientación hoy?',
        timestamp: nowLabel(),
        suggestedActivity: res?.suggestedActivity ?? null
      })
    } catch (err) {
      console.warn('[STIRE Tutor] No se pudo obtener el saludo proactivo:', err)
      messages.value.push({
        id: `msg-${Date.now()}-greeting`,
        sender: 'tutor',
        text: '¡Hola! Soy tu Tutor IA de STIRE. ¿En qué necesitas orientación hoy?',
        timestamp: nowLabel()
      })
    } finally {
      isThinking.value = false
      stopThinkingTimer()
    }
  }

  // ─── Abrir / Cerrar drawer ──────────────────────────────────────────────────
  async function openDrawer() {
    isOpen.value = true
    // 1. Historial (solo la primera vez)
    await fetchHistory()
    // 2. Estado de la clave de API
    await fetchApiKeyStatus()
    // 3. Nivel de guía de la actividad actual
    await fetchGuidanceLevel()
    // 4. Saludo proactivo (solo la primera vez, después del historial)
    fetchGreeting()
  }

  function closeDrawer() {
    isOpen.value = false
    showKeyPanel.value = false
  }

  function toggleDrawer() {
    if (isOpen.value) {
      closeDrawer()
    } else {
      openDrawer()
    }
  }

  // ─── Enviar mensaje (§18.1) ──────────────────────────────────────────────────
  async function sendMessage(userText: string) {
    if (!userText.trim()) return

    lastUserMessage.value = userText

    messages.value.push({
      id: `msg-${Date.now()}-user`,
      sender: 'student',
      text: userText,
      timestamp: nowLabel()
    })

    isThinking.value = true
    startThinkingTimer()

    try {
      const res = await api.post<{
        success: boolean
        message: string
        response?: string
        suggestedActivity: TutorSuggestedActivity | null
        guidanceLevel?: 1 | 2 | 3 | null
      }>('/tutor/chat', {
        message: userText,
        context: {
          currentRoute: route.path,
          unitTitle: workspaceStore.currentExercise?.unitTitle || studentStore.activeUnit?.title,
          learningUnitId: studentStore.activeUnit?.id,
          activityTitle: workspaceStore.currentExercise?.title,
          activityId: workspaceStore.currentExercise?.activityId,
          currentCode: workspaceStore.code
        }
      })

      // Actualizar nivel de guía con la respuesta del backend
      if (res?.guidanceLevel !== undefined) {
        guidanceLevel.value = res.guidanceLevel ?? null
      }

      if (res && (res.message || res.response)) {
        messages.value.push({
          id: `msg-${Date.now()}-tutor`,
          sender: 'tutor',
          text: res.message || res.response || '',
          guidanceLevel: res.guidanceLevel ?? null,
          timestamp: nowLabel(),
          suggestedActivity: res.suggestedActivity ?? null
        })
      }
    } catch (err: any) {
      console.warn('[STIRE Tutor] Error al consultar Tutor IA:', err)
      const { text, needsKey, is403 } = friendlyTutorError(err)

      if (needsKey) {
        // 428/422: abrir panel de clave y marcar que hay un reintento pendiente
        showKeyPanel.value = true
        pendingRetryAfterKey.value = true
      }

      messages.value.push({
        id: `msg-${Date.now()}-error`,
        sender: 'tutor',
        text,
        timestamp: nowLabel(),
        isError: !is403,  // 403 no tiene Reintentar
        is403
      })
    } finally {
      isThinking.value = false
      stopThinkingTimer()
    }
  }

  // ─── Reintentar último mensaje (§18.1) ──────────────────────────────────────
  async function retryLastMessage() {
    if (!lastUserMessage.value) return
    // Eliminar el último mensaje de error del historial visual
    const lastIdx = [...messages.value].reverse().findIndex((m) => m.isError)
    if (lastIdx !== -1) {
      messages.value.splice(messages.value.length - 1 - lastIdx, 1)
    }
    await sendMessage(lastUserMessage.value)
  }

  // ─── Solicitudes rápidas (§18.4 — ya no cambian el nivel) ───────────────────
  function requestQuickHint(type: 'conceptual' | 'borde' | 'parada') {
    if (type === 'conceptual') {
      sendMessage('¿Cuál es la regla conceptual o teórica para este problema?')
    } else if (type === 'borde') {
      sendMessage('¿Cómo debo manejar los casos de frontera o entradas límite?')
    } else {
      sendMessage('¿Por qué mi algoritmo no produce la salida esperada?')
    }
  }

  // ─── Ir a actividad sugerida ────────────────────────────────────────────────
  function goToSuggestedActivity(activity: TutorSuggestedActivity) {
    closeDrawer()
    navigateTo(`/estudiante/evaluacion/${activity.activityId}`)
  }

  return {
    isOpen,
    isThinking,
    thinkingSeconds,
    messages,
    guidanceLevel,
    tutorEnabled,
    dueReviews,
    contentLink,
    hasKey,
    last4,
    showKeyPanel,
    lastUserMessage,
    pendingRetryAfterKey,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    sendMessage,
    retryLastMessage,
    requestQuickHint,
    goToSuggestedActivity,
    saveApiKey,
    deleteApiKey,
    fetchGuidanceLevel,
    fetchApiKeyStatus
  }
})
