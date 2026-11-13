<template>
  <!-- «¿Qué es STIRE?» (cuadros «Entrar» y «Video-mascota» del lienzo v3): una tarjeta que abre el video sin salir de
       la página. <dialog> nativo: atrapa el foco, Esc cierra y el foco vuelve a la tarjeta (LECCIONES §D, regla 13).
       El video no arranca solo, tiene subtítulos y la transcripción se lee debajo (WCAG 1.2.1, 1.2.2 y 2.2.2). -->
  <div>
    <button ref="boton" type="button" class="tarjeta-video" @click="abrir">
      <span class="miniatura" :style="{ backgroundImage: `url(${VIDEO_PRESENTACION.poster})` }" aria-hidden="true">
        <span class="play"><Play :size="14" fill="currentColor" /></span>
      </span>
      <span class="text-left">
        <strong class="block text-base font-bold">¿Qué es STIRE?</strong>
        <span class="text-sm text-base-texto-secundario">Conócelo en menos de 2 minutos · con subtítulos</span>
      </span>
    </button>

    <dialog ref="dialogo" aria-labelledby="video-titulo" class="ventana-video" @close="alCerrar">
      <div class="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <h2 id="video-titulo" class="m-0 font-poppins text-lg font-bold">Conoce a tu Tutor · {{ VIDEO_PRESENTACION.duracion }}</h2>
        <button type="button" class="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-base-bg-secundario"
          aria-label="Cerrar el video" title="Cerrar el video" @click="dialogo?.close()">
          <X :size="20" aria-hidden="true" />
        </button>
      </div>
      <video v-if="cargado" ref="video" class="w-full aspect-video bg-black" controls preload="metadata" playsinline
        :poster="VIDEO_PRESENTACION.poster" @error="fallo = true">
        <source :src="VIDEO_PRESENTACION.mp4" type="video/mp4">
        <track kind="captions" srclang="es" label="Español" :src="VIDEO_PRESENTACION.subtitulos" default>
      </video>
      <p v-if="fallo" role="alert" class="mx-5 mt-3 mb-0 text-sm font-semibold text-semantico-falla">
        El video no cargó. Revisa tu conexión y vuelve a abrirlo; mientras tanto, abajo está lo que dice.
      </p>
      <details class="px-5 py-4">
        <summary class="cursor-pointer min-h-[44px] flex items-center font-semibold underline">Leer la transcripción</summary>
        <ol class="mt-2 mb-0 pl-5 space-y-2 text-[15px] leading-relaxed">
          <li v-for="(linea, i) in TRANSCRIPCION" :key="i">{{ linea }}</li>
        </ol>
      </details>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { Play, X } from 'lucide-vue-next'
import { TRANSCRIPCION, VIDEO_PRESENTACION } from '~/utils/videoPresentacion'

const boton = ref<HTMLButtonElement | null>(null)
const dialogo = ref<HTMLDialogElement | null>(null)
const video = ref<HTMLVideoElement | null>(null)
/** El video se pide solo al abrir la ventana: así Entrar no descarga megas que quizá nadie mira. */
const cargado = ref(false)
const fallo = ref(false)

function abrir() {
  cargado.value = true
  fallo.value = false
  dialogo.value?.showModal()
}
function alCerrar() {
  video.value?.pause()
  boton.value?.focus()
}
</script>

<style scoped>
.tarjeta-video {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 18px 10px 10px;
  border-radius: 18px;
  background: rgb(var(--c-base-blanco));
  border: 1px solid rgb(var(--c-base-borde-sutil));
  color: rgb(var(--c-base-texto-primario));
  transition: border-color 0.15s ease;
}
.tarjeta-video:hover { border-color: rgb(var(--c-base-borde-fuerte)); }
.miniatura {
  flex: none;
  width: 96px;
  height: 54px;
  border-radius: 10px;
  background: #0f172a center / cover;
  display: flex;
  align-items: center;
  justify-content: center;
}
.play {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #fff;
  color: #14213d;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ventana-video {
  width: min(56rem, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  padding: 0;
  border: 0;
  border-radius: 20px;
  background: rgb(var(--c-base-blanco));
  color: rgb(var(--c-base-texto-primario));
  box-shadow: 0 30px 70px rgba(15, 23, 42, 0.25);
}
.ventana-video::backdrop { background: rgb(15 23 42 / 0.55); }
</style>
