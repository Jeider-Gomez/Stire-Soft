<!-- El panel «Salida» bajo el editor de un ejercicio de programar (P48, 31/10/2026, Jeider en «Saludo personalizado»: pulsaba «Probar
     código» y no sabía dónde se veía el resultado). Siempre está a la vista; antes de probar dice qué va a aparecer ahí, y después
     muestra lo que escribió el programa junto a lo que se esperaba. Lo que dice cada botón (probar no gasta intentos, entregar sí)
     también va aquí. El detalle de todos los casos sigue en la pestaña «Casos de prueba». utils/salidaPrograma.ts. -->
<template>
  <section
    class="flex-shrink-0 max-h-[38%] overflow-y-auto border-t border-editor-border bg-editor-header text-editor-text text-xs"
    aria-labelledby="salida-titulo">
    <div class="flex items-center justify-between gap-2 px-4 py-1.5 border-b border-editor-border">
      <h3 id="salida-titulo" class="inline-flex items-center gap-1.5 font-bold text-white">
        <Terminal :size="13" aria-hidden="true" /> Salida de tu programa
      </h3>
      <span class="text-[10px] text-editor-muted">Probar no gasta intentos · Entregar sí</span>
    </div>

    <div class="px-4 py-2 space-y-2" role="status" aria-live="polite">
      <p v-if="resumen.estado !== 'no-coincide' || !resumen.caso" class="leading-relaxed" :class="resumen.estado === 'coincide' ? 'text-[#5eead4]' : 'text-editor-muted'">
        <Check v-if="resumen.estado === 'coincide'" :size="13" class="inline mr-1" aria-hidden="true" />
        {{ siguientePaso(resumen) }}
      </p>

      <template v-if="resumen.caso">
        <p v-if="resumen.estado === 'no-coincide'" class="text-[#f87171] font-semibold">
          <X :size="13" class="inline mr-1" aria-hidden="true" />
          {{ resumen.coinciden }} de {{ resumen.total }} {{ resumen.total === 1 ? 'ejemplo coincide' : 'ejemplos coinciden' }}. {{ siguientePaso(resumen) }}
        </p>
        <dl class="grid grid-cols-1 sm:grid-cols-3 gap-2 font-codigo">
          <div>
            <dt class="text-[10px] text-editor-muted font-sans">Entró</dt>
            <dd class="whitespace-pre-wrap break-words text-[#fcd34d]">{{ resumen.caso.input || '(nada)' }}</dd>
          </div>
          <div>
            <dt class="text-[10px] text-editor-muted font-sans">Tu programa mostró</dt>
            <dd class="whitespace-pre-wrap break-words" :class="resumen.estado === 'coincide' ? 'text-[#5eead4]' : 'text-[#f87171]'">{{ resumen.caso.actualOutput || '(no mostró nada)' }}</dd>
          </div>
          <div v-if="resumen.estado === 'no-coincide'">
            <dt class="text-[10px] text-editor-muted font-sans">Se esperaba</dt>
            <dd class="whitespace-pre-wrap break-words text-[#5eead4]">{{ resumen.caso.expectedOutput }}</dd>
          </div>
        </dl>
        <button
          type="button"
          class="min-h-[32px] px-2 -ml-2 rounded-md font-semibold text-[#7dd3fc] hover:bg-white/10 underline underline-offset-2"
          @click="$emit('ver-casos')">
          Ver los casos con detalle
        </button>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Check, Terminal, X } from 'lucide-vue-next'
import { resumenDeSalida, siguientePaso, type CasoDeSalida } from '~/utils/salidaPrograma'

const props = defineProps<{ casos: ReadonlyArray<CasoDeSalida>; ejecutando: boolean }>()
defineEmits<{ 'ver-casos': [] }>()

const resumen = computed(() => resumenDeSalida(props.casos, props.ejecutando))
</script>
