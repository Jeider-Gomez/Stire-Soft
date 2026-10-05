<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <DocentePestanasClase v-if="selectedClassId" :class-id="selectedClassId" activa="estudiantes" :nombre="selectedClass?.name" :codigo="selectedClass?.code" />
    <!-- Cabecera DOC-V04 -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info uppercase tracking-wider">
            Tu grupo
          </span>
          <span v-if="selectedClass" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-acento-ambar/15 text-acento-ambar-fuerte">
            {{ selectedClass.code }}
          </span>
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          Cómo va tu grupo
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">
          Quién va bien, quién necesita ayuda y en qué lección
        </p>
      </div>

      <!-- Selector de Clase -->
      <div class="flex items-center gap-2 min-w-0">
        <label for="rendimiento-class-selector" class="text-xs font-semibold text-base-texto-secundario whitespace-nowrap">Clase:</label>
        <select
          id="rendimiento-class-selector"
          v-model="selectedClassId"
          @change="loadClassMetrics"
          class="min-w-0 max-w-full w-full sm:w-auto text-xs bg-base-blanco text-base-texto-primario border border-base-borde-fuerte rounded-md px-3 py-1.5 outline-none focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30">
          <option v-for="c in teacherClasses" :key="c.id" :value="c.id">
            {{ c.name }} ({{ c.code }})
          </option>
        </select>
      </div>
    </header>

    <!-- ESTADO 1: Cargando -->
    <div v-if="isLoading" class="p-12 text-center text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil">
      <Loader2 :size="14" class="inline-block animate-spin mr-2" aria-hidden="true" /> Calculando métricas de cohorte en tiempo real...
    </div>

    <!-- ESTADO 2: Error -->
    <div v-else-if="errorMessage" class="p-8 text-center bg-base-blanco rounded-xl border border-semantico-falla/30 text-xs space-y-3">
      <TriangleAlert :size="22" class="text-2xl" aria-hidden="true" />
      <p class="font-bold text-semantico-falla">{{ errorMessage }}</p>
      <button
        @click="loadClassMetrics"
        class="px-4 py-2 rounded-md bg-base-bg-secundario border border-base-borde-fuerte font-semibold hover:bg-base-borde-sutil transition-colors">
        Reintentar carga
      </button>
    </div>

    <!-- ESTADO 3: Vacío (Sin alumnos matriculados) -->
    <div v-else-if="metrics && (!metrics.studentRankings || metrics.studentRankings.length === 0)" class="p-12 text-center bg-base-blanco rounded-xl border border-base-borde-fuerte text-xs space-y-3">
      <Users :size="28" class="text-3xl" aria-hidden="true" />
      <h3 class="font-bold text-base-texto-primario text-sm">Sin estudiantes matriculados</h3>
      <p class="text-base-texto-secundario max-w-md mx-auto">
        Esta clase aún no cuenta con estudiantes registrados. Comparte el código
        <strong class="text-acento-ambar-fuerte font-mono">{{ selectedClass?.code }}</strong>
        para que los alumnos se vinculen y comiencen a generar analíticas.
      </p>
      <NuxtLink
        to="/docente"
        class="inline-block px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors">
        Volver a mis clases
      </NuxtLink>
    </div>

    <!-- ESTADO 4: Defecto (Con datos reales de cohorte) -->
    <div v-else-if="metrics" class="space-y-6">
      <!-- Tarjetas KPI -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- KPI 1: Dominio promedio -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-1">
          <span class="text-[11px] font-semibold text-base-texto-secundario uppercase tracking-wider block">
            Dominio promedio
          </span>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold font-mono" :class="metrics.metrics.avgClassMastery >= 60 ? 'text-semantico-pasa' : 'text-semantico-falla'">
              {{ porcentaje(metrics.metrics.avgClassMastery) }}
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

        <!-- KPI 2: Tasa de aprobación -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-1">
          <span class="text-[11px] font-semibold text-base-texto-secundario uppercase tracking-wider block">
            Tasa de aprobación
          </span>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold font-mono text-base-texto-primario">
              {{ porcentaje(metrics.metrics.avgClassSuccessRate) }}
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
            Alumnos en rezago
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
            Estudiantes en la clase
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

      <!-- Mapa de calor (paso 6): a quién ayudar ahora -->
      <DocenteMapaDeCalor :class-id="selectedClassId" />

      <!-- Lista de estudiantes con filtros -->
      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-hidden space-y-4 p-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-borde-sutil text-xs">
          <div>
            <h2 class="text-sm font-bold text-base-texto-primario">
              Estudiantes y nivel de dominio
            </h2>
            <p class="text-base-texto-secundario text-[11px]">
              Abre a un estudiante para ver su avance lección por lección
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
              <OctagonAlert :size="16" aria-hidden="true" />
              <span>{{ onlyAtRisk ? 'Ver a todos' : 'Ver solo quienes van por debajo del 50 %' }}</span>
            </button>
          </div>
        </div>

        <!-- En el celular, una tarjeta por estudiante: la tabla de 7 columnas partía los nombres en tres líneas y dejaba la
             acción fuera de la pantalla (crítica de diseño del 05/10). -->
        <ul class="md:hidden divide-y divide-base-borde-sutil" aria-label="Estudiantes">
          <li v-for="st in filteredStudents" :key="st.studentId" class="py-3 flex items-center justify-between gap-3 text-xs">
            <span class="min-w-0 space-y-1">
              <NuxtLink :to="`/docente/estudiante/${st.studentId}?clase=${selectedClassId}`" class="font-semibold text-acento-ambar-fuerte hover:underline inline-flex min-h-[44px] items-center">{{ st.fullName }}</NuxtLink>
              <span class="block text-[11px] text-base-texto-secundario">{{ porcentaje(st.successRate) }} de ejercicios aprobados · {{ st.submissionsCount }} envíos</span>
            </span>
            <span class="text-right shrink-0 space-y-1">
              <span class="block font-mono font-bold" :class="st.avgMastery >= 60 ? 'text-semantico-pasa' : 'text-semantico-falla'">{{ porcentaje(st.avgMastery) }}</span>
              <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold" :class="claseDiagnostico(st.avgMastery)">{{ textoDiagnostico(st.avgMastery) }}</span>
            </span>
          </li>
        </ul>

        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-base-bg-secundario text-slate-600 border-b border-base-borde-sutil font-semibold">
              <tr>
                <th class="p-3">Estudiante</th>
                <th class="p-3">Correo</th>
                <th class="p-3 text-center">Dominio</th>
                <th class="p-3 text-center">Ejercicios aprobados</th>
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
                  {{ porcentaje(st.avgMastery) }}
                </td>
                <td class="p-3 text-center font-mono text-base-texto-primario">
                  {{ porcentaje(st.successRate) }}
                </td>
                <td class="p-3 text-center font-mono text-base-texto-secundario">
                  {{ st.submissionsCount }}
                </td>
                <td class="p-3 text-center">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="claseDiagnostico(st.avgMastery)">
                    {{ textoDiagnostico(st.avgMastery) }}
                  </span>
                </td>
                <td class="p-3 text-right">
                  <NuxtLink
                    :to="`/docente/estudiante/${st.studentId}?clase=${selectedClassId}`"
                    class="borde-afordancia px-2.5 py-1 rounded text-[11px] font-semibold text-acento-ambar-fuerte hover:bg-acento-ambar/10 inline-flex items-center gap-1">
                    <span>Ver ficha</span><span class="sr-only"> de {{ st.fullName }}</span>
                    <ArrowRight :size="12" aria-hidden="true" />
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
/** Diagnóstico en palabras (antes «Rezago crítico»): describe qué necesita, sin etiquetar al estudiante. */
function textoDiagnostico(dominio: number): string {
  return dominio < 50 ? 'Necesita apoyo' : dominio >= 80 ? 'Va muy bien' : 'Avanzando'
}
function claseDiagnostico(dominio: number): string {
  return dominio < 50 ? 'bg-semantico-falla/15 text-semantico-falla' : dominio >= 80 ? 'bg-semantico-pasa/10 text-semantico-pasa' : 'bg-acento-ambar/15 text-acento-ambar-fuerte'
}
import { ArrowRight, Loader2, OctagonAlert, TriangleAlert, Users } from 'lucide-vue-next'
import { porcentaje } from '~/utils/porcentaje'
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
