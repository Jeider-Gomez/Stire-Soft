<template>
  <!-- Quién y cuándo, y en las respuestas del Tutor un botón para escucharlas (UI-05, Jeider 17/10). Usa la voz que el
       estudiante eligió en «Escuchar la lección» o, si no eligió, la más natural del navegador (utils/vozTutor.ts). -->
  <span class="mt-1 px-1 flex items-center gap-1.5 text-[10px] text-base-texto-secundario">
    {{ deEstudiante ? 'Tú' : 'Tutor IA' }} • {{ hora }}
    <button
      v-if="!deEstudiante && puedeHablar && texto"
      type="button"
      class="inline-flex items-center gap-1 min-h-[28px] px-1.5 rounded-md font-semibold text-stire-blue hover:bg-stire-teal/10"
      :aria-pressed="hablando"
      :aria-label="hablando ? 'Detener la lectura de esta respuesta' : 'Escuchar esta respuesta'"
      @click="alternar">
      <Square v-if="hablando" :size="11" aria-hidden="true" /><Volume2 v-else :size="12" aria-hidden="true" />
      {{ hablando ? 'Detener' : 'Escuchar' }}
    </button>
    <span v-if="hablando && sinVozNatural">Para una voz más natural, abre STIRE en Microsoft Edge.</span>
  </span>
</template>

<script setup lang="ts">
import { Square, Volume2 } from 'lucide-vue-next'
import { CLAVE_PREFERENCIAS_VOZ, elegirVoz, leerPreferenciasVoz } from '~/utils/escucharLeccion'
import { hayVozNatural, textoDeMensaje } from '~/utils/vozTutor'

const props = defineProps<{ deEstudiante: boolean; hora: string; texto: string }>()
const puedeHablar = ref(false)
const hablando = ref(false)
const sinVozNatural = ref(false)
onMounted(() => { puedeHablar.value = 'speechSynthesis' in window })

function alternar() {
  const voz = window.speechSynthesis
  if (hablando.value) { voz.cancel(); hablando.value = false; return }
  voz.cancel() // una sola voz a la vez: si otra respuesta se estaba leyendo, se detiene
  let prefs = leerPreferenciasVoz(null)
  try { prefs = leerPreferenciasVoz(localStorage.getItem(CLAVE_PREFERENCIAS_VOZ)) } catch { /* sin almacenamiento */ }
  const u = new SpeechSynthesisUtterance(textoDeMensaje(props.texto))
  const voces = voz.getVoices()
  sinVozNatural.value = voces.length > 0 && !hayVozNatural(voces)
  const elegida = elegirVoz(voces, prefs.voz)
  if (elegida) { u.voice = elegida; u.lang = elegida.lang } else u.lang = 'es-CO'
  u.rate = prefs.velocidad
  u.onend = () => { hablando.value = false }
  u.onerror = () => { hablando.value = false }
  hablando.value = true
  voz.speak(u)
}
onBeforeUnmount(() => { if (hablando.value) window.speechSynthesis.cancel() })
</script>
