<template>
  <!-- Hablarle al Tutor (UI-05, Jeider 17/10): el micrófono convierte la voz en texto en el campo; el estudiante lo revisa
       y lo envía. Solo aparece donde el navegador lo permite (Chrome y Edge); el audio lo procesa el navegador. -->
  <span v-if="disponible" class="relative shrink-0 flex">
    <button
      type="button"
      class="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-colors"
      :class="escuchando ? 'bg-semantico-falla/10 border-semantico-falla/40 text-semantico-falla animate-pulse' : 'bg-white border-slate-200 text-slate-500 hover:text-stire-blue'"
      :aria-pressed="escuchando"
      :aria-label="escuchando ? 'Dejar de dictar' : 'Dictar la pregunta con la voz'"
      :title="escuchando ? 'Escuchando… toca para terminar' : 'Dictar con la voz'"
      :disabled="desactivado"
      @mousedown.prevent
      @click="alternar">
      <MicOff v-if="escuchando" :size="18" aria-hidden="true" /><Mic v-else :size="18" aria-hidden="true" />
    </button>
    <span v-if="aviso" role="status" class="sr-only">{{ aviso }}</span>
    <p v-if="error" role="alert" class="absolute bottom-full right-0 mb-2 w-64 p-2.5 rounded-lg border border-semantico-falla/40 bg-white text-xs text-semantico-falla shadow-md">{{ error }}</p>
  </span>
</template>

<script setup lang="ts">
import { Mic, MicOff } from 'lucide-vue-next'
import { mensajeErrorVoz, unirDictado } from '~/utils/vozTutor'

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
const emit = defineEmits<{ texto: [valor: string] }>()

const disponible = ref(false)
const escuchando = ref(false)
const aviso = ref('')
/** Visible, no solo para el lector de pantalla: sin él, un fallo del dictado no se notaba. */
const error = ref<string | null>(null)
let reconocedor: Reconocedor | null = null

function constructor(): ConstructorReconocedor | null {
  const w = window as unknown as { SpeechRecognition?: ConstructorReconocedor; webkitSpeechRecognition?: ConstructorReconocedor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}
onMounted(() => { disponible.value = !!constructor() })

function alternar() {
  if (escuchando.value) { reconocedor?.stop(); return }
  const C = constructor()
  if (!C) return
  error.value = null
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
    error.value = mensajeErrorVoz(e.error)
    aviso.value = error.value ?? ''
  }
  reconocedor.onend = () => { escuchando.value = false; if (!fallo) aviso.value = 'Listo: revisa el texto y envíalo.' }
  escuchando.value = true
  aviso.value = 'Escuchando…'
  try {
    reconocedor.start()
  } catch {
    escuchando.value = false
    error.value = mensajeErrorVoz('')
  }
}
onBeforeUnmount(() => reconocedor?.stop())
</script>
