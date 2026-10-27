<template>
  <!-- Logo de STIRE (docs/identidad-visual/propuestas/mascota-stire.html): la pantalla con gafas y, si se pide, el
       nombre «stire_» con el punto de la i y el cursor en turquesa. Es una marca: no se mueve (la que tiene vida es la
       mascota del Tutor). En tamaño pequeño usa el dibujo simplificado del favicon, con trazos gruesos, para que no se
       vea pixelado; en grande, el dibujo completo. -->
  <span class="logo-stire inline-flex items-center shrink-0" :class="grande ? 'gap-3' : 'gap-2'">
    <svg v-if="!grande" class="logo-isotipo" viewBox="0 0 64 64" :width="alto" :height="alto" aria-hidden="true" shape-rendering="geometricPrecision">
      <rect x="1" y="3" width="62" height="58" rx="14" class="l-marco" />
      <rect x="3.5" y="5.5" width="57" height="53" rx="12" class="l-pantalla" />
      <g transform="translate(32 33.5) scale(1.1) translate(-32 -28)">
        <g fill="none" stroke-linecap="round">
          <path d="M10.5 17 L5.5 14.5 M53.5 17 L58.5 14.5" class="l-gafas" stroke-width="3" />
          <path d="M29.5 18 H34.5" class="l-gafas" stroke-width="3.5" />
        </g>
        <rect x="10.5" y="11" width="19" height="19" rx="6" class="l-lente" stroke-width="3.5" />
        <rect x="34.5" y="11" width="19" height="19" rx="6" class="l-lente" stroke-width="3.5" />
        <path d="M22 16.5 L18 20.5 L22 24.5 M42 16.5 L46 20.5 L42 24.5" fill="none" class="l-ojo" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M24 37.5 Q32 44.5 40 37.5" fill="none" class="l-boca" stroke-width="4.2" stroke-linecap="round" />
      </g>
    </svg>
    <svg v-else class="logo-isotipo" viewBox="22 36 156 130" :width="Math.round(alto * 156 / 130)" :height="alto" aria-hidden="true" shape-rendering="geometricPrecision">
      <rect x="26" y="40" width="148" height="100" rx="18" class="l-marco" />
      <rect x="38" y="52" width="124" height="76" rx="10" class="l-pantalla" />
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M46 70 L30 62 M158 70 L174 62" class="l-patilla" stroke-width="6.5" />
        <path d="M46 70 L30 62 M158 70 L174 62" class="l-gafas" stroke-width="3.8" />
        <path d="M95 73 Q100 66 105 73" class="l-gafas" stroke-width="6" />
      </g>
      <rect x="43" y="58" width="52" height="44" rx="16" class="l-lente" stroke-width="7.5" />
      <rect x="105" y="58" width="52" height="44" rx="16" class="l-lente" stroke-width="7.5" />
      <path d="M76 70 L66 80 L76 90 M128 70 L138 80 L128 90" fill="none" class="l-ojo" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M82 114 Q100 127 118 114" fill="none" class="l-boca" stroke-width="6" stroke-linecap="round" />
      <path d="M36 150 H126.5 V151 a4.5 4.5 0 0 0 4.5 4.5 H147 a4.5 4.5 0 0 0 4.5 -4.5 V150 H164 a6 6 0 0 1 0 12 H36 a6 6 0 0 1 0 -12 Z" class="l-marco" />
    </svg>
    <span v-if="conNombre" class="logo-nombre" :class="{ claro }" :style="{ fontSize: `${Math.round(alto * (grande ? 0.62 : 0.78))}px` }" aria-hidden="true">st<span class="i">ı</span>re<span class="cursor" /></span>
    <span class="sr-only">STIRE</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** «grande» (48 px, pantallas de acceso) usa el dibujo completo; «normal» (28 px), el del favicon. */
  tamano?: 'normal' | 'grande'
  /** Junto al nombre «stire_». */
  conNombre?: boolean
  /** Nombre en blanco, para fondos de color. */
  claro?: boolean
}>(), { tamano: 'normal', conNombre: false, claro: false })

const grande = computed(() => props.tamano === 'grande')
const alto = computed(() => (grande.value ? 48 : 28))
</script>

<style scoped>
.logo-stire { --l-marco: #7b2fbf; --l-pantalla: #082b6b; --l-gafas: #00c2a8; --l-patilla: #008f7c; --l-lente: #fff; --l-ojo: #7b2fbf; --l-boca: #fff; }
.l-marco { fill: var(--l-marco); }
.l-pantalla { fill: var(--l-pantalla); }
.l-gafas { stroke: var(--l-gafas); }
.l-patilla { stroke: var(--l-patilla); }
.l-lente { fill: var(--l-lente); stroke: var(--l-gafas); }
.l-ojo { stroke: var(--l-ojo); }
.l-boca { stroke: var(--l-boca); }
/* Alto contraste: igual que la mascota (components/tutor/Mascota.vue). */
:global(:root[data-contraste="alto"]) .logo-stire {
  --l-marco: rgb(var(--c-base-texto-primario)); --l-pantalla: #000; --l-gafas: #ffd60a; --l-patilla: #ffd60a;
  --l-lente: #fff; --l-ojo: #000; --l-boca: #ffd60a;
}
.logo-isotipo { display: block; flex-shrink: 0; }

/* «stire_»: minúsculas, el punto de la i y el cursor en turquesa, como en el logo con nombre. */
.logo-nombre { font-family: Inter, system-ui, sans-serif; font-weight: 700; line-height: 1; letter-spacing: -0.035em; color: #0b3d91; white-space: nowrap; }
.logo-nombre.claro { color: #fff; }
:global(:root[data-tema="oscuro"]) .logo-nombre:not(.claro) { color: rgb(var(--c-base-texto-primario)); }
:global(:root[data-contraste="alto"]) .logo-nombre:not(.claro) { color: rgb(var(--c-base-texto-primario)); }
.logo-nombre .i { position: relative; }
.logo-nombre .i::after { content: ''; position: absolute; left: 50%; top: 0.04em; width: 0.21em; height: 0.21em; border-radius: 50%; background: #00c2a8; transform: translateX(-50%); }
.logo-nombre .cursor { display: inline-block; width: 0.5em; height: 0.12em; margin-left: 0.06em; border-radius: 999px; background: #00c2a8; }
</style>
