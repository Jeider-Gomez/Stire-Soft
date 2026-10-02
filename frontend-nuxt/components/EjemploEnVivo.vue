<template>
  <!-- Ejemplo de HTML, CSS y JavaScript dentro de la lección. Corre en un iframe aislado (allow-scripts SIN
       allow-same-origin): no puede tocar STIRE ni la sesión del estudiante. -->
  <figure class="rounded-lg border border-base-borde-sutil overflow-hidden bg-base-blanco not-prose">
    <figcaption class="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-base-borde-sutil bg-base-bg-secundario text-[11px]">
      <span class="inline-flex items-center gap-1 font-semibold text-base-texto-secundario"><MonitorPlay :size="12" aria-hidden="true" /> Ejemplo en vivo</span>
      <span class="flex items-center gap-1">
        <button type="button" @click="reiniciar" class="px-2 py-1 rounded font-semibold text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-blanco inline-flex items-center gap-1">
          <RotateCcw :size="11" aria-hidden="true" /> Reiniciar
        </button>
        <button type="button" @click="verCodigo = !verCodigo" :aria-expanded="verCodigo"
          class="px-2 py-1 rounded font-semibold text-acento-ambar-fuerte hover:bg-base-blanco inline-flex items-center gap-1">
          <Code :size="11" aria-hidden="true" /> {{ verCodigo ? 'Ocultar el código' : 'Ver el código' }}
        </button>
      </span>
    </figcaption>
    <iframe :key="vuelta" :srcdoc="documento" sandbox="allow-scripts allow-modals" title="Ejemplo en vivo de HTML, CSS y JavaScript"
      loading="lazy" class="w-full h-56 bg-white block" />
    <pre v-if="verCodigo" class="m-0 border-t border-base-borde-sutil bg-base-bg-secundario p-3 overflow-x-auto"><code class="font-codigo text-[11px] text-base-texto-primario">{{ codigo }}</code></pre>
  </figure>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Code, MonitorPlay, RotateCcw } from 'lucide-vue-next'

const props = defineProps<{ codigo: string }>()
const verCodigo = ref(false)
const vuelta = ref(0)
const reiniciar = () => { vuelta.value++ }
// Un fragmento (sin <html>) se envuelve en un documento con codificación y una letra legible.
const documento = computed(() => (/<html[\s>]/i.test(props.codigo)
  ? props.codigo
  : `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;margin:1rem}</style></head><body>${props.codigo}</body></html>`))
</script>
