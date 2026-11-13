<template>
  <!-- «Practica esta lección» (v3, Fase D, paso 2; cuadro «E-Leccion»): el dominio con la línea de la meta, el siguiente
       ejercicio recomendado con su porqué, el reto y la lista de todos. Practicar es la forma de avanzar y de medir lo que
       sabes (docs/DISENO_INTERVENCION_DOCENTE.md §10.2). La barra de arriba lleva aquí con «Practicar». -->
  <section id="ejercicios" class="tarjeta-leccion p-5 sm:p-6 space-y-4 scroll-mt-32" aria-labelledby="practicar-titulo">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <h2 id="practicar-titulo" class="m-0 flex-1 min-w-[12rem] font-poppins text-xl font-bold">Practica esta lección</h2>
      <!-- El dominio de la lección se ve desde el principio: practicar es la forma de medirlo. -->
      <div class="flex items-center gap-3" data-recorrido="meta-leccion">
        <div class="relative w-32 h-2 bg-base-bg-secundario rounded-full overflow-hidden border border-base-borde-sutil" role="progressbar"
          :aria-valuenow="dominio ?? 0" aria-valuemin="0" aria-valuemax="100" aria-label="Tu dominio de la lección">
          <span class="absolute inset-y-0 w-0.5 bg-base-texto-primario/60" :style="{ left: `${DOMINADO}%` }" aria-hidden="true" />
          <div class="h-full rounded-full" :class="(dominio ?? 0) >= DOMINADO ? 'bg-semantico-pasa' : 'bg-acento-ambar-fuerte'" :style="{ width: `${dominio ?? 0}%` }"></div>
        </div>
        <span class="text-sm font-bold text-base-texto-primario whitespace-nowrap">
          <template v-if="dominio !== null && dominio >= DOMINADO">Dominada · {{ dominio }} %</template>
          <template v-else-if="dominio">{{ dominio }} % <span class="font-medium text-base-texto-secundario">/ {{ DOMINADO }}</span></template>
          <template v-else>Aún sin <Termino palabra="Dominio">dominio</Termino></template>
        </span>
      </div>
    </div>
    <EstudianteMetaDeLaLeccion :unit-id="unitId" class="!text-xs" />

    <!-- Tope (docs/DISENO_INTERVENCION_DOCENTE.md §4.4): tras varios fallos seguidos, lo primero es parar y volver a la
         explicación o pedir una pista; el ejercicio sigue ahí, pero ya no es el botón principal. -->
    <div v-if="enPausa" class="flex items-center gap-2 flex-wrap">
      <!-- La pista primero: el estudiante ya está en la lección, y «volver a la explicación» solo subía la página. -->
      <button type="button" class="boton-practicar inline-flex min-h-[44px]" @click="tutorStore.openDrawer()">
        <Lightbulb :size="16" aria-hidden="true" /> Pedir una pista al Tutor
      </button>
      <button type="button" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl borde-afordancia text-sm font-semibold min-h-[44px]" @click="volverALaExplicacion">
        <BookOpen :size="15" aria-hidden="true" /> Releer la explicación
      </button>
    </div>

    <div v-if="recommendedActivity && !chooseManually" class="siguiente-ejercicio grid gap-3 sm:grid-cols-[1fr_auto] items-center p-4 rounded-2xl">
      <span class="min-w-0">
        <span class="block text-xs font-bold uppercase texto-menta">{{ enPausa ? 'Cuando quieras, otro igual' : 'Tu siguiente ejercicio' }}</span>
        <span class="block text-[17px] font-bold my-0.5">{{ recommendedActivity.title }}</span>
        <span class="flex flex-wrap items-center gap-2 text-[13px] text-base-texto-secundario">
          <span v-if="recommendedActivity.level" class="pastilla-inicio pastilla-gris">{{ levelLabel(recommendedActivity.level) }}</span>
          {{ recommendedActivity.reasonMessage ?? 'Cada ejercicio que resuelves suma a tu dominio de la lección.' }}
        </span>
      </span>
      <NuxtLink
        :to="`/estudiante/evaluacion/${recommendedActivity.activityId}`"
        class="transition-colors text-sm min-h-[44px]"
        :class="enPausa ? 'inline-flex items-center font-semibold texto-menta hover:underline' : 'boton-practicar inline-flex justify-center'"
      >
        <template v-if="enPausa">Probar otro ejercicio igual</template>
        <template v-else>
        <RotateCcw v-if="recommendedActivity.reason === 'repaso'" :size="16" aria-hidden="true" />
        <TrendingUp v-else-if="recommendedActivity.reason === 'reto' || recommendedActivity.reason === 'sube_nivel'" :size="16" aria-hidden="true" />
        <Hand v-else :size="16" aria-hidden="true" />
        {{ dominio ? 'Seguir practicando' : 'Practicar' }}<span class="sr-only">: {{ recommendedActivity.title }}</span>
        </template>
      </NuxtLink>
    </div>

    <!-- Todos los ejercicios, por nivel, con cuáles todavía suben el dominio (08/10). -->
    <EstudianteEjerciciosDeLaLeccion v-else-if="chooseManually" :unit-id="unitId" />

    <p v-else-if="cargado" class="m-0 text-sm text-base-texto-secundario">
      Todavía no hay ejercicios publicados para esta lección.
    </p>

    <div class="flex flex-wrap items-center gap-x-5 gap-y-1">
      <!-- 09/10 (Jeider): antes, un enlace pequeño que no se encontraba; ahora un botón que dice para qué sirve. -->
      <button
        v-if="recommendedActivity"
        type="button"
        :aria-expanded="chooseManually"
        class="inline-flex items-center gap-1.5 px-3 rounded-xl borde-afordancia bg-base-blanco text-sm font-semibold text-base-texto-primario hover:bg-base-bg-secundario min-h-[44px]"
        @click="toggleManualChoice">
        <ListChecks :size="15" class="texto-menta" aria-hidden="true" />
        {{ chooseManually ? 'Volver al recomendado' : 'Ver todos: cuáles suben tu dominio' }}
      </button>
      <!-- Tomar un reto, como «¿Ya sabes esto?» de Duolingo, pero en cualquier momento mientras la lección no esté
           dominada (pedido del dueño, 04/10): el que se siente seguro elige un ejercicio del nivel siguiente. -->
      <button v-if="puedeSaltar" type="button" :disabled="saltando" @click="saltarConReto"
        class="min-h-[44px] text-sm font-semibold texto-sol hover:underline inline-flex items-center gap-1.5 disabled:opacity-50">
        <Zap :size="15" aria-hidden="true" /> ¿Te sientes seguro? Toma un reto
      </button>
    </div>
    <p v-if="puedeSaltar" class="m-0 text-xs text-base-texto-secundario">El reto es un ejercicio del nivel siguiente. Si lo resuelves a la primera, lo de abajo deja de exigirse y tu dominio sube más rápido; si no sale, no pierdes lo que llevas.</p>
    <p v-if="saltoError" role="status" class="m-0 text-sm text-base-texto-primario">{{ saltoError }}</p>
  </section>
