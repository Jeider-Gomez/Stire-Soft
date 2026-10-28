<template>
  <!-- Hablarle al Tutor (UI-05, Jeider 17/10). Primero el dictado del navegador, que escribe mientras hablas; si en este
       navegador no sirve, se graba la voz y Gemini la pasa a texto con la clave del estudiante, y se recuerda para la
       próxima vez. En los dos casos el texto queda en el campo para revisarlo y enviarlo. -->
  <span v-if="modo" class="relative shrink-0 flex">
    <button
      type="button"
      class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
      :class="estado === 'escuchando' ? 'bg-semantico-falla/10 text-semantico-falla animate-pulse' : 'text-slate-500 hover:text-stire-blue hover:bg-slate-100'"
      :aria-pressed="estado === 'escuchando'"
      :aria-label="etiqueta"
      :title="etiqueta"
      :disabled="desactivado || estado === 'procesando'"
      @mousedown.prevent
      @click="alternar">
      <Loader2 v-if="estado === 'procesando'" :size="18" class="animate-spin" aria-hidden="true" />
      <MicOff v-else-if="estado === 'escuchando'" :size="18" aria-hidden="true" />
      <Mic v-else :size="18" aria-hidden="true" />
    </button>
    <span v-if="aviso" role="status" class="sr-only">{{ aviso }}</span>
    <p v-if="estado === 'escuchando' && modo === 'grabacion'" class="absolute bottom-full right-0 mb-2 whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-md">
      Grabando {{ segundos }} s · toca para terminar
    </p>
    <MensajeError v-if="error" class="absolute bottom-full right-0 mb-2 w-64 p-2.5 rounded-lg border border-semantico-falla/40 bg-white text-xs shadow-md">{{ error }}</MensajeError>
  </span>
</template>

<script setup lang="ts">
import { Loader2, Mic, MicOff } from 'lucide-vue-next'
import { useTutorStore } from '~/stores/tutor'
import { codificarWav, dictadoNoSirve, mensajeErrorVoz, modoDeVoz, remuestrear, unirDictado } from '~/utils/vozTutor'

