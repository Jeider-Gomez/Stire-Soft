<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { tituloPagina } from '~/utils/tituloPagina'

// Cada pantalla con su título en la pestaña (WCAG 2.4.2).
const route = useRoute()
useHead({ title: computed(() => tituloPagina(route.path)) })
</script>
