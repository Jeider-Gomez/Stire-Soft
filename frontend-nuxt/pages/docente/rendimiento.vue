<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Cabecera DOC-V04 -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info uppercase tracking-wider">
            Analítica de Cohorte • DOC-V04
          </span>
          <span v-if="selectedClass" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-acento-ambar/15 text-acento-ambar-fuerte">
            {{ selectedClass.code }}
          </span>
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          Rendimiento del Grupo y Alertas Tempranas
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">
          Diagnóstico del dominio conceptual y detección proactiva de rezago académico
        </p>
      </div>

      <!-- Selector de Clase -->
      <div class="flex items-center gap-2">
        <label for="rendimiento-class-selector" class="text-xs font-semibold text-base-texto-secundario whitespace-nowrap">Clase:</label>
        <select
          id="rendimiento-class-selector"
          v-model="selectedClassId"
          @change="loadClassMetrics"
          class="text-xs bg-base-blanco text-base-texto-primario border border-base-borde-fuerte rounded-md px-3 py-1.5 outline-none focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30">
          <option v-for="c in teacherClasses" :key="c.id" :value="c.id">
            {{ c.name }} ({{ c.code }})
          </option>
        </select>
      </div>
    </header>

    <!-- ESTADO 1: Cargando -->
    <div v-if="isLoading" class="p-12 text-center text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil">
      <span class="inline-block animate-spin mr-2">⏳</span> Calculando métricas de cohorte en tiempo real...
    </div>

    <!-- ESTADO 2: Error -->
    <div v-else-if="errorMessage" class="p-8 text-center bg-base-blanco rounded-xl border border-semantico-falla/30 text-xs space-y-3">
      <span class="text-2xl">⚠</span>
      <p class="font-bold text-semantico-falla">{{ errorMessage }}</p>
      <button
        @click="loadClassMetrics"
        class="px-4 py-2 rounded-md bg-base-bg-secundario border border-base-borde-fuerte font-semibold hover:bg-base-borde-sutil transition-colors">
        Reintentar carga
      </button>
    </div>

    <!-- ESTADO 3: Vacío (Sin alumnos matriculados) -->
    <div v-else-if="metrics && (!metrics.studentRankings || metrics.studentRankings.length === 0)" class="p-12 text-center bg-base-blanco rounded-xl border border-base-borde-fuerte text-xs space-y-3">
      <span class="text-3xl">👥</span>
      <h3 class="font-bold text-base-texto-primario text-sm">Sin estudiantes matriculados</h3>
      <p class="text-base-texto-secundario max-w-md mx-auto">
        Esta clase aún no cuenta con estudiantes registrados. Comparte el código
        <strong class="text-acento-ambar-fuerte font-mono">{{ selectedClass?.code }}</strong>
        para que los alumnos se vinculen y comiencen a generar analíticas.
      </p>
      <NuxtLink
        to="/docente"
        class="inline-block px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors">
        Volver a Mis Clases
      </NuxtLink>
    </div>

    <!-- ESTADO 4: Defecto (Con datos reales de cohorte) -->
    <div v-else-if="metrics" class="space-y-6">
      <!-- Tarjetas KPI -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- KPI 1: Dominio Promedio -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-1">
          <span class="text-[11px] font-semibold text-base-texto-secundario uppercase tracking-wider block">
            Dominio Promedio
          </span>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold font-mono" :class="metrics.metrics.avgClassMastery >= 60 ? 'text-semantico-pasa' : 'text-semantico-falla'">
              {{ metrics.metrics.avgClassMastery }}%
            </span>
            <span class="text-[11px] text-base-texto-secundario">del curso</span>
          </div>
          <div class="w-full bg-base-bg-secundario rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :class="metrics.metrics.avgClassMastery >= 60 ? 'bg-semantico-pasa' : 'bg-acento-ambar-fuerte'"
              :style="{ width: `${Math.min(100, metrics.metrics.avgClassMastery)}%` }"></div>
          </div>
        </div>

        <!-- KPI 2: Tasa de Aprobación -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-1">
          <span class="text-[11px] font-semibold text-base-texto-secundario uppercase tracking-wider block">
            Tasa de Aprobación
          </span>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold font-mono text-base-texto-primario">
              {{ metrics.metrics.avgClassSuccessRate }}%
            </span>
            <span class="text-[11px] text-base-texto-secundario">en envíos</span>
          </div>
          <p class="text-[10px] text-base-texto-secundario mt-2">
            {{ metrics.metrics.totalSubmissions }} envíos de código evaluados
          </p>
        </div>

        <!-- KPI 3: Alumnos en Riesgo -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-1">
          <span class="text-[11px] font-semibold text-base-texto-secundario uppercase tracking-wider block">
            Alumnos en Rezago
          </span>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold font-mono" :class="atRiskCount > 0 ? 'text-semantico-falla' : 'text-semantico-pasa'">
              {{ atRiskCount }}
            </span>
            <span class="text-[11px] text-base-texto-secundario">de {{ metrics.metrics.totalStudents }} alumnos</span>
          </div>
          <p class="text-[10px]" :class="atRiskCount > 0 ? 'text-semantico-falla font-semibold' : 'text-semantico-pasa'">
            {{ atRiskCount > 0 ? 'Requieren refuerzo pedagógico' : 'Sin alertas de rezago' }}
          </p>
        </div>

        <!-- KPI 4: Total Alumnos Activos -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-1">
          <span class="text-[11px] font-semibold text-base-texto-secundario uppercase tracking-wider block">
            Cohorte Activa
          </span>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold font-mono text-acento-ambar-fuerte">
              {{ metrics.metrics.totalStudents }}
            </span>
            <span class="text-[11px] text-base-texto-secundario">matriculados</span>
          </div>
          <p class="text-[10px] text-base-texto-secundario mt-2">
            Seguimiento individual activo
          </p>
        </div>
      </section>

      <!-- Roster de Estudiantes con Filtros -->
      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-hidden space-y-4 p-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-borde-sutil text-xs">
          <div>
            <h2 class="text-sm font-bold text-base-texto-primario">
              Roster de Estudiantes y Nivel de Dominio
            </h2>
            <p class="text-base-texto-secundario text-[11px]">
              Haz clic en cualquier estudiante para inspeccionar su trazabilidad individual (DOC-V05)
            </p>
          </div>

          <!-- Filtro de riesgo -->
          <div class="flex items-center gap-2">
            <button
              @click="onlyAtRisk = !onlyAtRisk"
              class="px-3 py-1.5 rounded-md font-semibold text-xs border transition-colors flex items-center gap-1.5"
              :class="onlyAtRisk
                ? 'bg-semantico-falla/15 text-semantico-falla border-semantico-falla/40'
                : 'borde-afordancia text-base-texto-primario hover:bg-base-bg-secundario'">
              <span>🚨</span>
              <span>{{ onlyAtRisk ? 'Viendo solo rezago (<50%)' : 'Filtrar por riesgo (<50%)' }}</span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-base-bg-secundario text-base-texto-secundario border-b border-base-borde-sutil font-semibold">
              <tr>
                <th class="p-3">Estudiante</th>
                <th class="p-3">Correo</th>
                <th class="p-3 text-center">Dominio</th>
                <th class="p-3 text-center">Tasa Éxito</th>
                <th class="p-3 text-center">Envíos</th>
                <th class="p-3 text-center">Diagnóstico</th>
                <th class="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-base-borde-sutil">
              <tr
                v-for="st in filteredStudents"
                :key="st.studentId"
                class="hover:bg-base-bg-secundario/50 transition-colors">
                <td class="p-3 font-semibold text-base-texto-primario">
                  {{ st.fullName }}
                </td>
                <td class="p-3 font-mono text-[11px] text-base-texto-secundario">
                  {{ st.email }}
                </td>
                <td class="p-3 text-center font-mono font-bold" :class="st.avgMastery >= 60 ? 'text-semantico-pasa' : 'text-semantico-falla'">
                  {{ st.avgMastery }}%
                </td>
                <td class="p-3 text-center font-mono text-base-texto-primario">
                  {{ st.successRate }}%
                </td>
                <td class="p-3 text-center font-mono text-base-texto-secundario">
                  {{ st.submissionsCount }}
                </td>
                <td class="p-3 text-center">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="st.avgMastery < 50
                      ? 'bg-semantico-falla/15 text-semantico-falla'
                      : st.avgMastery >= 80
                        ? 'bg-semantico-pasa/15 text-semantico-pasa'
                        : 'bg-acento-ambar/15 text-acento-ambar-fuerte'">
                    {{ st.avgMastery < 50 ? 'Rezago Crítico' : st.avgMastery >= 80 ? 'Sobresaliente' : 'En Progreso' }}
                  </span>
                </td>
                <td class="p-3 text-right">
                  <NuxtLink
                    :to="`/docente/estudiante/${st.studentId}`"
                    class="borde-afordancia px-2.5 py-1 rounded text-[11px] font-semibold text-acento-ambar-fuerte hover:bg-acento-ambar/10 inline-flex items-center gap-1">
                    <span>Ver detalle</span>
                    <span>→</span>
                  </NuxtLink>
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
const { messageOf } = useApiErrorMessage()

