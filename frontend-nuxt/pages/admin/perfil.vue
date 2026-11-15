<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <header class="cabecera-docente">
      <div class="min-w-0">
        <h1 class="titulo-docente">Mi cuenta</h1>
        <p class="detalle-docente">Datos del perfil y apariencia.</p>
      </div>
    </header>
    <PerfilForm data-recorrido="datos-perfil" />
    <PerfilAparienciaLectura class="mt-6" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>
