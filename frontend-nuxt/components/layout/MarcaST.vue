<template>
  <!-- Logo de STIRE sin nombre (components/layout/Logo.vue). Se conserva este componente para las pantallas de acceso que
       ya lo usan; el logo es fijo: no se mueve ni cambia con el foco (la vida la tiene el Tutor). -->
  <LayoutLogo :tamano="tamano" />
</template>

<script setup lang="ts">
// `escudo` se acepta por compatibilidad con login y registro, pero ya no cambia el logo: una marca no reacciona.
withDefaults(defineProps<{ tamano?: 'grande' | 'normal'; escudo?: boolean }>(), { tamano: 'normal', escudo: false })
</script>
