<template>
  <!-- UI-01 (docs/DISENO_FORMATOS_LECCION.md): la lección también se escucha. Como el Lector inmersivo de Microsoft o
       ReadSpeaker (el lector de Canvas y Moodle): un botón discreto junto al título y, al escuchar, un reproductor
       pequeño abajo que resalta la frase que suena y deja ir atrás o adelante. Lee lo que está en pantalla (no una copia
       del texto), así que lo que se oye y lo que se resalta siempre coinciden. Antes era una franja grande arriba de la
       lección que ocupaba espacio aunque nadie la usara. -->
  <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
    <button v-if="disponible" id="escuchar-leccion" type="button" :aria-pressed="estado !== 'quieto'"
      class="min-h-[44px] inline-flex items-center gap-1.5 px-3 rounded-md borde-afordancia bg-base-blanco text-xs font-semibold text-acento-ambar-fuerte"
      @click="estado === 'quieto' ? empezar() : detener()">
      <Headphones :size="15" aria-hidden="true" /> {{ estado === 'quieto' ? 'Escuchar' : 'Dejar de escuchar' }}
    </button>
    <p v-if="formatos" class="text-[11px] text-base-texto-secundario">{{ formatos }}</p>
    <p class="sr-only" role="status">{{ aviso }}</p>
  </div>

  <Teleport to="body">
    <div v-if="estado !== 'quieto'" class="reproductor-leccion fixed z-30 left-3 right-32 sm:left-auto sm:right-44" role="region" aria-label="Lectura en voz alta">
      <div class="relative flex items-center gap-0.5 rounded-xl bg-base-blanco border border-base-borde-fuerte shadow-lg p-1">
        <button type="button" class="boton-reproductor" aria-label="Frase anterior" title="Frase anterior" :disabled="actual === 0" @click="saltar(-1)">
          <SkipBack :size="16" aria-hidden="true" />
        </button>
        <button type="button" class="boton-reproductor bg-acento-ambar-fuerte text-base-blanco hover:bg-acento-ambar" :aria-label="estado === 'leyendo' ? 'Pausar' : 'Seguir escuchando'" @click="estado === 'leyendo' ? pausar() : seguir()">
          <component :is="estado === 'leyendo' ? Pause : Play" :size="16" aria-hidden="true" />
        </button>
        <button type="button" class="boton-reproductor" aria-label="Frase siguiente" title="Frase siguiente" :disabled="actual >= lecturas.length - 1" @click="saltar(1)">
          <SkipForward :size="16" aria-hidden="true" />
        </button>
        <span class="hidden sm:inline px-2 text-[11px] text-base-texto-secundario whitespace-nowrap">{{ actual + 1 }} de {{ lecturas.length }}</span>
        <button type="button" class="boton-reproductor" aria-label="Velocidad y voz" title="Velocidad y voz" :aria-expanded="ajustes" aria-controls="ajustes-voz" @click="ajustes = !ajustes">
          <Settings2 :size="16" aria-hidden="true" />
        </button>
        <button type="button" class="boton-reproductor" aria-label="Dejar de escuchar" title="Dejar de escuchar" @click="detener">
          <X :size="16" aria-hidden="true" />
        </button>
        <div v-if="ajustes" id="ajustes-voz" class="absolute bottom-full right-0 mb-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-lg bg-base-blanco border border-base-borde-fuerte shadow-lg p-3 space-y-2 text-xs">
          <label class="block">
            <span class="block font-semibold text-base-texto-primario mb-1">Velocidad</span>
            <select v-model.number="velocidad" class="w-full min-h-[44px] rounded-md border border-base-borde-fuerte bg-base-blanco px-2">
              <option v-for="v in VELOCIDADES" :key="v.valor" :value="v.valor">{{ v.texto }}</option>
            </select>
          </label>
          <label v-if="voces.length > 1" class="block">
            <span class="block font-semibold text-base-texto-primario mb-1">Voz</span>
            <select v-model="vozElegida" class="w-full min-h-[44px] rounded-md border border-base-borde-fuerte bg-base-blanco px-2">
              <option v-for="v in voces" :key="v.voiceURI" :value="v.voiceURI">{{ nombreVoz(v) }}</option>
            </select>
          </label>
          <p class="text-[11px] text-base-texto-secundario">Las voces son las de tu navegador: en Edge y Chrome hay voces naturales en español.</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { Headphones, Pause, Play, Settings2, SkipBack, SkipForward, X } from 'lucide-vue-next'
import {
  CLAVE_PREFERENCIAS_VOZ, elegirVoz, formatosDeLeccion, frasesConPosicion, leerPreferenciasVoz, nombreVoz, textoFormatos,
  textoParaVoz, VELOCIDADES, vocesEnEspanol, type BloqueLeccion, type Frase,
} from '~/utils/escucharLeccion'

const props = withDefaults(defineProps<{ bloques: BloqueLeccion[]; objetivo?: string }>(), { objetivo: '#explicacion' })

