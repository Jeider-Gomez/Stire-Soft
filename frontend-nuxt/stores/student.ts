import { defineStore } from 'pinia'
import type { CourseModule, SpacedReviewItem, StudentAnalytics } from '~/types'

export const useStudentStore = defineStore('student', () => {
  const currentClassName = ref('Algoritmia y Programación I — Grupo 01')
  const currentTeacher = ref('Prof. Roberto Toscano Miranda')

  const modules = ref<CourseModule[]>([
    {
      id: 1,
      title: 'Módulo 1: Fundamentos y Estructuras de Control',
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
      title: 'Módulo 2: Arreglos y Manipulación de Memoria',
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
          title: 'Búsqueda Lineal y Búsqueda Binaria',
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
      title: 'Módulo 3: Funciones y Modularidad',
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

  const reviews = ref<SpacedReviewItem[]>([
    {
      id: 1,
      conceptTitle: 'Condición de parada en ciclos While infinitos',
      moduleTitle: 'Módulo 1: Fundamentos',
      urgency: 'critico',
      urgencyLabel: 'Crítico — Repasar hoy',
      easeFactor: 2.1,
      intervalDays: 1,
      nextReviewDate: 'Hoy',
      estimatedTimeMin: 5
    },
    {
      id: 2,
      conceptTitle: 'Precedencia de operadores lógicos (AND / OR)',
      moduleTitle: 'Módulo 1: Fundamentos',
      urgency: 'vencido',
      urgencyLabel: 'Pendiente',
      easeFactor: 2.4,
      intervalDays: 3,
      nextReviewDate: 'Ayer',
      estimatedTimeMin: 5
    },
    {
      id: 3,
      conceptTitle: 'Mutabilidad de variables y constantes const/let',
      moduleTitle: 'Módulo 1: Fundamentos',
      urgency: 'al-dia',
      urgencyLabel: 'Al día',
      easeFactor: 2.7,
      intervalDays: 7,
      nextReviewDate: 'En 4 días',
      estimatedTimeMin: 3
    }
  ])

  const analytics = ref<StudentAnalytics>({
    avgMastery: 74.2,
    avgSuccessRate: 82.5,
    streakDays: 4,
    completedExercises: 8,
    reviewStats: {
      pending: 2,
      total: 3,
      critical: 1
    },
    masteryByUnit: [
      { unitId: 1, unitTitle: 'Variables y Tipos', mastery: 95, status: 'dominado' },
      { unitId: 2, unitTitle: 'Condicionales y Lógica', mastery: 88, status: 'dominado' },
      { unitId: 3, unitTitle: 'Ciclos e Iteraciones', mastery: 62, status: 'en-progreso' },
      { unitId: 4, unitTitle: 'Arreglos Unidimensionales', mastery: 20, status: 'por-iniciar' }
    ]
  })

  // Unidad recomendada o activa
  const activeUnit = computed(() => {
    return modules.value.flatMap(m => m.units).find(u => u.status === 'en-progreso') || modules.value[0].units[0]
  })

  return {
    currentClassName,
    currentTeacher,
    modules,
    reviews,
    analytics,
    activeUnit
  }
})
