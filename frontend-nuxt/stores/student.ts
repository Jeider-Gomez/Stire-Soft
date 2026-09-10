import { defineStore } from 'pinia'
import type { CourseModule, LearningUnit, SpacedReviewItem, StudentAnalytics, UnitStatus } from '~/types'
import { useApi } from '~/composables/useApi'
import { useAuthStore } from './auth'

export interface EnrolledClassInfo {
  id: number
  classId: number
  name: string
  code: string
  description?: string
  teacherName: string
}

export const useStudentStore = defineStore('student', () => {
  const api = useApi()
  const authStore = useAuthStore()

  const currentClassId = ref<number | null>(null)
  const currentClassName = ref<string>('')
  const currentTeacher = ref<string>('')
  const enrolledClasses = ref<EnrolledClassInfo[]>([])

  const isLoading = ref(false)
  const isSyncing = ref(false)
  const lastSyncTime = ref<string>('Sincronizado')

  // Módulos curriculares cargados dinámicamente desde el backend
  const modules = ref<CourseModule[]>([])

  // Repasos de repetición espaciada: cargados en vivo desde GET /review-schedules/due (SM-2)
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
    return (
      modules.value.flatMap(m => m.units).find(u => u.status === 'en-progreso') ||
      modules.value.flatMap(m => m.units).find(u => u.status === 'por-iniciar') ||
      modules.value[0]?.units[0]
    )
  })

  /**
   * Cambia la clase activa y recarga el plan curricular
   */
  async function selectClass(classId: number, name?: string, teacher?: string) {
    currentClassId.value = classId
    if (name) currentClassName.value = name
    if (teacher) currentTeacher.value = teacher
    await fetchStudentData()
  }

  /**
   * Carga de datos reales desde el backend NestJS
   * 1. GET /enrollment/my
   * 2. GET /analytics/student/:studentId
   * 3. GET /sections/class/:classId (Árbol curricular dinámico)
   * 4. GET /review-schedules/due (SM-2)
   */
  async function fetchStudentData() {
    if (!authStore.token) return
    isSyncing.value = true

    try {
      // 1. Cargar matrículas reales del estudiante
      try {
        const enrollmentsRes = await api.get<Array<{
          id: number
          classId?: number
          class?: { id: number; name: string; code: string; description?: string; teacher?: { fullName: string } }
        }>>('/enrollment/my')

        if (Array.isArray(enrollmentsRes) && enrollmentsRes.length > 0) {
          enrolledClasses.value = enrollmentsRes
            .filter(e => e.class)
            .map(e => ({
              id: e.id,
              classId: e.class!.id,
              name: e.class!.name,
              code: e.class!.code,
              description: e.class!.description,
              teacherName: e.class!.teacher?.fullName || 'Docente'
            }))

          // Si no hay clase activa seleccionada o la actual no está en la lista, seleccionar la primera
          const currentExists = enrolledClasses.value.some(c => c.classId === currentClassId.value)
          if (!currentClassId.value || !currentExists) {
            currentClassId.value = enrolledClasses.value[0].classId
            currentClassName.value = enrolledClasses.value[0].name
            currentTeacher.value = enrolledClasses.value[0].teacherName
          } else {
            const active = enrolledClasses.value.find(c => c.classId === currentClassId.value)
            if (active) {
              currentClassName.value = active.name
              currentTeacher.value = active.teacherName
            }
          }
        } else {
          enrolledClasses.value = []
          currentClassId.value = null
          currentClassName.value = ''
          currentTeacher.value = ''
          modules.value = []
        }
      } catch (err: any) {
        console.warn('[STIRE Student] No se pudo cargar matrícula:', err?.message)
      }

      // 2. Analítica de estudiante real
      const studentId = authStore.user?.id
      const masteryMap = new Map<number, { mastery: number; status?: string }>()

      if (studentId) {
        try {
          const analyticsData = await api.get<{
            summary?: {
              avgMastery: number
              avgSuccessRate: number
              streakDays?: number
              totalUnitsTracked: number
              totalAttempts: number
              completedActivitiesCount: number
              reviewStats?: { total: number; pending: number }
            }
            masteryByUnit?: Array<{
              unitId: number
              unitTitle: string
              mastery: number
              status?: string
              successRate: number
            }>
          }>(`/analytics/student/${studentId}`)

          if (analyticsData?.summary) {
            analytics.value = {
              avgMastery: analyticsData.summary.avgMastery || 0,
              avgSuccessRate: analyticsData.summary.avgSuccessRate || 0,
              streakDays: analyticsData.summary.streakDays || 0,
              completedExercises: analyticsData.summary.completedActivitiesCount || 0,
              reviewStats: {
                pending: analyticsData.summary.reviewStats?.pending || 0,
                total: analyticsData.summary.reviewStats?.total || 0,
                critical: 0
              },
              masteryByUnit: (analyticsData.masteryByUnit || []).map(m => {
                const calculatedStatus: UnitStatus =
                  m.mastery >= 80 ? 'dominado' : m.mastery > 0 ? 'en-progreso' : 'por-iniciar'
                masteryMap.set(m.unitId, { mastery: m.mastery, status: calculatedStatus })
                return {
                  unitId: m.unitId,
                  unitTitle: m.unitTitle,
                  mastery: m.mastery,
                  status: calculatedStatus
                }
              })
            }
          }
        } catch (err: any) {
          console.warn('[STIRE Student] No se pudo cargar analíticas:', err?.message)
        }
      }

      // 3. Cargar currículo real de la clase activa desde el backend (/sections/class/:classId)
      if (currentClassId.value) {
        try {
          const sections = await api.get<Array<{
            id: number
            title: string
            description?: string
            order: number
            isPublished: boolean
            topics?: Array<{
              id: number
              title: string
              description?: string
              order: number
              learningUnits?: Array<{
                id: number
                title: string
                description?: string
                order: number
                difficulty: string
                activities?: Array<{
                  id: number
                  title: string
                  adaptiveWeight?: number
                  totalPoints?: number
                  activityType?: { code: string; name?: string }
                }>
              }>
            }>
          }>>(`/sections/class/${currentClassId.value}`)

          if (Array.isArray(sections) && sections.length > 0) {
            modules.value = sections.map((sec, secIdx) => {
              const allUnits: LearningUnit[] = []

              if (Array.isArray(sec.topics)) {
                for (const top of sec.topics) {
                  if (Array.isArray(top.learningUnits)) {
                    for (const u of top.learningUnits) {
                      const tracked = masteryMap.get(u.id)
                      const mastery = tracked ? tracked.mastery : 0

                      let status: UnitStatus = 'por-iniciar'
                      if (mastery >= 80) {
                        status = 'dominado'
                      } else if (mastery > 0) {
                        status = 'en-progreso'
                      } else if (allUnits.length === 0 && secIdx === 0) {
                        status = 'por-iniciar'
                      }

                      // Encontrar la primera actividad de código para el botón rápido de ejercicio, o la primera actividad disponible
                      const codingAct = (u.activities || []).find(a =>
                        (a.activityType?.code || '').toLowerCase().includes('code') ||
                        a.title.toLowerCase().includes('código') ||
                        a.title.toLowerCase().includes('desafío')
                      ) || (u.activities || [])[0]

                      allUnits.push({
                        id: u.id,
                        moduleId: sec.id,
                        moduleTitle: sec.title,
                        title: u.title,
                        description: u.description || '',
                        order: u.order,
                        status,
                        masteryPercentage: Math.round(mastery),
                        exerciseActivityId: codingAct?.id,
                        activities: u.activities || []
                      })
                    }
                  }
                }
              }

              return {
                id: sec.id,
                title: sec.title,
                order: sec.order,
                units: allUnits
              }
            })
          }
        } catch (err: any) {
          console.warn('[STIRE Student] No se pudo cargar secciones/currículo:', err?.message)
        }
      }

      // 4. Repasos en riesgo reales (SM-2) desde GET /review-schedules/due
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
            moduleTitle: currentClassName.value || 'Asignatura Actual',
            urgency: r.urgency,
            urgencyLabel:
              r.urgency === 'critico'
                ? 'Crítico — Repasar hoy'
                : r.urgency === 'vencido'
                ? 'Pendiente hoy'
                : r.urgency === 'manana'
                ? 'Mañana'
                : 'Al día',
            easeFactor: r.easeFactor,
            intervalDays: r.intervalDays,
            nextReviewDate: new Date(r.nextReviewDate).toLocaleDateString('es-CO'),
            estimatedTimeMin: 5
          }))

          if (analytics.value.reviewStats) {
            analytics.value.reviewStats.total = reviews.value.length
            analytics.value.reviewStats.pending = reviews.value.filter(
              r => r.urgency === 'critico' || r.urgency === 'vencido'
            ).length
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
    currentClassId,
    currentClassName,
    currentTeacher,
    enrolledClasses,
    isLoading,
    isSyncing,
    lastSyncTime,
    modules,
    reviews,
    analytics,
    activeUnit,
    selectClass,
    fetchStudentData
  }
})
