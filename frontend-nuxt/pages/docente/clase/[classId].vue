<template>
  <div class="max-w-4xl mx-auto space-y-6">

    <!-- Tarjeta: Datos de la clase -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-4">
      <h2 class="text-sm font-bold text-base-texto-primario">Datos de la clase</h2>

      <!-- Nombre -->
      <div>
        <label for="class-name" class="block text-xs font-semibold text-base-texto-primario mb-1">
          Nombre <span class="text-semantico-error">*</span>
        </label>
        <input
          id="class-name"
          v-model="editForm.name"
          type="text"
          maxlength="120"
          placeholder="Nombre de la clase"
          class="w-full px-3 py-2 text-sm rounded-md border border-base-borde-sutil bg-base-blanco focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30 outline-none transition-colors"
        />
      </div>

      <!-- Descripción -->
      <div>
        <label for="class-description" class="block text-xs font-semibold text-base-texto-primario mb-1">
          Descripción <span class="text-base-texto-secundario font-normal">(opcional)</span>
        </label>
        <textarea
          id="class-description"
          v-model="editForm.description"
          rows="3"
          placeholder="Breve descripción de la clase..."
          class="w-full px-3 py-2 text-sm rounded-md border border-base-borde-sutil bg-base-blanco focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30 outline-none transition-colors resize-none"
        />
      </div>

      <!-- Código de ingreso (solo lectura) -->
      <div>
        <label class="block text-xs font-semibold text-base-texto-primario mb-1">
          Código de ingreso <span class="text-base-texto-secundario font-normal">(solo lectura)</span>
        </label>
        <div class="flex items-center gap-2">
          <input
            id="class-code-display"
            :value="classInfo?.code || ''"
            type="text"
            readonly
            class="flex-1 px-3 py-2 text-sm font-mono rounded-md border border-base-borde-sutil bg-base-bg-secundario text-base-texto-primario outline-none cursor-not-allowed"
          />
          <button
            id="copy-class-code-btn"
            type="button"
            @click="copyCode"
            class="px-3 py-2 rounded-md text-xs font-bold bg-base-borde-sutil hover:bg-acento-ambar/20 text-base-texto-primario transition-colors flex-shrink-0 flex items-center gap-1"
          >
            <span>{{ codeCopied ? '✔ Copiado' : 'Copiar' }}</span>
          </button>
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex items-center gap-3">
        <button
          id="save-class-data-btn"
          type="button"
          :disabled="!hasChanges || isSavingData"
          @click="saveData"
          class="px-4 py-2 rounded-md text-xs font-bold bg-acento-ambar text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-acento-ambar-fuerte"
        >
          {{ isSavingData ? 'Guardando...' : 'Guardar cambios' }}
        </button>
        <transition name="fade">
          <span v-if="saveSuccess" class="text-xs text-semantico-exito font-semibold">✔ Cambios guardados.</span>
        </transition>
        <span v-if="saveError" class="text-xs text-semantico-error font-semibold">{{ saveError }}</span>
      </div>
    </section>

    <!-- Tarjeta: Configuración de matrícula -->
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
            : 'bg-base-borde-sutil text-base-texto-secundario'"
        >
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
  code?: string
  description?: string
  requiresApproval?: boolean
}

const route = useRoute()
const api = useApi()
const { messageOf } = useApiErrorMessage()
const pending = ref<EnrollmentItem[]>([])
const active = ref<EnrollmentItem[]>([])
const classInfo = ref<ClassInfo | null>(null)
const isSavingApproval = ref(false)
const classId = Number(route.params.classId)

// Datos editables del formulario
const editForm = reactive({
  name: '',
  description: ''
})

// Estado guardado (para comparar cambios)
const savedData = reactive({
  name: '',
  description: ''
})

const isSavingData = ref(false)
const saveSuccess = ref(false)
const saveError = ref<string | null>(null)
const codeCopied = ref(false)

const hasChanges = computed(() => {
  return editForm.name.trim() !== savedData.name || editForm.description !== savedData.description
})

async function load() {
  const [pendingItems, allItems, classData] = await Promise.all([
    api.get<EnrollmentItem[]>(`/enrollment/class/${classId}/pending`),
    api.get<EnrollmentItem[]>(`/enrollment/class/${classId}`),
    api.get<ClassInfo>(`/class/${classId}`)
  ])
  pending.value = pendingItems
  active.value = allItems.filter(item => item.status === 'active')
  classInfo.value = classData

  // Inicializar formulario con los datos actuales
  editForm.name = classData?.name || ''
  editForm.description = classData?.description || ''
  savedData.name = editForm.name
  savedData.description = editForm.description
}

async function saveData() {
  if (!hasChanges.value) return
  if (!editForm.name.trim()) {
    saveError.value = 'El nombre de la clase no puede estar vacío.'
    return
  }

  isSavingData.value = true
  saveSuccess.value = false
  saveError.value = null

  try {
    // Solo enviar los campos que cambiaron (PATCH parcial)
    const body: Record<string, string> = {}
    if (editForm.name.trim() !== savedData.name) {
      body.name = editForm.name.trim()
    }
    if (editForm.description !== savedData.description) {
      body.description = editForm.description
    }

    const updated = await api.apiFetch<ClassInfo>(`/class/${classId}`, {
      method: 'PATCH',
      body
    })

    classInfo.value = updated
    savedData.name = updated.name
    savedData.description = updated.description || ''
    editForm.name = updated.name
    editForm.description = updated.description || ''

    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err: any) {
    saveError.value = messageOf(err, 'Error al guardar los cambios.')
  } finally {
    isSavingData.value = false
  }
}

async function copyCode() {
  if (!classInfo.value?.code) return
  try {
    await navigator.clipboard.writeText(classInfo.value.code)
    codeCopied.value = true
    setTimeout(() => { codeCopied.value = false }, 2000)
  } catch {
    // fallback
    const el = document.getElementById('class-code-display') as HTMLInputElement | null
    el?.select()
    document.execCommand('copy')
    codeCopied.value = true
    setTimeout(() => { codeCopied.value = false }, 2000)
  }
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

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
