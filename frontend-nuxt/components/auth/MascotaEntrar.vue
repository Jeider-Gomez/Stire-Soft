<template>
  <!-- La mascota en «Entrar» (cuadro «Entrar» del lienzo v3, sus interacciones): se asoma sobre la tarjeta y reacciona.
       - Saluda según la hora; mira el correo y pone ✓ en su pantalla cuando ya tiene forma de correo.
       - Al salir del correo, si le falta la @ o el final (.com), lo dice con una «?» en la pantalla.
       - Con la contraseña baja la PERSIANA de la pantalla (como un protector de pantalla) con un candado y un punto por
         cada tecla; con «Mostrar la contraseña» la persiana baja a la mitad y se asoma por encima.
       - Avisa las MAYÚSCULAS, se apena con un error, celebra al entrar y se duerme a los 15 s sin actividad.
       Es decorativa (aria-hidden): no cambia el formulario. Con «reducir movimiento», la persiana aparece sin animación. -->
  <div class="mascota-entrar hidden sm:block" aria-hidden="true">
    <span v-if="globo" class="globo-entrar">{{ globo }}</span>
    <TutorMascota :expresion="expresion" :tamano="96" forma="completa" mirar-cursor saludar>
      <template #pantalla>
        <g class="persiana" :class="{ baja: campo === 'password', espia: campo === 'password' && verClave }">
          <rect x="38" y="52" width="124" height="76" class="persiana-tela" />
          <path v-for="y in [60, 69, 78, 87, 96, 105, 114, 123]" :key="y" :d="`M38 ${y} H162`" class="persiana-raya" stroke-width="2" />
          <g class="candado" :class="{ tic }">
            <rect x="91" y="73" width="18" height="15" rx="3" class="candado-cuerpo" />
            <path d="M94 73 V68 a6 6 0 0 1 12 0 V73" fill="none" class="candado-arco" stroke-width="3" />
            <text x="100" y="106" text-anchor="middle" class="candado-puntos">{{ puntos }}</text>
          </g>
        </g>
        <g v-if="simbolo" class="simbolo" :class="{ correcto: simbolo === '✓' }">
          <rect x="38" y="52" width="124" height="76" class="simbolo-fondo" />
          <text x="100" y="104" text-anchor="middle" class="simbolo-texto">{{ simbolo }}</text>
        </g>
      </template>
    </TutorMascota>
  </div>
</template>

<script setup lang="ts">
import type { ExpresionTutor } from '~/utils/mascotaTutor'

const props = withDefaults(defineProps<{
  campo: 'email' | 'password' | null
  verClave: boolean
  error: boolean
  listo: boolean
  pestana: 'codigo' | 'cuenta'
  /** Lo escrito en el correo: para el ✓ y para avisar la @ que falta. */
  correo?: string
  /** Cuántos caracteres lleva la contraseña: un punto por tecla en la persiana (nunca la clave). */
  largoClave?: number
  /** Bloq Mayús activado mientras escribe la contraseña. */
  mayus?: boolean
}>(), { correo: '', largoClave: 0, mayus: false })

const saludo = ref('')
const aviso = ref('')
const simbolo = ref('')
const dormida = ref(false)
const tic = ref(false)
let tSimbolo: ReturnType<typeof setTimeout> | undefined
let tSueno: ReturnType<typeof setTimeout> | undefined

const CORREO_COMPLETO = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i
function mostrar(s: string, ms: number) {
  simbolo.value = s
  clearTimeout(tSimbolo)
  tSimbolo = setTimeout(() => { simbolo.value = '' }, ms)
}
/** Cualquier tecla, clic o movimiento la despierta; a los 15 s sin nada, se duerme. */
function despertar() {
  dormida.value = false
  clearTimeout(tSueno)
  tSueno = setTimeout(() => { if (!props.campo) dormida.value = true }, 15000)
}

