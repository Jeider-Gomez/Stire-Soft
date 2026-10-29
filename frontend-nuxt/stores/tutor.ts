import { contextoSegunPantalla, ultimaPruebaDe } from '~/utils/contextoTutor'
import { conceptosDelEjercicio } from '~/utils/conceptosEjercicio'
import { saludoDeRespaldo } from '~/utils/saludoTutor'
import { enviarEnVivo } from '~/utils/tutorEnVivo'
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
  const baseUrl = useRuntimeConfig().public.apiBase || 'http://localhost:3001'

  // ─── Estado del drawer ──────────────────────────────────────────────────────
  const isOpen = ref(false)
  // UI-05: el estudiante pidió resolver el ejercicio por pasos (subpreguntas); vale para el próximo mensaje.
  const modoPorPasos = ref(false)
  // UI-04: la explicación de la lección no le sirvió; el Tutor la explica de otra forma (vale para el próximo mensaje).
  const modoOtraExplicacion = ref(false)
  // UI-05: tras varios intentos fallidos, un ejemplo resuelto de un problema parecido (no el suyo).
  const modoEjemplo = ref(false)
  /**
   * UI-05 · modo acompañado (Jeider 17/10: «que el Tutor intervenga como una persona real si se estanca»): a diferencia
   * de los otros modos, vale para TODA la conversación hasta que el estudiante lo termine o cambie de ejercicio.
   */
  const modoAcompanado = ref(false)
  watch(() => workspaceStore.currentExercise?.activityId, () => { modoAcompanado.value = false })
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
        text: res?.message || saludoDeRespaldo(),
        timestamp: nowLabel(),
        suggestedActivity: res?.suggestedActivity ?? null
      })
    } catch (err) {
      console.warn('[STIRE Tutor] No se pudo obtener el saludo proactivo:', err)
      messages.value.push({
        id: `msg-${Date.now()}-greeting`,
        sender: 'tutor',
        text: saludoDeRespaldo(),
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
    await openDrawer({ conPregunta: true })
    modoPorPasos.value = true
    await sendMessage('Quiero resolver este ejercicio por pasos.')
  }

  /** UI-05: tras varios fallos, el estudiante acepta que el Tutor lo acompañe hasta resolverlo. */
  async function acompanar() {
    await openDrawer({ conPregunta: true })
    modoAcompanado.value = true
    await sendMessage('Llevo varios intentos con este ejercicio y no me sale. ¿Me acompañas a resolverlo paso a paso?')
  }

  function terminarAcompanamiento() {
    modoAcompanado.value = false
  }

  /** UI-05: cambiar de táctica tras varios fallos — ver resuelto un problema parecido, no el suyo. */
  async function verEjemploParecido() {
    await openDrawer({ conPregunta: true })
    modoEjemplo.value = true
    await sendMessage('Quiero ver resuelto un ejemplo parecido a este ejercicio.')
  }

  /** «¿Te sirvió esta explicación?» → No: el Tutor explica la lección de otra forma (UI-04). */
  async function pedirOtraExplicacion(queNoQuedoClaro?: string) {
    await openDrawer({ conPregunta: true })
    modoOtraExplicacion.value = true
    const detalle = queNoQuedoClaro?.trim() ? ` No me quedó claro: ${queNoQuedoClaro.trim().slice(0, 300)}` : ''
    await sendMessage(`La explicación de esta lección no me sirvió. ¿Me la explicas de otra forma?${detalle}`)
  }

  /** «Pedirle al Tutor que lo explique» en un recurso que no carga (UI-04): el Tutor no ve el video, explica el tema. */
  async function preguntarPorRecurso(titulo: string) {
    await openDrawer({ conPregunta: true })
    await sendMessage(`No me carga el recurso «${titulo}». ¿Me explicas lo que muestra?`)
  }

  /**
   * Abre el panel. Con `conPregunta` (un botón que abre el Tutor con una pregunta ya escrita) no se pide el saludo
   * proactivo: llegaba después de la pregunta y quedaba debajo, como si fuera la respuesta (Jeider, 17/10: pidió que
   * explicara un video y el Tutor contestó «tienes pendiente repasar…»). Dentro de un ejercicio tampoco se saluda (29/10,
   * Jeider: «lo de los saludos no en el ejercicio»): ahí está resolviendo algo, y los repasos tienen su lugar en el inicio.
   */
  async function openDrawer(opciones: { conPregunta?: boolean } = {}) {
    if (opciones.conPregunta || /^\/estudiante\/evaluacion\/\d+/.test(route.path)) hasGreeted.value = true
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

  /** Los conceptos que pide el ejercicio de programar abierto (los mismos de «Lo que vas a usar»). */
  function conceptosParaTutor(): string[] | undefined {
    const ej = workspaceStore.currentExercise
    if (!ej || ej.questionType !== 'coding') return undefined
    const claves = conceptosDelEjercicio({ enunciado: ej.description, plantilla: ej.initialCode, ejemplo: workspaceStore.publicTestCases[0], unidad: ej.unitTitle }).map((c) => c.clave)
    return claves.length > 0 ? claves : undefined
  }

  /** Lo que el estudiante dijo con la voz, en texto (POST /tutor/transcribir, con su clave de Google AI Studio). */
  async function transcribir(audio: Blob): Promise<string> {
    const datos = new FormData()
    datos.append('audio', audio, 'voz.wav')
    const res = await api.post<{ texto: string }>('/tutor/transcribir', datos)
    return res.texto
  }

  // ─── Enviar mensaje (§18.1) ──────────────────────────────────────────────────
  async function sendMessage(userText: string) {
    if (!userText.trim()) return
    // El modo por pasos vale para este mensaje; los siguientes siguen la conversación normal.
    const modoEnvio = modoAcompanado.value ? 'acompanado' as const : modoPorPasos.value ? 'por-pasos' as const : modoEjemplo.value ? 'ejemplo-parecido' as const : modoOtraExplicacion.value ? 'otra-explicacion' as const : undefined
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

    const cuerpo = {
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
            conceptos: conceptosParaTutor(),
          }, ultimaPruebaDe(workspaceStore.publicTestCases))
    }
    // Ítem 2 de la evaluación heurística: la respuesta aparece a medida que llega (SSE). Si el servidor todavía no tiene
    // esa ruta, se usa el chat de siempre.
    // En un objeto: TypeScript no sigue lo que se asigna dentro de la función que recibe los trozos.
    const vivo: { m: TutorMessage | null } = { m: null }
    try {
      const fin = await enviarEnVivo(`${baseUrl}/tutor/chat/stream`, authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}, cuerpo, (trozo) => {
        if (!vivo.m) {
          isThinking.value = false
          stopThinkingTimer()
          messages.value.push({ id: `msg-${Date.now()}-tutor`, sender: 'tutor', text: '', timestamp: nowLabel() })
          vivo.m = messages.value[messages.value.length - 1]!
        }
        vivo.m.text += trozo
      })
      const res = fin ?? await api.post<{
        success: boolean
        message: string
        response?: string
        suggestedActivity: TutorSuggestedActivity | null
        guidanceLevel?: 1 | 2 | 3 | null
      }>('/tutor/chat', cuerpo)

      // Actualizar nivel de guía con la respuesta del backend
      if (res?.guidanceLevel !== undefined) {
        guidanceLevel.value = res.guidanceLevel ?? null
      }

      const texto = ('response' in res ? res.message || res.response : res.message) || ''
      if (vivo.m) {
        // El texto definitivo (el que se guardó, ya pasado entero por la barrera) reemplaza al que llegó por partes.
        const m = vivo.m
        m.text = texto || m.text
        m.guidanceLevel = res.guidanceLevel ?? null
        m.suggestedActivity = (res.suggestedActivity as TutorSuggestedActivity | null) ?? null
      } else if (texto) {
        messages.value.push({
          id: `msg-${Date.now()}-tutor`,
          sender: 'tutor',
          text: texto,
          guidanceLevel: res.guidanceLevel ?? null,
          timestamp: nowLabel(),
          suggestedActivity: (res.suggestedActivity as TutorSuggestedActivity | null) ?? null
        })
      }
    } catch (err) {
      console.warn('[STIRE Tutor] Error al consultar Tutor IA:', err)
      const { text, needsKey, is403 } = friendlyTutorError(err)
      // Si se cortó a mitad, se quita lo que alcanzó a llegar: queda el aviso con «Reintentar».
      if (vivo.m) messages.value = messages.value.filter((m) => m !== vivo.m)

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
    preguntarPorRecurso,
    modoPorPasos,
    resolverPorPasos,
    modoAcompanado,
    acompanar,
    terminarAcompanamiento,
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
    transcribir,
    retryLastMessage,
    requestQuickHint,
    goToSuggestedActivity,
    saveApiKey,
    deleteApiKey,
    fetchGuidanceLevel,
    fetchApiKeyStatus
  }
})
