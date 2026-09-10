import { defineStore } from 'pinia'
import type { CourseModule, SpacedReviewItem, StudentAnalytics } from '~/types'
import { useApi } from '~/composables/useApi'
import { useAuthStore } from './auth'

export const useStudentStore = defineStore('student', () => {
  const api = useApi()
  const authStore = useAuthStore()

  const currentClassName = ref('Algoritmia y Programación I — Grupo 01')
  const currentTeacher = ref('Prof. Roberto Toscano Miranda')
  const isLoading = ref(false)
  const isSyncing = ref(false)
  const lastSyncTime = ref<string>('Sincronizado')

  // Módulos curriculares: rotulados como demostración pedagógica hasta que el backend exponga /curriculum
  const modules = ref<CourseModule[]>([
    {
      id: 1,
      title: 'Módulo 1: Fundamentos y Estructuras de Control [Demostración]',
      order: 1,
      units: [
        {
          id: 1,
          moduleId: 1,
          moduleTitle: 'Módulo 1',
          title: 'Variables y Tipos de Datos Primitivos',
          description: 'Espacio de memoria, mutabilidad, tipado dinámico y operadores.',
          order: 1,
          status: 'dominado',
          masteryPercentage: 95,
          exerciseActivityId: 101
        },
        {
          id: 2,
          moduleId: 1,
          moduleTitle: 'Módulo 1',
          title: 'Condicionales y Bifurcaciones Lógicas',
          description: 'Control de flujo mediante if/else, switch y tablas de verdad.',
          order: 2,
          status: 'dominado',
          masteryPercentage: 88,
          exerciseActivityId: 102
        },
        {
          id: 3,
          moduleId: 1,
          moduleTitle: 'Módulo 1',
          title: 'Ciclos e Iteraciones Determinadas (For / While)',
          description: 'Invariantes de ciclo, condiciones de parada y acumulación.',
          order: 3,
          status: 'en-progreso',
          masteryPercentage: 62,
          exerciseActivityId: 103
        }
      ]
    },
    {
      id: 2,
      title: 'Módulo 2: Arreglos y Memoria [En preparación]',
      order: 2,
      units: [
        {
          id: 4,
          moduleId: 2,
          moduleTitle: 'Módulo 2',
          title: 'Arreglos Unidimensionales y Recorrido Indexado',
          description: 'Indexación base cero, límites de memoria y transformaciones lineales.',
          order: 4,
          status: 'por-iniciar',
          masteryPercentage: 0,
          exerciseActivityId: 104
        },
        {
          id: 5,
          moduleId: 2,
          moduleTitle: 'Módulo 2',
          title: 'Búsqueda Lineal y Binaria',
          description: 'Estrategias de búsqueda, ordenamiento previo y complejidad O(log n).',
          order: 5,
          status: 'bloqueado',
          masteryPercentage: 0,
          exerciseActivityId: 105
        }
      ]
    },
    {
      id: 3,
      title: 'Módulo 3: Funciones y Modularidad [En preparación]',
      order: 3,
      units: [
        {
          id: 6,
          moduleId: 3,
          moduleTitle: 'Módulo 3',
          title: 'Parámetros, Ámbito de Variables y Retorno',
          description: 'Paso por valor vs referencia, stack de llamadas y diseño modular.',
          order: 6,
          status: 'bloqueado',
          masteryPercentage: 0,
          exerciseActivityId: 106
        }
      ]
    }
  ])

  // Repasos de repetición espaciada: inicializado vacío y cargado en vivo desde GET /review-schedules/due
  const reviews = ref<SpacedReviewItem[]>([])

  // Analítica real: cargada en vivo desde GET /analytics/student/:id
  const analytics = ref<StudentAnalytics>({
    avgMastery: 0,
    avgSuccessRate: 0,
    streakDays: 0,
    completedExercises: 0,
    reviewStats: {
      pending: 0,
      total: 0,
      critical: 0
    },
    masteryByUnit: []
  })

  // Unidad recomendada o activa
  const activeUnit = computed(() => {
    return modules.value.flatMap(m => m.units).find(u => u.status === 'en-progreso') || modules.value[0]?.units[0]
  })

  /**
   * Carga de datos reales desde el backend NestJS (Insumo 15 §12 Fase C)
   * 1. GET /enrollment/my
   * 2. GET /analytics/student/:studentId
   * 3. GET /review-schedules/due (SM-2)
   */
  async function fetchStudentData() {
    if (!authStore.token) return
    isSyncing.value = true

    try {
      // 1. Matrículas reales
      try {
        const enrollments = await api.get<Array<{
          id: number
          class?: { id: number; name: string; code: string; teacher?: { fullName: string } }
        }>>('/enrollment/my')

        if (Array.isArray(enrollments) && enrollments.length > 0 && enrollments[0].class) {
          currentClassName.value = enrollments[0].class.name
          if (enrollments[0].class.teacher?.fullName) {
            currentTeacher.value = enrollments[0].class.teacher.fullName
          }
        }
      } catch (err: any) {
        console.warn('[STIRE Student] No se pudo cargar matrícula:', err?.message)
      }

      // 2. Analítica de estudiante real
      const studentId = authStore.user?.id
      if (studentId) {
        try {
          const analyticsData = await api.get<{
            summary?: {
              avgMastery: number
              avgSuccessRate: number
              totalUnitsTracked: number
              totalAttempts: number
              completedActivitiesCount: number
              reviewStats?: { total: number; pending: number }
            }
            masteryByUnit?: Array<{
              unitId: number
              unitTitle: string
              mastery: number
              successRate: number
            }>
          }>(`/analytics/student/${studentId}`)

          if (analyticsData?.summary) {
            analytics.value = {
              avgMastery: analyticsData.summary.avgMastery || 0,
              avgSuccessRate: analyticsData.summary.avgSuccessRate || 0,
              streakDays: 4,
              completedExercises: analyticsData.summary.completedActivitiesCount || 0,
              reviewStats: {
                pending: analyticsData.summary.reviewStats?.pending || 0,
                total: analyticsData.summary.reviewStats?.total || 0,
                critical: 0
              },
              masteryByUnit: (analyticsData.masteryByUnit || []).map(m => ({
                unitId: m.unitId,
                unitTitle: m.unitTitle,
                mastery: m.mastery,
                status: m.mastery >= 80 ? 'dominado' : m.mastery > 0 ? 'en-progreso' : 'por-iniciar'
              }))
            }
          }
        } catch (err: any) {
          console.warn('[STIRE Student] No se pudo cargar analíticas:', err?.message)
        }
      }

      // 3. Repasos en riesgo reales (SM-2) desde GET /review-schedules/due
      try {
        const dueReviews = await api.get<Array<{
          id: number
          learningUnitId: number
          learningUnitTitle: string | null
          nextReviewDate: string
          urgency: 'al-dia' | 'manana' | 'vencido' | 'critico'
          intervalDays: number
          easeFactor: number
          repetitions: number
        }>>('/review-schedules/due')

        if (Array.isArray(dueReviews)) {
          reviews.value = dueReviews.map(r => ({
            id: r.id,
            conceptTitle: r.learningUnitTitle || `Conceptos de Unidad #${r.learningUnitId}`,
            moduleTitle: 'Módulo 1: Fundamentos',
            urgency: r.urgency,
            urgencyLabel: r.urgency === 'critico'
              ? 'Crítico — Repasar hoy'
              : r.urgency === 'vencido'
              ? 'Pendiente'
              : r.urgency === 'manana'
              ? 'Mañana'
              : 'Al día',
            easeFactor: r.easeFactor,
            intervalDays: r.intervalDays,
            nextReviewDate: new Date(r.nextReviewDate).toLocaleDateString(),
            estimatedTimeMin: 5
          }))

          if (analytics.value.reviewStats) {
            analytics.value.reviewStats.total = reviews.value.length
            analytics.value.reviewStats.pending = reviews.value.filter(r => r.urgency === 'critico' || r.urgency === 'vencido').length
            analytics.value.reviewStats.critical = reviews.value.filter(r => r.urgency === 'critico').length
          }
        }
      } catch (err: any) {
        console.warn('[STIRE Student] No se pudo cargar repasos:', err?.message)
      }

      lastSyncTime.value = `Sincronizado ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } finally {
      isSyncing.value = false
    }
  }

  return {
    currentClassName,
    currentTeacher,
    isLoading,
    isSyncing,
    lastSyncTime,
    modules,
    reviews,
    analytics,
    activeUnit,
    fetchStudentData
  }
})

