<template>
  <!-- La libreta del Asistente (cuadros Asistente-mascota y D3-Asistente del lienzo v3; generador
       scripts/diseno-v3/generador/proto_est2.mjs, LIB_P y LIB_G): la libreta azul con las gafas del Tutor, «misma
       familia, otro objeto». El borde blanco (filtro) la separa de cualquier fondo, también en oscuro. Por debajo de 40 px
       usa el dibujo simplificado, con trazos gruesos. Es decorativa: el nombre lo da el botón o el título de al lado. -->
  <svg v-if="tamano < 40" :width="tamano" :height="Math.round(tamano * 150 / 144)" viewBox="8 0 144 150" aria-hidden="true" class="libreta-asistente" shape-rendering="geometricPrecision">
    <defs>
      <filter :id="borde" x="-20%" y="-20%" width="140%" height="140%">
        <feMorphology in="SourceAlpha" operator="dilate" radius="9" result="g" /><feFlood flood-color="#FFFFFF" />
        <feComposite in2="g" operator="in" result="borde" /><feMerge><feMergeNode in="borde" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <g :filter="`url(#${borde})`">
      <rect x="20" y="22" width="120" height="116" rx="22" fill="#14213D" />
      <rect x="20" y="126" width="120" height="12" rx="6" fill="#082B6B" />
      <rect x="31" y="33" width="98" height="92" rx="12" fill="#FFFFFF" />
      <rect x="44" y="10" width="11" height="26" rx="5.5" fill="#5B6B7A" />
      <rect x="75" y="10" width="11" height="26" rx="5.5" fill="#5B6B7A" />
      <rect x="106" y="10" width="11" height="26" rx="5.5" fill="#5B6B7A" />
      <rect x="36" y="56" width="40" height="34" rx="12" fill="#fff" stroke="#00C2A8" stroke-width="9" />
      <rect x="84" y="56" width="40" height="34" rx="12" fill="#fff" stroke="#00C2A8" stroke-width="9" />
      <path d="M76 66 H84" stroke="#00C2A8" stroke-width="7" />
      <path d="M47 79 L56 70 L65 79 M95 79 L104 70 L113 79" fill="none" stroke="#14213D" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M66 106 Q80 116 94 106" fill="none" stroke="#14213D" stroke-width="7" stroke-linecap="round" />
    </g>
  </svg>
  <svg v-else :width="tamano" :height="Math.round(tamano * 166 / 192)" viewBox="14 6 192 166" aria-hidden="true" class="libreta-asistente" shape-rendering="geometricPrecision">
    <defs>
      <filter :id="borde" x="-20%" y="-20%" width="140%" height="140%">
        <feMorphology in="SourceAlpha" operator="dilate" radius="6" result="g" /><feFlood flood-color="#FFFFFF" />
        <feComposite in2="g" operator="in" result="borde" /><feMerge><feMergeNode in="borde" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <g :filter="`url(#${borde})`">
      <rect x="30" y="30" width="140" height="128" rx="18" fill="#14213D" />
      <rect x="30" y="148" width="140" height="10" rx="5" fill="#082B6B" />
      <rect x="40" y="40" width="120" height="112" rx="10" fill="#FFFFFF" />
      <path d="M48 108 H152 M48 126 H152 M48 144 H152" stroke="#DCE7F5" stroke-width="2" />
      <rect v-for="x in [52, 72, 92, 112, 132]" :key="x" :x="x" y="22" width="8" height="22" rx="4" fill="#5B6B7A" />
      <g fill="none" stroke-linecap="round">
        <path d="M46 80 L34 74 M154 80 L166 74" stroke="#00C2A8" stroke-width="4.5" />
        <path d="M95 84 Q100 78 105 84" stroke="#00C2A8" stroke-width="5" />
      </g>
      <rect x="50" y="68" width="45" height="38" rx="14" fill="#fff" stroke="#00C2A8" stroke-width="6.5" />
      <rect x="105" y="68" width="45" height="38" rx="14" fill="#fff" stroke="#00C2A8" stroke-width="6.5" />
      <path d="M63 91 L72 83 L81 91 M119 91 L128 83 L137 91" fill="none" stroke="#14213D" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M86 116 Q100 126 114 116" fill="none" stroke="#14213D" stroke-width="5.5" stroke-linecap="round" />
      <!-- El lápiz: escribe borradores. -->
      <g transform="translate(172 92) rotate(28)">
        <rect x="-7" y="-46" width="14" height="52" rx="3" fill="#FFD60A" stroke="#14213D" stroke-width="3" />
        <rect x="-7" y="-52" width="14" height="10" rx="3" fill="#F9A8D4" stroke="#14213D" stroke-width="3" />
        <path d="M-7 6 L0 22 L7 6 Z" fill="#FDE7C2" stroke="#14213D" stroke-width="3" stroke-linejoin="round" />
        <path d="M-2.5 16 L0 22 L2.5 16 Z" fill="#14213D" />
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { useId } from 'vue'

withDefaults(defineProps<{
  /** Ancho en píxeles. */
  tamano?: number
}>(), { tamano: 30 })
const borde = `libreta-borde-${useId()}`
</script>

<style scoped>
.libreta-asistente { display: block; flex-shrink: 0; overflow: visible; }
</style>
