<template>
  <!-- UI-01 (docs/DISENO_FORMATOS_LECCION.md): la lección se puede leer, escuchar, ver y practicar. Arriba, como opciones
       que cada estudiante usa cuando le sirven, no como un «estilo» que le asignamos. La voz es la del navegador: sin
       costo y sin enviar el texto a ningún servicio. Si el navegador no tiene voz en español, el botón no aparece. -->
  <div class="rounded-lg border border-base-borde-sutil bg-base-blanco px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3" aria-label="Formas de estudiar esta lección" role="group">
    <div v-if="disponible" class="flex flex-wrap items-center gap-2">
      <button v-if="estado === 'quieto'" type="button" class="min-h-[44px] inline-flex items-center gap-2 px-4 rounded-md bg-semantico-info text-base-blanco text-xs font-bold" @click="empezar">
        <Headphones :size="15" aria-hidden="true" /> Escuchar la lección
      </button>
      <template v-else>
        <button type="button" class="min-h-[44px] inline-flex items-center gap-2 px-4 rounded-md bg-semantico-info text-base-blanco text-xs font-bold" @click="alternarPausa">
          <component :is="estado === 'leyendo' ? Pause : Play" :size="15" aria-hidden="true" /> {{ estado === 'leyendo' ? 'Pausar' : 'Seguir' }}
        </button>
        <button type="button" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 rounded-md borde-afordancia text-xs font-semibold" @click="detener">
          <Square :size="13" aria-hidden="true" /> Detener
        </button>
        <span class="text-[11px] text-slate-600" aria-live="polite">Parte {{ actual + 1 }} de {{ frases.length }}</span>
      </template>
      <label class="inline-flex items-center gap-1.5 text-[11px] text-slate-700">
        Velocidad
        <select v-model.number="velocidad" class="min-h-[44px] sm:min-h-[36px] rounded-md border border-base-borde-fuerte bg-base-blanco px-2 text-xs">
          <option v-for="v in VELOCIDADES" :key="v.valor" :value="v.valor">{{ v.texto }}</option>
        </select>
      </label>
    </div>
    <p v-if="otros.length" class="text-[11px] text-slate-600 sm:ml-auto">
      <span class="font-semibold text-base-texto-primario">También en esta lección:</span> {{ otros.join(' · ') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Headphones, Pause, Play, Square } from 'lucide-vue-next'
import { elegirVoz, formatosDeLeccion, partirEnFrases, textoParaEscuchar, VELOCIDADES, type BloqueLeccion } from '~/utils/escucharLeccion'

const props = defineProps<{ bloques: BloqueLeccion[] }>()

const disponible = ref(false)
const estado = ref<'quieto' | 'leyendo' | 'pausa'>('quieto')
const actual = ref(0)
const velocidad = ref<number>(1)
let voz: SpeechSynthesisVoice | null = null
// Cada lectura tiene su turno: al cancelar, el navegador dispara el «fin» de la frase cortada, y ese fin no debe
// seguir leyendo (si no, al cambiar la velocidad se leerían dos frases a la vez).
let turno = 0

const frases = computed(() => partirEnFrases(textoParaEscuchar(props.bloques)))
const otros = computed(() => {
  const f = formatosDeLeccion(props.bloques)
  return [
    f.diagrama && 'el algoritmo en diagrama de flujo y paso a paso',
    f.imagenes && 'imágenes',
    f.recursos && 'videos o recursos',
    f.enVivo && 'un ejemplo en vivo para probar',
    'ejercicios para practicar',
  ].filter((x): x is string => !!x)
})

function cargarVoz() {
  voz = elegirVoz(window.speechSynthesis.getVoices())
  disponible.value = !!voz && frases.value.length > 0
}

onMounted(() => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  cargarVoz()
  // En Chrome las voces llegan después de cargar la página.
  window.speechSynthesis.addEventListener?.('voiceschanged', cargarVoz)
})

function leer(i: number) {
  if (i >= frases.value.length) { detener(); return }
  actual.value = i
  const u = new SpeechSynthesisUtterance(frases.value[i])
  if (voz) { u.voice = voz; u.lang = voz.lang }
  u.rate = velocidad.value
  const mio = ++turno
  u.onend = () => { if (mio === turno && estado.value === 'leyendo') leer(i + 1) }
  window.speechSynthesis.speak(u)
}

function empezar() {
  turno++
  window.speechSynthesis.cancel()
  estado.value = 'leyendo'
  leer(0)
}
function alternarPausa() {
  if (estado.value === 'leyendo') { window.speechSynthesis.pause(); estado.value = 'pausa' }
  else { window.speechSynthesis.resume(); estado.value = 'leyendo' }
}
function detener() {
  turno++
  estado.value = 'quieto'
  actual.value = 0
  window.speechSynthesis?.cancel()
}

// Cambiar la velocidad vuelve a leer la frase actual con la nueva velocidad.
watch(velocidad, () => { if (estado.value === 'leyendo') { turno++; window.speechSynthesis.cancel(); leer(actual.value) } })
// Otra lección: lo que sonaba se calla.
watch(() => props.bloques, () => { if (estado.value !== 'quieto') detener(); if (typeof window !== 'undefined' && 'speechSynthesis' in window) cargarVoz() })
onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    window.speechSynthesis.removeEventListener?.('voiceschanged', cargarVoz)
  }
})
</script>
