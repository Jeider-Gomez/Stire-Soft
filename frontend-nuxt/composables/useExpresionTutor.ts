import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { useTutorStore } from '~/stores/tutor'
import { DURACION_REACCION, EVENTO_RESULTADO, expresionTutor } from '~/utils/mascotaTutor'

/**
 * La cara que pone el Tutor según lo que pasa en la página (utils/mascotaTutor.ts): duerme si el docente lo apagó,
 * piensa mientras llega la respuesta, mueve la boca al responder, atiende cuando el estudiante escribe y reacciona al
 * resultado de «Probar» o «Entregar».
 */
export function useExpresionTutor(escribiendo?: Ref<boolean>) {
  const tutor = useTutorStore()
  const reaccion = ref<'acierto' | 'error' | null>(null)
  const hablando = ref(false)
  let finReaccion: ReturnType<typeof setTimeout> | undefined
  let finHabla: ReturnType<typeof setTimeout> | undefined

  function alResultado(e: Event) {
    reaccion.value = (e as CustomEvent<{ todoBien: boolean }>).detail?.todoBien ? 'acierto' : 'error'
    clearTimeout(finReaccion)
    finReaccion = setTimeout(() => { reaccion.value = null }, DURACION_REACCION)
  }

  watch(() => tutor.messages.length, (n, antes) => {
    const ultimo = tutor.messages[n - 1]
    if (n <= (antes ?? 0) || !ultimo || ultimo.sender === 'student' || ultimo.isError) return
    hablando.value = true
    clearTimeout(finHabla)
    finHabla = setTimeout(() => { hablando.value = false }, 1600)
  })

  onMounted(() => window.addEventListener(EVENTO_RESULTADO, alResultado))
  onBeforeUnmount(() => {
    window.removeEventListener(EVENTO_RESULTADO, alResultado)
    clearTimeout(finReaccion)
    clearTimeout(finHabla)
  })

  return computed(() => expresionTutor({
    activo: tutor.tutorEnabled,
    pensando: tutor.isThinking,
    escribiendo: escribiendo?.value ?? false,
    ultimoError: tutor.messages[tutor.messages.length - 1]?.isError === true,
    hablando: hablando.value,
    reaccion: reaccion.value,
  }))
}
