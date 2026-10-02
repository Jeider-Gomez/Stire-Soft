<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <DocentePestanasClase v-if="claseDeLaFicha" :class-id="claseDeLaFicha" activa="estudiantes" />
    <!-- Navegación de retorno -->
    <div class="flex items-center gap-2 text-xs">
      <NuxtLink
        :to="volverAlGrupo"
        class="borde-afordancia px-2.5 py-1 rounded text-base-texto-secundario hover:text-base-texto-primario flex items-center gap-1">
        <span>◀</span>
        <span>Volver a Rendimiento del Grupo</span>
      </NuxtLink>
    </div>

    <!-- Cabecera DOC-V05 -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info uppercase tracking-wider">
            Estudiante
          </span>
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          {{ dashboard?.studentName || 'Seguimiento y Diagnóstico de Estudiante' }}
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">
          Universidad de Córdoba • Sistema de Tutoría Inteligente STIRE
        </p>
      </div>

      <!-- La intervención individual (docs/DISENO_INTERVENCION_DOCENTE.md §4.2): refuerzo, reto o mensaje desde la ficha. -->
      <div class="flex flex-wrap gap-2 self-start sm:self-auto">
        <NuxtLink
          :to="enlaceNuevoRefuerzo(claseDeLaFicha, 'refuerzo', [Number(route.params.studentId)])"
          class="px-3.5 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco text-xs font-bold flex items-center gap-1.5">
          <LifeBuoy :size="14" aria-hidden="true" /> Asignar refuerzo
        </NuxtLink>
        <NuxtLink
          :to="enlaceNuevoRefuerzo(claseDeLaFicha, 'reto', [Number(route.params.studentId)])"
          class="px-3.5 py-2 rounded-md borde-afordancia text-xs font-semibold flex items-center gap-1.5">
          <Rocket :size="14" aria-hidden="true" /> Reto
        </NuxtLink>
        <NuxtLink
          to="/docente/mensajes"
          class="px-3.5 py-2 rounded-md borde-afordancia text-xs font-semibold text-acento-ambar-fuerte hover:bg-acento-ambar/10 transition-colors flex items-center gap-1.5">
          <Mail :size="14" aria-hidden="true" /> Mensaje
        </NuxtLink>
      </div>
    </header>

    <!-- ESTADO 1: Cargando -->
    <div v-if="isLoading" class="p-12 text-center text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil">
      <span class="inline-block animate-spin mr-2">⏳</span> Obteniendo métricas y registros de actividad del alumno...
    </div>

    <!-- ESTADO 2: Error -->
    <div v-else-if="errorMessage" class="p-8 text-center bg-base-blanco rounded-xl border border-semantico-falla/30 text-xs space-y-3">
      <span class="text-2xl">⚠</span>
      <p class="font-bold text-semantico-falla">{{ errorMessage }}</p>
      <div class="flex items-center justify-center gap-2">
        <button
          @click="fetchStudentDashboard"
          class="px-4 py-1.5 rounded-md bg-base-bg-secundario border border-base-borde-fuerte font-semibold hover:bg-base-borde-sutil transition-colors">
          Reintentar
        </button>
        <NuxtLink
          :to="volverAlGrupo"
          class="px-4 py-1.5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold">
          Volver a Cohorte
        </NuxtLink>
      </div>
    </div>

    <!-- ESTADO 3: Con Datos -->
    <div v-else-if="dashboard" class="space-y-6">
      <!-- Tarjetas KPI -->
      <section class="grid grid-cols-3 gap-2 sm:gap-4">
        <!-- Dominio Promedio -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-3 sm:p-4 shadow-sm min-w-0">
          <span class="text-[10px] font-semibold text-base-texto-secundario block">Dominio en lo trabajado</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-xl sm:text-2xl font-bold" :class="dashboard.summary.avgMastery >= 60 ? 'text-semantico-pasa' : 'text-semantico-falla'">
              {{ dashboard.summary.avgMastery }}%
            </span>
          </div>
          <p class="text-[10px] text-base-texto-secundario mt-1">Solo las lecciones que ya practicó</p>
        </div>

        <!-- Tasa de Éxito -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-3 sm:p-4 shadow-sm min-w-0">
          <span class="text-[10px] font-semibold text-base-texto-secundario block">Ejercicios aprobados</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-xl sm:text-2xl font-bold text-base-texto-primario">
              {{ dashboard.summary.avgSuccessRate }}%
            </span>
          </div>
          <p class="text-[10px] text-base-texto-secundario mt-1">{{ plural(dashboard.summary.totalAttempts, 'intento', 'intentos') }} en total</p>
        </div>

        <!-- Repasos Pendientes -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-3 sm:p-4 shadow-sm min-w-0">
          <span class="text-[10px] font-semibold text-base-texto-secundario block">Repasos</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-xl sm:text-2xl font-bold" :class="dashboard.summary.reviewStats.pending > 0 ? 'text-acento-ambar-fuerte' : 'text-semantico-pasa'">
              {{ dashboard.summary.reviewStats.pending }}
            </span>
            <span class="text-[11px] text-base-texto-secundario">pendientes</span>
          </div>
          <p class="text-[10px] text-base-texto-secundario mt-1">{{ plural(dashboard.summary.reviewStats.total, 'programado', 'programados') }}</p>
        </div>
      </section>

      <!-- Dominio por Unidad de Aprendizaje -->
      <!-- Las mismas estadísticas que ve el estudiante (docs/DISENO_INTERVENCION_DOCENTE.md §10.3) -->
      <!-- Racha y semana a la vista; lo demás plegado (BT-21). La racha ya cuenta los días en hora de Colombia. -->
      <EstadisticasEstudiante :student-id="Number(route.params.studentId)" :class-id="claseDeLaFicha" vista="docente" />

      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4">
        <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider">
          Dominio por lección
        </h2>

        <div v-if="dashboard.masteryByUnit.length === 0" class="text-xs text-base-texto-secundario italic py-4">
          Todavía no ha practicado ninguna lección.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="u in dashboard.masteryByUnit"
            :key="u.unitId"
            class="space-y-1.5 p-3 rounded-lg bg-base-bg-secundario/50 border border-base-borde-sutil">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-base-texto-primario">{{ u.unitTitle }}</span>
              <div class="flex items-center gap-3">
                <span class="text-[11px] text-base-texto-secundario">Éxito: {{ u.successRate }}%</span>
                <span class="font-mono font-bold text-xs" :class="u.mastery >= 60 ? 'text-semantico-pasa' : 'text-semantico-falla'">
                  {{ u.mastery }}%
                </span>
              </div>
            </div>

            <div class="w-full bg-base-blanco rounded-full h-2 overflow-hidden border border-base-borde-sutil">
              <div
                class="h-full rounded-full transition-all"
                :class="u.mastery >= 70 ? 'bg-semantico-pasa' : u.mastery >= 40 ? 'bg-acento-ambar-fuerte' : 'bg-semantico-falla'"
                :style="{ width: `${Math.min(100, u.mastery)}%` }"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Historial de Entregas Recientes -->
      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4">
        <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider">
          Historial de Soluciones y Entregas
        </h2>

        <div v-if="dashboard.recentSubmissions.length === 0" class="text-xs text-base-texto-secundario italic py-4">
          El estudiante no ha enviado soluciones aún.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-base-bg-secundario text-base-texto-secundario border-b border-base-borde-sutil font-semibold">
              <tr>
                <th class="p-2.5">Actividad</th>
                <th class="p-2.5 hidden sm:table-cell">Fecha</th>
                <th class="p-2.5 text-center hidden sm:table-cell">Estado</th>
                <th class="p-2.5 text-right">Puntaje</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-base-borde-sutil">
              <tr v-for="sub in dashboard.recentSubmissions" :key="sub.id" class="hover:bg-base-bg-secundario/40">
                <td class="p-2.5 font-semibold text-base-texto-primario">
                  {{ sub.activityTitle }}
                </td>
                <td class="p-2.5 text-[11px] text-base-texto-secundario hidden sm:table-cell">
                  {{ new Date(sub.createdAt).toLocaleString() }}
                </td>
                <td class="p-2.5 text-center hidden sm:table-cell">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                    :class="sub.status === 'graded' ? 'bg-semantico-pasa/15 text-semantico-pasa' : 'bg-acento-ambar/15 text-acento-ambar-fuerte'">
                    {{ statusLabel(sub.status) }}
                  </span>
                </td>
                <td
                  class="p-2.5 text-right font-bold"
                  :class="sub.passed === true ? 'text-semantico-pasa' : sub.passed === false ? 'text-semantico-falla' : 'text-base-texto-secundario'">
                  <template v-if="sub.status === 'graded'">{{ sub.score }} / {{ sub.maxScore ?? '—' }}</template>
                  <template v-else>—</template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LifeBuoy, Mail, Rocket } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { enlaceNuevoRefuerzo } from '~/utils/refuerzos'
