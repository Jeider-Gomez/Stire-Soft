<template>
  <!-- La mascota del Tutor: la pantalla con gafas del logo (utils/mascotaTutor.ts). Tiene vida propia: parpadea, respira,
       mira de reojo y alrededor cuando nadie la usa, sigue el puntero, guiña al saludar y cada cara trae su gesto
       (salta al acertar, niega con la cabeza al fallar, asiente para animar, ladea la cabeza al pensar). Con «reducir
       movimiento» se queda quieta y solo cambia la cara. -->
  <svg
    ref="raiz"
    class="mascota-tutor"
    :class="{ respira: vivo && !quieta, 'respira-lento': expresion === 'durmiendo' }"
    :viewBox="forma === 'completa' ? '22 36 156 130' : '24 38 152 104'"
    :height="tamano"
    :width="Math.round(tamano * (forma === 'completa' ? 156 / 130 : 152 / 104))"
    role="img"
    :aria-label="etiqueta ?? `Tutor: ${SIGNIFICADO[expresion]}`"
  >
    <g :key="gestoClave" class="cuerpo" :class="gesto && !quieta ? `gesto-${gesto}` : ''">
      <rect x="26" y="40" width="148" height="100" rx="18" class="m-marco" />
      <rect x="38" y="52" width="124" height="76" rx="10" class="m-pantalla" />
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M46 70 L30 62" class="m-patilla" stroke-width="6.5" /><path d="M158 70 L174 62" class="m-patilla" stroke-width="6.5" />
        <path d="M46 70 L30 62" class="m-gafas" stroke-width="3.8" /><path d="M158 70 L174 62" class="m-gafas" stroke-width="3.8" />
        <path d="M95 73 Q100 66 105 73" class="m-gafas" stroke-width="6" />
      </g>
      <rect x="43" y="58" width="52" height="44" rx="16" class="m-lente" stroke-width="7.5" />
      <rect x="105" y="58" width="52" height="44" rx="16" class="m-lente" stroke-width="7.5" />
      <g class="ojos" :class="{ parpadea, mirando: expresion === 'pensando' && !quieta }" :style="{ transform: `translate(${mirada.x}px, ${mirada.y}px)` }">
        <template v-if="OJOS[expresion] === null">
          <!-- pensando: arriba y a la derecha; ánimo: redondos y al centro, mirando de frente -->
          <circle v-for="(c, i) in (expresion === 'pensando' ? [[73, 75], [135, 75]] : [[69, 81], [131, 81]])" :key="i"
            class="ojo m-ojo-relleno" :class="{ guina: guina && i === 0 }" :cx="c[0]" :cy="c[1]" :r="expresion === 'pensando' ? 6 : 7.5" />
        </template>
        <path v-for="(d, i) in OJOS[expresion] ?? []" v-else :key="d" :d="d" class="ojo m-ojo" :class="{ guina: guina && i === 0 }"
          fill="none" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <path class="boca m-boca" :class="{ habla: expresion === 'hablando' && !quieta }" :d="BOCA[expresion]" fill="none" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
      <!-- La base con el hueco del mouse recortado: deja ver el fondo, sea cual sea. -->
      <path v-if="forma === 'completa'" d="M36 150 H126.5 V151 a4.5 4.5 0 0 0 4.5 4.5 H147 a4.5 4.5 0 0 0 4.5 -4.5 V150 H164 a6 6 0 0 1 0 12 H36 a6 6 0 0 1 0 -12 Z" class="m-marco" />
    </g>
    <!-- Chispas al acertar: tres destellos que salen de la pantalla y se apagan. -->
    <g v-if="expresion === 'acierto' && !quieta" class="chispas" aria-hidden="true">
      <path d="M20 44 l4 -10 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 Z" class="chispa" />
      <path d="M172 34 l3 -8 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 Z" class="chispa c2" />
      <path d="M180 112 l2.5 -6 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5 -6 l-6 -2.5 Z" class="chispa c3" />
    </g>
    <text v-if="expresion === 'durmiendo' && !etiqueta && !quieta" x="158" y="50" class="zeta" aria-hidden="true">z</text>
  </svg>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { BOCA, GESTO, OJOS, SIGNIFICADO, esperaParpadeo, miradaHacia, type ExpresionTutor } from '~/utils/mascotaTutor'

