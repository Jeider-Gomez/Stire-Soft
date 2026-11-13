<!-- Barra de abajo del estudiante en el celular (v3, Fase B; cuadro E-Cel-Inicio del lienzo): Inicio, Aprender, Repasos,
     Progreso y el Tutor, siempre a un toque. «Aprender» lleva a su pantalla (Fase D, 13/11); el
     resto sigue en el menú (☰ arriba). En una lección no se muestra: allí va la barra de la lección
     (EstudianteNavegacionLeccion), que ya trae al Tutor. -->
<template>
  <nav aria-label="Menú principal" class="barra-inferior">
    <NuxtLink to="/estudiante" class="tono-menta" :class="{ activo: route.path === '/estudiante' }" :aria-current="route.path === '/estudiante' ? 'page' : undefined">
      <span class="pildora"><House :size="19" aria-hidden="true" /></span>Inicio
    </NuxtLink>
    <NuxtLink to="/estudiante/aprender" class="tono-cielo" :class="{ activo: route.path === '/estudiante/aprender' }" :aria-current="route.path === '/estudiante/aprender' ? 'page' : undefined">
      <span class="pildora"><BookOpen :size="19" aria-hidden="true" /></span>Aprender
    </NuxtLink>
    <NuxtLink to="/estudiante/repasos" class="tono-sol" :class="{ activo: route.path === '/estudiante/repasos' }" :aria-current="route.path === '/estudiante/repasos' ? 'page' : undefined">
      <span class="pildora">
        <Repeat :size="19" aria-hidden="true" />
        <span v-if="pendientes > 0" class="punto" />
      </span>
      Repasos<span v-if="pendientes > 0" class="sr-only">, {{ pendientes }} para hoy</span>
    </NuxtLink>
    <NuxtLink to="/estudiante/progreso" class="tono-lila" :class="{ activo: route.path === '/estudiante/progreso' }" :aria-current="route.path === '/estudiante/progreso' ? 'page' : undefined">
      <span class="pildora"><TrendingUp :size="19" aria-hidden="true" /></span>Progreso
    </NuxtLink>
    <button type="button" aria-label="Abrir el Tutor" @click="tutorStore.openDrawer()">
      <TutorMascota :tamano="30" aria-hidden="true" />Tutor
    </button>
  </nav>
</template>

<script setup lang="ts">
import { BookOpen, House, Repeat, TrendingUp } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import { useTutorStore } from '~/stores/tutor'

const route = useRoute()
const tutorStore = useTutorStore()
const studentStore = useStudentStore()
const pendientes = computed(() => studentStore.reviewsDueToday.length)
</script>
