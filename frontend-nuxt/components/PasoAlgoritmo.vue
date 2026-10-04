<template>
  <!-- Un paso del «Paso a paso» de un algoritmo, con sus pasos internos (Si / Mientras / Para) anidados. -->
  <li class="flex gap-2">
    <span class="shrink-0 font-codigo text-[11px] text-slate-500 min-w-[2.5rem]">{{ paso.numero }}</span>
    <div class="space-y-1.5 min-w-0">
      <span>{{ paso.texto }}</span>
      <ol v-if="paso.hijos.length" class="space-y-1.5 pl-2 border-l-2 border-base-borde-sutil">
        <PasoAlgoritmo v-for="h in paso.hijos" :key="h.numero" :paso="h" />
      </ol>
    </div>
  </li>
</template>

<script setup lang="ts">
import type { Paso } from '~/utils/algoritmoMultiformato'

defineProps<{ paso: Paso }>()
</script>
