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
          <!-- Qué hay en cada posición de `lineas` con el ejemplo (10/10: se confundía la posición con el valor). -->
          <dl v-if="p.datos?.length" class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[11px] bg-base-blanco rounded border border-base-borde-sutil px-2 py-1.5">
            <template v-for="d in p.datos" :key="d.posicion">
              <dt class="text-semantico-info font-semibold">{{ d.posicion }}</dt>
              <dd class="text-base-texto-primario whitespace-pre-wrap break-all">"{{ d.valor }}"</dd>
            </template>
          </dl>
          <!-- Una meta por línea de la salida, con su marca cuando la última prueba ya la mostró igual. -->
          <ul v-if="p.metas?.length" class="space-y-1">
            <li v-for="m in p.metas" :key="m.linea" class="flex items-center gap-1.5 text-[11px]">
              <CheckCircle2 v-if="m.ok" :size="14" class="shrink-0 text-semantico-pasa" aria-hidden="true" />
              <XCircle v-else-if="m.ok === false" :size="14" class="shrink-0 text-semantico-falla" aria-hidden="true" />
              <Circle v-else :size="14" class="shrink-0 text-base-texto-secundario" aria-hidden="true" />
              <span>Línea {{ m.linea }}: <code class="font-mono bg-base-blanco px-1 rounded">{{ m.esperado }}</code></span>
              <span class="sr-only">{{ m.ok ? '(ya coincide)' : m.ok === false ? '(todavía no coincide)' : '' }}</span>
            </li>
          </ul>
          <code v-if="p.codigo" class="block font-mono text-[11px] bg-editor-bg text-editor-text rounded px-2 py-1 overflow-x-auto whitespace-pre">{{ p.codigo }}</code>
        </span>
      </li>
    </ol>
    <button type="button" class="mt-3 w-full min-h-[44px] rounded-md bg-stire-purple text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 hover:opacity-90" @click="$emit('por-pasos')">
      <Sparkles :size="14" aria-hidden="true" /> Que el Tutor me guíe paso a paso
    </button>
  </details>
</template>

<script setup lang="ts">
import { CheckCircle2, ChevronDown, Circle, ListOrdered, Sparkles, XCircle } from 'lucide-vue-next'
import { pasosCodigo } from '~/utils/pasosCodigo'

const props = defineProps<{
  codigo: string
  ejemplo?: { input: string; expectedOutput: string; actualOutput?: string; passed?: boolean } | null
  yaAprobado?: boolean
}>()
defineEmits<{ 'por-pasos': [] }>()

const pasos = computed(() => pasosCodigo({ codigo: props.codigo, ejemplo: props.ejemplo }))

const escapar = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/** `texto` entre comillas invertidas se ve como código; todo lo demás se escapa. */
const conCodigo = (t: string) => escapar(t).replace(/`([^`]+)`/g, '<code>$1</code>')
</script>
