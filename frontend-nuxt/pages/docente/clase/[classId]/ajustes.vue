<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <DocentePestanasClase :class-id="classId" activa="ajustes" :nombre="classInfo?.name" :codigo="classInfo?.code" />

    <!-- Quién está en la clase: primero las solicitudes, porque el estudiante no ve el curso hasta que lo aceptas. -->
    <section id="solicitudes" class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-3">
      <h1 class="text-sm font-bold text-base-texto-primario">Solicitudes para entrar</h1>
      <p v-if="pending.length === 0" class="text-xs text-base-texto-secundario">No hay solicitudes pendientes.</p>
      <div v-for="enrollment in pending" :key="enrollment.id" class="flex items-center justify-between gap-3 border-b border-base-borde-sutil py-3">
        <span class="text-xs min-w-0 truncate inline-flex items-center gap-2"><AvatarUsuario :nombre="enrollment.student?.fullName" :foto-id="enrollment.student?.fotoId" decorativo /><span class="truncate">{{ enrollment.student?.fullName || enrollment.student?.email || 'Estudiante' }}</span></span>
        <div class="flex gap-2 shrink-0">
          <button class="px-3 py-1.5 rounded-md text-xs font-semibold text-semantico-exito hover:bg-semantico-exito/10" @click="change(enrollment.id, 'approve')">Aprobar</button>
          <button class="px-3 py-1.5 rounded-md text-xs font-semibold text-semantico-error hover:bg-semantico-error/10" @click="change(enrollment.id, 'reject')">Rechazar</button>
        </div>
      </div>
    </section>

    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-3">
      <h2 class="text-sm font-bold text-base-texto-primario">Estudiantes en la clase ({{ active.length }})</h2>
      <p v-if="active.length === 0" class="text-xs text-base-texto-secundario">Todavía no hay estudiantes. Comparte el código de la clase.</p>
      <div v-for="enrollment in active" :key="enrollment.id" class="flex items-center justify-between gap-3 border-b border-base-borde-sutil py-3">
        <span class="text-xs min-w-0 truncate inline-flex items-center gap-2"><AvatarUsuario :nombre="enrollment.student?.fullName" :foto-id="enrollment.student?.fotoId" decorativo /><span class="truncate">{{ enrollment.student?.fullName || enrollment.student?.email || 'Estudiante' }}</span></span>
        <button class="px-3 py-1.5 rounded-md text-xs font-semibold text-semantico-error hover:bg-semantico-error/10 shrink-0" @click="change(enrollment.id, 'remove')">Remover</button>
      </div>
    </section>

    <!-- Cómo se entra a la clase -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-4">
      <h2 class="text-sm font-bold text-base-texto-primario">Matrícula</h2>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil">
        <div>
          <p class="text-xs font-semibold text-base-texto-primario">Exigir aprobación para matricularse</p>
          <p class="text-[11px] text-base-texto-secundario mt-0.5">
            Si está activo, un estudiante que ingrese el código queda en «pendiente» hasta que lo apruebes aquí.
          </p>
        </div>
        <button
          @click="toggleRequiresApproval"
          :disabled="isSavingApproval"
          :aria-pressed="!!classInfo?.requiresApproval"
          class="px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex-shrink-0 self-start sm:self-auto inline-flex items-center gap-1"
          :class="classInfo?.requiresApproval
            ? 'bg-semantico-exito/15 text-semantico-exito'
            : 'bg-base-borde-sutil text-base-texto-secundario'"
        >
          <Check v-if="classInfo?.requiresApproval" :size="12" aria-hidden="true" />
          {{ classInfo?.requiresApproval ? 'Activado' : 'Desactivado' }}
        </button>
      </div>
    </section>

    <!-- Compartir el contenido con otros docentes (docs/DISENO_CLASES_Y_DOCENTES.md) -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-3">
      <h2 class="text-sm font-bold text-base-texto-primario">Compartir el contenido</h2>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil">
        <div>
          <p class="text-xs font-semibold text-base-texto-primario">Compartir como plantilla con otros docentes</p>
          <p class="text-[11px] text-base-texto-secundario mt-0.5">
            Otros docentes podrán copiar los módulos, explicaciones y ejercicios a sus propias clases. Reciben una copia: lo
            que cambien no toca tu clase, y tus estudiantes, entregas y notas nunca se comparten.
          </p>
        </div>
        <button
          type="button"
          :disabled="isSavingPlantilla"
          :aria-pressed="!!classInfo?.compartidaComoPlantilla"
          class="px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex-shrink-0 self-start sm:self-auto inline-flex items-center gap-1"
          :class="classInfo?.compartidaComoPlantilla ? 'bg-semantico-exito/15 text-semantico-exito' : 'bg-base-borde-sutil text-base-texto-secundario'"
          @click="alternarPlantilla"
        >
          <Check v-if="classInfo?.compartidaComoPlantilla" :size="12" aria-hidden="true" />
          {{ classInfo?.compartidaComoPlantilla ? 'Compartida' : 'No compartida' }}
        </button>
      </div>
    </section>

    <!-- Datos de la clase -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-4">
      <h2 class="text-sm font-bold text-base-texto-primario">Datos de la clase</h2>

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

      <div>
        <label for="class-code-display" class="block text-xs font-semibold text-base-texto-primario mb-1">
          Código de ingreso <span class="text-base-texto-secundario font-normal">(solo lectura)</span>
        </label>
        <div class="flex items-center gap-2">
          <input
            id="class-code-display"
            :value="classInfo?.code || ''"
            type="text"
            readonly
            class="flex-1 min-w-0 px-3 py-2 text-sm font-mono rounded-md border border-base-borde-sutil bg-base-bg-secundario text-base-texto-primario outline-none cursor-not-allowed"
          />
          <button
            id="copy-class-code-btn"
            type="button"
            @click="copyCode"
            class="px-3 py-2 rounded-md text-xs font-bold bg-base-borde-sutil hover:bg-acento-ambar/20 text-base-texto-primario transition-colors flex-shrink-0 flex items-center gap-1"
          >
            <Check v-if="codeCopied" :size="12" aria-hidden="true" />
            <span>{{ codeCopied ? 'Copiado' : 'Copiar' }}</span>
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
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
          <span v-if="saveSuccess" role="status" class="text-xs text-semantico-exito font-semibold">Cambios guardados.</span>
        </transition>
        <span v-if="saveError" role="alert" class="text-xs text-semantico-error font-semibold">{{ saveError }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'teacher' })

interface EnrollmentItem {
  id: string
  status: string
  student?: { fullName?: string; email?: string; fotoId?: string | null }
}

interface ClassInfo {
  id: number
  name: string
  code?: string
  description?: string
  requiresApproval?: boolean
  compartidaComoPlantilla?: boolean
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
  } catch (err) {
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

const isSavingPlantilla = ref(false)
async function alternarPlantilla() {
  if (!classInfo.value) return
  isSavingPlantilla.value = true
  try {
    classInfo.value = await api.apiFetch<ClassInfo>(`/class/${classId}`, {
      method: 'PATCH',
      body: { compartidaComoPlantilla: !classInfo.value.compartidaComoPlantilla }
    })
  } finally {
    isSavingPlantilla.value = false
  }
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
