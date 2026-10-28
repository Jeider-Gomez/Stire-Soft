<template>
  <!-- Mensaje de error de STIRE (ítems 27 y 29 de la evaluación heurística, docs/calidad/EVALUACION_HEURISTICA_PLAN_A_5.md):
       siempre con ícono, para no depender solo del color, y, cuando hay cómo salir, con su botón: «Reintentar» o «Pedir
       ayuda al Tutor». El tamaño de la letra lo pone quien lo usa con `class`. -->
  <div role="alert" class="flex items-start gap-1.5 text-semantico-falla">
    <CircleAlert :size="14" class="shrink-0 mt-[0.15em]" aria-hidden="true" />
    <div class="min-w-0 flex-1">
      <slot>{{ texto }}</slot>
      <span v-if="reintentar || ayuda" class="inline-flex flex-wrap items-center gap-x-2 ml-1">
        <button v-if="reintentar" type="button" class="min-h-[32px] px-1.5 rounded-md font-semibold underline underline-offset-2 hover:bg-semantico-falla/10" @click="reintentar()">
          Reintentar
        </button>
        <button v-if="ayuda" type="button" class="min-h-[32px] px-1.5 rounded-md font-semibold underline underline-offset-2 hover:bg-semantico-falla/10" @click="pedirAyuda">
          Pedir ayuda al Tutor
        </button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next'
import { useTutorStore } from '~/stores/tutor'

const props = withDefaults(defineProps<{
  texto?: string
  /** Muestra «Reintentar» y lo llama al tocarlo (cargas que fallaron). */
  reintentar?: (() => unknown) | null
  /** Muestra «Pedir ayuda al Tutor» (solo en pantallas del estudiante). */
  ayuda?: boolean
}>(), { texto: '', reintentar: null, ayuda: false })

function pedirAyuda() {
  if (props.ayuda) useTutorStore().openDrawer({ conPregunta: true })
}
</script>
