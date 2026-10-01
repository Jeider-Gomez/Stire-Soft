<template>
  <div class="space-y-6">
    <!-- BARRA SUPERIOR: Contexto de Asignatura y Selector de Clases -->
    <div class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <Landmark :size="20" class="text-acento-ambar-fuerte shrink-0" aria-hidden="true" />
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-acento-ambar-fuerte">
            Asignatura Activa
          </span>
          <h2 class="text-xs sm:text-sm font-bold text-base-texto-primario">
            {{ studentStore.currentClassName || 'Sin clase activa seleccionada' }}
          </h2>
          <p v-if="studentStore.currentTeacher" class="text-[11px] text-base-texto-secundario">
            Docente: {{ studentStore.currentTeacher }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <NuxtLink
          to="/estudiante/clases"
          class="borde-afordancia px-3 py-1.5 rounded-md text-xs font-semibold text-base-texto-primario bg-base-blanco hover:bg-base-bg-secundario transition-colors flex items-center gap-1.5 shadow-sm">
          <Library :size="14" aria-hidden="true" />
          <span>Mis Clases ({{ studentStore.enrolledClasses.length }})</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Aviso discreto de solicitud de rol docente (§23 T4) -->
    <div
      v-if="myRoleRequest"
      class="p-3 rounded-lg border text-xs flex items-center justify-between gap-3 shadow-sm"
      :class="{
        'bg-semantico-info/10 border-semantico-info/30 text-semantico-info': myRoleRequest.status === 'pending',
        'bg-semantico-pasa/10 border-semantico-pasa/30 text-semantico-pasa': myRoleRequest.status === 'approved',
        'bg-semantico-falla/10 border-semantico-falla/30 text-semantico-falla': myRoleRequest.status === 'rejected'
      }">
      <div class="flex items-center gap-2">
        <Clock v-if="myRoleRequest.status === 'pending'" :size="14" aria-hidden="true" />
        <PartyPopper v-else-if="myRoleRequest.status === 'approved'" :size="14" aria-hidden="true" />
        <AlertTriangle v-else :size="14" aria-hidden="true" />

        <span v-if="myRoleRequest.status === 'pending'" class="font-medium">
          Tu solicitud para ser docente está pendiente
        </span>
        <span v-else-if="myRoleRequest.status === 'approved'" class="font-medium">
          Aprobada: cierra sesión y vuelve a entrar para usar el rol docente
        </span>
        <span v-else class="font-medium">
          Tu solicitud para ser docente fue rechazada<span v-if="myRoleRequest.reviewNote">: «{{ myRoleRequest.reviewNote }}»</span>
        </span>
      </div>

      <button
        v-if="myRoleRequest.status === 'approved'"
        type="button"
        @click="authStore.logout()"
        class="text-xs underline font-bold hover:opacity-80">
        Cerrar sesión
      </button>
    </div>

    <!-- ESTADO VACÍO SI NO ESTÁ MATRICULADO -->
    <section v-if="!studentStore.isSyncing && studentStore.enrolledClasses.length === 0" class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-8 text-center space-y-4 shadow-sm">
      <div class="w-16 h-16 bg-acento-ambar/15 text-acento-ambar-fuerte rounded-full flex items-center justify-center mx-auto">
        <GraduationCap :size="30" aria-hidden="true" />
      </div>
      <div class="max-w-md mx-auto space-y-1">
        <h2 class="text-base font-bold text-base-texto-primario">¡Bienvenido a STIRE!</h2>
        <p class="text-xs text-base-texto-secundario">
          Aún no estás matriculado en ninguna clase. Para comenzar tu ruta de aprendizaje adaptativo, ingresa el código de clase suministrado por tu docente.
        </p>
      </div>
      <NuxtLink
        to="/estudiante/clases"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs transition-colors shadow-sm">
        <KeyRound :size="14" aria-hidden="true" />
        <span>Ingresar Código de Clase</span>
      </NuxtLink>
    </section>

    <template v-else>
      <!-- 1. EL SIGUIENTE PASO: una sola acción destacada (docs/DISENO_INTERVENCION_DOCENTE.md §10.2) -->
      <section v-if="studentStore.activeUnit" class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="space-y-2 max-w-2xl min-w-0">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-acento-ambar/15 text-acento-ambar-fuerte uppercase tracking-wider">
            Tu siguiente paso
          </span>
          <h1 class="text-lg md:text-xl font-bold text-base-texto-primario tracking-tight">
            {{ studentStore.activeUnit.title }}
          </h1>
          <p class="text-[11px] text-base-texto-secundario">{{ ubicacion(studentStore.activeUnit) }}</p>
          <p class="text-xs text-base-texto-secundario leading-relaxed">
            {{ studentStore.activeUnit.empezada ? (recommendedReasonMessage || studentStore.activeUnit.description) : studentStore.activeUnit.description }}
          </p>
          <div v-if="studentStore.activeUnit.empezada" class="flex items-center gap-3 pt-1">
            <div class="w-48 h-2 bg-base-bg-secundario rounded-full overflow-hidden border border-base-borde-sutil" role="progressbar"
              :aria-valuenow="studentStore.activeUnit.masteryPercentage" aria-valuemin="0" aria-valuemax="100" aria-label="Dominio de la lección">
              <div class="h-full bg-acento-ambar-fuerte rounded-full transition-all duration-500" :style="{ width: `${studentStore.activeUnit.masteryPercentage}%` }"></div>
            </div>
            <span class="text-xs font-semibold text-base-texto-primario">{{ studentStore.activeUnit.masteryPercentage }} % de dominio</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto flex-shrink-0">
          <!-- Una lección sin empezar abre la lección (la explicación primero); una empezada sigue con la práctica. -->
          <NuxtLink v-if="!studentStore.activeUnit.empezada || !recommendedExerciseId" :to="`/estudiante/unidad/${studentStore.activeUnit.id}`"
            class="px-5 py-3 rounded-lg bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs text-center transition-colors shadow-sm flex items-center justify-center gap-2">
            <BookOpen :size="15" aria-hidden="true" /> {{ studentStore.activeUnit.empezada ? 'Abrir la lección' : 'Empezar la lección' }}
          </NuxtLink>
          <template v-else>
            <NuxtLink :to="`/estudiante/evaluacion/${recommendedExerciseId}`"
              class="px-5 py-3 rounded-lg bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs text-center transition-colors shadow-sm flex items-center justify-center gap-2">
              <RotateCcw v-if="recommendedReason === 'repaso'" :size="15" aria-hidden="true" />
              <TrendingUp v-else-if="recommendedReason === 'reto' || recommendedReason === 'sube_nivel'" :size="15" aria-hidden="true" />
              <Play v-else :size="15" aria-hidden="true" />
              Seguir practicando
            </NuxtLink>
            <NuxtLink :to="`/estudiante/unidad/${studentStore.activeUnit.id}`" class="text-xs font-semibold text-acento-ambar-fuerte hover:underline text-center">
              Ver la explicación
            </NuxtLink>
          </template>

          <NuxtLink
            to="/estudiante/repasos"
            class="borde-afordancia px-4 py-2.5 rounded-lg bg-base-bg-secundario text-center text-xs font-semibold text-base-texto-primario flex items-center justify-center gap-1.5">
            <Brain :size="14" aria-hidden="true" />
            <span v-if="!studentStore.hasLoaded">Repasos</span>
            <span v-else-if="studentStore.reviewsDueToday.length">Repasar ({{ studentStore.reviewsDueToday.length }} para hoy)</span>
            <span v-else>Repasos: ninguno para hoy</span>
          </NuxtLink>
        </div>
      </section>

      <!-- 2. AVANCE HONESTO: cuánto del curso, no solo de lo trabajado (antes decía «Dominio 100 %» con 5 de 17) -->
      <section class="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Tu avance">
        <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm">
          <p class="text-[11px] text-base-texto-secundario font-medium">Avance del curso</p>
          <p class="text-xl font-bold mt-1 text-base-texto-primario">
            <template v-if="studentStore.hasLoaded">{{ studentStore.avanceCurso.dominadas }} <span class="text-sm font-semibold text-base-texto-secundario">de {{ contar(studentStore.avanceCurso.total, 'leccion') }}</span></template>
            <template v-else>—</template>
          </p>
          <div class="mt-2 h-1.5 bg-base-bg-secundario rounded-full overflow-hidden" aria-hidden="true">
            <div class="h-full bg-semantico-pasa rounded-full" :style="{ width: `${porcentajeAvance}%` }"></div>
          </div>
          <span class="text-[10px] text-base-texto-secundario">lecciones dominadas</span>
        </div>

        <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm">
          <p class="text-[11px] text-base-texto-secundario font-medium">Dominio en lo que has trabajado</p>
          <p class="text-xl font-bold mt-1" :class="studentStore.avanceCurso.dominioTrabajado >= DOMINADO ? 'text-semantico-pasa' : 'text-base-texto-primario'">
            {{ studentStore.hasLoaded && studentStore.avanceCurso.trabajadas ? `${studentStore.avanceCurso.dominioTrabajado} %` : '—' }}
          </p>
          <span class="text-[10px] text-base-texto-secundario">
            {{ studentStore.avanceCurso.trabajadas ? `en ${contar(studentStore.avanceCurso.trabajadas, 'leccion')} que ya empezaste` : 'Aún no empiezas ninguna lección' }}
          </span>
        </div>

        <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm">
          <p class="text-[11px] text-base-texto-secundario font-medium">Racha de estudio</p>
          <p class="text-xl font-bold text-acento-ambar-fuerte mt-1 flex items-center gap-1.5"><Flame :size="18" aria-hidden="true" /> {{ studentStore.hasLoaded ? plural(studentStore.analytics.streakDays, 'día', 'días') : '—' }}</p>
          <NuxtLink to="/estudiante/progreso" class="text-[10px] font-semibold text-acento-ambar-fuerte hover:underline">Ver mis estadísticas</NuxtLink>
        </div>
      </section>

      <!-- 3. EL PLAN DEL CURSO: módulos, temas (solo si agrupan más de una lección) y lecciones -->
      <section class="space-y-4" aria-labelledby="plan-titulo">
        <div class="flex items-center justify-between">
          <h2 id="plan-titulo" class="text-base font-bold text-base-texto-primario flex items-center gap-2">
            <MapIcon :size="18" class="text-acento-ambar-fuerte" aria-hidden="true" /> Plan del curso
          </h2>
          <span class="text-xs text-base-texto-secundario">{{ contar(studentStore.modules.length, 'modulo') }}</span>
        </div>

        <div v-if="studentStore.modules.length === 0" class="p-8 text-center bg-base-blanco rounded-xl border border-base-borde-sutil text-xs text-base-texto-secundario">
          Tu docente todavía no ha publicado el contenido de este curso.
        </div>

        <div v-else class="space-y-4">
          <section v-for="mod in studentStore.modules" :key="mod.id" class="bg-base-blanco rounded-xl border border-base-borde-sutil overflow-hidden shadow-sm" :aria-label="mod.title">
            <div class="bg-base-bg-secundario/60 px-5 py-3 border-b border-base-borde-sutil flex flex-wrap items-center justify-between gap-2">
              <h3 class="font-bold text-xs text-base-texto-primario">{{ mod.title }}</h3>
              <span class="text-[11px] text-base-texto-secundario flex items-center gap-2">
                <span class="w-16 h-1.5 bg-base-blanco rounded-full overflow-hidden border border-base-borde-sutil" aria-hidden="true">
                  <span class="block h-full bg-semantico-pasa" :style="{ width: `${porcentajeModulo(mod)}%` }"></span>
                </span>
                {{ dominadasDe(mod) }} de {{ contar(mod.units.length, 'leccion') }} dominadas
              </span>
            </div>

            <div v-for="tema in mod.topics" :key="tema.id">
              <p v-if="tema.units.length > 1" class="px-5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-base-texto-secundario">
                {{ tema.title }}
              </p>
              <ul class="divide-y divide-base-borde-sutil">
                <li v-for="unit in tema.units" :key="unit.id">
                  <NuxtLink :to="`/estudiante/unidad/${unit.id}`"
                    class="px-5 py-3 flex items-center gap-3 hover:bg-base-bg-primario/60 transition-colors group"
                    :class="unit.id === studentStore.activeUnit?.id ? 'bg-acento-ambar/5' : ''"
                    :aria-label="`${unit.title}: ${estadoLeccion(unit)}`">
                    <CheckCircle2 v-if="unit.status === 'dominado'" :size="18" class="text-semantico-pasa shrink-0" aria-hidden="true" />
                    <CircleDot v-else-if="unit.status === 'en-progreso'" :size="18" class="text-acento-ambar-fuerte shrink-0" aria-hidden="true" />
                    <Circle v-else :size="18" class="text-base-borde-fuerte shrink-0" aria-hidden="true" />
                    <span class="flex-1 min-w-0">
                      <span class="block text-xs font-semibold group-hover:underline" :class="unit.status === 'dominado' ? 'text-base-texto-secundario' : 'text-base-texto-primario'">{{ unit.title }}</span>
                      <span v-if="unit.id === studentStore.activeUnit?.id" class="block text-[11px] text-base-texto-secundario truncate">{{ unit.description }}</span>
                    </span>
                    <span v-if="forgettingUnitIds.has(unit.id)" class="inline-flex items-center gap-1 text-[10px] font-semibold text-semantico-info shrink-0">
                      <RotateCcw :size="12" aria-hidden="true" /> Repasar
                    </span>
                    <span v-if="unit.id === studentStore.activeUnit?.id"
                      class="px-3 py-1 rounded-md text-[11px] font-bold bg-acento-ambar-fuerte text-base-blanco shrink-0">Continuar</span>
                    <span v-else-if="unit.empezada" class="text-[11px] font-semibold text-base-texto-secundario shrink-0 w-10 text-right">{{ unit.masteryPercentage }} %</span>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RotateCcw, TrendingUp, AlertTriangle, Landmark, Library, Clock, PartyPopper, GraduationCap, KeyRound, Brain, Flame, Map as MapIcon, Play, BookOpen, CheckCircle2, CircleDot, Circle } from 'lucide-vue-next'