const props = withDefaults(defineProps<{
  expresion?: ExpresionTutor
  /** Alto en píxeles. */
  tamano?: number
  /** «completa» lleva la barra de la base; «compacta» es solo la pantalla, para botones y avatares. */
  forma?: 'completa' | 'compacta'
  /** Parpadea, respira y mira alrededor. Los avatares de los mensajes van quietos para no distraer. */
  vivo?: boolean
  /** Los ojos siguen el puntero (solo con ratón). */
  mirarCursor?: boolean
  /** Guiña un ojo al aparecer, como saludo (al abrir el chat). */
  saludar?: boolean
  /** Nombre accesible propio, p. ej. «STIRE» cuando es el logo y no el Tutor. */
  etiqueta?: string
}>(), { expresion: 'normal', tamano: 40, forma: 'compacta', vivo: true, mirarCursor: false, saludar: false })

const raiz = ref<SVGSVGElement | null>(null)
const parpadea = ref(false)
const guina = ref(false)
const mirada = ref({ x: 0, y: 0 })
const quieta = ref(false)
/** Cambia con cada cara para que su gesto se repita aunque la misma cara vuelva. */
const gestoClave = ref(0)
const gesto = computed(() => GESTO[props.expresion])
const temporizadores = new Set<ReturnType<typeof setTimeout>>()
let reloj: ReturnType<typeof setTimeout> | undefined
let cuadro = 0
let ultimoPuntero = Date.now()

function luego(ms: number, fn: () => void) {
  const t = setTimeout(() => { temporizadores.delete(t); fn() }, ms)
  temporizadores.add(t)
}

function parpadear() {
  if (['durmiendo', 'acierto', 'contento'].includes(props.expresion)) return
  parpadea.value = true
  luego(160, () => { parpadea.value = false })
}

function guinar() {
  guina.value = true
  luego(380, () => { guina.value = false })
}

/** Mira a un lado y al otro, como quien espera; solo si nadie mueve el puntero hace rato. */
function mirarAlrededor() {
  mirada.value = { x: -3, y: -1 }
  luego(900, () => { mirada.value = { x: 3, y: -1 } })
  luego(1800, () => { mirada.value = { x: 0, y: 0 } })
}

function ciclo() {
  parpadear()
  const quieto = Date.now() - ultimoPuntero > 4000
  if (quieto && props.expresion === 'normal') {
    const azar = Math.random()
    if (azar < 0.2) mirarAlrededor()
    else if (azar < 0.45) {
      mirada.value = { x: azar < 0.32 ? -3 : 3, y: 0 }
      luego(900, () => { mirada.value = { x: 0, y: 0 } })
    } else if (azar < 0.5) luego(300, parpadear) // a veces parpadea dos veces seguidas
  }
  reloj = setTimeout(ciclo, esperaParpadeo(Math.random()))
}

function alMoverPuntero(e: PointerEvent) {
  ultimoPuntero = Date.now()
  if (cuadro) return
  cuadro = requestAnimationFrame(() => {
    cuadro = 0
    const caja = raiz.value?.getBoundingClientRect()
    if (!caja) return
    mirada.value = miradaHacia(e.clientX - (caja.left + caja.width / 2), e.clientY - (caja.top + caja.height / 2))
  })
}

// Al cambiar de cara parpadea y hace su gesto: el cambio se lee como una reacción, no como un salto.
watch(() => props.expresion, () => {
  gestoClave.value++
  if (!quieta.value) parpadear()
})

onMounted(() => {
  quieta.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (quieta.value || !props.vivo) return
  if (props.saludar) luego(350, guinar)
  reloj = setTimeout(ciclo, esperaParpadeo(Math.random()))
  if (props.mirarCursor && window.matchMedia('(pointer: fine)').matches) window.addEventListener('pointermove', alMoverPuntero, { passive: true })
})
onBeforeUnmount(() => {
  clearTimeout(reloj)
  for (const t of temporizadores) clearTimeout(t)
  cancelAnimationFrame(cuadro)
  window.removeEventListener('pointermove', alMoverPuntero)
})
</script>

<style scoped>
.mascota-tutor {
  --m-marco: #7b2fbf; --m-pantalla: #082b6b; --m-gafas: #00c2a8; --m-patilla: #008f7c; --m-lente: #fff; --m-ojo: #7b2fbf; --m-boca: #fff;
  display: block; overflow: visible; flex-shrink: 0;
}
.m-marco { fill: var(--m-marco); }
.m-pantalla { fill: var(--m-pantalla); }
.m-gafas { stroke: var(--m-gafas); }
.m-patilla { stroke: var(--m-patilla); }
.m-lente { fill: var(--m-lente); stroke: var(--m-gafas); }
.m-ojo { stroke: var(--m-ojo); }
.m-ojo-relleno { fill: var(--m-ojo); }
.m-boca { stroke: var(--m-boca); }
/* Alto contraste: pantalla negra, gafas amarillas y lentes blancas con ojos negros (más de 15:1); el marco toma el color
   del texto del tema, así se separa del fondo en claro (negro) y en oscuro (blanco). */
