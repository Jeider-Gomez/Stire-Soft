<template>
  <!-- Pestaña «Competencias» de Mi progreso (P39; cuadro «E-Progreso-Competencias»): la ecuación a la vista, el nivel de
       cada competencia con sus puntos y «Practicar esta» en la más baja. Solo aparece si el docente las activó. -->
  <div class="space-y-[18px]">
    <p v-if="cargando" class="text-sm text-base-texto-secundario">Cargando tus competencias…</p>
    <MensajeError v-else-if="error" class="text-sm">{{ error }}</MensajeError>
    <template v-else-if="datos && datos.modo !== 'apagado'">
      <CompetenciasEcuacionNivel />

      <section v-if="elegido" class="tarjeta-competencias flex flex-wrap items-center gap-3" aria-labelledby="elegido-titulo">
        <div class="min-w-0 flex-1">
          <p class="m-0 text-xs font-bold uppercase tracking-wide text-base-texto-secundario">Elegido para ti</p>
          <h2 id="elegido-titulo" class="m-0 mt-0.5 font-poppins text-lg font-bold text-base-texto-primario">«{{ elegido.ejercicio.title }}»</h2>
          <p class="m-0 mt-1 text-sm text-base-texto-secundario">
            Nivel {{ NOMBRE_DIFICULTAD[elegido.ejercicio.difficulty] ?? elegido.ejercicio.difficulty }}.
            ¿Por qué este? Practica «{{ elegido.nombre }}», {{ elegido.estado === 'sin-evidencia' ? 'una competencia que todavía no has trabajado' : 'tu competencia más baja' }}.
          </p>
        </div>
        <NuxtLink :to="`/estudiante/evaluacion/${elegido.ejercicio.activityId}`" class="boton-tinta inline-flex">Empezar</NuxtLink>
      </section>

      <section class="tarjeta-competencias" aria-labelledby="mis-competencias-titulo">
        <div class="flex flex-wrap items-center gap-2.5 mb-3">
          <h2 id="mis-competencias-titulo" class="m-0 flex-1 font-poppins text-[19px] font-bold text-base-texto-primario">Mis competencias</h2>
          <span v-if="datos.docente" class="text-xs font-bold px-2.5 py-1 rounded-full bg-base-bg-secundario text-base-texto-primario whitespace-nowrap">Las activó {{ datos.docente }}</span>
        </div>
        <p v-if="!datos.competencias.length" class="m-0 text-sm text-base-texto-secundario">Tu clase todavía no tiene ejercicios con competencias.</p>
        <ul class="m-0 p-0 list-none">
          <li v-for="c in datos.competencias" :key="c.id" class="fila-competencia" :class="CLASE_ESTADO[c.estado]">
            <span class="min-w-0">
              <span class="block text-[15px] font-bold text-base-texto-primario">{{ c.nombre }}</span>
              <span class="block text-[13px] text-base-texto-secundario">{{ c.ejemplo }}</span>
            </span>
            <span class="flex items-center gap-2.5">
              <span class="barra-competencia" aria-hidden="true"><span :style="{ width: c.estado === 'sin-evidencia' ? '0%' : `${Math.round(c.nivel * 100)}%` }" /></span>
              <span class="pastilla-nivel">{{ etiquetaNivel(c) }}</span>
            </span>
            <NuxtLink v-if="datos.practicar?.id === c.id && datos.practicar.ejercicio" :to="`/estudiante/evaluacion/${datos.practicar.ejercicio.activityId}`"
              class="boton-tinta inline-flex !min-h-[36px] text-[13px] justify-self-start">Practicar esta</NuxtLink>
            <span v-else class="text-[13px] text-base-texto-secundario">{{ c.posibles ? `${c.logrados} de ${c.posibles} ${c.posibles === 1 ? 'punto' : 'puntos'}` : `Se trabaja en «${c.lecciones[0]}»` }}</span>
          </li>
        </ul>
        <p class="m-0 mt-3 text-[13px] text-base-texto-secundario">
          Cada ejercicio que resuelves bien suma sus puntos a la competencia que trabaja. Tu respuesta a «¿qué tan seguro estás?»
          no cambia tu nivel: solo te ayuda a conocerte.
        </p>
      </section>
    </template>
    <p v-else-if="datos" class="tarjeta-competencias m-0 text-sm text-base-texto-secundario">Tu docente no ha activado las competencias en esta clase.</p>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'
import { CLASE_ESTADO, NOMBRE_DIFICULTAD, etiquetaNivel, type CompetenciasDelEstudiante } from '~/utils/competencias'

const authStore = useAuthStore()
const studentStore = useStudentStore()
const competencias = useCompetencias()
const { messageOf } = useApiErrorMessage()

const datos = ref<CompetenciasDelEstudiante | null>(null)
const cargando = ref(false)
const error = ref('')

const elegido = computed(() => {
  const p = datos.value?.practicar
  return p?.ejercicio ? { ...p, ejercicio: p.ejercicio } : null
})

async function cargar() {
  const id = authStore.user?.id
  const clase = studentStore.currentClassId
  if (!id || !clase) return
  cargando.value = true
  error.value = ''
  try {
    datos.value = await competencias.delEstudiante(id, clase)
  } catch (e: unknown) {
    error.value = messageOf(e, 'No se pudieron cargar tus competencias.')
  } finally {
    cargando.value = false
  }
}

watch(() => studentStore.currentClassId, cargar, { immediate: true })
</script>

<style scoped>
.fila-competencia {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 300px) 150px;
  gap: 16px;
  align-items: center;
  padding: 12px 4px;
  border-top: 1px solid rgb(var(--c-base-borde-sutil));
}
@media (max-width: 767px) {
  .fila-competencia { grid-template-columns: minmax(0, 1fr); gap: 8px; }
}
</style>
