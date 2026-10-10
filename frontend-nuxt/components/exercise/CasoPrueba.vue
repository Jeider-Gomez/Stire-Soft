<!-- Un caso público de un ejercicio de programar: qué entra, qué debe salir, qué mostró el programa y qué revisar.
     10/10 (Jeider, «Área y perímetro»): la entrada no se veía (tras «Probar código» el título cambiaba a «Ejemplo 1»),
     «12» y «14» se leían «12 14» en una sola línea y un SyntaxError decía «la primera diferencia está en la línea 1».
     Ahora la entrada siempre está, los saltos de línea se respetan y el error dice su línea (utils/diagnosticoSalida.ts). -->
<template>
  <div
    class="border rounded-lg p-3 space-y-2 transition-colors"
    :class="{
      'border-semantico-pasa/40 bg-semantico-pasa/5': tc.passed === true,
      'border-semantico-falla/40 bg-semantico-falla/5': tc.passed === false,
      'border-base-borde-sutil bg-base-bg-secundario/40': tc.passed === undefined
    }">
    <div class="flex items-center justify-between font-bold text-xs">
      <span>Caso #{{ tc.id }}</span>
      <span v-if="tc.passed === true" class="text-semantico-pasa flex items-center gap-1">
        <Check :size="16" aria-hidden="true" />
        <span>Superado</span>
      </span>
      <span v-else-if="tc.passed === false" class="text-semantico-falla flex items-center gap-1">
        <X :size="14" aria-hidden="true" />
        <span>Todavía no coincide</span>
      </span>
      <span v-else class="text-base-texto-secundario text-[11px]">Sin evaluar</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-codigo pt-1">
      <div class="p-2 bg-base-blanco rounded border border-base-borde-sutil">
        <span class="text-base-texto-secundario text-[10px] block font-sans">Entra:</span>
        <span class="block whitespace-pre-wrap break-words text-acento-ambar-fuerte font-bold">{{ tc.input || '(nada)' }}</span>
      </div>
      <div class="p-2 bg-base-blanco rounded border border-base-borde-sutil">
        <span class="text-base-texto-secundario text-[10px] block font-sans">Debe salir:</span>
        <span class="block whitespace-pre-wrap break-words font-bold text-semantico-pasa">{{ tc.expectedOutput }}</span>
      </div>
      <div class="p-2 bg-base-blanco rounded border border-base-borde-sutil">
        <span class="text-base-texto-secundario text-[10px] block font-sans">Lo que mostró tu código:</span>
        <span
          class="block whitespace-pre-wrap break-words"
          :class="tc.passed ? 'text-semantico-pasa font-bold' : tc.passed === false ? 'text-semantico-falla font-bold' : 'text-base-texto-secundario'">{{ tc.actualOutput || '—' }}</span>
      </div>
    </div>

    <!-- Qué revisar: el error de concepto más probable, sin dar la solución (MOD-02 y MOD-04) -->
    <p v-if="diagnostico" class="flex items-start gap-1.5 text-[11px] text-base-texto-primario bg-base-blanco rounded border border-semantico-falla/25 p-2">
      <Lightbulb :size="13" class="shrink-0 mt-0.5 text-acento-ambar-fuerte" aria-hidden="true" />
      <span>
        {{ diagnostico.mensaje }}
        <template v-if="!tc.actualOutput && limiteMs"> Si tarda más de {{ limiteMs }} ms (un bucle infinito), se corta.</template>
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { Check, Lightbulb, X } from 'lucide-vue-next'
import type { TestCase } from '~/types'
import type { Diagnostico } from '~/utils/diagnosticoSalida'

defineProps<{ tc: TestCase; diagnostico: Diagnostico | null; limiteMs?: number | null }>()
</script>
