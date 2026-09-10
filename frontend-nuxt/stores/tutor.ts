import { defineStore } from 'pinia'
import type { TutorMessage } from '~/types'
import { useAuthStore } from './auth'
import { useApi } from '~/composables/useApi'

export const useTutorStore = defineStore('tutor', () => {
  const api = useApi()
  const authStore = useAuthStore()

  const isOpen = ref(false)
  const isThinking = ref(false)
  const activeScaffoldingLevel = ref<1 | 2 | 3>(1)

  const messages = ref<TutorMessage[]>([
    {
      id: 'msg-0',
      sender: 'tutor',
      text: '¡Hola, Pedro! Soy tu Tutor IA. Estoy aquí para guiarte en tu lógica sin darte la solución directa. ¿En qué parte del ejercicio sientes dudas?',
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
      // 1. Petición HTTP Real al Backend NestJS: POST /tutor/chat (Insumo 12 §EST-V04)
      const res = await api.post<{ success: boolean; message: string }>('/tutor/chat', {
        message: userText
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
        text: `⚠ **Servicio de Tutoría No Disponible:** ${typeof msg === 'string' ? msg : 'Error de conexión con el backend'}. Por favor intenta de nuevo en unos segundos.`,
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
      sendMessage('¿Cuál es la regla teórica para este problema?', 1)
    } else if (type === 'borde') {
      activeScaffoldingLevel.value = 2
      sendMessage('¿Cómo debo manejar los casos límite con arreglos vacíos o n=0?', 2)
    } else {
      activeScaffoldingLevel.value = 3
      sendMessage('¿Por qué mi condición de parada no termina?', 3)
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
