<template>
  <div>
    <h1 class="text-xl font-bold text-base-texto-primario mb-6">Mi perfil</h1>
    <PerfilForm />
    <PerfilVinculos class="mt-6" />
    <PerfilAparienciaLectura class="mt-6" />
    <p class="mt-6 text-xs text-slate-600">
      ¿Cómo te ha parecido usar STIRE?
      <NuxtLink to="/estudiante/encuesta" class="font-semibold text-acento-ambar-fuerte hover:underline">Responder la encuesta de usabilidad</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'student' })
</script>
