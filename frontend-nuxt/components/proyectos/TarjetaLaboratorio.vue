<template>
  <!-- Un proyecto del Laboratorio en la lista (cuadro «E-Laboratorio»): una muestra arriba (el título de la página, las
       primeras líneas del programa o un diagrama), quién lo hizo y Probar / Hacer mi copia. -->
  <article class="tarjeta-lab">
    <NuxtLink :to="`/estudiante/proyectos/laboratorio/${pub.id}`" class="muestra sin-borde" :class="`muestra-${pub.tipo}`" tabindex="-1" aria-hidden="true">
      <span v-if="pub.tipo === 'web'" class="muestra-web">{{ pub.extracto || pub.titulo }}</span>
      <pre v-else-if="pub.extracto" class="muestra-codigo">{{ pub.extracto }}</pre>
      <span v-else class="muestra-diagrama"><Workflow :size="40" /></span>
    </NuxtLink>
    <div class="p-4 flex-1 flex flex-col gap-2">
      <h3 class="m-0 font-poppins font-bold text-[16px] leading-snug">{{ pub.titulo }}</h3>
      <p class="m-0 flex items-center gap-2 text-[13px] text-base-texto-secundario">
        <span class="avatar-lab" aria-hidden="true">{{ pub.autor.iniciales }}</span>
        <span class="truncate">{{ pub.esMia ? 'Tú' : pub.autor.nombre }}<template v-if="pub.clase"> · {{ pub.clase }}</template></span>
      </p>
      <p class="m-0 flex flex-wrap gap-1.5">
        <span class="pastilla-inicio pastilla-gris">{{ TIPO_PROYECTO[pub.tipo] }}</span>
        <span v-if="pub.alcance === 'universidad'" class="pastilla-inicio pastilla-lila">Toda la universidad</span>
        <span v-if="pub.oculta" class="pastilla-inicio pastilla-sol">Oculto</span>
      </p>
      <div class="mt-auto pt-2 flex items-center gap-2 border-t border-base-borde-sutil">
        <button type="button" class="gusto" :aria-pressed="pub.laMarque" :aria-label="`Me gusta ${pub.titulo}: ${pub.meGusta}`" @click="emit('me-gusta')">
          <Heart :size="16" :fill="pub.laMarque ? 'currentColor' : 'none'" aria-hidden="true" /> {{ pub.meGusta }}
        </button>
        <span v-if="pub.mensajes" class="text-[13px] text-base-texto-secundario inline-flex items-center gap-1"><MessageCircle :size="15" aria-hidden="true" /> {{ pub.mensajes }}<span class="sr-only"> mensajes</span></span>
        <NuxtLink :to="`/estudiante/proyectos/laboratorio/${pub.id}`" class="boton-lab borde-control ml-auto" :aria-label="`Probar ${pub.titulo}`"><Play :size="14" aria-hidden="true" /> Probar</NuxtLink>
        <button v-if="!pub.esMia" type="button" class="boton-lab" :disabled="copiando" @click="emit('copiar')">Hacer mi copia</button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Heart, MessageCircle, Play, Workflow } from 'lucide-vue-next'
import { TIPO_PROYECTO } from '~/utils/proyectoNavegador'
import type { PublicacionLaboratorio } from '~/composables/useLaboratorio'

defineProps<{ pub: PublicacionLaboratorio; copiando?: boolean }>()
const emit = defineEmits<{ 'me-gusta': []; copiar: [] }>()
</script>

<style scoped>
.tarjeta-lab { display: flex; flex-direction: column; overflow: hidden; border-radius: 18px; background: rgb(var(--c-base-blanco)); border: 1px solid rgb(var(--c-base-borde-sutil)); }
.muestra { display: flex; align-items: center; justify-content: center; height: 140px; overflow: hidden; }
.muestra-web { background: linear-gradient(135deg, #ffe4ef, #fff6d6); }
.muestra-javascript, .muestra-pseudocodigo { background: #14213d; justify-content: flex-start; align-items: flex-start; }
.muestra-diagrama { background: linear-gradient(135deg, #e3f6ff, #e6fbf6); color: #0a7f70; }
.muestra-web > span { padding: 0 16px; text-align: center; font-family: Poppins, sans-serif; font-weight: 800; font-size: 22px; color: #b0154f; line-height: 1.2; }
.muestra-codigo { margin: 0; padding: 12px 14px; font-size: 12px; line-height: 1.55; color: #e8f6ff; white-space: pre; }
.avatar-lab { flex: none; width: 26px; height: 26px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; background: rgb(var(--c-sec-lila-fondo)); color: rgb(var(--c-sec-lila-icono)); }
.gusto { display: inline-flex; align-items: center; gap: 5px; min-height: 40px; padding: 0 10px; border-radius: 10px; font-weight: 700; font-size: 14px; color: rgb(var(--c-base-texto-primario)); }
.boton-lab { display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 12px; border-radius: 10px; border: 1px solid rgb(var(--c-base-borde-fuerte)); font-size: 13px; font-weight: 700; white-space: nowrap; }
.boton-lab:hover { background: rgb(var(--c-base-bg-secundario)); }
.boton-lab:disabled { opacity: 0.6; }
.gusto:hover { background: rgb(var(--c-base-bg-secundario)); }
.gusto[aria-pressed="true"] { color: rgb(var(--c-sec-rosa-icono)); }
</style>
