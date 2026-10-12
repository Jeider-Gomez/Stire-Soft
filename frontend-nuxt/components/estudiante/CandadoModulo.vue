<!-- José, UX-01 (09/10): en el plan del curso, el candado de un módulo cerrado dice qué lo abre y cuánto falta, a la vista
     aunque el módulo esté plegado (como Duolingo o Coursera). La barra llega hasta la meta, no hasta el 100 %. -->
<template>
  <span v-if="r" class="basis-full flex items-center gap-2 text-[11px] text-base-texto-primario">
    <span class="w-24 h-1.5 bg-base-blanco rounded-full overflow-hidden border border-base-borde-sutil shrink-0" aria-hidden="true">
      <span class="block h-full bg-acento-ambar-fuerte" :style="{ width: `${avance}%` }"></span>
    </span>
    <span>Se abre con {{ r.umbral }} % en «{{ r.titulo }}» · llevas {{ r.dominio }} %</span>
  </span>
</template>

<script setup lang="ts">
import { useStudentStore } from '~/stores/student'

const props = defineProps<{ moduloId: number }>()
const studentStore = useStudentStore()
const r = computed(() => studentStore.estadoModulo(props.moduloId)?.requiere ?? null)
/** 30 % de una meta de 50 % llena el 60 % de la barra. */
const avance = computed(() => (r.value && r.value.umbral > 0 ? Math.min(100, Math.round((r.value.dominio / r.value.umbral) * 100)) : 0))
</script>
