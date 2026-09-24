<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-lessons-title"
      @keydown.esc="handleClose"
      @click.self="handleClose">
      <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>

      <div class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <!-- Encabezado del diálogo -->
        <header class="p-5 border-b border-base-borde-sutil flex items-center justify-between gap-4 bg-base-bg-secundario">
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-acento-ambar/15 text-acento-ambar-fuerte uppercase tracking-wider">
                Lecciones Teóricas
              </span>
              <span v-if="unit" class="text-xs font-semibold text-base-texto-secundario">
                Unidad {{ unit.id }}
              </span>
            </div>
            <h2 id="modal-lessons-title" class="text-sm font-bold text-base-texto-primario">
              {{ unit?.title }}
            </h2>
          </div>

          <button
            @click="handleClose"
            class="text-base-texto-secundario hover:text-base-texto-primario transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte rounded p-1"
            aria-label="Cerrar panel de lecciones">
            ✕
          </button>
        </header>

        <!-- Mensajes de feedback / error -->
        <div v-if="feedbackMsg" role="status" class="mx-5 mt-4 p-2.5 bg-semantico-pasa/10 border border-semantico-pasa/40 text-semantico-pasa rounded-lg text-xs flex items-center justify-between">
          <span>✔ {{ feedbackMsg }}</span>
          <button @click="feedbackMsg = null" class="text-[11px] underline">Cerrar</button>
        </div>
        <div v-if="errorMsg" role="alert" class="mx-5 mt-4 p-2.5 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded-lg text-xs flex items-center justify-between">
          <span>✖ {{ errorMsg }}</span>
          <button @click="errorMsg = null" class="text-[11px] underline">Cerrar</button>
        </div>

        <!-- Contenido principal con scroll -->
        <div class="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          <!-- VISTA 1: Lista de Lecciones -->
          <div v-if="!showForm" class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-base-texto-secundario">
                Bloques de lectura (tipo Markdown)
              </span>
              <button
                @click="openCreateForm"
                class="px-3 py-1.5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
                <span>+</span>
                <span>Nueva lección</span>
              </button>
            </div>

            <!-- Cargando -->
            <div v-if="isLoading" class="p-8 text-center text-xs text-base-texto-secundario">
              <span class="inline-block animate-spin mr-2">⏳</span> Cargando lecciones...
            </div>

            <!-- Sin lecciones -->
            <div v-else-if="lessons.length === 0" class="p-8 text-center bg-base-bg-secundario rounded-xl border border-base-borde-sutil space-y-2">
              <span class="text-2xl">📝</span>
              <p class="font-semibold text-base-texto-primario">Sin lecciones teóricas aún</p>
              <p class="text-base-texto-secundario max-w-sm mx-auto text-[11px]">
                Esta unidad no tiene material de lectura. Agrega lecciones en Markdown para que los estudiantes aprendan los conceptos.
              </p>
            </div>

            <!-- Lista de lecciones ordenadas -->
            <div v-else class="space-y-2">
              <div
                v-for="(item, idx) in sortedLessons"
                :key="item.id"
                class="p-3 rounded-lg border border-base-borde-sutil bg-base-blanco flex items-start justify-between gap-3 hover:border-base-borde-fuerte transition-colors">
                <div class="flex-1 min-w-0 space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded bg-base-bg-secundario font-mono text-[10px] font-bold text-base-texto-secundario flex items-center justify-center">
                      {{ item.order ?? (idx + 1) }}
                    </span>
                    <h3 class="font-bold text-base-texto-primario truncate">
                      {{ item.title }}
                    </h3>
                    <span
                      class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      :class="item.isVisible !== false ? 'bg-semantico-pasa/15 text-semantico-pasa' : 'bg-base-texto-secundario/20 text-base-texto-secundario'">
                      {{ item.isVisible !== false ? 'Visible' : 'Oculta' }}
                    </span>
                  </div>

                  <p v-if="item.body" class="text-base-texto-secundario text-[11px] line-clamp-2 font-mono bg-base-bg-secundario p-1.5 rounded">
                    {{ item.body }}
                  </p>
                </div>

                <div class="flex items-center gap-1.5 shrink-0 pt-0.5">
                  <!-- Reordenar subir/bajar -->
                  <div class="flex items-center gap-1">
                    <button
                      :disabled="idx === 0 || isReordering"
                      @click="moveLesson(idx, -1)"
                      title="Subir lección"
                      class="p-1 rounded text-xs text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      aria-label="Subir lección">
                      ▲
                    </button>
                    <button
                      :disabled="idx === sortedLessons.length - 1 || isReordering"
                      @click="moveLesson(idx, 1)"
                      title="Bajar lección"
                      class="p-1 rounded text-xs text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      aria-label="Bajar lección">
                      ▼
                    </button>
                  </div>

                  <!-- Alternar visibilidad -->
                  <button
                    :disabled="togglingId === item.id"
                    @click="toggleLessonVisibility(item)"
                    class="px-2 py-1 rounded text-[11px] font-semibold border border-base-borde-fuerte bg-base-blanco text-base-texto-primario hover:bg-base-bg-secundario transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                    :title="item.isVisible !== false ? 'Ocultar lección' : 'Mostrar lección'">
                    {{ item.isVisible !== false ? '👁 Ocultar' : '👁‍🗨 Mostrar' }}
                  </button>

                  <!-- Editar -->
                  <button
                    @click="openEditForm(item)"
                    class="px-2 py-1 rounded text-[11px] font-semibold border border-base-borde-fuerte bg-base-blanco text-base-texto-primario hover:bg-acento-ambar/10 hover:border-acento-ambar-fuerte transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
                    ✏ Editar
                  </button>

                  <!-- Borrar -->
                  <button
                    @click="confirmDelete(item)"
                    class="px-2 py-1 rounded text-[11px] font-semibold border border-semantico-falla/30 text-semantico-falla hover:bg-semantico-falla/10 transition-colors focus:outline-none focus:ring-2 focus:ring-semantico-falla">
                    🗑
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- VISTA 2: Formulario Crear / Editar Lección -->
          <form v-else @submit.prevent="submitLessonForm" class="space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-base-borde-sutil">
              <h3 class="font-bold text-base-texto-primario">
                {{ formState.isEditing ? 'Editar Lección' : 'Nueva Lección' }}
              </h3>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="previewActive = !previewActive"
                  class="px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                  :class="previewActive ? 'bg-acento-ambar/20 border-acento-ambar-fuerte text-acento-ambar-fuerte' : 'bg-base-blanco border-base-borde-fuerte text-base-texto-primario'">
                  {{ previewActive ? 'Ocultar Vista Previa' : '👁 Vista Previa' }}
                </button>
              </div>
            </div>

            <div>
              <label for="lesson-title-input" class="block font-semibold text-base-texto-primario mb-1">
                Título de la lección *
              </label>
              <input
                id="lesson-title-input"
                ref="lessonTitleRef"
                v-model="formState.title"
                type="text"
                required
                placeholder="Ej. Introducción a los condicionales en JavaScript"
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario" />
            </div>

            <div>
              <label for="lesson-body-input" class="block font-semibold text-base-texto-primario mb-1">
                Contenido Markdown *
              </label>
              <p class="text-[11px] text-base-texto-secundario mb-1.5">
                Soporta # Encabezados, **negrita**, *cursiva*, `código`, bloques ``` y listas con guion -.
              </p>
              <textarea
                id="lesson-body-input"
                v-model="formState.body"
                required
                rows="8"
                placeholder="# Título de la lección&#10;&#10;Escribe aquí la explicación teórica...&#10;&#10;```javascript&#10;const x = 10;&#10;```"
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 resize-y font-mono text-xs text-base-texto-primario"></textarea>
            </div>

            <!-- Vista previa condicional -->
            <div v-if="previewActive" class="p-4 rounded-lg bg-base-bg-secundario border border-base-borde-sutil space-y-2">
              <span class="text-[10px] font-bold text-base-texto-secundario uppercase tracking-wider block">
                Vista Previa del Estudiante
              </span>
              <h2 v-if="formState.title" class="text-sm font-bold text-base-texto-primario">
                {{ formState.title }}
              </h2>
              <div
                v-if="formState.body"
                class="prose prose-xs space-y-2 text-xs text-base-texto-primario"
                v-html="formatMarkdown(formState.body)" />
              <p v-else class="text-xs text-base-texto-secundario italic">
                Escribe algo en el cuerpo para ver la vista previa.
              </p>
            </div>

            <p v-if="formError" role="alert" class="text-semantico-falla text-[11px]">
              {{ formError }}
            </p>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                @click="cancelForm"
                class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-base-borde-fuerte">
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isSaving"
                class="px-5 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
                <span v-if="isSaving" class="animate-spin">⚙️</span>
                <span>{{ isSaving ? 'Guardando…' : (formState.isEditing ? '✔ Guardar cambios' : '✔ Crear lección') }}</span>
              </button>
            </div>
          </form>

          <!-- Diálogo de confirmación para borrar -->
          <div
            v-if="lessonToDelete"
            class="p-4 rounded-xl border border-semantico-falla/30 bg-semantico-falla/5 space-y-3">
            <p class="font-bold text-semantico-falla">
              ¿Eliminar definitivamente la lección "{{ lessonToDelete.title }}"?
            </p>
            <p class="text-base-texto-secundario text-[11px]">
              Esta acción no se puede deshacer.
            </p>
            <div class="flex items-center justify-end gap-2">
              <button
                type="button"
                @click="lessonToDelete = null"
                class="px-3 py-1.5 rounded-md borde-afordancia text-xs font-semibold bg-base-blanco">
                Cancelar
              </button>
              <button
                type="button"
                :disabled="isDeleting"
                @click="executeDelete"
                class="px-4 py-1.5 rounded-md bg-semantico-falla text-base-blanco font-bold text-xs hover:opacity-90 disabled:opacity-50">
                {{ isDeleting ? 'Eliminando…' : 'Confirmar eliminación' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Pie del modal -->
        <footer class="p-4 border-t border-base-borde-sutil bg-base-bg-secundario flex items-center justify-end">
          <button
            type="button"
            @click="handleClose"
            class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario bg-base-blanco hover:bg-base-bg-secundario">
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'
import { formatMarkdown } from '~/utils/formatMarkdown'

interface LessonItem {
  id: number
  learningUnitId: number
  title: string
  type: string
  body: string
  order: number
  isVisible: boolean
}

const props = defineProps<{
  unit: { id: number; title: string } | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const api = useApi()

const isOpen = ref(false)
const isLoading = ref(false)
const lessons = ref<LessonItem[]>([])
const feedbackMsg = ref<string | null>(null)
const errorMsg = ref<string | null>(null)

// Form state
const showForm = ref(false)
const previewActive = ref(false)
const isSaving = ref(false)
const formError = ref<string | null>(null)
const lessonTitleRef = ref<HTMLInputElement | null>(null)
const formState = reactive({
  isEditing: false,
  id: 0,
  title: '',
  body: '',
  order: 0
})

// Acciones en curso
const togglingId = ref<number | null>(null)
const isReordering = ref(false)
const lessonToDelete = ref<LessonItem | null>(null)
const isDeleting = ref(false)

const sortedLessons = computed(() => {
  return [...lessons.value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
})

async function openModal() {
  isOpen.value = true
  showForm.value = false
  feedbackMsg.value = null
  errorMsg.value = null
  lessonToDelete.value = null
  await fetchLessons()
}

function handleClose() {
  isOpen.value = false
  emit('close')
}

async function fetchLessons() {
  if (!props.unit) return
  isLoading.value = true
  errorMsg.value = null
  try {
    const res = await api.get<LessonItem[]>(`/content/unit/${props.unit.id}/all`)
    lessons.value = Array.isArray(res) ? res : []
  } catch (err: any) {
    errorMsg.value = err?.data?.message || 'Error al cargar las lecciones de la unidad.'
  } finally {
    isLoading.value = false
  }
}

function openCreateForm() {
  const maxOrder = lessons.value.reduce((max, l) => Math.max(max, l.order ?? 0), 0)
  formState.isEditing = false
  formState.id = 0
  formState.title = ''
  formState.body = ''
  formState.order = maxOrder + 1
  formError.value = null
  previewActive.value = false
  showForm.value = true
  nextTick(() => lessonTitleRef.value?.focus())
}

function openEditForm(lesson: LessonItem) {
  formState.isEditing = true
  formState.id = lesson.id
  formState.title = lesson.title
  formState.body = lesson.body || ''
  formState.order = lesson.order
  formError.value = null
  previewActive.value = false
  showForm.value = true
  nextTick(() => lessonTitleRef.value?.focus())
}

function cancelForm() {
  showForm.value = false
  formError.value = null
}

async function submitLessonForm() {
  if (!props.unit) return
  if (!formState.title.trim()) {
    formError.value = 'El título de la lección es obligatorio.'
    return
  }
  if (!formState.body.trim()) {
    formError.value = 'El contenido de la lección no puede estar vacío.'
    return
  }

  isSaving.value = true
  formError.value = null
  try {
    if (formState.isEditing) {
      const updated = await api.patch<LessonItem>(`/content/${formState.id}`, {
        title: formState.title.trim(),
        body: formState.body.trim(),
        order: formState.order
      })
      const idx = lessons.value.findIndex(l => l.id === formState.id)
      if (idx !== -1) {
        lessons.value[idx] = updated
      }
      feedbackMsg.value = `Lección "${updated.title}" actualizada correctamente.`
    } else {
      const created = await api.post<LessonItem>('/content', {
        learningUnitId: props.unit.id,
        title: formState.title.trim(),
        type: 'markdown',
        body: formState.body.trim(),
        order: formState.order,
        isVisible: true
      })
      lessons.value.push(created)
      feedbackMsg.value = `Lección "${created.title}" creada correctamente.`
    }
    showForm.value = false
  } catch (err: any) {
    formError.value = err?.data?.message || 'Error al guardar la lección.'
  } finally {
    isSaving.value = false
  }
}

async function toggleLessonVisibility(lesson: LessonItem) {
  togglingId.value = lesson.id
  errorMsg.value = null
  try {
    const res = await api.patch<LessonItem>(`/content/${lesson.id}/visibility`)
    lesson.isVisible = res.isVisible
    feedbackMsg.value = `Visibilidad de "${lesson.title}" actualizada a ${lesson.isVisible ? 'Visible' : 'Oculta'}.`
  } catch (err: any) {
    errorMsg.value = err?.data?.message || 'No se pudo cambiar la visibilidad de la lección.'
  } finally {
    togglingId.value = null
  }
}

async function moveLesson(index: number, direction: -1 | 1) {
  const targetIndex = index + direction
  const list = [...sortedLessons.value]
  if (targetIndex < 0 || targetIndex >= list.length) return

  isReordering.value = true
  errorMsg.value = null

  // Swap order values
  const current = list[index]
  const target = list[targetIndex]
  const tempOrder = current.order
  current.order = target.order
  target.order = tempOrder

  const reorderPayload = list.map((item, idx) => ({
    id: item.id,
    order: idx + 1
  }))

  try {
    await api.post('/content/reorder', reorderPayload)
    // Update local orders
    for (const r of reorderPayload) {
      const found = lessons.value.find(l => l.id === r.id)
      if (found) found.order = r.order
    }
    feedbackMsg.value = 'Orden de lecciones actualizado.'
  } catch (err: any) {
    errorMsg.value = err?.data?.message || 'Error al reordenar las lecciones.'
    await fetchLessons() // restaurar orden real
  } finally {
    isReordering.value = false
  }
}

function confirmDelete(lesson: LessonItem) {
  lessonToDelete.value = lesson
}

async function executeDelete() {
  if (!lessonToDelete.value) return
  isDeleting.value = true
  errorMsg.value = null
  try {
    await api.del(`/content/${lessonToDelete.value.id}`)
    lessons.value = lessons.value.filter(l => l.id !== lessonToDelete.value!.id)
    feedbackMsg.value = `Lección "${lessonToDelete.value.title}" eliminada.`
    lessonToDelete.value = null
  } catch (err: any) {
    errorMsg.value = err?.data?.message || 'Error al eliminar la lección.'
  } finally {
    isDeleting.value = false
  }
}

defineExpose({
  openModal
})
</script>
