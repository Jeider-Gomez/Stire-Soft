<!-- «Lo que necesitas saber (ya lo viste)» (v3, Fase D, paso 3; cuadro «E-Ejercicio» v9; antes «Lo que vas a usar», 10/10,
     Jeider): los conceptos de JavaScript que pide este ejercicio, cada uno con lo que se escribe, una frase y, al abrirlo,
     un ejemplo de otro contexto; y siempre el camino a la lección para repasar. Cada duda lleva a la parte de la lección
     que ya debería saber, antes que al Tutor. Abierto la primera vez; plegado si ya lo resolvió. utils/conceptosEjercicio.ts -->
<template>
  <details v-if="conceptos.length" :open="!yaAprobado" class="saber-ejercicio rounded-2xl border border-base-borde-sutil bg-base-blanco p-3 group">
    <summary class="cursor-pointer min-h-[36px] flex items-center gap-1.5 font-bold text-sm text-base-texto-primario list-none">
      <BookMarked :size="16" class="text-acento-ambar-fuerte" aria-hidden="true" /> Lo que necesitas saber
      <span class="font-normal text-xs text-base-texto-secundario">(ya lo viste · {{ conceptos.length }})</span>
      <ChevronDown :size="15" class="ml-auto transition-transform group-open:rotate-180" aria-hidden="true" />
    </summary>
    <ul class="mt-2 space-y-1.5 list-none p-0">
      <li v-for="c in conceptos" :key="c.clave">
        <details class="rounded-xl border border-base-borde-sutil">
          <summary class="cursor-pointer min-h-[44px] px-2.5 py-1.5 grid grid-cols-[minmax(0,7.5rem)_1fr] items-center gap-2.5 list-none">
            <code class="font-codigo text-xs bg-base-bg-secundario rounded-md px-1.5 py-1 justify-self-start break-all">{{ c.codigo }}</code>
            <span class="text-[13px] leading-snug"><strong class="font-semibold">{{ c.titulo }}</strong></span>
          </summary>
          <div class="px-2.5 pb-2.5 space-y-1.5">
            <p class="m-0 text-[13px] text-base-texto-primario leading-relaxed">{{ c.idea }}</p>
            <p class="m-0 text-[11px] text-base-texto-secundario">Mira el ejemplo: es otro problema, con otros datos.</p>
            <pre class="m-0 font-codigo text-xs bg-editor-bg text-editor-text rounded-lg px-2.5 py-2 overflow-x-auto whitespace-pre">{{ c.ejemplo }}</pre>
          </div>
        </details>
      </li>
    </ul>
    <NuxtLink v-if="learningUnitId" :to="`/estudiante/unidad/${learningUnitId}#explicacion`" class="mt-2 min-h-[44px] inline-flex items-center gap-1.5 text-[13px] font-semibold texto-menta hover:underline">
      <BookOpen :size="15" aria-hidden="true" /> Repasar la lección<template v-if="unidad"> «{{ unidad }}»</template>
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
