<!-- Cómo resolver un ejercicio de programar, paso a paso (08/10, Jeider). Abierto la primera vez; plegado si ya lo
     resolvió. Los pasos salen del ejemplo y la plantilla del ejercicio (utils/pasosCodigo.ts). -->
<template>
  <details :open="!yaAprobado" class="rounded-lg border border-semantico-info/30 bg-semantico-info/5 p-3 group">
    <summary class="cursor-pointer min-h-[32px] flex items-center gap-1.5 font-bold text-base-texto-primario list-none">
      <ListOrdered :size="15" class="text-semantico-info" aria-hidden="true" /> Cómo resolverlo, paso a paso
      <ChevronDown :size="14" class="ml-auto transition-transform group-open:rotate-180" aria-hidden="true" />
    </summary>
    <ol class="mt-2 space-y-2">
      <li v-for="(p, i) in pasos" :key="i" class="flex gap-2">
        <span class="shrink-0 w-5 h-5 rounded-full bg-semantico-info text-base-blanco text-[10px] font-bold flex items-center justify-center" aria-hidden="true">{{ i + 1 }}</span>
        <span class="min-w-0 space-y-1">
          <span class="block font-semibold text-base-texto-primario">{{ p.titulo }}</span>
          <span class="block text-[11px] text-base-texto-primario [&_code]:font-mono [&_code]:bg-base-blanco [&_code]:px-1 [&_code]:rounded" v-html="conCodigo(p.detalle)" />
          <code v-if="p.codigo" class="block font-mono text-[11px] bg-editor-bg text-editor-text rounded px-2 py-1 overflow-x-auto">{{ p.codigo }}</code>
        </span>
      </li>
    </ol>
    <button type="button" class="mt-3 w-full min-h-[44px] rounded-md bg-stire-purple text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 hover:opacity-90" @click="$emit('por-pasos')">
      <Sparkles :size="14" aria-hidden="true" /> Que el Tutor me guíe paso a paso
    </button>
  </details>
</template>

<script setup lang="ts">
import { ChevronDown, ListOrdered, Sparkles } from 'lucide-vue-next'
import { pasosCodigo } from '~/utils/pasosCodigo'

const props = defineProps<{ codigo: string; ejemplo?: { input: string; expectedOutput: string } | null; yaAprobado?: boolean }>()
defineEmits<{ 'por-pasos': [] }>()

const pasos = computed(() => pasosCodigo({ codigo: props.codigo, ejemplo: props.ejemplo }))

const escapar = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/** `texto` entre comillas invertidas se ve como código; todo lo demás se escapa. */
const conCodigo = (t: string) => escapar(t).replace(/`([^`]+)`/g, '<code>$1</code>')
</script>
