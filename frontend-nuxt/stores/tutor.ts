import { defineStore } from 'pinia'
import type { TutorMessage, TutorSuggestedActivity } from '~/types'
import { useAuthStore } from './auth'
import { useWorkspaceStore } from './workspace'
import { useStudentStore } from './student'
import { useApi } from '~/composables/useApi'

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export const useTutorStore = defineStore('tutor', () => {
  const api = useApi()
  const authStore = useAuthStore()
  const workspaceStore = useWorkspaceStore()
  const studentStore = useStudentStore()
  const route = useRoute()

  const isOpen = ref(false)
  const isThinking = ref(false)
  const activeScaffoldingLevel = ref<1 | 2 | 3>(1)
  const hasGreeted = ref(false)

  const messages = ref<TutorMessage[]>([])

  // El saludo real (con tu seguimiento: repasos vencidos, mastery bajo) se pide al backend la
  // primera vez que abres el Tutor -- antes había un texto genérico fijo aquí mismo, que nunca
  // sabía nada de ti. Se pide una sola vez por sesión, no cada apertura del drawer.
  async function fetchGreeting() {
    if (hasGreeted.value) return
    hasGreeted.value = true
    isThinking.value = true

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
    }
  }

  function openDrawer() {
    isOpen.value = true
    fetchGreeting()
  }

  function closeDrawer() {
    isOpen.value = false
  }

  function toggleDrawer() {
    isOpen.value = !isOpen.value
    if (isOpen.value) fetchGreeting()
  }

  async function sendMessage(userText: string, levelOverride?: 1 | 2 | 3) {
    if (!userText.trim()) return

    const level = levelOverride || activeScaffoldingLevel.value

    messages.value.push({
      id: `msg-${Date.now()}-user`,
      sender: 'student',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })

    isThinking.value = true

    try {
      // Petición HTTP con contexto completo de pantalla
      const res = await api.post<{ success: boolean; message: string; suggestedActivity: TutorSuggestedActivity | null }>('/tutor/chat', {
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

      if (res && res.message) {
        messages.value.push({
          id: `msg-${Date.now()}-tutor`,
          sender: 'tutor',
          text: res.message,
          scaffoldingLevel: level,
          timestamp: nowLabel(),
          suggestedActivity: res.suggestedActivity ?? null
        })
        return
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Error de comunicación'
      console.warn('[STIRE Tutor] Error al consultar Tutor IA:', msg)
      messages.value.push({
        id: `msg-${Date.now()}-tutor`,
        sender: 'tutor',
        text: `⚠ **Tutor Temporalmente Indisponible:** ${typeof msg === 'string' ? msg : 'Error de comunicación'}. Intenta nuevamente en unos instantes.`,
        scaffoldingLevel: level,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
    } finally {
      isThinking.value = false
    }
  }

  function requestQuickHint(type: 'conceptual' | 'borde' | 'parada') {
    if (type === 'conceptual') {
      activeScaffoldingLevel.value = 1
      sendMessage('¿Cuál es la regla conceptual o teórica para este problema?', 1)
    } else if (type === 'borde') {
      activeScaffoldingLevel.value = 2
      sendMessage('¿Cómo debo manejar los casos de frontera o entradas límite?', 2)
    } else {
      activeScaffoldingLevel.value = 3
      sendMessage('¿Por qué mi algoritmo no produce la salida esperada?', 3)
    }
  }

  function goToSuggestedActivity(activity: TutorSuggestedActivity) {
    closeDrawer()
    navigateTo(`/estudiante/evaluacion/${activity.activityId}`)
  }

  return {
    isOpen,
    isThinking,
    activeScaffoldingLevel,
    messages,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    sendMessage,
    requestQuickHint,
    goToSuggestedActivity
  }
})
