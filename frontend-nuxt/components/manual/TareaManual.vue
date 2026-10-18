<template>
  <!-- Una tarea del manual (utils/manual.ts), siempre con la misma plantilla: para qué sirve, pasos, captura, resultado,
       consejo y «si algo sale mal». -->
  <article :id="tarea.id" class="tarea-manual bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-hidden" :aria-labelledby="`${tarea.id}-titulo`">
    <div class="h-1.5" :class="franja" aria-hidden="true" />
    <div class="p-5 sm:p-6 space-y-4">
      <header>
        <h3 :id="`${tarea.id}-titulo`" class="font-poppins text-lg font-bold text-base-texto-primario">{{ tarea.titulo }}</h3>
        <p class="text-sm text-base-texto-secundario mt-1">{{ tarea.paraQue }}</p>
      </header>

      <ol class="space-y-3">
        <li v-for="(paso, i) in tarea.pasos" :key="i" class="flex gap-3 text-sm text-base-texto-primario leading-relaxed">
          <span class="shrink-0 w-7 h-7 rounded-full text-base-blanco font-bold text-xs flex items-center justify-center" :class="circulo" aria-hidden="true">{{ i + 1 }}</span>
          <span class="pt-0.5"><span class="sr-only">Paso {{ i + 1 }}: </span><ManualTextoConBotones :texto="paso" /></span>
        </li>
      </ol>

      <figure v-if="tarea.captura" class="rounded-lg border border-base-borde-fuerte overflow-hidden bg-base-bg-secundario">
        <img :src="tarea.captura.src" :alt="tarea.captura.alt" class="block mx-auto w-auto max-w-full max-h-[560px]" />
      </figure>

      <p class="flex gap-2 text-sm rounded-lg bg-semantico-pasa/10 border border-semantico-pasa/30 p-3 text-base-texto-primario">
        <CircleCheck :size="18" class="shrink-0 text-semantico-pasa" aria-hidden="true" />
        <span><strong>Resultado:</strong> <ManualTextoConBotones :texto="tarea.resultado" /></span>
      </p>

      <p v-if="tarea.consejo" class="flex gap-2 text-sm rounded-lg border-l-4 border-stire-teal bg-base-bg-secundario p-3 text-base-texto-primario">
        <Lightbulb :size="18" class="shrink-0 text-base-texto-secundario" aria-hidden="true" />
        <span><strong>Consejo:</strong> <ManualTextoConBotones :texto="tarea.consejo" /></span>
      </p>

      <section v-if="tarea.siAlgoSaleMal?.length" class="rounded-lg border border-acento-ambar-fuerte/30 p-3" :aria-labelledby="`${tarea.id}-problemas`">
        <h4 :id="`${tarea.id}-problemas`" class="text-sm font-bold text-base-texto-primario flex items-center gap-2">
          <LifeBuoy :size="16" aria-hidden="true" /> Si algo sale mal
        </h4>
        <dl class="mt-2 space-y-2 text-sm">
          <div v-for="p in tarea.siAlgoSaleMal" :key="p.problema">
            <dt class="font-semibold text-base-texto-primario">{{ p.problema }}</dt>
            <dd class="text-base-texto-secundario"><ManualTextoConBotones :texto="p.solucion" /></dd>
          </div>
        </dl>
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CircleCheck, LifeBuoy, Lightbulb } from 'lucide-vue-next'
import type { RolManual, TareaManual } from '~/utils/manual'

const props = defineProps<{ tarea: TareaManual; rol: RolManual }>()

// Un color por rol (docs/identidad-visual/GUIA_IDENTIDAD.md): morado lo del estudiante, azul lo del docente.
const franja = computed(() => (props.rol === 'estudiante' ? 'bg-stire-purple' : props.rol === 'docente' ? 'bg-stire-blue' : props.rol === 'administrador' ? 'bg-slate-500' : 'bg-gradient-to-r from-stire-blue via-stire-purple to-stire-teal'))
const circulo = computed(() => (props.rol === 'estudiante' ? 'bg-stire-purple' : props.rol === 'administrador' ? 'bg-slate-600' : 'bg-stire-blue'))
</script>

<style scoped>
@media print {
  /* La tarea puede seguir en la hoja siguiente; lo que no se parte es el título con su primer paso, la captura y cada
     recuadro. */
  .tarea-manual { box-shadow: none; }
  header, li, figure, p, section { break-inside: avoid; }
  header { break-after: avoid; }
}
</style>
