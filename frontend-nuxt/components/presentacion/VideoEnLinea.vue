<template>
  <!-- El video de presentación dentro de la página de inicio (cuadro «Pagina-inicio»). No arranca solo; solo se piden
       sus datos básicos hasta que alguien le da play. Subtítulos y transcripción (WCAG 1.2.1 y 1.2.2). -->
  <figure class="m-0 flex flex-col gap-3">
    <video class="video-inicio" controls preload="metadata" playsinline :poster="VIDEO_PRESENTACION.poster"
      :aria-label="`Video: el Tutor de STIRE explica qué es STIRE (${VIDEO_PRESENTACION.duracion}, con subtítulos)`" @error="fallo = true">
      <source :src="VIDEO_PRESENTACION.mp4" type="video/mp4">
      <track kind="captions" srclang="es" label="Español" :src="VIDEO_PRESENTACION.subtitulos" default>
    </video>
    <p v-if="fallo" role="alert" class="m-0 text-sm font-semibold text-semantico-falla">
      El video no cargó. Revisa tu conexión y recarga la página; mientras tanto, abajo está lo que dice.
    </p>
    <figcaption class="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[15px] font-semibold">
      <TutorMascota :tamano="22" :vivo="false" aria-hidden="true" />
      <span>Conoce a tu Tutor · {{ VIDEO_PRESENTACION.duracion }} · con subtítulos</span>
      <button type="button" class="ml-auto min-h-[44px] underline" :aria-expanded="verTexto" aria-controls="transcripcion-inicio"
        @click="verTexto = !verTexto">{{ verTexto ? 'Ocultar la transcripción' : 'Leer la transcripción' }}</button>
    </figcaption>
    <ol v-show="verTexto" id="transcripcion-inicio" class="m-0 pl-5 space-y-2 text-[15px] leading-relaxed text-base-texto-secundario">
      <li v-for="(linea, i) in TRANSCRIPCION" :key="i">{{ linea }}</li>
    </ol>
  </figure>
</template>

<script setup lang="ts">
import { TRANSCRIPCION, VIDEO_PRESENTACION } from '~/utils/videoPresentacion'

const verTexto = ref(false)
const fallo = ref(false)
</script>

<style scoped>
.video-inicio {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 20px;
  background: #0f172a;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
}
</style>
