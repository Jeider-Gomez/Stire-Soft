<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Encabezado de Gestión de Clases -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-acento-ambar/15 text-acento-ambar-fuerte uppercase tracking-wider">
            Portal Estudiantil • Mis Clases
          </span>
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          Mis Clases y Grupos Académicos
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">
          Gestiona las asignaturas en las que estás matriculado o ingresa el código de una nueva clase
        </p>
      </div>

      <!-- Tarjeta rápida de inscripción -->
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/estudiante"
          class="px-3.5 py-1.5 rounded-md border border-base-borde-fuerte text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario transition-colors">
          ← Volver al Dashboard
        </NuxtLink>
      </div>
    </header>

    <!-- Formulario para Unirse a Nueva Clase -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-5 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-sm font-bold text-base-texto-primario flex items-center gap-2">
            <span>🔑</span> ¿Tienes un código de clase?
          </h2>
          <p class="text-xs text-base-texto-secundario mt-0.5">
            Ingresa el código proporcionado por tu docente (ej. ALGO-WEB-T01) para inscribirte al curso
          </p>
        </div>

        <form @submit.prevent="handleJoinClass" class="flex items-center gap-2 w-full sm:w-auto">
          <input
            v-model="joinCode"
            type="text"
            required
            placeholder="CÓDIGO DE CLASE"
            class="px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none w-full sm:w-52" />
          <button
            type="submit"
            :disabled="isJoining || !joinCode.trim()"
            class="px-4 py-1.5 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs transition-colors shadow-sm disabled:opacity-50 whitespace-nowrap">
            <span v-if="isJoining">Inscribiendo...</span>
            <span v-else>Unirse</span>
          </button>
        </form>
      </div>

      <!-- Alerta de éxito o error -->
      <div v-if="feedbackMessage" class="mt-4 p-3 rounded-md text-xs flex items-center gap-2" :class="feedbackIsError ? 'bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla' : 'bg-semantico-pasa/10 border border-semantico-pasa/30 text-semantico-pasa'">
        <span>{{ feedbackIsError ? '⚠' : '✔' }}</span>
        <span>{{ feedbackMessage }}</span>
      </div>
    </section>

    <!-- Lista de Clases Matriculadas -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-base-texto-primario flex items-center gap-2">
          <span>📚</span> Clases Matriculadas ({{ enrolledClasses.length }})
        </h2>
        <button
          @click="fetchEnrollments"
          :disabled="isLoading"
          class="text-xs text-acento-ambar-fuerte hover:underline font-semibold flex items-center gap-1">
          <span>↻</span> Actualizar lista
        </button>
      </div>

      <div v-if="isLoading" class="p-12 text-center text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil">
        <span class="inline-block animate-spin mr-2">⏳</span> Cargando tus asignaturas matriculadas...
      </div>

      <div v-else-if="enrolledClasses.length === 0" class="p-12 text-center bg-base-blanco rounded-xl border border-base-borde-fuerte text-xs space-y-3">
        <div class="text-3xl">🎓</div>
        <h3 class="font-bold text-sm text-base-texto-primario">Aún no estás matriculado en ninguna clase</h3>
        <p class="text-base-texto-secundario max-w-md mx-auto">
          Solicita el código de clase a tu docente de la Universidad de Córdoba o ingresa el código de demostración en el formulario superior para comenzar tu aprendizaje adaptativo.
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="item in enrolledClasses"
          :key="item.id"
          class="bg-base-blanco rounded-xl border p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
          :class="isActiveClass(item.class?.id) ? 'border-acento-ambar ring-1 ring-acento-ambar' : 'border-base-borde-fuerte'">
          <div>
            <div class="flex items-start justify-between gap-2 mb-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-base-bg-secundario border border-base-borde-fuerte text-base-texto-primario">
                {{ item.class?.code || 'SIN CÓDIGO' }}
              </span>
              <span v-if="isActiveClass(item.class?.id)" class="px-2 py-0.5 rounded text-[10px] font-bold bg-semantico-pasa/15 text-semantico-pasa flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-semantico-pasa"></span> Activa ahora
              </span>
            </div>

            <h3 class="font-bold text-sm text-base-texto-primario tracking-tight line-clamp-2 mb-1">
              {{ item.class?.name || 'Clase sin título' }}
            </h3>

            <p class="text-xs text-base-texto-secundario line-clamp-2 mb-3">
              {{ item.class?.description || 'Sin descripción disponible para esta asignatura.' }}
            </p>

            <div class="text-xs text-base-texto-secundario flex items-center gap-1.5 mb-4">
              <span>👨‍🏫</span>
              <span class="font-medium text-base-texto-primario">
                {{ item.class?.teacher?.fullName || 'Docente asignado' }}
              </span>
            </div>
          </div>

          <div class="pt-3 border-t border-base-borde-sutil flex items-center justify-between gap-2">
            <span class="text-[11px] text-base-texto-secundario">
              Inscrito el {{ formatDate(item.createdAt || item.enrolledAt) }}
            </span>

            <button
              @click="selectActiveClass(item)"
              class="px-3.5 py-1.5 rounded-md font-bold text-xs transition-colors"
              :class="isActiveClass(item.class?.id) ? 'bg-base-bg-secundario text-base-texto-primario hover:bg-base-borde-fuerte' : 'bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco shadow-sm'">
              {{ isActiveClass(item.class?.id) ? 'Ver Contenido' : 'Cambiar a esta clase' }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'
import { useStudentStore } from '~/stores/student'

definePageMeta({
  layout: 'default'
})

interface EnrollmentItem {
  id: number
  classId: number
  status: string
  createdAt?: string
  enrolledAt?: string
  class?: {
    id: number
    name: string
    code: string
    description?: string
    teacher?: {
      fullName: string
    }
  }
}

const api = useApi()
const studentStore = useStudentStore()

const enrolledClasses = ref<EnrollmentItem[]>([])
const isLoading = ref(false)
const joinCode = ref('')
const isJoining = ref(false)
const feedbackMessage = ref('')
const feedbackIsError = ref(false)

async function fetchEnrollments() {
  isLoading.value = true
  try {
    const res = await api.get<EnrollmentItem[]>('/enrollment/my')
    if (Array.isArray(res)) {
      enrolledClasses.value = res
    }
  } catch (err: any) {
    console.error('[STIRE] Error al listar matrículas:', err)
  } finally {
    isLoading.value = false
  }
}

async function handleJoinClass() {
  if (!joinCode.value.trim()) return

  isJoining.value = true
  feedbackMessage.value = ''
  feedbackIsError.value = false

  try {
    const res = await api.post<any>('/enrollment/join', {
      code: joinCode.value.trim().toUpperCase()
    })

    feedbackMessage.value = '¡Te has matriculado exitosamente en la clase!'
    feedbackIsError.value = false
    joinCode.value = ''
    
    // Recargar matrículas y actualizar store
    await fetchEnrollments()
    await studentStore.fetchStudentData()
  } catch (err: any) {
    const status = err?.response?.status || err?.statusCode
    const msg = err?.data?.message || err?.message

    feedbackIsError.value = true
    if (status === 409) {
      feedbackMessage.value = 'Ya estás matriculado en esta clase.'
    } else if (status === 404) {
      feedbackMessage.value = 'Código de clase inválido o no encontrado. Verifica con tu docente.'
    } else {
      feedbackMessage.value = typeof msg === 'string' ? msg : 'No fue posible unirse a la clase.'
    }
  } finally {
    isJoining.value = false
  }
}

function isActiveClass(classId?: number): boolean {
  if (!classId) return false
  return studentStore.currentClassId === classId
}

function selectActiveClass(item: EnrollmentItem) {
  if (item.class) {
    studentStore.selectClass(item.class.id, item.class.name, item.class.teacher?.fullName)
    navigateTo('/estudiante')
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'fecha reciente'
  try {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

onMounted(() => {
  fetchEnrollments()
})
</script>