</template>

<script setup lang="ts">
import { BookOpen, Hand, Lightbulb, ListChecks, RotateCcw, TrendingUp, Zap } from 'lucide-vue-next'
import { DOMINADO } from '~/utils/terminos'
import { useAuthStore } from '~/stores/auth'
import { useTutorStore } from '~/stores/tutor'
import { useUnidadEstudiante, type RecomendacionActividadEstudiante } from '~/composables/useUnidadEstudiante'

const props = defineProps<{ unitId: number }>()
const route = useRoute()
const authStore = useAuthStore()
const tutorStore = useTutorStore()
const { progreso, siguienteActividad, registrarConfianza } = useUnidadEstudiante()
const { messageOf } = useApiErrorMessage()

const unitId = props.unitId
const cargado = ref(false)
const recommendedActivity = ref<RecomendacionActividadEstudiante | null>(null)
const enPausa = computed(() => recommendedActivity.value?.reason === 'pausa')
// Desde un ejercicio («Ver cuáles todavía suben tu dominio») se llega con la lista ya abierta.
const chooseManually = ref(route.query.ejercicios === '1')
/** Dominio de la lección (null si aún no hay progreso: se muestra desde que empieza a practicar). */
const dominio = ref<number | null>(null)
/**
 * Tomar un reto (docs/DISENO_INTERVENCION_DOCENTE.md §10.2; en cualquier momento desde el 04/10): reemplaza la pregunta
 * «¿Cómo te sientes con este tema?». Por dentro es el reto de salto (confianza 3): si lo resuelve al primer intento, lo
 * de abajo deja de exigirse.
 */
const puedeSaltar = ref(false)
const saltando = ref(false)
const saltoError = ref<string | null>(null)

/** Lleva a la explicación de la lección y le pasa el foco, para que el lector de pantalla también llegue ahí. */
function volverALaExplicacion() {
  const el = document.getElementById('explicacion')
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  el.focus({ preventScroll: true })
}

function toggleManualChoice() {
  chooseManually.value = !chooseManually.value
}

async function saltarConReto() {
  saltando.value = true
  saltoError.value = null
  try {
    const studentId = authStore.user?.id
    // Primero se busca el reto; solo si hay uno se marca la confianza (así no cambia nada si no lo hay).
    const reto = studentId
      ? await siguienteActividad(studentId, unitId, true)
      : null
    if (reto?.activityId && reto.reason === 'reto') {
      await registrarConfianza(unitId, 3)
      await navigateTo(`/estudiante/evaluacion/${reto.activityId}?reto=1`)
      return
    }
    // Tras varios fallos seguidos el tope (BT-16) va primero: no se ofrece algo más difícil.
    saltoError.value = reto?.reason === 'pausa'
      ? 'Llevas varios intentos seguidos sin lograrlo: primero vuelve a la explicación o pide una pista. El reto queda para después.'
      : 'No hay ejercicios de un nivel más alto pendientes en esta lección: sigue con el recomendado.'
    puedeSaltar.value = false
  } catch (error: unknown) {
    saltoError.value = messageOf(error, 'No se pudo preparar el reto. Prueba con «Practicar».')
  } finally {
    saltando.value = false
  }
}

function levelLabel(level: string) {
  if (level === 'basico') return 'Básico'
  if (level === 'intermedio') return 'Intermedio'
  if (level === 'avanzado') return 'Avanzado'
  return level
}

onMounted(async () => {
  if (chooseManually.value) nextTick(() => document.getElementById('practicar-titulo')?.scrollIntoView({ block: 'start' }))
  const studentId = authStore.user?.id
  if (!studentId || !unitId) return
  try {
    const [progress, rec] = await Promise.all([
      progreso(studentId, unitId),
      siguienteActividad(studentId, unitId)
    ])
    recommendedActivity.value = rec
    dominio.value = progress && (progress.attemptsCount ?? 0) > 0 ? Math.round(progress.mastery ?? 0) : null
    // El reto se ofrece mientras la lección no esté dominada ni completada (antes, solo antes de empezar).
    puedeSaltar.value = !!rec && !rec.allCompleted && rec.reason !== 'pausa' && (progress?.mastery ?? 0) < DOMINADO
  } catch (error: unknown) {
    console.warn('[STIRE Student] No se pudo cargar el progreso o la actividad recomendada:', error)
  } finally {
    cargado.value = true
  }
})
</script>