/** Lo que usamos del reconocimiento de voz del navegador (no viene en los tipos de TypeScript). */
interface ResultadoVoz { isFinal: boolean; 0: { transcript: string } }
interface EventoVoz { resultIndex: number; results: ArrayLike<ResultadoVoz> }
interface Reconocedor {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((e: EventoVoz) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
  start: () => void
  stop: () => void
}
type ConstructorReconocedor = new () => Reconocedor

const props = defineProps<{ escrito: string; desactivado?: boolean }>()
const emit = defineEmits<{ texto: [valor: string]; activo: [valor: boolean] }>()
const tutorStore = useTutorStore()
const { messageOf } = useApiErrorMessage()

/** Un minuto basta para una pregunta y cabe en lo que acepta el servidor. */
const MAX_SEGUNDOS = 60
/** Este navegador ya demostró que su dictado no sirve: se graba directamente. */
const CLAVE_GRABAR = 'stire-voz-grabar'

const modo = ref<'dictado' | 'grabacion' | null>(null)
const estado = ref<'listo' | 'escuchando' | 'procesando'>('listo')
const segundos = ref(0)
const aviso = ref('')
/** Visible, no solo para el lector de pantalla: sin él, un fallo de la voz no se notaba. */
const error = ref<string | null>(null)
const etiqueta = computed(() =>
  estado.value === 'procesando' ? 'Pasando tu voz a texto…' : estado.value === 'escuchando' ? 'Terminar y pasar a texto' : 'Hablarle al Tutor con la voz',
)

watch(estado, (e) => emit('activo', e !== 'listo'))

let reconocedor: Reconocedor | null = null
let grabadora: MediaRecorder | null = null
let microfono: MediaStream | null = null
let reloj: ReturnType<typeof setInterval> | null = null

function constructor(): ConstructorReconocedor | null {
  const w = window as unknown as { SpeechRecognition?: ConstructorReconocedor; webkitSpeechRecognition?: ConstructorReconocedor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}
let hayGrabadora = false
onMounted(() => {
  hayGrabadora = typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  let fallo = false
  try { fallo = localStorage.getItem(CLAVE_GRABAR) === '1' } catch { /* sin almacenamiento: se intenta el dictado */ }
  modo.value = modoDeVoz(!!constructor(), hayGrabadora, fallo)
})

function fallar(codigo: string) {
  estado.value = 'listo'
  error.value = mensajeErrorVoz(codigo)
  aviso.value = error.value ?? ''
}

function alternar() {
  if (estado.value === 'escuchando') {
    reconocedor?.stop()
    if (grabadora?.state === 'recording') grabadora.stop()
    return
  }
  error.value = null
  if (modo.value === 'dictado') dictar()
  else if (modo.value === 'grabacion') void grabar()
}

/** Celular: el navegador escribe mientras el estudiante habla. */
function dictar() {
  const C = constructor()
  if (!C) return
  const base = props.escrito
  reconocedor = new C()
  reconocedor.lang = 'es-CO'
  reconocedor.interimResults = true
  reconocedor.continuous = false
  reconocedor.onresult = (e) => {
    const dicho = Array.from(e.results).map((r) => r[0].transcript).join(' ')
    emit('texto', unirDictado(base, dicho))
  }
  let fallo = false
  reconocedor.onerror = (e) => {
    fallo = true
    if (dictadoNoSirve(e.error) && hayGrabadora) {
      // El dictado de este navegador no sirve: se pasa a grabar sin que el estudiante tenga que hacer nada más.
      try { localStorage.setItem(CLAVE_GRABAR, '1') } catch { /* solo se pierde el recuerdo */ }
      modo.value = 'grabacion'
      void grabar()
      return
    }
    fallar(e.error)
  }
  reconocedor.onend = () => {
    if (modo.value !== 'dictado') return
    estado.value = 'listo'
    if (!fallo) aviso.value = 'Listo: revisa el texto y envíalo.'
  }
  estado.value = 'escuchando'
  aviso.value = 'Escuchando…'
  try {
    reconocedor.start()
  } catch {
    fallar('')
  }
}

/** Computador: se graba la voz, se pasa a WAV y el servidor la convierte en texto con Gemini. */
async function grabar() {
  try {
    microfono = await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch (err: unknown) {
    fallar(err instanceof DOMException ? err.name : '')
    return
  }
  const partes: Blob[] = []
  grabadora = new MediaRecorder(microfono)
  grabadora.ondataavailable = (e) => { if (e.data.size) partes.push(e.data) }
  grabadora.onstop = () => void pasarATexto(new Blob(partes, { type: grabadora?.mimeType || 'audio/webm' }))
  grabadora.start()
  estado.value = 'escuchando'
  aviso.value = 'Grabando. Toca de nuevo para terminar.'
  segundos.value = 0
  reloj = setInterval(() => {
    segundos.value++
    if (segundos.value >= MAX_SEGUNDOS && grabadora?.state === 'recording') grabadora.stop()
  }, 1000)
}

function soltarMicrofono() {
  if (reloj) clearInterval(reloj)
  reloj = null
  microfono?.getTracks().forEach((t) => t.stop())
  microfono = null
}

async function pasarATexto(grabacion: Blob) {
  soltarMicrofono()
  estado.value = 'procesando'
  aviso.value = 'Pasando tu voz a texto…'
  try {
    const contexto = new AudioContext()
    const audio = await contexto.decodeAudioData(await grabacion.arrayBuffer())
    void contexto.close()
    const muestras = remuestrear(audio.getChannelData(0), audio.sampleRate)
    const wav = new Blob([codificarWav(muestras, muestras === audio.getChannelData(0) ? audio.sampleRate : 16000)], { type: 'audio/wav' })
    const texto = await tutorStore.transcribir(wav)
    emit('texto', unirDictado(props.escrito, texto))
    estado.value = 'listo'
    aviso.value = 'Listo: revisa el texto y envíalo.'
  } catch (err: unknown) {
    estado.value = 'listo'
    error.value = messageOf(err, 'No se pudo pasar tu voz a texto. Intenta de nuevo o escribe tu pregunta.')
    aviso.value = error.value
  }
}

onBeforeUnmount(() => {
  reconocedor?.stop()
  if (grabadora?.state === 'recording') {
    grabadora.onstop = null
    grabadora.stop()
  }
  soltarMicrofono()
})
</script>
