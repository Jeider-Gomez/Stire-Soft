<!-- Barra de abajo del estudiante en el celular (v3, Fase B; cuadro E-Cel-Inicio del lienzo): Inicio, Aprender, Repasos,
     Progreso y el Tutor, siempre a un toque. «Aprender» abre el menú con el plan del curso, que es donde está hoy; el
     resto sigue en ese menú (☰ arriba). En una lección no se muestra: allí va la barra de la lección
     (EstudianteNavegacionLeccion), que ya trae al Tutor. -->
<template>
  <nav aria-label="Menú principal" class="barra-inferior">
    <NuxtLink to="/estudiante" class="tono-menta" :class="{ activo: route.path === '/estudiante' }" :aria-current="route.path === '/estudiante' ? 'page' : undefined">
      <span class="pildora"><House :size="19" aria-hidden="true" /></span>Inicio
    </NuxtLink>
    <button type="button" class="tono-cielo" :aria-expanded="sidebarOpen" @click="toggle">
      <span class="pildora"><BookOpen :size="19" aria-hidden="true" /></span>Aprender
    </button>
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
const { sidebarOpen, toggle } = useMobileSidebar()
const pendientes = computed(() => studentStore.reviewsDueToday.length)
</script>

<style scoped>
/* Solo en el celular (< 768 px): un display propio le ganaría a «md:hidden». */
.barra-inferior { display: none; }
@media (max-width: 767px) {
  .barra-inferior {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 35; height: 72px; display: grid; grid-template-columns: repeat(5, 1fr);
    background: rgb(var(--c-base-blanco)); border-top: 1px solid rgb(var(--c-base-borde-sutil));
    padding-bottom: env(safe-area-inset-bottom);
  }
}
.barra-inferior > a, .barra-inferior > button {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; min-height: 44px;
  font-size: 11px; font-weight: 500; color: rgb(var(--c-base-texto-primario));
}
.barra-inferior > .activo { font-weight: 700; }
.pildora {
  position: relative; width: 44px; height: 28px; border-radius: 999px; display: flex; align-items: center; justify-content: center;
  color: rgb(var(--t-icono));
}
.activo .pildora { background: rgb(var(--t-fila)); color: rgb(var(--t)); }
:root[data-tema="oscuro"] .activo .pildora { color: rgb(var(--t-icono)); }
.punto { position: absolute; top: 0; right: 6px; width: 8px; height: 8px; border-radius: 50%; background: #ffc94d; }
</style>
