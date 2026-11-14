<template>
  <!-- «Tu reflexión de la semana» (cuadro «E-Progreso-Reflexion»): una pregunta para pensar, sacada de lo que tiene pendiente
       (utils/progresoV3.ts). No se guarda ni se califica: es para el estudiante. -->
  <section class="tarjeta-inicio" style="--acento: 124 58 237; --acento2: 0 194 168" aria-labelledby="titulo-reflexion">
    <h2 id="titulo-reflexion" class="titulo-tarjeta mb-2.5">Tu reflexión de la semana</h2>
    <div class="flex gap-3.5 items-start">
      <span class="hidden sm:block flex-none" aria-hidden="true"><TutorMascota expresion="pensando" :tamano="60" /></span>
      <div class="space-y-2.5">
        <p class="m-0 text-[15px] leading-relaxed"><template v-if="reflexion.destacado">Tienes <strong>{{ reflexion.destacado }}</strong></template>{{ reflexion.texto }}</p>
        <p class="globo-reflexion m-0 text-[15px] font-semibold">{{ reflexion.pregunta }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useStudentStore } from '~/stores/student'
import { estadoTarjeta, reflexionDeLaSemana } from '~/utils/progresoV3'

const studentStore = useStudentStore()
const reflexion = computed(() => reflexionDeLaSemana({
  repasosHoy: studentStore.reviewsDueToday.length,
  empezada: studentStore.modules.flatMap((m) => m.units).find((l) => estadoTarjeta(l) === 'empezada')?.title ?? null,
}))
</script>

<style scoped>
.globo-reflexion { padding: 10px 14px; border-radius: 14px 14px 14px 4px; background: rgb(var(--c-sec-cielo-fondo)); }
</style>