const { messageOf } = useApiErrorMessage()

definePageMeta({
  layout: 'teacher'
})

function statusLabel(status: string): string {
  switch (status) {
    case 'graded': return 'Calificado'
    case 'in_progress': return 'En curso'
    case 'submitted': return 'Calificando'
    case 'expired': return 'Expirado'
    default: return 'Sin entregar'
  }
}

interface StudentDashboardData {
  studentId: number
  studentName: string | null
  summary: {
    avgMastery: number
    avgSuccessRate: number
    totalUnitsTracked: number
    totalAttempts: number
    completedActivitiesCount: number
    streakDays: number
    reviewStats: {
      total: number
      pending: number
    }
  }
  recentSubmissions: Array<{
    id: string
    activityId: number
    activityTitle: string
    score: number
    maxScore: number | null
    passed: boolean | null
    status: string
    createdAt: string
  }>
  masteryByUnit: Array<{
    unitId: number
    unitTitle: string
    mastery: number
    successRate: number
  }>
}

const route = useRoute()
// Clase desde la que se abrió la ficha (Rendimiento o el mapa de calor): las estadísticas de lecciones son de esa clase.
const claseDeLaFicha = computed(() => Number(route.query.clase) || null)
const volverAlGrupo = computed(() => (claseDeLaFicha.value ? `/docente/rendimiento?classId=${claseDeLaFicha.value}` : '/docente/rendimiento'))
const api = useApi()

const dashboard = ref<StudentDashboardData | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

async function fetchStudentDashboard() {
  const studentId = Number(route.params.studentId)
  if (!studentId) {
    errorMessage.value = 'ID de estudiante inválido'
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    const res = await api.get<StudentDashboardData>(`/analytics/student/${studentId}`)
    dashboard.value = res
  } catch (err: any) {
    errorMessage.value = messageOf(err, 'No tienes permiso o no se pudo cargar el seguimiento del alumno')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStudentDashboard()
})
</script>
