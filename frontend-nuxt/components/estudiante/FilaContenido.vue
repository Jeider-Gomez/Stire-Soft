<template>
  <!-- Una lección en «Contenido del curso»: el círculo con su estado (ícono Y texto, nunca solo color), el nombre completo
       y, en la abierta, su dominio; en la que sigue, «Sigue». -->
  <NuxtLink :to="`/estudiante/unidad/${leccion.id}`" :aria-current="leccion.estado === 'aqui' ? 'page' : undefined"
    class="fila-contenido flex items-center gap-2.5 min-h-[44px] px-2.5 py-2 rounded-[11px] text-sm"
    :class="leccion.estado === 'aqui' ? 'font-bold actual' : 'font-medium'">
    <span class="circulo flex-none w-5 h-5 rounded-full inline-flex items-center justify-center" :class="`c-${leccion.estado}`" aria-hidden="true">
      <Check v-if="leccion.estado === 'hecho'" :size="11" :stroke-width="3" />
    </span>
    <span class="flex-1 leading-snug">{{ leccion.titulo }}<span class="sr-only"> ({{ TEXTO_ESTADO[leccion.estado] }})</span></span>
    <span v-if="leccion.estado === 'aqui'" class="text-[11px] font-bold texto-menta" aria-hidden="true">{{ leccion.dominio }} %</span>
    <span v-else-if="leccion.estado === 'sigue'" class="text-[11px] font-bold texto-sol" aria-hidden="true">Sigue</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { TEXTO_ESTADO, type LeccionContenido } from '~/utils/contenidoCurso'

defineProps<{ leccion: LeccionContenido }>()
</script>

<style scoped>
.fila-contenido { transition: background-color 0.15s ease; }
.fila-contenido:hover { background: rgb(var(--c-base-bg-secundario)); }
.fila-contenido.actual { background: rgb(var(--c-sec-menta-fondo)); }
.c-hecho { background: #00c2a8; color: #14213d; }
.c-aqui { background: rgb(var(--c-base-texto-primario)); }
.c-sigue { border: 2px dashed #ffc94d; }
.c-empezada { border: 2px solid #ffc94d; }
.c-pendiente { border: 1.5px solid rgb(var(--c-base-borde-fuerte)); }
.texto-menta { color: rgb(var(--c-semantico-pasa)); }
.texto-sol { color: #7a4b00; }
:root[data-tema='oscuro'] .texto-menta { color: rgb(var(--c-sec-menta-icono)); }
:root[data-tema='oscuro'] .texto-sol { color: rgb(var(--c-sec-sol-icono)); }
</style>
