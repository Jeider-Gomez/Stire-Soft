<!-- Guía en vivo para que el docente arme una buena lección (09/10, Jeider). Opcional y plegable: dice qué falta y por qué,
     sin bloquear nada (utils/guiaLeccion.ts; BT-42). Va en el panel de ejercicios de cada lección en «Contenidos». -->
<template>
  <details class="rounded-lg border border-semantico-info/30 bg-semantico-info/5 p-3 text-xs group">
    <summary class="cursor-pointer min-h-[44px] sm:min-h-[32px] flex items-center gap-1.5 font-bold text-base-texto-primario list-none">
      <ListChecks :size="15" class="text-semantico-info" aria-hidden="true" /> Para que sea una buena lección
      <span class="ml-auto text-[11px] font-semibold" :class="listos === puntos.length ? 'text-semantico-pasa' : 'text-base-texto-secundario'">{{ listos }} de {{ puntos.length }} listos</span>
      <ChevronDown :size="14" class="transition-transform group-open:rotate-180" aria-hidden="true" />
    </summary>
    <ul class="mt-2 space-y-1.5">
      <li v-for="p in puntos" :key="p.texto" class="flex gap-2">
        <CheckCircle2 v-if="p.ok" :size="15" class="shrink-0 mt-0.5 text-semantico-pasa" aria-hidden="true" />
        <Circle v-else :size="15" class="shrink-0 mt-0.5 text-base-texto-secundario" aria-hidden="true" />
        <span class="min-w-0">
          <span class="block font-semibold text-base-texto-primario">{{ p.texto }}<span class="sr-only">{{ p.ok ? ': listo' : ': falta' }}</span></span>
          <span v-if="!p.ok" class="block text-[11px] text-base-texto-primario">{{ p.porque }}</span>
        </span>
      </li>
    </ul>
    <ul class="mt-3 list-disc pl-4 space-y-0.5 text-[11px] text-base-texto-primario">
      <li v-for="c in CONSEJOS_LECCION" :key="c">{{ c }}</li>
    </ul>
  </details>
</template>

<script setup lang="ts">
import { CheckCircle2, ChevronDown, Circle, ListChecks } from 'lucide-vue-next'
import { CONSEJOS_LECCION, revisarLeccion, type EjercicioParaGuia, type ExplicacionParaGuia } from '~/utils/guiaLeccion'

const props = defineProps<{ explicaciones: ExplicacionParaGuia[]; ejercicios: EjercicioParaGuia[] }>()
const puntos = computed(() => revisarLeccion({ explicaciones: props.explicaciones, ejercicios: props.ejercicios }))
const listos = computed(() => puntos.value.filter((p) => p.ok).length)
</script>