interface Lectura { el: HTMLElement; frase: Frase }

// Lo que se lee de la pantalla: títulos, párrafos, viñetas, pies de imagen y el texto alternativo de las imágenes. Lo
// que solo se puede ver (el algoritmo, un ejemplo en vivo, un video) se anuncia con su `data-leer-aviso`.
const SELECTOR = 'h2,h3,h4,h5,p,li,figcaption,blockquote,img,pre,table,[data-leer-aviso]'
const CONTENEDORES = 'p,li,figcaption,blockquote,pre,table'
const RESALTADO = 'stire-leyendo'

const disponible = ref(false)
const estado = ref<'quieto' | 'leyendo' | 'pausa'>('quieto')
const lecturas = shallowRef<Lectura[]>([])
const actual = ref(0)
const ajustes = ref(false)
const aviso = ref('')
const voces = shallowRef<SpeechSynthesisVoice[]>([])
const preferencias = leerPreferenciasVoz(leerLocal())
const velocidad = ref<number>(preferencias.velocidad)
const vozElegida = ref<string | null>(preferencias.voz)
const formatos = computed(() => textoFormatos(formatosDeLeccion(props.bloques)))

// Cada lectura tiene su turno: al cancelar, el navegador dispara el «fin» de la frase cortada, y ese fin no debe seguir.
let turno = 0
// Chrome a veces libera la locución en curso y nunca dispara su «fin» (la lectura se quedaba muda tras la primera
// frase): se guarda aquí para que siga viva mientras suena.
const vivas = new Set<SpeechSynthesisUtterance>()
let bloqueResaltado: HTMLElement | null = null

function leerLocal(): string | null {
  try { return localStorage.getItem(CLAVE_PREFERENCIAS_VOZ) } catch { return null }
}
function guardarPreferencias() {
  try { localStorage.setItem(CLAVE_PREFERENCIAS_VOZ, JSON.stringify({ velocidad: velocidad.value, voz: vozElegida.value })) } catch { /* sin almacenamiento: no se recuerda */ }
}

function cargarVoces() {
  voces.value = vocesEnEspanol(window.speechSynthesis.getVoices())
  const voz = elegirVoz(voces.value, vozElegida.value)
  if (voz && !voces.value.some((v) => v.voiceURI === vozElegida.value)) vozElegida.value = voz.voiceURI
}

onMounted(() => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  disponible.value = true
  cargarVoces()
  // En Chrome las voces llegan después de cargar la página.
  window.speechSynthesis.addEventListener?.('voiceschanged', cargarVoces)
})

/** Las frases de la lección, en orden, tal como están en pantalla. */
function construir(): Lectura[] {
  const raiz = document.querySelector<HTMLElement>(props.objetivo)
  if (!raiz) return []
  const out: Lectura[] = []
  for (const el of raiz.querySelectorAll<HTMLElement>(SELECTOR)) {
    if (el.closest('[aria-hidden="true"]')) continue
    const anuncio = el.closest<HTMLElement>('[data-leer-aviso]')
    if (anuncio && anuncio !== el) continue
    const padre = el.parentElement?.closest(CONTENEDORES)
    if (padre && raiz.contains(padre)) continue
    const solo = (texto: string): Frase[] => [{ texto, inicio: -1, fin: -1 }]
    let frases: Frase[]
    if (el.dataset.leerAviso !== undefined) frases = solo(el.dataset.leerAviso)
    else if (el instanceof HTMLImageElement) frases = el.alt.trim() ? solo(`Imagen: ${el.alt.trim()}.`) : []
    else if (el.tagName === 'PRE') frases = solo('Hay un fragmento de código en la pantalla.')
    else if (el.tagName === 'TABLE') frases = solo('Hay una tabla en la pantalla.')
    else frases = frasesConPosicion(el.textContent ?? '')
    for (const frase of frases) out.push({ el, frase })
  }
  return out
}

/** El rango de una frase dentro de su párrafo, recorriendo sus nodos de texto (el mismo orden que `textContent`). */
function rangoDe(el: HTMLElement, inicio: number, fin: number): Range | null {
  if (inicio < 0) return null
  const recorrido = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const rango = document.createRange()
  let pos = 0
  let empezo = false
  for (let n = recorrido.nextNode(); n; n = recorrido.nextNode()) {
    const largo = n.textContent?.length ?? 0
    if (!empezo && inicio < pos + largo) { rango.setStart(n, inicio - pos); empezo = true }
    if (empezo && fin <= pos + largo) { rango.setEnd(n, fin - pos); return rango }
    pos += largo
  }
  return null
}

function quitarResaltado() {
  bloqueResaltado?.classList.remove('leyendo-bloque')
  bloqueResaltado = null
  if (typeof CSS !== 'undefined' && 'highlights' in CSS) CSS.highlights.delete(RESALTADO)
}

