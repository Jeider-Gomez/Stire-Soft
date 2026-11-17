<!-- P-2 (17/11): «Sigue donde ibas» en el menú del estudiante: la lección en la que va, con la misma regla de «Tu siguiente
     paso» del Inicio (studentStore.activeUnit). No sale dentro de esa misma lección. -->
<template>
  <NuxtLink v-if="leccion" :to="`/estudiante/unidad/${leccion.id}`" class="item-menu tono-cielo sigue-donde-ibas">
    <span class="icono-menu"><PlayCircle :size="18" aria-hidden="true" /></span>
    <span>
      <span class="block">Sigue donde ibas</span>
      <span class="block truncate text-xs font-normal text-base-texto-secundario">{{ leccion.title }}</span>
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { PlayCircle } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'

const route = useRoute()
const studentStore = useStudentStore()
const leccion = computed(() => {
  const u = studentStore.activeUnit
  return u && route.path !== `/estudiante/unidad/${u.id}` ? u : null
})
</script>
