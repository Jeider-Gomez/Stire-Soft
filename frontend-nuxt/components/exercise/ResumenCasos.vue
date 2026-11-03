<!-- Cuántos ejemplos coinciden y qué sigue, sobre las tarjetas de «Casos de prueba» (02/11, Jeider: la consola solo muestra el resultado;
     la comparación y la retroalimentación van aquí). Antes de probar no dice nada: el título de la pestaña ya lo explica. -->
<template>
  <p
    role="status"
    aria-live="polite"
    class="text-xs leading-relaxed font-semibold"
    :class="resumen.estado === 'coincide' ? 'text-semantico-pasa' : resumen.estado === 'no-coincide' ? 'text-semantico-falla' : 'text-base-texto-secundario'">
    <template v-if="resumen.estado === 'ejecutando' || resumen.estado === 'coincide'">{{ siguientePaso(resumen) }}</template>
    <template v-else-if="resumen.estado === 'no-coincide'">
      {{ resumen.coinciden }} de {{ resumen.total }} {{ resumen.total === 1 ? 'ejemplo coincide' : 'ejemplos coinciden' }}. {{ siguientePaso(resumen) }}
    </template>
  </p>
</template>

<script setup lang="ts">
import { resumenDeSalida, siguientePaso, type CasoDeSalida } from '~/utils/salidaPrograma'

const props = defineProps<{ casos: ReadonlyArray<CasoDeSalida>; ejecutando: boolean }>()
const resumen = computed(() => resumenDeSalida(props.casos, props.ejecutando))
</script>