import { contar, DOMINADO } from '~/utils/terminos'
import { useStudentStore } from '~/stores/student'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'
import type { CourseModule, LearningUnit } from '~/types'

definePageMeta({
  layout: 'student'
})

const studentStore = useStudentStore()
const authStore = useAuthStore()
const api = useApi()

// Estado de solicitud de rol docente del estudiante (§23 T4)
const myRoleRequest = ref<{
  id: number
  status: 'pending' | 'approved' | 'rejected'
  reason?: string | null
  reviewNote?: string | null
} | null>(null)

async function fetchMyRoleRequest() {
  try {
    const res = await api.get<{ request: any } | null>('/role-requests/me')
    if (res?.request) {
      myRoleRequest.value = res.request
    }
  } catch (err) {
    // Si falla o no está disponible, no bloquea el dashboard del estudiante
  }
}

onMounted(() => {
  studentStore.fetchStudentData()
  fetchMyRoleRequest()
})

// Ejercicio a recomendar en la tarjeta hero: usa el mismo motor de dominio
// (GET .../next-activity) que /estudiante/unidad/[id].vue, en vez del
// heurístico local de studentStore ("primera actividad cuyo título contenga
// 'código'/'desafío'") -- ese heurístico salta cualquier MCQ sin importar su
// order, porque un quiz nunca calza esas palabras, así que nunca coincidía
// con la Fase A pedagógicamente correcta.
const recommendedExerciseId = ref<number | null>(null)
const recommendedReason = ref<string | null>(null)
const recommendedReasonMessage = ref<string | null>(null)
const recommendedLevel = ref<string | null>(null)

