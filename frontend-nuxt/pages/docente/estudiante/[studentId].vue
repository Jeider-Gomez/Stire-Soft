<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Navegación de retorno -->
    <div class="flex items-center gap-2 text-xs">
      <NuxtLink
        to="/docente/rendimiento"
        class="borde-afordancia px-2.5 py-1 rounded text-base-texto-secundario hover:text-base-texto-primario flex items-center gap-1">
        <span>◀</span>
        <span>Volver a Rendimiento del Grupo (DOC-V04)</span>
      </NuxtLink>
    </div>

    <!-- Cabecera DOC-V05 -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info uppercase tracking-wider">
            Trazabilidad Individual • DOC-V05
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-base-bg-secundario text-base-texto-secundario">
            ID: #{{ route.params.studentId }}
          </span>
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          Seguimiento y Diagnóstico de Estudiante
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">
          Universidad de Córdoba • Sistema de Tutoría Inteligente STIRE
        </p>
      </div>

      <NuxtLink
        to="/docente/mensajes"
        class="px-3.5 py-2 rounded-md borde-afordancia text-xs font-semibold text-acento-ambar-fuerte hover:bg-acento-ambar/10 transition-colors flex items-center gap-1.5 self-start sm:self-auto">
        <span>✉️</span>
        <span>Enviar Mensaje Directo</span>
      </NuxtLink>
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
          to="/docente/rendimiento"
          class="px-4 py-1.5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold">
          Volver a Cohorte
        </NuxtLink>
      </div>
    </div>

    <!-- ESTADO 3: Con Datos -->
    <div v-else-if="dashboard" class="space-y-6">
      <!-- Tarjetas KPI -->
      <section class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <!-- Dominio Promedio -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm">
          <span class="text-[10px] font-semibold text-base-texto-secundario uppercase block">Dominio Promedio</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-2xl font-bold font-mono" :class="dashboard.summary.avgMastery >= 60 ? 'text-semantico-pasa' : 'text-semantico-falla'">
              {{ dashboard.summary.avgMastery }}%
            </span>
          </div>
          <p class="text-[10px] text-base-texto-secundario mt-1">En todas las unidades</p>
        </div>

        <!-- Tasa de Éxito -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm">
          <span class="text-[10px] font-semibold text-base-texto-secundario uppercase block">Tasa de Aprobación</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-2xl font-bold font-mono text-base-texto-primario">
              {{ dashboard.summary.avgSuccessRate }}%
            </span>
          </div>
          <p class="text-[10px] text-base-texto-secundario mt-1">{{ dashboard.summary.totalAttempts }} intentos en total</p>
        </div>

        <!-- Racha Real -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm">
          <span class="text-[10px] font-semibold text-base-texto-secundario uppercase block">Racha Activa</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-2xl font-bold font-mono text-acento-ambar-fuerte">
              {{ dashboard.summary.streakDays }}
            </span>
            <span class="text-[11px] text-base-texto-secundario">días seguidos</span>
          </div>
          <p class="text-[10px] text-base-texto-secundario mt-1">Práctica continuada</p>
        </div>

        <!-- Repasos Pendientes -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm">
          <span class="text-[10px] font-semibold text-base-texto-secundario uppercase block">Repasos SM-2</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-2xl font-bold font-mono" :class="dashboard.summary.reviewStats.pending > 0 ? 'text-acento-ambar-fuerte' : 'text-semantico-pasa'">
              {{ dashboard.summary.reviewStats.pending }}
            </span>
            <span class="text-[11px] text-base-texto-secundario">pendientes</span>
          </div>
          <p class="text-[10px] text-base-texto-secundario mt-1">{{ dashboard.summary.reviewStats.total }} programados</p>
        </div>
      </section>

      <!-- Dominio por Unidad de Aprendizaje -->
      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4">
        <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider">
          Dominio Conceptual por Unidad de Aprendizaje
        </h2>

        <div v-if="dashboard.masteryByUnit.length === 0" class="text-xs text-base-texto-secundario italic py-4">
          Sin registros de progreso en unidades aún.
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
                <th class="p-2.5">Fecha y Hora</th>
                <th class="p-2.5 text-center">Estado</th>
                <th class="p-2.5 text-right">Puntaje</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-base-borde-sutil">
              <tr v-for="sub in dashboard.recentSubmissions" :key="sub.id" class="hover:bg-base-bg-secundario/40">
                <td class="p-2.5 font-semibold text-base-texto-primario">
                  {{ sub.activityTitle }}
                </td>
                <td class="p-2.5 text-[11px] text-base-texto-secundario">
                  {{ new Date(sub.createdAt).toLocaleString() }}
                </td>
                <td class="p-2.5 text-center">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                    :class="sub.status === 'graded' ? 'bg-semantico-pasa/15 text-semantico-pasa' : 'bg-acento-ambar/15 text-acento-ambar-fuerte'">
                    {{ sub.status === 'graded' ? 'Calificado' : 'Procesando' }}
                  </span>
                </td>
                <td class="p-2.5 text-right font-mono font-bold" :class="sub.score >= 60 ? 'text-semantico-pasa' : 'text-semantico-falla'">
                  {{ sub.score }} / 100
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
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'teacher'
})

interface StudentDashboardData {
  studentId: number
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
    errorMessage.value = err?.data?.message || 'No tienes permiso o no se pudo cargar el seguimiento del alumno'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStudentDashboard()
})
</script>
