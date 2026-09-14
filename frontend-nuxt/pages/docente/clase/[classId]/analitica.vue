<template>
  <div class="space-y-4">
    <NuxtLink
      :to="`/docente/rendimiento?classId=${route.params.classId}`"
      class="text-xs text-acento-ambar-fuerte underline flex items-center gap-1">
      <span>←</span>
      <span>Cargando analítica detallada de la clase...</span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'teacher'
})

const route = useRoute()
const router = useRouter()

onMounted(() => {
  router.replace(`/docente/rendimiento?classId=${route.params.classId}`)
})
</script>
