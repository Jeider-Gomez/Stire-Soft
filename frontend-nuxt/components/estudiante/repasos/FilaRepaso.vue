<template>
  <!-- Un tema por repasar (cuadro «E-Repasos»): nombre y de dónde es, las casillas de qué tan firme está el recuerdo, cuándo toca y
       «Repasar». Una lección dominada lo dice («Dominada ✓»), nunca sale como atrasada (lección 4). -->
  <li class="fila-repaso grid items-center gap-x-3.5 gap-y-1 py-2.5 px-1.5 border-t border-base-borde-sutil">
    <span class="min-w-0 [grid-area:nombre]">
      <span class="block text-[15px] font-bold truncate">{{ titulo }}</span>
      <span v-if="lugar" class="block text-xs text-base-texto-secundario truncate">{{ lugar }}</span>
    </span>
    <span class="flex gap-[3px] [grid-area:casillas]" role="img" :aria-label="`Recuerdo ${llenas} de ${CASILLAS}`">
      <span v-for="i in CASILLAS" :key="i" class="casilla-recuerdo" :class="{ llena: i <= llenas }" />
    </span>
    <span class="text-[13px] font-bold [grid-area:cuando]" :class="dominada ? 'texto-menta' : hoy ? 'texto-sol' : 'text-base-texto-secundario'">{{ cuando }}</span>
    <NuxtLink :to="`/estudiante/unidad/${learningUnitId}#ejercicios`" :aria-label="`Repasar ${titulo}`"
      class="boton-repasar [grid-area:boton] inline-flex items-center justify-center min-h-[44px] sm:min-h-[36px] px-4 rounded-xl border border-base-borde-fuerte bg-base-blanco text-sm font-semibold hover:bg-base-bg-secundario">
      Repasar
    </NuxtLink>
  </li>
</template>

<script setup lang="ts">
import { CASILLAS } from '~/utils/repasosV3'

defineProps<{ titulo: string; lugar: string | null; llenas: number; cuando: string; hoy: boolean; dominada: boolean; learningUnitId: number }>()
</script>

<style scoped>
/* En el computador, una fila como el cuadro; en el celular (E-Cel-Repasos), el nombre arriba y casillas y cuándo debajo. */
.fila-repaso { grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "nombre boton" "casillas boton" "cuando boton"; }
@media (min-width: 640px) {
  .fila-repaso { grid-template-columns: minmax(0, 1fr) auto 128px auto; grid-template-areas: "nombre casillas cuando boton"; }
}
.casilla-recuerdo { width: 14px; height: 14px; border-radius: 4px; background: rgb(var(--c-base-blanco)); border: 2px solid rgba(0, 194, 168, 0.3); }
.casilla-recuerdo.llena { background: #00c2a8; border: 0; }
.boton-repasar { transition: transform 0.15s ease, background-color 0.15s ease; }
.boton-repasar:active { transform: scale(0.97); }
</style>
