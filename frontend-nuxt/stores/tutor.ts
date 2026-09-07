import { defineStore } from 'pinia'
import type { TutorMessage } from '~/types'
import { useAuthStore } from './auth'

export const useTutorStore = defineStore('tutor', () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:3001'
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
      const res = await $fetch<{ success: boolean; message: string }>(`${apiBase}/tutor/chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        body: {
          message: userText
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
        isThinking.value = false
        return
      }
    } catch (err: any) {
      console.warn('[STIRE Tutor] Backend tutor offline o modo desarrollo, usando andamiaje socrático local:', err.message)
    }

    // 2. Fallback de andamiaje socrático adaptativo local en 3 niveles
    setTimeout(() => {
      let responseText = ''
      if (level === 1) {
        responseText = '💡 **Pista Conceptual:** Recuerda que un ciclo `while` continúa ejecutándose mientras su condición sea verdadera. Si el acumulador no cambia dentro del bloque, la condición nunca llegará a ser falsa.'
      } else if (level === 2) {
        responseText = '🧭 **Pregunta Guía:** Observa el valor de la variable `i` en la línea 4. ¿Se está incrementando en cada iteración o mantiene su valor inicial?'
      } else {
        responseText = '🔍 **Localización de la Falla:** Revisa el bloque interno de las líneas 5 a 7. Tu condición de parada evalúa `i <= fin`, pero debes asegurar que el acumulador sume únicamente en caso de que `i % 2 === 0`.'
      }

      messages.value.push({
        id: `msg-${Date.now()}-tutor`,
        sender: 'tutor',
        text: responseText,
        scaffoldingLevel: level,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })

      isThinking.value = false
    }, 500)
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
