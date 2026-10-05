<template>
  <div>
    <h1 class="text-xl font-bold text-base-texto-primario mb-6">Mi perfil</h1>
    <PerfilForm />
    <PerfilAparienciaLectura class="mt-6" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>
