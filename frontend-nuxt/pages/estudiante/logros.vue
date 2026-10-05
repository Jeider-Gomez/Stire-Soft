<template>
  <div class="max-w-5xl mx-auto space-y-4">
    <NuxtLink to="/estudiante/progreso" class="inline-flex items-center gap-1.5 min-h-[44px] text-xs font-semibold text-acento-ambar-fuerte hover:underline">
      <ArrowLeft :size="14" aria-hidden="true" /> Mi progreso
    </NuxtLink>
    <EstudianteMisLogros />
  </div>
</template>

<script setup lang="ts">
// Todas las medallas en su propia pantalla; en «Mi progreso» y en el inicio solo va el resumen.
import { ArrowLeft } from 'lucide-vue-next'

definePageMeta({ layout: 'student' })
</script>
