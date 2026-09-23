<template>
  <div class="min-h-screen bg-base-bg-primario flex items-center justify-center p-6">
    <div class="w-full max-w-md bg-base-blanco rounded-xl border border-base-borde-fuerte p-8 shadow-md text-center space-y-4">
      <div class="inline-flex w-12 h-12 rounded-xl bg-acento-ambar items-center justify-center text-base-blanco font-bold text-lg shadow-sm">
        ST
      </div>
      <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
        {{ is404 ? 'No encontramos esa página' : 'Algo salió mal' }}
      </h1>
      <p class="text-xs text-base-texto-secundario">
        {{ is404
          ? 'El enlace puede estar mal escrito o la página ya no existe.'
          : 'Ocurrió un error inesperado. Puedes volver al inicio e intentarlo de nuevo.' }}
      </p>
      <button
        @click="goHome"
        class="w-full py-2.5 px-4 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs transition-colors shadow-sm">
        Volver al inicio
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number } }>()
const is404 = computed(() => props.error?.statusCode === 404)

// La raíz redirige por rol (o al login si no hay sesión); clearError limpia la página de error.
function goHome() {
  clearError({ redirect: '/' })
}
</script>
