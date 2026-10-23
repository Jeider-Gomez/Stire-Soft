<template>
  <!-- Una palabra de STIRE con su explicación del glosario (utils/glosario.ts). Se abre al tocarla o con el teclado, y
       se cierra al salir; el lector de pantalla la anuncia como descripción del botón. -->
  <span class="relative inline-block">
    <button
      type="button"
      class="underline decoration-dotted underline-offset-2 cursor-help"
      :aria-expanded="abierto"
      :aria-describedby="abierto ? id : undefined"
      @click="abierto = !abierto"
      @blur="abierto = false"
      @keydown.esc="abierto = false">
      <slot>{{ palabra }}</slot>
    </button>
    <span
      v-if="abierto"
      :id="id"
      role="tooltip"
      class="absolute left-0 top-full z-40 mt-1 w-60 rounded-lg bg-slate-900 px-3 py-2 text-left text-xs font-normal normal-case leading-snug text-white shadow-lg">
      {{ texto }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { definicion } from '~/utils/glosario'

const props = defineProps<{ palabra: string }>()
const abierto = ref(false)
const id = useId()
const texto = computed(() => definicion(props.palabra))
</script>
