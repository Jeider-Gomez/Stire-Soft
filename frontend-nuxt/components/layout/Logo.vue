<template>
  <!-- Logo definitivo de STIRE (v3, cuadro «Logo-final» del lienzo; generador en scripts/diseno-v3/generador/logo_final.mjs):
       la mascota con su pantalla turquesa detrás y el borde blanco, y el nombre «stıre» con la s de circuito (Sistema), la t
       con las gafas del Tutor, la ı turquesa con el cerebro (Inteligente) y la r y la e en Poppins Bold. Es una marca: no
       se mueve (la que tiene vida es la mascota del Tutor). Los huecos de las gafas y del cerebro son transparentes
       (máscara), así el nombre se ve bien sobre cualquier fondo. -->
  <span class="logo-stire inline-flex items-center shrink-0" :class="{ claro }" :style="{ gap: `${Math.round(alto * 0.22)}px` }">
    <svg class="logo-isotipo" viewBox="20 26 168 140" :width="Math.round(alto * 168 / 140)" :height="alto" aria-hidden="true" shape-rendering="geometricPrecision">
      <rect x="34" y="32" width="148" height="100" rx="18" class="l-fondo" stroke-width="3.5" paint-order="stroke" />
      <rect x="26" y="40" width="148" height="100" rx="18" class="l-marco l-borde" stroke-width="3.5" paint-order="stroke" />
      <rect x="38" y="52" width="124" height="76" rx="10" class="l-pantalla" />
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M46 70 L30 62 M158 70 L174 62" class="l-patilla" stroke-width="6.5" />
        <path d="M46 70 L30 62 M158 70 L174 62" class="l-gafas" stroke-width="3.8" />
        <path d="M95 73 Q100 66 105 73" class="l-gafas" stroke-width="6" />
        <rect x="45.5" y="62.5" width="52" height="44" rx="16" class="l-gafas" stroke-width="4" />
        <rect x="107.5" y="62.5" width="52" height="44" rx="16" class="l-gafas" stroke-width="4" />
      </g>
      <rect x="43" y="58" width="52" height="44" rx="16" class="l-lente" stroke-width="7.5" />
      <rect x="105" y="58" width="52" height="44" rx="16" class="l-lente" stroke-width="7.5" />
      <path d="M76 70 L66 80 L76 90 M128 70 L138 80 L128 90" fill="none" class="l-ojo" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M82 114 Q100 127 118 114" fill="none" class="l-boca" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M36 150 H126.5 V151 a4.5 4.5 0 0 0 4.5 4.5 H147 a4.5 4.5 0 0 0 4.5 -4.5 V150 H164 a6 6 0 0 1 0 12 H36 a6 6 0 0 1 0 -12 Z" class="l-marco" />
    </svg>
    <svg v-if="conNombre" class="logo-nombre" viewBox="-6 18 654 196" :width="Math.round(altoNombre * 654 / 196)" :height="altoNombre" aria-hidden="true" shape-rendering="geometricPrecision">
      <defs>
        <mask :id="huecos" maskUnits="userSpaceOnUse" x="-6" y="18" width="654" height="196">
          <rect x="-6" y="18" width="654" height="196" fill="#fff" />
          <rect x="184" y="77" width="34.5" height="25" rx="5" fill="#000" />
          <rect x="247.5" y="77" width="34.5" height="25" rx="5" fill="#000" />
          <g transform="translate(363,64) scale(1.05)">
            <g v-for="lado in [1, -1]" :key="lado" :transform="`scale(${lado},1) translate(-3,0)`">
              <path d="M-3,-15 H-11 L-16,-20 M-3,0 H-17 M-3,13 H-10 L-15,18 M-9,-15 V-8" fill="none" stroke="#000" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="-17" cy="-21" r="4.4" fill="#000" /><circle cx="-18.5" cy="0" r="4.4" fill="#000" />
              <circle cx="-16" cy="19" r="4.4" fill="#000" /><circle cx="-9" cy="-6" r="3.6" fill="#000" />
            </g>
          </g>
        </mask>
      </defs>
      <!-- s: el circuito (Sistema) -->
      <g transform="translate(-13.5,12.8) scale(0.376)">
        <g fill="none" class="n-trazo" stroke-width="17" stroke-linejoin="miter">
          <path d="M350,75 H175 L105,145 V255 L170,320 H320 L350,350 V385 L320,415 H65" />
          <path d="M420,150 H205 L180,175 V215 L210,245 H375 L430,300 V425 L365,490 H140" />
        </g>
        <g class="n-tinta"><circle cx="350" cy="75" r="29" /><circle cx="420" cy="150" r="29" /><circle cx="65" cy="415" r="29" /><circle cx="140" cy="490" r="29" /></g>
      </g>
      <!-- t, r y e -->
      <g class="n-tinta">
        <path d="M373 145V0H286Q193 0 141.0 45.5Q89 91 89 194V694H260V192Q260 167 272.0 156.0Q284 145 312 145Z" transform="translate(192.9,200) scale(0.23,-0.23)" />
        <path d="M408 564V383H361Q297 383 265.0 355.5Q233 328 233 259V0H62V558H233V465Q263 511 308.0 537.5Q353 564 408 564Z" transform="translate(413,200) scale(0.23,-0.23)" />
        <path d="M585 238H198Q202 186 231.5 158.5Q261 131 304 131Q368 131 393 185H575Q561 130 524.5 86.0Q488 42 433.0 17.0Q378 -8 310 -8Q228 -8 164.0 27.0Q100 62 64.0 127.0Q28 192 28 279Q28 366 63.5 431.0Q99 496 163.0 531.0Q227 566 310 566Q391 566 454.0 532.0Q517 498 552.5 435.0Q588 372 588 288Q588 264 585 238ZM413 333Q413 377 383.0 403.0Q353 429 308 429Q265 429 235.5 404.0Q206 379 199 333Z" transform="translate(507,200) scale(0.23,-0.23)" />
      </g>
      <!-- Las gafas del Tutor sobre la t, y la ı turquesa con el cerebro (Inteligente) -->
      <g class="n-turquesa" :mask="`url(#${huecos})`">
        <rect x="168" y="78" width="10" height="10" rx="5" /><rect x="288" y="78" width="10" height="10" rx="5" />
        <rect x="226" y="80.5" width="14" height="10.5" />
        <rect x="174" y="67" width="54" height="45" rx="12" /><rect x="238" y="67" width="54" height="45" rx="12" />
        <rect x="343.3" y="110" width="39.4" height="90" />
        <g transform="translate(363,64) scale(1.05)">
          <path v-for="lado in [1, -1]" :key="lado" :transform="`scale(${lado},1) translate(-3,0)`"
            d="M-3,-27 C-12,-31 -22,-27 -23,-18 C-32,-15 -34,-3 -28,3 C-34,11 -28,23 -18,23 C-14,30 -5,30 -3,25 Z" class="n-borde-tq" stroke-width="6" stroke-linejoin="round" />
        </g>
      </g>
    </svg>
    <span class="sr-only">STIRE</span>
  </span>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(defineProps<{
  /** «grande» (48 px, pantallas de acceso), «normal» (28 px) y «mini» (20 px, menú y pie). */
  tamano?: 'mini' | 'normal' | 'grande'
  /** Junto al nombre «stıre». */
  conNombre?: boolean
  /** Nombre en blanco, para fondos de color. */
  claro?: boolean
}>(), { tamano: 'normal', conNombre: false, claro: false })

