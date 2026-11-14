<template>
  <!-- «Mi clase» › Notas (v3, Fase D, paso 5; cuadro «E-Clase-Notas»): cómo califica el profe y la nota hasta ahora, sin
       compararla con la de nadie (MiNota.vue, docs/DISENO_INTERVENCION_DOCENTE.md §6). -->
  <div class="max-w-6xl mx-auto space-y-[18px]">
    <EstudianteClaseCabecera />
    <MiNota :class-id="studentStore.currentClassId" vacio />
  </div>
</template>

<script setup lang="ts">
import { useStudentStore } from '~/stores/student'

definePageMeta({ layout: 'student' })

const studentStore = useStudentStore()
onMounted(() => { if (!studentStore.hasLoaded) studentStore.fetchStudentData() })
</script>
