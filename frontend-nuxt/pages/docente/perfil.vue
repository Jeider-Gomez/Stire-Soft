<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <header class="cabecera-docente">
      <div class="min-w-0">
        <h1 class="titulo-docente">Mi cuenta</h1>
        <p class="detalle-docente">Datos del perfil, clave del Asistente y apariencia.</p>
      </div>
    </header>
    <PerfilForm data-recorrido="datos-perfil" />
    <PerfilVinculos />
    <PerfilAparienciaLectura class="mt-6" />
    <PerfilInvestigacion />
    <p class="text-xs text-slate-600">
      ¿Cómo te ha parecido usar STIRE?
      <NuxtLink to="/docente/encuesta" class="font-semibold text-acento-ambar-fuerte hover:underline">Responder la encuesta de usabilidad</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'teacher' })
</script>
