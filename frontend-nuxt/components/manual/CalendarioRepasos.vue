<template>
  <!-- Cuándo vuelve una lección según cómo te fue en el repaso (utils/manual.ts, CALENDARIO_REPASOS: los intervalos del
       motor SM-2). Cada fila es un resultado; cada ficha, cuántos días pasan hasta el siguiente repaso y en qué día cae
       contando desde el primero. -->
  <section class="calendario-repasos bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm p-5 sm:p-6 space-y-5" aria-labelledby="calendario-titulo">
    <header class="space-y-1">
      <h3 id="calendario-titulo" class="font-poppins text-lg font-bold text-base-texto-primario">¿Cuándo vuelve una lección?</h3>
      <p class="text-sm text-base-texto-secundario">
        Depende de cómo te fue en cada repaso. Cada ficha dice cuántos días pasan hasta el siguiente; debajo, en qué día
        cae si todos los repasos salen igual. Entre un repaso y otro nunca pasan más de {{ maximo }} días.
      </p>
    </header>

    <ol class="space-y-4">
      <li v-for="fila in CALENDARIO_REPASOS" :key="fila.resultado" class="fila space-y-2">
        <p class="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
          <span class="px-2.5 py-0.5 rounded-full border text-xs font-bold text-base-texto-primario" :class="[COLOR[fila.resultado], BORDE[fila.resultado]]">{{ fila.resultado }}</span>
          <span class="text-base-texto-primario">{{ fila.cuando }}</span>
        </p>
        <ol class="flex flex-wrap items-center gap-1.5" :aria-label="`Repasos si el resultado es ${fila.resultado}`">
          <li v-for="(d, i) in fila.dias" :key="i" class="flex items-center gap-1.5">
            <span v-if="i > 0" class="text-base-texto-secundario" aria-hidden="true">→</span>
            <span class="inline-flex flex-col items-center min-w-[3.5rem] px-2 py-1 rounded-lg border" :class="BORDE[fila.resultado]">
              <span class="text-sm font-bold text-base-texto-primario tabular-nums">+{{ d }} {{ d === 1 ? 'día' : 'días' }}</span>
              <span class="text-[11px] text-base-texto-secundario tabular-nums">día {{ acumulado(fila.dias, i) }}</span>
            </span>
          </li>
        </ol>
      </li>
    </ol>

    <p class="text-xs text-base-texto-secundario">
      El cálculo es el algoritmo SM-2 (Woźniak, 1990), el mismo de Anki, con un cambio para un semestre: el segundo repaso
      llega a los 3 días en vez de 6.
    </p>
  </section>
</template>

<script setup lang="ts">
import { CALENDARIO_REPASOS } from '~/utils/manual'

const maximo = Math.max(...CALENDARIO_REPASOS.flatMap((f) => f.dias))

// Fondo suave con texto oscuro: el blanco sobre el turquesa no llega al contraste de WCAG.
const COLOR: Record<string, string> = {
  'Fácil': 'bg-stire-teal/15',
  Bien: 'bg-semantico-pasa/15',
  'Difícil': 'bg-acento-ambar-fuerte/15',
  'Otra vez': 'bg-semantico-falla/15',
}
const BORDE: Record<string, string> = {
  'Fácil': 'border-stire-teal/50',
  Bien: 'border-semantico-pasa/50',
  'Difícil': 'border-acento-ambar-fuerte/50',
  'Otra vez': 'border-semantico-falla/50',
}

/** En qué día cae el repaso i, contando desde el primero. */
function acumulado(dias: number[], i: number): number {
  return dias.slice(0, i + 1).reduce((a, b) => a + b, 0)
}
</script>

<style scoped>
@media print {
  .calendario-repasos { box-shadow: none; break-inside: avoid; }
  .fila { break-inside: avoid; }
}
</style>