function resaltar(l: Lectura) {
  quitarResaltado()
  l.el.classList.add('leyendo-bloque')
  bloqueResaltado = l.el
  // La frase exacta, con la API de resaltado de CSS (Chrome, Edge, Safari 17.2+, Firefox 140+); sin ella, el párrafo.
  const rango = rangoDe(l.el, l.frase.inicio, l.frase.fin)
  if (rango && typeof Highlight !== 'undefined' && typeof CSS !== 'undefined' && 'highlights' in CSS) CSS.highlights.set(RESALTADO, new Highlight(rango))
  const r = l.el.getBoundingClientRect()
  if (r.top < 80 || r.bottom > window.innerHeight - 110) {
    const quieto = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    l.el.scrollIntoView({ block: 'center', behavior: quieto ? 'auto' : 'smooth' })
  }
}

function leer(i: number) {
  if (i >= lecturas.value.length) {
    detener()
    aviso.value = 'Terminó la lectura de la lección.'
    return
  }
  actual.value = i
  const l = lecturas.value[i]
  resaltar(l)
  const u = new SpeechSynthesisUtterance(textoParaVoz(l.frase.texto))
  const voz = voces.value.find((v) => v.voiceURI === vozElegida.value) ?? null
  if (voz) { u.voice = voz; u.lang = voz.lang } else u.lang = 'es-CO'
  u.rate = velocidad.value
  const mio = ++turno
  u.onend = () => { vivas.delete(u); if (mio === turno && estado.value === 'leyendo') leer(i + 1) }
  u.onerror = (ev) => {
    vivas.delete(u)
    if (mio !== turno || ev.error === 'interrupted' || ev.error === 'canceled') return
    estado.value = 'pausa'
    aviso.value = 'El navegador no pudo leer esta parte. Prueba con «Seguir escuchando» o con otra voz.'
  }
  vivas.add(u)
  const s = window.speechSynthesis
  if (s.paused) s.resume()
  s.speak(u)
}

/** Corta lo que suena y lee la frase `i`. Chrome a veces ignora un `speak` justo después de `cancel`: se espera un instante. */
function leerDesde(i: number) {
  turno++
  window.speechSynthesis.cancel()
  const mio = turno
  setTimeout(() => { if (mio === turno && estado.value === 'leyendo') leer(i) }, 60)
}

function empezar() {
  lecturas.value = construir()
  if (!lecturas.value.length) { aviso.value = 'Esta lección no tiene texto para leer.'; return }
  estado.value = 'leyendo'
  aviso.value = 'Leyendo la lección en voz alta.'
  leerDesde(0)
}

// Pausar es cortar y recordar la frase; seguir la vuelve a leer desde su inicio. Así funciona igual en todos los
// navegadores (en Chrome para Android `pause()` corta la lectura y `resume()` no la retoma).
function pausar() {
  turno++
  window.speechSynthesis.cancel()
  estado.value = 'pausa'
  aviso.value = 'En pausa.'
}
function seguir() {
  estado.value = 'leyendo'
  aviso.value = ''
  leerDesde(actual.value)
}
function saltar(d: number) {
  const i = Math.min(Math.max(actual.value + d, 0), lecturas.value.length - 1)
  if (estado.value === 'leyendo') leerDesde(i)
  else { actual.value = i; resaltar(lecturas.value[i]) }
}
function detener() {
  turno++
  vivas.clear()
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
  estado.value = 'quieto'
  ajustes.value = false
  actual.value = 0
  aviso.value = ''
  quitarResaltado()
}

// Cambiar la velocidad o la voz vuelve a leer la frase actual con la nueva, y se recuerda para la próxima vez.
watch([velocidad, vozElegida], () => {
  guardarPreferencias()
  if (estado.value === 'leyendo') leerDesde(actual.value)
})
// Otra lección: lo que sonaba se calla.
watch(() => props.bloques, () => { if (estado.value !== 'quieto') detener() })
useEscapeToClose(() => ajustes.value, () => { ajustes.value = false })
onBeforeUnmount(() => {
  detener()
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.removeEventListener?.('voiceschanged', cargarVoces)
})
</script>

<style>
/* Sin «scoped»: el resaltado va sobre el texto de la lección, que no es de este componente. */
.reproductor-leccion { bottom: calc(1rem + env(safe-area-inset-bottom)); }
@media (min-width: 640px) { .reproductor-leccion { bottom: 1.5rem; } }
.boton-reproductor { display: inline-flex; align-items: center; justify-content: center; min-width: 44px; min-height: 44px; border-radius: 0.5rem; }
.boton-reproductor:disabled { opacity: 0.4; }
.leyendo-bloque { background-color: rgb(11 61 145 / 0.06); box-shadow: 0 0 0 4px rgb(11 61 145 / 0.06); border-radius: 4px; }
::highlight(stire-leyendo) { background-color: #fef08a; color: #1e293b; }
@media (forced-colors: active) {
  ::highlight(stire-leyendo) { background-color: Highlight; color: HighlightText; }
}
</style>