definePageMeta({
  layout: 'teacher'
})

interface TeacherClass {
  id: number
  code: string
  name: string
}

// Contrato real de GET /analytics/class/:classId (verificado 2026-09-14 contra backend)
interface StudentRanking {
  studentId: number
  fullName: string
  email: string
  avgMastery: number
  successRate: number
  submissionsCount: number
}

interface ClassMetrics {
  totalStudents: number
  avgClassMastery: number
  avgClassSuccessRate: number
  totalSubmissions: number
}

interface ClassMetricsResponse {
  classId: number
  className: string
  classCode: string
  metrics: ClassMetrics
  studentRankings: StudentRanking[]
}

const api = useApi()
const route = useRoute()

const teacherClasses = ref<TeacherClass[]>([])
const selectedClassId = ref<number | null>(null)
const metrics = ref<ClassMetricsResponse | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const onlyAtRisk = ref(false)

const selectedClass = computed(() => {
  return teacherClasses.value.find(c => c.id === selectedClassId.value)
})

const atRiskCount = computed(() => {
  if (!metrics.value?.studentRankings) return 0
  return metrics.value.studentRankings.filter(s => s.avgMastery < 50).length
})

const filteredStudents = computed(() => {
  if (!metrics.value?.studentRankings) return []
  if (onlyAtRisk.value) {
    return metrics.value.studentRankings.filter(s => s.avgMastery < 50)
  }
  return metrics.value.studentRankings
})

async function fetchClassesAndMetrics() {
  isLoading.value = true
  errorMessage.value = null

  try {
    const clsList = await api.get<TeacherClass[]>('/class/my-classes')
    if (Array.isArray(clsList) && clsList.length > 0) {
      teacherClasses.value = clsList
      // Si viene por query param ?classId=
      const qClassId = Number(route.query.classId)
      if (qClassId && clsList.some(c => c.id === qClassId)) {
        selectedClassId.value = qClassId
      } else {
        selectedClassId.value = clsList[0].id
      }
      await loadClassMetrics()
    } else {
      teacherClasses.value = []
      isLoading.value = false
    }
  } catch (err: any) {
    errorMessage.value = messageOf(err, 'Error al cargar las clases del docente')
    isLoading.value = false
  }
}

async function loadClassMetrics() {
  if (!selectedClassId.value) return
  isLoading.value = true
  errorMessage.value = null

  try {
    const res = await api.get<ClassMetricsResponse>(`/analytics/class/${selectedClassId.value}`)
    metrics.value = res
  } catch (err: any) {
    errorMessage.value = messageOf(err, 'Error al obtener las analíticas de la clase seleccionada')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchClassesAndMetrics()
})
</script>
