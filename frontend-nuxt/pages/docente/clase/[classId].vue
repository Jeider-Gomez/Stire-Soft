<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6">
      <h1 class="text-xl font-bold text-base-texto-primario">Gestionar estudiantes</h1>
      <p class="text-xs text-base-texto-secundario mt-1">Aprueba solicitudes o remueve matrículas activas.</p>
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

const route = useRoute()
const api = useApi()
const pending = ref<EnrollmentItem[]>([])
const active = ref<EnrollmentItem[]>([])
const classId = Number(route.params.classId)

async function load() {
  const [pendingItems, allItems] = await Promise.all([
    api.get<EnrollmentItem[]>(`/enrollment/class/${classId}/pending`),
    api.get<EnrollmentItem[]>(`/enrollment/class/${classId}`)
  ])
  pending.value = pendingItems
  active.value = allItems.filter(item => item.status === 'active')
}

async function change(id: string, action: 'approve' | 'reject' | 'remove') {
  const method = action === 'remove' ? 'DELETE' : 'PATCH'
  await api.apiFetch(`/enrollment/${id}/${action === 'remove' ? '' : action}`, { method })
  await load()
}

onMounted(load)
</script>
