<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-4">
      <div>
        <h1 class="text-xl font-bold text-base-texto-primario">{{ classInfo?.name || 'Gestionar estudiantes' }}</h1>
        <p class="text-xs text-base-texto-secundario mt-1">Aprueba solicitudes o remueve matrículas activas.</p>
      </div>

      <div class="flex items-center justify-between p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil">
        <div>
          <p class="text-xs font-semibold text-base-texto-primario">Exigir aprobación para matricularse</p>
          <p class="text-[11px] text-base-texto-secundario mt-0.5">
            Si está activo, un estudiante que ingrese el código queda en "pendiente" hasta que lo apruebes aquí.
          </p>
        </div>
        <button
          @click="toggleRequiresApproval"
          :disabled="isSavingApproval"
          class="px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex-shrink-0"
          :class="classInfo?.requiresApproval
            ? 'bg-semantico-exito/15 text-semantico-exito'
            : 'bg-base-borde-sutil text-base-texto-secundario'">
          {{ classInfo?.requiresApproval ? 'Activado ✔' : 'Desactivado' }}
        </button>
      </div>
    </header>

    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-3">
      <h2 class="text-sm font-bold">Solicitudes pendientes</h2>
      <p v-if="pending.length === 0" class="text-xs text-base-texto-secundario">No hay solicitudes pendientes.</p>
      <div v-for="enrollment in pending" :key="enrollment.id" class="flex items-center justify-between border-b border-base-borde-sutil py-3">
        <span class="text-xs">{{ enrollment.student?.fullName || enrollment.student?.email || 'Estudiante' }}</span>
        <div class="flex gap-2">
          <button class="text-xs font-semibold text-semantico-exito" @click="change(enrollment.id, 'approve')">Aprobar</button>
          <button class="text-xs font-semibold text-semantico-error" @click="change(enrollment.id, 'reject')">Rechazar</button>
        </div>
      </div>
    </section>

    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-3">
      <h2 class="text-sm font-bold">Estudiantes activos</h2>
      <div v-for="enrollment in active" :key="enrollment.id" class="flex items-center justify-between border-b border-base-borde-sutil py-3">
        <span class="text-xs">{{ enrollment.student?.fullName || enrollment.student?.email || 'Estudiante' }}</span>
        <button class="text-xs font-semibold text-semantico-error" @click="change(enrollment.id, 'remove')">Remover</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'teacher' })

interface EnrollmentItem {
  id: string
  status: string
  student?: { fullName?: string; email?: string }
}

interface ClassInfo {
  id: number
  name: string
  requiresApproval?: boolean
}

const route = useRoute()
const api = useApi()
const pending = ref<EnrollmentItem[]>([])
const active = ref<EnrollmentItem[]>([])
const classInfo = ref<ClassInfo | null>(null)
const isSavingApproval = ref(false)
const classId = Number(route.params.classId)

async function load() {
  const [pendingItems, allItems, classData] = await Promise.all([
    api.get<EnrollmentItem[]>(`/enrollment/class/${classId}/pending`),
    api.get<EnrollmentItem[]>(`/enrollment/class/${classId}`),
    api.get<ClassInfo>(`/class/${classId}`)
  ])
  pending.value = pendingItems
  active.value = allItems.filter(item => item.status === 'active')
  classInfo.value = classData
}

async function change(id: string, action: 'approve' | 'reject' | 'remove') {
  const method = action === 'remove' ? 'DELETE' : 'PATCH'
  const path = action === 'remove' ? `/enrollment/${id}` : `/enrollment/${id}/${action}`
  await api.apiFetch(path, { method })
  await load()
}

async function toggleRequiresApproval() {
  if (!classInfo.value) return
  isSavingApproval.value = true
  try {
    const updated = await api.apiFetch<ClassInfo>(`/class/${classId}`, {
      method: 'PATCH',
      body: { requiresApproval: !classInfo.value.requiresApproval }
    })
    classInfo.value = updated
  } finally {
    isSavingApproval.value = false
  }
}

onMounted(load)
</script>