watch(
  () => studentStore.activeUnit?.id,
  async (unitId) => {
    recommendedExerciseId.value = null
    recommendedReason.value = null
    recommendedReasonMessage.value = null
    recommendedLevel.value = null
    const studentId = authStore.user?.id
    if (!unitId || !studentId) return

    try {
      const rec = await api.get<{ activityId: number; reason?: string; reasonMessage?: string; level?: string } | null>(
        `/learning-progress/student/${studentId}/unit/${unitId}/next-activity`
      )
      recommendedExerciseId.value = rec?.activityId ?? null
      recommendedReason.value = rec?.reason ?? null
      recommendedReasonMessage.value = rec?.reasonMessage ?? null
      recommendedLevel.value = rec?.level ?? null
    } catch (error: unknown) {
      console.warn('[STIRE Student] No se pudo cargar la actividad recomendada real, usando heurístico local:', error)
      recommendedExerciseId.value = studentStore.activeUnit?.exerciseActivityId ?? null
    }
  },
  { immediate: true }
)

// Unidades con repaso vencido o crítico para el badge «Se está olvidando» (T2)
const forgettingUnitIds = computed(() => {
  const ids = new Set<number>()
  for (const r of studentStore.reviews) {
    if (r.urgency === 'vencido' || r.urgency === 'critico') {
      ids.add(r.learningUnitId)
    }
  }
  return ids
})

const porcentajeAvance = computed(() => {
  const { dominadas, total } = studentStore.avanceCurso
  return total ? Math.round((dominadas / total) * 100) : 0
})
const dominadasDe = (mod: CourseModule) => mod.units.filter((u) => u.status === 'dominado').length
const porcentajeModulo = (mod: CourseModule) => (mod.units.length ? Math.round((dominadasDe(mod) / mod.units.length) * 100) : 0)

/** «Módulo · Tema»; el tema solo aparece si agrupa más de una lección (si tiene una, no aporta). */
function ubicacion(unit: LearningUnit) {
  const mod = studentStore.modules.find((m) => m.id === unit.moduleId)
  const tema = mod?.topics.find((t) => t.id === unit.topicId)
  return tema && tema.units.length > 1 ? `${unit.moduleTitle} · ${tema.title}` : unit.moduleTitle
}

function estadoLeccion(unit: LearningUnit) {
  if (unit.status === 'dominado') return `dominada, ${unit.masteryPercentage} %`
  if (unit.empezada) return `en práctica, ${unit.masteryPercentage} %`
  return 'sin empezar'
}
</script>