onMounted(() => {
  const h = new Date().getHours()
  saludo.value = h < 12 ? '¡Buenos días!' : h < 19 ? '¡Buenas tardes!' : '¡Buenas noches!'
  for (const ev of ['pointermove', 'keydown', 'pointerdown'] as const) window.addEventListener(ev, despertar, { passive: true })
  despertar()
})
onBeforeUnmount(() => {
  for (const ev of ['pointermove', 'keydown', 'pointerdown'] as const) window.removeEventListener(ev, despertar)
  clearTimeout(tSimbolo); clearTimeout(tSueno)
})

// El correo: ✓ en la pantalla cuando ya tiene forma; al salir, avisa lo que falta.
watch(() => props.correo, (v) => { aviso.value = ''; if (props.campo === 'email' && CORREO_COMPLETO.test(v.trim())) mostrar('✓', 1100) })
watch(() => props.campo, (ahora, antes) => {
  if (antes !== 'email') return
  const v = props.correo.trim()
  if (v && !v.includes('@')) { aviso.value = 'A ese correo le falta la @'; mostrar('?', 1800) }
  else if (v && !/\.[a-z]{2,}$/i.test(v)) { aviso.value = 'Revisa el final: algo como .com o .edu.co'; mostrar('?', 1800) }
})
// Cada tecla de la contraseña: el candado da un saltico.
watch(() => props.largoClave, () => { tic.value = false; requestAnimationFrame(() => { tic.value = true }) })

const puntos = computed(() => '•'.repeat(Math.min(props.largoClave, 8)) || '• • • •')
const expresion = computed<ExpresionTutor>(() => {
  if (props.listo) return 'acierto'
  if (props.error) return 'error'
  if (aviso.value) return 'pensando'
  if (props.campo === 'password') return props.verClave ? 'atento' : 'normal'
  if (props.campo === 'email') return 'atento'
  if (dormida.value) return 'durmiendo'
  return 'contento'
})
const globo = computed(() => {
  if (props.listo) return '¡Vamos!'
  if (props.campo === 'password' && props.mayus) return 'Ojo: tienes las MAYÚSCULAS activadas'
  if (props.campo === 'password') return props.verClave ? 'Bueno… solo un poquito' : 'Pantalla en privado: no miro'
  if (aviso.value) return aviso.value
  if (props.campo === 'email') return 'Ese es tu correo, ¿cierto?'
  if (dormida.value) return ''
  if (props.pestana === 'codigo') return '¿Te dieron un código?'
  return saludo.value
})
</script>

<style scoped>
/* La persiana baja desde arriba; con «Mostrar la contraseña» se queda a media pantalla y los ojos se asoman. */
.persiana { transform: translateY(-80px); transition: transform 0.45s cubic-bezier(0.3, 1.2, 0.5, 1); }
.persiana.baja { transform: translateY(0); }
.persiana.baja.espia { transform: translateY(35px); }
.persiana-tela { fill: var(--m-pantalla); }
.persiana-raya { stroke: rgb(0 0 0 / 0.22); }
.candado { opacity: 0; transition: opacity 0.2s 0.3s; transform-box: fill-box; transform-origin: center; }
.persiana.baja .candado { opacity: 1; }
.persiana.espia .candado { opacity: 0; }
.candado.tic { animation: tic 0.25s; }
.candado-cuerpo { fill: var(--m-gafas); }
.candado-arco { stroke: var(--m-gafas); }
.candado-puntos { fill: var(--m-gafas); font: 700 11px Inter, sans-serif; letter-spacing: 1px; }
.simbolo-fondo { fill: var(--m-pantalla); }
.simbolo.correcto .simbolo-fondo { fill: #047857; }
.simbolo-texto { fill: #fff; font: 700 40px Inter, sans-serif; }
.simbolo:not(.correcto) .simbolo-texto { fill: #ffc94d; font-family: Poppins, sans-serif; }
@keyframes tic { 50% { transform: scale(1.25); } }
@media (prefers-reduced-motion: reduce) {
  .persiana, .candado { transition: none; }
  .candado.tic { animation: none; }
}
</style>
