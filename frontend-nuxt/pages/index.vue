<template>
  <div class="p-8 text-center">
    <p class="text-sm text-base-texto-secundario">Redirigiendo a STIRE-Soft...</p>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isAuthenticated) {
    if (authStore.currentRole === 'docente') {
      navigateTo('/docente')
    } else if (authStore.currentRole === 'administrador') {
      navigateTo('/admin')
    } else {
      navigateTo('/estudiante')
    }
  } else {
    navigateTo('/auth/login')
  }
})
</script>
