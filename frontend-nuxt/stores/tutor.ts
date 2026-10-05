import { contextoSegunPantalla } from '~/utils/contextoTutor'
import { defineStore } from 'pinia'
import type { TutorMessage, TutorSuggestedActivity, TutorApiKey, TutorGuidance } from '~/types'
import { useAuthStore } from './auth'
import { useWorkspaceStore } from './workspace'
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
  const route = useRoute()

  // ─── Estado del drawer ──────────────────────────────────────────────────────
  const isOpen = ref(false)
  // UI-05: el estudiante pidió resolver el ejercicio por pasos (subpreguntas); vale para el próximo mensaje.
  const modoPorPasos = ref(false)
  // UI-04: la explicación de la lección no le sirvió; el Tutor la explica de otra forma (vale para el próximo mensaje).
  const modoOtraExplicacion = ref(false)
  // UI-05: tras varios intentos fallidos, un ejemplo resuelto de un problema parecido (no el suyo).
  const modoEjemplo = ref(false)
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
  /**
   * El proyecto propio abierto (docs/DISENO_PROYECTOS.md, fase 3): la página del proyecto lo pone y lo quita. Con él, el
   * Tutor guía en el proyecto en vez de en un ejercicio.
   */
  const proyectoAbierto = ref<{ titulo: string; tipo: 'web' | 'javascript' | 'pseudocodigo' | 'diagrama'; archivos: Array<{ nombre: string; contenido: string }> } | null>(null)
  function setProyectoAbierto(p: typeof proyectoAbierto.value) {
    proyectoAbierto.value = p
  }
  const tutorEnabled = ref(true)
  const dueReviews = ref<TutorGuidance['dueReviews']>(null)
  const contentLink = ref<TutorGuidance['contentLink']>(null)
  /** Refuerzo que incluye la actividad actual (ayuda ampliada); null si no hay. */
  const refuerzo = ref<string | null>(null)

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
    } catch (err) {
      const { extract } = useApiErrorMessage()
      const { detail, status } = extract(err)
      const errTexts: Record<number, string> = {
        400: detail || 'Formato de clave inválido.',
        422: 'Google no reconoce esa clave. Revisa que la copiaste completa.',
        // El 503 puede ser «Google no responde» (reintentar sirve) o «el servidor no tiene el cifrado
        // configurado» (reintentar no sirve): el backend distingue cuál es en `error`.
        503: detail || 'No pude verificar la clave ahora. Inténtalo de nuevo en un minuto.',
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

  // ─── Nivel de guía y orientación (§18.4, §21.2 T4a, §22 T3) ─────────────────
  async function fetchGuidanceLevel(activityId?: number) {
    // §22 T3: usar activityId del workspace SOLO cuando la ruta activa es una
    // evaluación. Si el estudiante navega a /estudiante sin recargar, el store
    // conserva currentExercise de la actividad anterior; no debemos enviarlo.
    const isEvaluacionRoute = /^\/estudiante\/evaluacion\/\d+/.test(route.path)
    const id = activityId ?? (isEvaluacionRoute ? workspaceStore.currentExercise?.activityId : undefined)
    const endpoint = id ? `/tutor/guidance?activityId=${id}` : '/tutor/guidance'
    try {
      const res = await api.get<TutorGuidance>(endpoint)
      guidanceLevel.value = res?.guidanceLevel ?? null
      tutorEnabled.value = res?.tutorEnabled ?? true
      dueReviews.value = res?.dueReviews ?? null
      contentLink.value = res?.contentLink ?? null
      refuerzo.value = res?.refuerzo ?? null
    } catch {
      // Si la llamada falla, dueReviews y contentLink quedan null y el chat sigue funcionando
      guidanceLevel.value = null
      tutorEnabled.value = true
      dueReviews.value = null
      contentLink.value = null
      refuerzo.value = null
    }
  }

  // ─── Saludo proactivo ────────────────────────────────────────────────────────
  async function fetchGreeting() {
    if (hasGreeted.value) return
    hasGreeted.value = true
    isThinking.value = true
    startThinkingTimer()

    try {
      const res = await api.get<{ success: boolean; message: string; suggestedActivity: TutorSuggestedActivity | null; reemplazaAnterior?: boolean }>('/tutor/greeting')
      // El servidor cambió el saludo anterior por este: se quita el viejo que trajo el historial.
      const ultimo = messages.value[messages.value.length - 1]
      if (res?.reemplazaAnterior && ultimo?.sender === 'tutor' && /^¡Buen(os días|as tardes|as noches)!/.test(ultimo.text)) messages.value.pop()
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
  /** «Resolverlo por pasos con el Tutor» (UI-05): el Tutor divide el problema en subpreguntas y plantea la primera. */
  async function resolverPorPasos() {
    await openDrawer()
    modoPorPasos.value = true
    await sendMessage('Quiero resolver este ejercicio por pasos.')
  }

  /** UI-05: cambiar de táctica tras varios fallos — ver resuelto un problema parecido, no el suyo. */
  async function verEjemploParecido() {
    await openDrawer()
    modoEjemplo.value = true
    await sendMessage('Quiero ver resuelto un ejemplo parecido a este ejercicio.')
  }

  /** «¿Te sirvió esta explicación?» → No: el Tutor explica la lección de otra forma (UI-04). */
  async function pedirOtraExplicacion(queNoQuedoClaro?: string) {
    await openDrawer()
    modoOtraExplicacion.value = true
    const detalle = queNoQuedoClaro?.trim() ? ` No me quedó claro: ${queNoQuedoClaro.trim().slice(0, 300)}` : ''
    await sendMessage(`La explicación de esta lección no me sirvió. ¿Me la explicas de otra forma?${detalle}`)
  }

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
    // El modo por pasos vale para este mensaje; los siguientes siguen la conversación normal.
    const modoEnvio = modoPorPasos.value ? 'por-pasos' as const : modoEjemplo.value ? 'ejemplo-parecido' as const : modoOtraExplicacion.value ? 'otra-explicacion' as const : undefined
    modoPorPasos.value = false
    modoEjemplo.value = false
    modoOtraExplicacion.value = false

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
        context: proyectoAbierto.value && route.path.startsWith('/estudiante/proyectos/')
          ? {
              currentRoute: route.path,
              proyectoTitulo: proyectoAbierto.value.titulo,
              proyectoTipo: proyectoAbierto.value.tipo,
              // Todos los archivos, cada uno con su nombre, para que el Tutor vea el proyecto completo.
              currentCode: proyectoAbierto.value.archivos.map((a) => `/* ${a.nombre} */\n${a.contenido}`).join('\n\n'),
              codeLanguage: ({ web: 'html', javascript: 'javascript', pseudocodigo: 'text', diagrama: 'text' } as const)[proyectoAbierto.value.tipo],
            }
          : contextoSegunPantalla(route.path, workspaceStore.currentExercise ?? null, {
              js: workspaceStore.code, html: workspaceStore.htmlCode, css: workspaceStore.cssCode,
            }, {
              // Señales (src/tutor/tutor-senales.ts): error probable de la salida, juicio de confianza y modo por pasos.
              errorProbable: workspaceStore.errorProbable ?? undefined,
              confianza: workspaceStore.calibracion?.confianza,
              acerto: workspaceStore.calibracion?.acerto,
              modo: modoEnvio,
            })
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
    } catch (err) {
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
    pedirOtraExplicacion,
    modoPorPasos,
    resolverPorPasos,
    verEjemploParecido,
    isOpen,
    isThinking,
    thinkingSeconds,
    messages,
    guidanceLevel,
    proyectoAbierto,
    setProyectoAbierto,
    tutorEnabled,
    dueReviews,
    contentLink,
    refuerzo,
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
