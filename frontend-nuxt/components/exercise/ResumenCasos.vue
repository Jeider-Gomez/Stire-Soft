<!-- Cuántos ejemplos coinciden y qué sigue, sobre las tarjetas de «Casos de prueba» (02/11, Jeider: la consola solo muestra el resultado;
     la comparación y la retroalimentación van aquí). Antes de probar no dice nada: el título de la pestaña ya lo explica. -->
<template>
  <!-- v3 (cuadro «E-Ejercicio-Casos»): «Cumples 2 de 4 casos» con una barra por caso, y qué sigue. -->
  <div class="space-y-2">
    <div v-if="probado" class="flex items-center justify-between gap-2">
      <p class="m-0 text-base font-bold">Cumples {{ casos.filter((c) => c.passed === true).length }} de {{ casos.length }} {{ casos.length === 1 ? 'caso' : 'casos' }}</p>
      <span class="text-xs text-base-texto-secundario">no gastaste intentos</span>
    </div>
    <div v-if="probado" class="flex gap-1" aria-hidden="true">
      <span v-for="(c, i) in casos" :key="i" class="h-1.5 flex-1 rounded-full" :class="c.passed === true ? 'bg-[#00c2a8]' : c.passed === false ? 'bg-[#ffc94d]' : 'bg-base-borde-sutil'" />
    </div>
    <p
      role="status"
      aria-live="polite"
      class="m-0 text-xs leading-relaxed font-semibold"
      :class="resumen.estado === 'coincide' ? 'text-semantico-pasa' : 'text-base-texto-secundario'">
      <template v-if="resumen.estado === 'ejecutando' || resumen.estado === 'coincide'">{{ siguientePaso(resumen) }}</template>
      <template v-else-if="resumen.estado === 'no-coincide'">
        {{ resumen.coinciden }} de {{ resumen.total }} {{ resumen.total === 1 ? 'ejemplo coincide' : 'ejemplos coinciden' }}. {{ siguientePaso(resumen) }}
      </template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { resumenDeSalida, siguientePaso, type CasoDeSalida } from '~/utils/salidaPrograma'

const props = defineProps<{ casos: ReadonlyArray<CasoDeSalida>; ejecutando: boolean }>()
const resumen = computed(() => resumenDeSalida(props.casos, props.ejecutando))
/** «Cumples n de m» solo después de probar: antes, «0 de 4» parecería un fallo. */
const probado = computed(() => props.casos.some((c) => c.passed !== undefined))
</script>
