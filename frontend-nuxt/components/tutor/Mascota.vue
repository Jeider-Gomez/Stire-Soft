<template>
  <!-- La mascota del Tutor: la pantalla con gafas del logo (utils/mascotaTutor.ts). Parpadea, mira de reojo, respira y
       sigue el puntero con los ojos para que se sienta viva; con «reducir movimiento» se queda quieta. -->
  <svg
    ref="raiz"
    class="mascota-tutor"
    :class="{ respira: vivo && !quieta }"
    :viewBox="forma === 'completa' ? '22 36 156 130' : '24 38 152 104'"
    :height="tamano"
    :width="Math.round(tamano * (forma === 'completa' ? 156 / 130 : 152 / 104))"
    role="img"
    :aria-label="`Tutor: ${SIGNIFICADO[expresion]}`"
  >
    <rect x="26" y="40" width="148" height="100" rx="18" fill="#7B2FBF" />
    <rect x="38" y="52" width="124" height="76" rx="10" fill="#082B6B" />
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M46 70 L30 62" stroke="#008F7C" stroke-width="6.5" /><path d="M158 70 L174 62" stroke="#008F7C" stroke-width="6.5" />
      <path d="M46 70 L30 62" stroke="#00C2A8" stroke-width="3.8" /><path d="M158 70 L174 62" stroke="#00C2A8" stroke-width="3.8" />
      <path d="M95 73 Q100 66 105 73" stroke="#00C2A8" stroke-width="6" />
    </g>
    <rect x="43" y="58" width="52" height="44" rx="16" fill="#fff" stroke="#00C2A8" stroke-width="7.5" />
    <rect x="105" y="58" width="52" height="44" rx="16" fill="#fff" stroke="#00C2A8" stroke-width="7.5" />
    <g class="ojos" :class="{ parpadea }" :style="{ transform: `translate(${mirada.x}px, ${mirada.y}px)` }">
      <g v-if="expresion === 'pensando'" fill="#7B2FBF"><circle cx="73" cy="75" r="6" /><circle cx="135" cy="75" r="6" /></g>
      <g v-else fill="none" stroke="#7B2FBF" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round">
        <path v-for="d in OJOS[expresion] ?? []" :key="d" :d="d" />
      </g>
    </g>
    <path class="boca" :class="{ habla: expresion === 'hablando' && !quieta }" :d="BOCA[expresion]" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
    <!-- La base con el hueco del mouse recortado: deja ver el fondo, sea cual sea. -->
    <path v-if="forma === 'completa'" d="M36 150 H126.5 V151 a4.5 4.5 0 0 0 4.5 4.5 H147 a4.5 4.5 0 0 0 4.5 -4.5 V150 H164 a6 6 0 0 1 0 12 H36 a6 6 0 0 1 0 -12 Z" fill="#7B2FBF" />
    <text v-if="expresion === 'durmiendo' && !quieta" x="158" y="50" class="zeta" aria-hidden="true">z</text>
  </svg>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { BOCA, OJOS, SIGNIFICADO, esperaParpadeo, miradaHacia, type ExpresionTutor } from '~/utils/mascotaTutor'

const props = withDefaults(defineProps<{
  expresion?: ExpresionTutor
  /** Alto en píxeles. */
  tamano?: number
  /** «completa» lleva la barra de la base; «compacta» es solo la pantalla, para botones y avatares. */
  forma?: 'completa' | 'compacta'
  /** Parpadea y respira. Los avatares de los mensajes van quietos para no distraer. */
  vivo?: boolean
  /** Los ojos siguen el puntero (solo con ratón). */
  mirarCursor?: boolean
}>(), { expresion: 'normal', tamano: 40, forma: 'compacta', vivo: true, mirarCursor: false })

const raiz = ref<SVGSVGElement | null>(null)
const parpadea = ref(false)
const mirada = ref({ x: 0, y: 0 })
const quieta = ref(false)
let reloj: ReturnType<typeof setTimeout> | undefined
let reojo: ReturnType<typeof setTimeout> | undefined
let cuadro = 0
let siguiendo = false

function parpadear() {
  if (['durmiendo', 'acierto'].includes(props.expresion)) return
  parpadea.value = true
  setTimeout(() => { parpadea.value = false }, 160)
}

function ciclo() {
  parpadear()
  // De vez en cuando mira de reojo, como quien espera.
  if (!siguiendo && props.expresion === 'normal' && Math.random() < 0.35) {
    mirada.value = { x: Math.random() < 0.5 ? -3 : 3, y: 0 }
    reojo = setTimeout(() => { if (!siguiendo) mirada.value = { x: 0, y: 0 } }, 900)
  }
  reloj = setTimeout(ciclo, esperaParpadeo(Math.random()))
}

function alMoverPuntero(e: PointerEvent) {
  if (cuadro) return
  cuadro = requestAnimationFrame(() => {
    cuadro = 0
    const caja = raiz.value?.getBoundingClientRect()
    if (!caja) return
    siguiendo = true
    mirada.value = miradaHacia(e.clientX - (caja.left + caja.width / 2), e.clientY - (caja.top + caja.height / 2))
  })
}

// Al cambiar de expresión parpadea: el cambio se lee como un gesto, no como un salto.
watch(() => props.expresion, () => { if (!quieta.value) parpadear() })

onMounted(() => {
  quieta.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (quieta.value || !props.vivo) return
  reloj = setTimeout(ciclo, esperaParpadeo(Math.random()))
  if (props.mirarCursor && window.matchMedia('(pointer: fine)').matches) window.addEventListener('pointermove', alMoverPuntero, { passive: true })
})
onBeforeUnmount(() => {
  clearTimeout(reloj)
  clearTimeout(reojo)
  cancelAnimationFrame(cuadro)
  window.removeEventListener('pointermove', alMoverPuntero)
})
</script>

<style scoped>
.mascota-tutor { display: block; overflow: visible; flex-shrink: 0; }
.ojos { transform-box: fill-box; transform-origin: center; transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1); }
.ojos.parpadea { transform: scaleY(0.1) !important; transition-duration: 0.08s; }
.respira { animation: respirar 3.6s ease-in-out infinite; }
@keyframes respirar { 50% { transform: translateY(-1.5px); } }
.boca.habla { animation: hablar 0.32s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
@keyframes hablar { to { transform: scaleY(0.45); } }
.zeta { font: 700 26px/1 system-ui, sans-serif; fill: #00c2a8; animation: dormir 2.4s ease-in-out infinite; }
@keyframes dormir { 0% { opacity: 0; transform: translate(0, 6px); } 40% { opacity: 1; } 100% { opacity: 0; transform: translate(6px, -10px); } }
@media (prefers-reduced-motion: reduce) {
  .respira, .boca.habla, .zeta { animation: none; }
  .ojos { transition: none; }
}
</style>
