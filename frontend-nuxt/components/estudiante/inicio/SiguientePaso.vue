<!-- «Tu siguiente paso» (v3, Fase D; cuadro «E-Inicio»): la mascota, una sola acción destacada y el anillo con cuánto del
     curso va dominado. La lógica es la de antes (GET .../next-activity, docs/DISENO_INTERVENCION_DOCENTE.md §10.2):
     solo cambia la forma. -->
<template>
  <section data-recorrido="siguiente-paso" class="heroe-inicio grid gap-4 sm:gap-6 items-center grid-cols-[1fr_88px] sm:grid-cols-[1fr_150px] lg:grid-cols-[130px_1fr_170px]"
    aria-labelledby="titulo-siguiente-paso">
    <span class="hidden lg:block" aria-hidden="true"><TutorMascota expresion="contento" :tamano="110" forma="completa" /></span>

    <div class="min-w-0">
      <p class="m-0 mb-1.5 text-[15px] font-semibold">{{ saludoTexto }}</p>
      <h1 id="titulo-siguiente-paso" class="m-0 font-poppins font-bold text-[21px] sm:text-[30px] leading-tight">
        Tu siguiente paso: {{ titulo }}
      </h1>
      <!-- En el celular (cuadro «E-Cel-Inicio») solo el título y un botón: la explicación y el segundo botón, desde sm. -->
      <p class="hidden sm:block mt-2 mb-0 text-base font-medium leading-relaxed">{{ explicacion }}</p>

      <div class="flex flex-wrap gap-x-2.5 gap-y-1 items-center mt-3 sm:mt-4">
        <NuxtLink :to="principal.to" class="boton-heroe boton-principal inline-flex">
          {{ principal.texto }} <ChevronRight :size="17" aria-hidden="true" />
        </NuxtLink>
        <NuxtLink v-if="segundo" :to="segundo.to" class="boton-heroe boton-otro hidden sm:inline-flex">{{ segundo.texto }}</NuxtLink>
        <!-- META-03 (transparencia y agencia): cómo elige STIRE y que el estudiante puede elegir otra cosa. -->
        <button type="button" class="min-h-[44px] px-1 text-sm font-semibold underline" :aria-expanded="porQue" aria-controls="por-que-veo-esto"
          @click="porQue = !porQue">¿Por qué veo esto?</button>
      </div>
      <div v-if="porQue" id="por-que-veo-esto" class="mt-3 p-3.5 rounded-xl text-sm leading-relaxed bg-base-blanco text-base-texto-primario max-w-2xl">
        <p class="m-0">STIRE elige tu siguiente paso con estas reglas, en orden:</p>
        <ol class="my-1.5 pl-5 list-decimal space-y-0.5">
          <li>Si fallaste 3 veces seguidas en la lección, una pausa para volver a la explicación o pedir una pista.</li>
          <li>Si un repaso venció, el repaso: es cuando más ayuda a no olvidar.</li>
          <li>Si vas bien, un ejercicio más difícil; si te costaron los dos últimos, uno del mismo nivel.</li>
          <li>Si no, el siguiente ejercicio de la lección que estás trabajando.</li>
        </ol>
        <p class="m-0">Es una sugerencia: puedes abrir cualquier lección abierta en «Aprender» o elegir tú el ejercicio.</p>
      </div>
    </div>

    <!-- El anillo: el porcentaje del curso dominado, con el número escrito (no solo el arco). -->
    <div class="flex flex-col items-center gap-1 self-start sm:self-center">
      <svg class="w-[88px] h-[88px] sm:w-[150px] sm:h-[150px]" viewBox="0 0 150 150" role="img" :aria-label="`${porcentaje} % del curso dominado`">
        <defs>
          <linearGradient id="anillo-curso" gradientUnits="userSpaceOnUse" x1="138" y1="75" x2="98" y2="134">
            <stop offset="0" stop-color="#00C2A8" /><stop offset="1" stop-color="#FFC94D" />
          </linearGradient>
        </defs>
        <circle cx="75" cy="75" r="63" fill="none" stroke="var(--heroe-pista)" stroke-width="14" />
        <circle v-if="porcentaje > 0" cx="75" cy="75" r="63" fill="none" stroke="url(#anillo-curso)" stroke-width="14" stroke-linecap="round"
          :stroke-dasharray="CIRCUNFERENCIA" :stroke-dashoffset="CIRCUNFERENCIA * (1 - porcentaje / 100)" transform="rotate(-90 75 75)" class="arco" />
        <text x="50%" y="46%" text-anchor="middle" dominant-baseline="central" font-family="Poppins,sans-serif" font-weight="700" font-size="34" fill="currentColor">{{ porcentaje }} %</text>
        <text x="50%" y="66%" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="currentColor">del curso</text>
      </svg>
      <!-- Avance honesto: cuántas lecciones de TODO el curso, no solo de lo trabajado. -->
      <p class="hidden sm:block m-0 text-[13px] font-semibold text-center">{{ curso.dominadas }} de {{ contar(curso.total, 'leccion') }} dominadas</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { estadoDePractica } from '~/utils/progresoLeccion'
