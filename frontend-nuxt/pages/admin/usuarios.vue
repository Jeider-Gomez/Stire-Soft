<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
onMounted(() => {
  router.replace('/admin')
})
</script>