:global(:root[data-contraste="alto"]) .mascota-tutor {
  --m-marco: rgb(var(--c-base-texto-primario)); --m-pantalla: #000; --m-gafas: #ffd60a; --m-patilla: #ffd60a;
  --m-lente: #fff; --m-ojo: #000; --m-boca: #ffd60a;
}
.ojos { transform-box: fill-box; transform-origin: center; transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1); }
.ojos.parpadea { transform: scaleY(0.1) !important; transition-duration: 0.08s; }
.ojo { transform-box: fill-box; transform-origin: center; }
.ojo.guina { animation: guinar 0.38s ease-in-out; }
@keyframes guinar { 40%, 60% { transform: scaleY(0.1); } }
/* Pensando: los ojos van de un lado a otro, arriba, como quien busca la idea. */
.ojos.mirando { animation: buscar 2.6s ease-in-out infinite alternate; }
@keyframes buscar { from { transform: translate(-4px, -1px); } to { transform: translate(2px, -2px); } }
.respira { animation: respirar 3.6s ease-in-out infinite; }
.respira.respira-lento { animation-duration: 6s; }
@keyframes respirar { 50% { transform: translateY(-1.5px); } }
.boca { transform-box: fill-box; transform-origin: center; }
.boca.habla { animation: hablar 0.32s ease-in-out infinite alternate; }
@keyframes hablar { to { transform: scaleY(0.45); } }
/* Gestos del cuerpo: uno por cara y una sola vez (pensar y atender se quedan ladeados mientras duran). */
.cuerpo { transform-box: fill-box; transform-origin: 50% 100%; }
.gesto-salta { animation: saltar 0.6s cubic-bezier(0.3, 1.6, 0.5, 1); }
@keyframes saltar { 0% { transform: translateY(0) scale(1, 1); } 25% { transform: translateY(1px) scale(1.04, 0.94); } 55% { transform: translateY(-9px) scale(0.97, 1.04); } 100% { transform: translateY(0) scale(1, 1); } }
.gesto-niega { animation: negar 0.5s ease-in-out; }
@keyframes negar { 20% { transform: translateX(-3px) rotate(-2deg); } 50% { transform: translateX(3px) rotate(2deg); } 80% { transform: translateX(-2px) rotate(-1deg); } }
.gesto-asiente { animation: asentir 0.9s ease-in-out; }
@keyframes asentir { 25%, 75% { transform: translateY(3px) rotate(0.5deg); } 50% { transform: translateY(0); } }
.gesto-ladea { animation: ladear 0.5s ease-out forwards; }
@keyframes ladear { to { transform: rotate(-4deg); } }
.gesto-inclina { animation: inclinar 0.35s ease-out forwards; }
@keyframes inclinar { to { transform: scale(1.04) translateY(-1px); } }
.gesto-rebota { animation: rebotar 0.45s cubic-bezier(0.3, 1.6, 0.5, 1); }
@keyframes rebotar { 50% { transform: translateY(-4px); } }
.chispa { fill: #ffd60a; transform-box: fill-box; transform-origin: center; animation: chispa 1.1s ease-out forwards; }
.chispa.c2 { fill: #00c2a8; animation-delay: 0.12s; }
.chispa.c3 { fill: #7b2fbf; animation-delay: 0.22s; }
@keyframes chispa { 0% { opacity: 0; transform: scale(0.2) rotate(0deg); } 30% { opacity: 1; transform: scale(1.1) rotate(25deg); } 100% { opacity: 0; transform: scale(0.6) rotate(60deg); } }
.zeta { font: 700 26px/1 system-ui, sans-serif; fill: #00c2a8; animation: dormir 2.4s ease-in-out infinite; }
@keyframes dormir { 0% { opacity: 0; transform: translate(0, 6px); } 40% { opacity: 1; } 100% { opacity: 0; transform: translate(6px, -10px); } }
@media (prefers-reduced-motion: reduce) {
  .respira, .boca.habla, .zeta, .ojo.guina, .ojos.mirando, .cuerpo, .chispa { animation: none !important; }
  .ojos { transition: none; }
}
</style>
