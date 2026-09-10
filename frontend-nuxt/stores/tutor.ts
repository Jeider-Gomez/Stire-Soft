import { defineStore } from 'pinia'
import type { TutorMessage } from '~/types'
import { useAuthStore } from './auth'
import { useWorkspaceStore } from './workspace'
import { useStudentStore } from './student'
import { useApi } from '~/composables/useApi'

export const useTutorStore = defineStore('tutor', () => {
  const api = useApi()
  const authStore = useAuthStore()
  const workspaceStore = useWorkspaceStore()
  const studentStore = useStudentStore()
  const route = useRoute()

  const isOpen = ref(false)
  const isThinking = ref(false)
  const activeScaffoldingLevel = ref<1 | 2 | 3>(1)

  const messages = ref<TutorMessage[]>([
    {
      id: 'msg-0',
      sender: 'tutor',
      text: '¡Hola! Soy tu Tutor IA de STIRE. Estoy aquí para acompañar tu razonamiento pedagógico paso a paso. ¿En qué parte del algoritmo o ejercicio necesitas orientación?',
      timestamp: 'Ahora'
    }
  ])

  function openDrawer() {
    isOpen.value = true
  }

  function closeDrawer() {
    isOpen.value = false
  }

  function toggleDrawer() {
    isOpen.value = !isOpen.value
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
      const res = await api.post<{ success: boolean; message: string }>('/tutor/chat', {
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
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

  return {
    isOpen,
    isThinking,
    activeScaffoldingLevel,
    messages,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    sendMessage,
    requestQuickHint
  }
})
