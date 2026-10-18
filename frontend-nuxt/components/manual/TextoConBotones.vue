<template>
  <!-- Lo que va entre «» en utils/manual.ts se ve como el botón o el campo de la pantalla, para reconocerlo al buscarlo. -->
  <span>
    <template v-for="(t, i) in trozosConBotones(texto)" :key="i">
      <span v-if="t.tipo === 'boton'" class="boton-manual">{{ t.valor }}</span>
      <template v-else>{{ t.valor }}</template>
    </template>
  </span>
</template>

<script setup lang="ts">
import { trozosConBotones } from '~/utils/manual'

defineProps<{ texto: string }>()
</script>

<style scoped>
.boton-manual {
  display: inline-block;
  padding: 0 0.4em;
  margin: 0 0.1em;
  border-radius: 0.375rem;
  border: 1px solid rgb(var(--c-base-borde-fuerte));
  background: rgb(var(--c-base-bg-secundario));
  font-weight: 600;
  white-space: nowrap;
}
</style>
