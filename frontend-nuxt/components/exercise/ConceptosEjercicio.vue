<!-- «Lo que vas a usar» (10/10, Jeider): los conceptos de JavaScript que pide este ejercicio, cada uno con un ejemplo de
     otro contexto, y el enlace a la lección para repasar. Abierto la primera vez; plegado si ya lo resolvió.
     utils/conceptosEjercicio.ts -->
<template>
  <details v-if="conceptos.length" :open="!yaAprobado" class="rounded-lg border border-acento-ambar/40 bg-acento-ambar/5 p-3 group">
    <summary class="cursor-pointer min-h-[32px] flex items-center gap-1.5 font-bold text-base-texto-primario list-none">
      <BookMarked :size="15" class="text-acento-ambar-fuerte" aria-hidden="true" /> Lo que vas a usar
      <span class="font-normal text-[11px] text-base-texto-secundario">({{ conceptos.length }})</span>
      <ChevronDown :size="14" class="ml-auto transition-transform group-open:rotate-180" aria-hidden="true" />
    </summary>
    <p class="mt-1 text-[11px] text-base-texto-secundario">Si no lo recuerdas, mira el ejemplo: es otro problema, con otros datos.</p>
    <ul class="mt-2 space-y-2">
      <li v-for="c in conceptos" :key="c.clave">
        <details class="rounded border border-base-borde-sutil bg-base-blanco px-2 py-1.5">
          <summary class="cursor-pointer min-h-[32px] flex items-center font-semibold text-base-texto-primario">{{ c.titulo }}</summary>
          <p class="text-[11px] text-base-texto-primario mt-1">{{ c.idea }}</p>
          <pre class="mt-1.5 font-mono text-[11px] bg-editor-bg text-editor-text rounded px-2 py-1.5 overflow-x-auto whitespace-pre">{{ c.ejemplo }}</pre>
        </details>
      </li>
    </ul>
    <NuxtLink v-if="learningUnitId" :to="`/estudiante/unidad/${learningUnitId}`" class="mt-2 min-h-[44px] inline-flex items-center gap-1 text-[11px] font-semibold text-semantico-info hover:underline">
      <BookOpen :size="13" aria-hidden="true" /> Repasar la lección<template v-if="unidad"> «{{ unidad }}»</template>
    </NuxtLink>
  </details>
</template>

<script setup lang="ts">
import { BookMarked, BookOpen, ChevronDown } from 'lucide-vue-next'
import { conceptosDelEjercicio } from '~/utils/conceptosEjercicio'

const props = defineProps<{
  enunciado: string
  plantilla: string
  ejemplo?: { input: string; expectedOutput: string } | null
  unidad?: string
  learningUnitId?: number
  yaAprobado?: boolean
}>()

const conceptos = computed(() => conceptosDelEjercicio({ enunciado: props.enunciado, plantilla: props.plantilla, ejemplo: props.ejemplo, unidad: props.unidad }))
</script>