const grande = computed(() => props.tamano === 'grande')
const alto = computed(() => (grande.value ? 48 : props.tamano === 'mini' ? 20 : 28))
/** El nombre mide el 78 % del alto de la mascota, como en el cuadro del logo. */
const altoNombre = computed(() => Math.round(alto.value * 0.78))
const huecos = `logo-huecos-${useId()}`
</script>

<style scoped>
/* Colores del cuadro «Logo-final»: en claro tinta #102A4C y turquesa #14B3A4; en oscuro blanco y #2FD3C0. */
.logo-stire {
  --l-fondo: #00c2a8; --l-borde: #fff; --l-marco: #7b2fbf; --l-pantalla: #082b6b; --l-gafas: #00c2a8; --l-patilla: #008f7c;
  --l-lente: #fff; --l-ojo: #7b2fbf; --l-boca: #fff; --n-tinta: #102a4c; --n-turquesa: #14b3a4;
}
:global(:root[data-tema="oscuro"]) .logo-stire, .logo-stire.claro { --n-tinta: #fff; --n-turquesa: #2fd3c0; }
/* Alto contraste: igual que la mascota (components/tutor/Mascota.vue); el nombre, todo del color del texto. */
:global(:root[data-contraste="alto"]) .logo-stire {
  --l-fondo: #ffd60a; --l-marco: rgb(var(--c-base-texto-primario)); --l-pantalla: #000; --l-gafas: #ffd60a; --l-patilla: #ffd60a;
  --l-lente: #fff; --l-ojo: #000; --l-boca: #ffd60a; --n-tinta: rgb(var(--c-base-texto-primario)); --n-turquesa: rgb(var(--c-base-texto-primario));
}
.l-fondo { fill: var(--l-fondo); stroke: var(--l-borde); }
.l-marco { fill: var(--l-marco); }
.l-borde { stroke: var(--l-borde); }
.l-pantalla { fill: var(--l-pantalla); }
.l-gafas { stroke: var(--l-gafas); }
.l-patilla { stroke: var(--l-patilla); }
.l-lente { fill: var(--l-lente); stroke: var(--l-gafas); }
.l-ojo { stroke: var(--l-ojo); }
.l-boca { stroke: var(--l-boca); }
.n-tinta { fill: var(--n-tinta); }
.n-trazo { stroke: var(--n-tinta); }
.n-turquesa { fill: var(--n-turquesa); }
.n-borde-tq { stroke: var(--n-turquesa); }
.logo-isotipo, .logo-nombre { display: block; flex-shrink: 0; overflow: visible; }
</style>
