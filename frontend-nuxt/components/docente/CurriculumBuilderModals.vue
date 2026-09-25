<template>
  <div>
    <!-- MODAL: Crear Módulo / Sección -->
    <Teleport to="body">
      <div
        v-if="moduleModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-new-module-title"
        @keydown.esc="closeModuleModal"
        @click.self="closeModuleModal">
        <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
        <div class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-md p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 id="modal-new-module-title" class="text-sm font-bold text-base-texto-primario">
              Nuevo Módulo Curricular
            </h2>
            <button
              @click="closeModuleModal"
              class="text-base-texto-secundario hover:text-base-texto-primario transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte rounded"
              aria-label="Cerrar modal">
              ✕
            </button>
          </div>

          <form @submit.prevent="submitCreateModule" class="space-y-4 text-xs">
            <div>
              <label for="module-title-input" class="block font-semibold text-base-texto-primario mb-1">
                Título del módulo *
              </label>
              <input
                id="module-title-input"
                ref="moduleTitleRef"
                v-model="moduleModal.form.title"
                type="text"
                required
                placeholder="Ej. Módulo 1: Fundamentos de Programación"
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario" />
            </div>

            <div>
              <label for="module-desc-input" class="block font-semibold text-base-texto-primario mb-1">
                Descripción (opcional)
              </label>
              <textarea
                id="module-desc-input"
                v-model="moduleModal.form.description"
                rows="3"
                placeholder="Breve resumen de las competencias que cubre este módulo..."
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 resize-y text-base-texto-primario"></textarea>
            </div>

            <div class="p-3 bg-base-bg-secundario rounded-md border border-base-borde-sutil text-[11px] text-base-texto-secundario">
              ℹ El módulo se creará como <strong class="text-base-texto-primario">Borrador</strong>. Los estudiantes no lo verán hasta que lo publiques.
            </div>

            <p v-if="moduleModal.error" role="alert" class="text-semantico-falla text-[11px]">
              {{ moduleModal.error }}
            </p>

            <div class="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                @click="closeModuleModal"
                class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-base-borde-fuerte">
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="moduleModal.saving"
                class="px-5 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
                <span v-if="moduleModal.saving" class="animate-spin">⚙️</span>
                <span>{{ moduleModal.saving ? 'Creando…' : '✔ Crear módulo' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- MODAL: Crear Tema -->
    <Teleport to="body">
      <div
        v-if="topicModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-new-topic-title"
        @keydown.esc="closeTopicModal"
        @click.self="closeTopicModal">
        <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
        <div class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-md p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 id="modal-new-topic-title" class="text-sm font-bold text-base-texto-primario">
              Nuevo Tema Curricular
            </h2>
            <button
              @click="closeTopicModal"
              class="text-base-texto-secundario hover:text-base-texto-primario transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte rounded"
              aria-label="Cerrar modal">
              ✕
            </button>
          </div>

          <form @submit.prevent="submitCreateTopic" class="space-y-4 text-xs">
            <div>
              <label for="topic-title-input" class="block font-semibold text-base-texto-primario mb-1">
                Título del tema *
              </label>
              <input
                id="topic-title-input"
                ref="topicTitleRef"
                v-model="topicModal.form.title"
                type="text"
                required
                placeholder="Ej. Variables, Tipos y Operadores"
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario" />
            </div>

            <div>
              <label for="topic-desc-input" class="block font-semibold text-base-texto-primario mb-1">
                Descripción (opcional)
              </label>
              <textarea
                id="topic-desc-input"
                v-model="topicModal.form.description"
                rows="3"
                placeholder="Descripción del tema temático..."
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 resize-y text-base-texto-primario"></textarea>
            </div>

            <p v-if="topicModal.error" role="alert" class="text-semantico-falla text-[11px]">
              {{ topicModal.error }}
            </p>

            <div class="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                @click="closeTopicModal"
                class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-base-borde-fuerte">
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="topicModal.saving"
                class="px-5 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
                <span v-if="topicModal.saving" class="animate-spin">⚙️</span>
                <span>{{ topicModal.saving ? 'Creando…' : '✔ Crear tema' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- MODAL: Crear Unidad -->
    <Teleport to="body">
      <div
        v-if="unitModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-new-unit-title"
        @keydown.esc="closeUnitModal"
        @click.self="closeUnitModal">
        <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
        <div class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-md p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 id="modal-new-unit-title" class="text-sm font-bold text-base-texto-primario">
              Nueva Unidad Didáctica
            </h2>
            <button
              @click="closeUnitModal"
              class="text-base-texto-secundario hover:text-base-texto-primario transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte rounded"
              aria-label="Cerrar modal">
              ✕
            </button>
          </div>

          <form @submit.prevent="submitCreateUnit" class="space-y-4 text-xs">
            <div>
              <label for="unit-new-title-input" class="block font-semibold text-base-texto-primario mb-1">
                Título de la unidad *
              </label>
              <input
                id="unit-new-title-input"
                ref="unitTitleRef"
                v-model="unitModal.form.title"
                type="text"
                required
                placeholder="Ej. Declaración de variables let y const"
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario" />
            </div>

            <div>
              <label for="unit-new-desc-input" class="block font-semibold text-base-texto-primario mb-1">
                Descripción (opcional)
              </label>
              <textarea
                id="unit-new-desc-input"
                v-model="unitModal.form.description"
                rows="3"
                placeholder="Objetivo o descripción de la unidad..."
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 resize-y text-base-texto-primario"></textarea>
            </div>

            <div>
              <label for="unit-new-difficulty-select" class="block font-semibold text-base-texto-primario mb-1">
                Nivel de dificultad
              </label>
              <select
                id="unit-new-difficulty-select"
                v-model="unitModal.form.difficulty"
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario">
                <option value="basico">Básico</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>

            <p v-if="unitModal.error" role="alert" class="text-semantico-falla text-[11px]">
              {{ unitModal.error }}
            </p>

            <div class="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                @click="closeUnitModal"
                class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-base-borde-fuerte">
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="unitModal.saving"
                class="px-5 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
                <span v-if="unitModal.saving" class="animate-spin">⚙️</span>
                <span>{{ unitModal.saving ? 'Creando…' : '✔ Crear unidad' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'

const emit = defineEmits<{
  (e: 'section-created', section: any): void
  (e: 'topic-created', payload: { sectionId: number; topic: any }): void
  (e: 'unit-created', payload: { sectionId: number; topicId: number; unit: any }): void
  (e: 'feedback', message: string): void
}>()

const api = useApi()
const { messageOf } = useApiErrorMessage()

// Autofocus refs
const moduleTitleRef = ref<HTMLInputElement | null>(null)
const topicTitleRef = ref<HTMLInputElement | null>(null)
const unitTitleRef = ref<HTMLInputElement | null>(null)

// ─── Modal Módulo ─────────────────────────────────────────────────────────────
const moduleModal = reactive({
  open: false,
  classId: 0,
  order: 0,
  form: { title: '', description: '' },
  saving: false,
  error: null as string | null
})

function openCreateModule(classId: number, maxExistingOrder: number) {
  moduleModal.classId = classId
  moduleModal.order = maxExistingOrder + 1
  moduleModal.form.title = ''
  moduleModal.form.description = ''
  moduleModal.error = null
  moduleModal.open = true
  nextTick(() => moduleTitleRef.value?.focus())
}

function closeModuleModal() {
  moduleModal.open = false
}

async function submitCreateModule() {
  if (!moduleModal.form.title.trim()) {
    moduleModal.error = 'El título del módulo es obligatorio.'
    return
  }
  moduleModal.saving = true
  moduleModal.error = null
  try {
    const res = await api.post<any>('/sections', {
      classId: moduleModal.classId,
      title: moduleModal.form.title.trim(),
      description: moduleModal.form.description.trim() || undefined,
      order: moduleModal.order
    })
    emit('section-created', res)
    emit('feedback', `Módulo "${moduleModal.form.title.trim()}" creado correctamente.`)
    closeModuleModal()
  } catch (err: any) {
    moduleModal.error = messageOf(err, 'Error al crear el módulo.')
  } finally {
    moduleModal.saving = false
  }
}

// ─── Modal Tema ───────────────────────────────────────────────────────────────
const topicModal = reactive({
  open: false,
  sectionId: 0,
  order: 0,
  form: { title: '', description: '' },
  saving: false,
  error: null as string | null
})

function openCreateTopic(sectionId: number, maxExistingOrder: number) {
  topicModal.sectionId = sectionId
  topicModal.order = maxExistingOrder + 1
  topicModal.form.title = ''
  topicModal.form.description = ''
  topicModal.error = null
  topicModal.open = true
  nextTick(() => topicTitleRef.value?.focus())
}

function closeTopicModal() {
  topicModal.open = false
}

async function submitCreateTopic() {
  if (!topicModal.form.title.trim()) {
    topicModal.error = 'El título del tema es obligatorio.'
    return
  }
  topicModal.saving = true
  topicModal.error = null
  try {
    const res = await api.post<any>('/topic', {
      sectionId: topicModal.sectionId,
      title: topicModal.form.title.trim(),
      description: topicModal.form.description.trim() || undefined,
      order: topicModal.order
    })
    emit('topic-created', { sectionId: topicModal.sectionId, topic: res })
    emit('feedback', `Tema "${topicModal.form.title.trim()}" creado correctamente.`)
    closeTopicModal()
  } catch (err: any) {
    topicModal.error = messageOf(err, 'Error al crear el tema.')
  } finally {
    topicModal.saving = false
  }
}

// ─── Modal Unidad ─────────────────────────────────────────────────────────────
const unitModal = reactive({
  open: false,
  sectionId: 0,
  topicId: 0,
  order: 0,
  form: { title: '', description: '', difficulty: 'basico' },
  saving: false,
  error: null as string | null
})

function openCreateUnit(sectionId: number, topicId: number, maxExistingOrder: number) {
  unitModal.sectionId = sectionId
  unitModal.topicId = topicId
  unitModal.order = maxExistingOrder + 1
  unitModal.form.title = ''
  unitModal.form.description = ''
  unitModal.form.difficulty = 'basico'
  unitModal.error = null
  unitModal.open = true
  nextTick(() => unitTitleRef.value?.focus())
}

function closeUnitModal() {
  unitModal.open = false
}

async function submitCreateUnit() {
  if (!unitModal.form.title.trim()) {
    unitModal.error = 'El título de la unidad es obligatorio.'
    return
  }
  unitModal.saving = true
  unitModal.error = null
  try {
    const res = await api.post<any>('/learning-unit', {
      topicId: unitModal.topicId,
      title: unitModal.form.title.trim(),
      description: unitModal.form.description.trim() || undefined,
      difficulty: unitModal.form.difficulty,
      order: unitModal.order
    })
    emit('unit-created', {
      sectionId: unitModal.sectionId,
      topicId: unitModal.topicId,
      unit: res
    })
    emit('feedback', `Unidad "${unitModal.form.title.trim()}" creada correctamente.`)
    closeUnitModal()
  } catch (err: any) {
    unitModal.error = messageOf(err, 'Error al crear la unidad.')
  } finally {
    unitModal.saving = false
  }
}

defineExpose({
  openCreateModule,
  openCreateTopic,
  openCreateUnit
})

// Escape cierra el diálogo abierto aunque el foco se haya perdido.
useEscapeToClose(() => moduleModal.open, closeModuleModal)
useEscapeToClose(() => topicModal.open, closeTopicModal)
useEscapeToClose(() => unitModal.open, closeUnitModal)
</script>