import { contar } from '~/utils/terminos'
import { primerNombre, saludo } from '~/utils/inicioDocente'
import { useStudentStore } from '~/stores/student'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{ ejercicioId: number | null; razon: string | null; mensaje: string | null }>()

const CIRCUNFERENCIA = 2 * Math.PI * 63
const studentStore = useStudentStore()
const authStore = useAuthStore()
const porQue = ref(false)

const leccion = computed(() => studentStore.activeUnit)
const repasos = computed(() => studentStore.reviewsDueToday.length)
const curso = computed(() => studentStore.avanceCurso)
const porcentaje = computed(() => (curso.value.total ? Math.round((curso.value.dominadas / curso.value.total) * 100) : 0))
const saludoTexto = computed(() => {
  const nombre = primerNombre(authStore.user?.fullName)
  return nombre ? `${saludo(new Date().getHours())}, ${nombre}` : saludo(new Date().getHours())
})

/** Repasos vencidos primero (lo dice la regla 2); si no, la lección con lo que toca en ella. */
const conRepasos = computed(() => repasos.value > 0 && props.razon !== 'pausa')
const titulo = computed(() => {
  if (conRepasos.value) return `${repasos.value} ${repasos.value === 1 ? 'repaso que está' : 'repasos que están'} por vencer`
  if (!leccion.value) return 'elegir una lección'
  return leccion.value.empezada ? `«${leccion.value.title}»` : `empezar «${leccion.value.title}»`
})
const explicacion = computed(() => {
  if (conRepasos.value && leccion.value) return `Después sigues con «${leccion.value.title}». Es una sugerencia: lo eliges tú.`
  if (!leccion.value) return 'Abre el plan del curso desde «Aprender» y elige por dónde seguir.'
  return (leccion.value.empezada ? props.mensaje : null) || leccion.value.description || ''
})

const aLeccion = computed(() => (leccion.value ? `/estudiante/unidad/${leccion.value.id}` : '/estudiante'))
const practica = computed(() => estadoDePractica(leccion.value?.masteryPercentage ?? 0, props.razon))
const principal = computed(() => {
  if (conRepasos.value) return { to: '/estudiante/repasos', texto: 'Empezar los repasos' }
  if (!leccion.value?.empezada || !props.ejercicioId || props.razon === 'pausa') {
    return { to: aLeccion.value, texto: props.razon === 'pausa' ? 'Releer la lección' : leccion.value?.empezada ? 'Abrir la lección' : 'Empezar la lección' }
  }
  return { to: `/estudiante/evaluacion/${props.ejercicioId}`, texto: practica.value.boton }
})
const segundo = computed(() => {
  if (!leccion.value) return null
  if (conRepasos.value) return { to: aLeccion.value, texto: 'Ir a la lección' }
  return principal.value.to === aLeccion.value ? null : { to: aLeccion.value, texto: 'Ver la explicación' }
})
</script>

<style scoped>
.arco { transition: stroke-dashoffset 0.9s cubic-bezier(0.23, 1, 0.32, 1); }
</style>
