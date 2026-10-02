<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      ref="dialogRef"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-lessons-title"
      tabindex="-1"
      @click.self="handleClose">
      <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>

      <div class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <header class="p-5 border-b border-base-borde-sutil flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="text-[11px] font-semibold text-base-texto-secundario">Lecciones</p>
            <h2 id="modal-lessons-title" class="text-sm font-bold text-base-texto-primario truncate">{{ unit?.title }}</h2>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="openCreateForm"
              class="px-3 py-1.5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
              <Plus :size="14" aria-hidden="true" /> Nueva explicación
            </button>
            <button
              @click="abrirRecurso(null)"
              class="px-3 py-1.5 rounded-md borde-afordancia bg-base-blanco text-acento-ambar-fuerte font-bold text-xs hover:bg-acento-ambar/10 inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
              <ImagePlus :size="14" aria-hidden="true" /> Recurso
            </button>
            <button
              @click="handleClose"
              class="p-1.5 rounded text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
              aria-label="Cerrar la explicación">
              <X :size="18" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div v-if="feedbackMsg" role="status" class="mx-5 mt-4 p-2.5 bg-semantico-pasa/10 border border-semantico-pasa/40 text-semantico-pasa rounded-lg text-xs">
          {{ feedbackMsg }}
        </div>
        <div v-if="errorMsg" role="alert" class="mx-5 mt-4 p-2.5 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded-lg text-xs">
          {{ errorMsg }}
        </div>

        <div class="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          <p v-if="isLoading" class="p-8 text-center text-base-texto-secundario animate-pulse">Cargando la explicación…</p>

          <div v-else-if="lessons.length === 0" class="p-8 text-center bg-base-bg-secundario rounded-xl border border-base-borde-sutil space-y-2">
            <FileText :size="28" class="mx-auto text-base-texto-secundario" aria-hidden="true" />
            <p class="font-semibold text-base-texto-primario">Esta lección todavía no tiene explicación</p>
            <p class="text-base-texto-secundario max-w-sm mx-auto text-[11px]">
              Una explicación corta (la idea, un ejemplo y un error común) prepara al estudiante antes de los ejercicios.
            </p>
          </div>

          <ul v-else class="space-y-2">
            <li
              v-for="(item, idx) in sortedLessons"
              :key="item.id"
              class="p-3 rounded-lg border border-base-borde-sutil hover:border-base-borde-fuerte transition-colors space-y-3">
              <div class="flex items-center justify-between gap-3">
              <button type="button" @click="openEditForm(item)" class="flex-1 min-w-0 text-left rounded focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
                <span class="flex items-center gap-2">
                  <span class="font-bold text-base-texto-primario truncate">{{ item.title }}</span>
                  <span v-if="item.isVisible === false" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-base-texto-secundario/20 text-base-texto-secundario">Oculta</span>
                </span>
                <span v-if="esRecurso(item.type)" class="block text-base-texto-secundario text-[11px] truncate mt-0.5">
                  {{ item.type === 'image' ? 'Imagen' : (NOMBRE_PROVEEDOR[String(item.metadata?.provider)] ?? 'Recurso') }}
                </span>
                <span v-else-if="item.body" class="block text-base-texto-secundario text-[11px] truncate mt-0.5">{{ excerpt(item.body) }}</span>
              </button>

              <div class="flex items-center gap-0.5 shrink-0">
                <button :disabled="idx === 0 || isReordering" @click="moveLesson(idx, -1)"
                  class="p-1.5 rounded text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Subir explicación" title="Subir">
                  <ChevronUp :size="16" aria-hidden="true" />
                </button>
                <button :disabled="idx === sortedLessons.length - 1 || isReordering" @click="moveLesson(idx, 1)"
                  class="p-1.5 rounded text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Bajar explicación" title="Bajar">
                  <ChevronDown :size="16" aria-hidden="true" />
                </button>
                <button :disabled="togglingId === item.id" @click="toggleLessonVisibility(item)"
                  class="p-1.5 rounded text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                  :aria-label="item.isVisible !== false ? `Ocultar ${item.title}` : `Mostrar ${item.title}`"
                  :title="item.isVisible !== false ? 'Ocultar a los estudiantes' : 'Mostrar a los estudiantes'">
                  <Eye v-if="item.isVisible !== false" :size="16" aria-hidden="true" />
                  <EyeOff v-else :size="16" aria-hidden="true" />
                </button>
                <button v-if="esRecurso(item.type)" @click="vistaPreviaId = vistaPreviaId === item.id ? null : item.id"
                  :aria-expanded="vistaPreviaId === item.id"
                  class="p-1.5 rounded text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                  :aria-label="`Vista previa de ${item.title}`" title="Vista previa">
                  <ScanEye :size="16" aria-hidden="true" />
                </button>
                <button @click="openEditForm(item)"
                  class="p-1.5 rounded text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                  :aria-label="`Editar ${item.title}`" title="Editar">
                  <Pencil :size="16" aria-hidden="true" />
                </button>
                <button @click="confirmDelete(item)"
                  class="p-1.5 rounded text-base-texto-secundario hover:text-semantico-falla hover:bg-semantico-falla/10 focus:outline-none focus:ring-2 focus:ring-semantico-falla"
                  :aria-label="`Eliminar ${item.title}`" title="Eliminar">
                  <Trash2 :size="16" aria-hidden="true" />
                </button>
              </div>
              </div>
              <LessonResource v-if="vistaPreviaId === item.id" :type="item.type" :title="item.title" :metadata="item.metadata" />
            </li>
          </ul>

          <div v-if="lessonToDelete" class="p-4 rounded-xl border border-semantico-falla/30 bg-semantico-falla/5 space-y-3">
            <p class="font-bold text-semantico-falla">¿Eliminar la explicación «{{ lessonToDelete.title }}»?</p>
            <p class="text-base-texto-secundario text-[11px]">No se puede deshacer. Si solo quieres que los estudiantes no la vean, usa el ojo para ocultarla.</p>
            <div class="flex items-center justify-end gap-2">
              <button type="button" @click="lessonToDelete = null" class="px-3 py-1.5 rounded-md borde-afordancia text-xs font-semibold bg-base-blanco">Cancelar</button>
              <button type="button" :disabled="isDeleting" @click="executeDelete"
                class="px-4 py-1.5 rounded-md bg-semantico-falla text-base-blanco font-bold text-xs hover:opacity-90 disabled:opacity-50">
                {{ isDeleting ? 'Eliminando…' : 'Eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Editor a pantalla completa (fase C) -->
  <DocenteLessonEditor
    v-if="showForm"
    :unit-title="unit?.title || ''"
    :is-editing="formState.isEditing"
    :initial-title="formState.title"
    :initial-body="formState.body"
    :initial-insertados="formState.insertados"
    :saving="isSaving"
    :error="formError"
    @cancel="cancelForm"
    @save="onEditorSave" />

  <DocenteResourceForm
    v-if="recursoForm.open && unit"
    :unit-id="unit.id"
    :order="recursoForm.order"
    :recurso="recursoForm.recurso"
    @cancel="recursoForm.open = false"
    @saved="onRecursoGuardado" />
</template>

<script setup lang="ts">
import { Plus, X, FileText, ChevronUp, ChevronDown, Eye, EyeOff, Pencil, Trash2, ImagePlus, ScanEye } from 'lucide-vue-next'
import { NOMBRE_PROVEEDOR } from '~/utils/recursoSeguro'
import { insertadosDe, type Insertados } from '~/utils/contenidoLeccion'
import { useApi } from '~/composables/useApi'

interface LessonItem {
  id: number
  learningUnitId: number
  title: string
  type: string
  body: string
  metadata?: Record<string, unknown> | null
  order: number
  isVisible: boolean
}

/** Video, PDF, imagen o recurso insertado (paso 6): se editan con su propio formulario, no con el editor de texto. */
const esRecurso = (type: string) => ['video', 'pdf', 'image', 'embed'].includes(type)
const vistaPreviaId = ref<number | null>(null)
const recursoForm = reactive({ open: false, order: 0, recurso: null as LessonItem | null })

const props = defineProps<{
  unit: { id: number; title: string } | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const api = useApi()
const { messageOf } = useApiErrorMessage()

const isOpen = ref(false)
const isLoading = ref(false)
const lessons = ref<LessonItem[]>([])
const feedbackMsg = ref<string | null>(null)
const errorMsg = ref<string | null>(null)

const showForm = ref(false)
const isSaving = ref(false)
const formError = ref<string | null>(null)
const formState = reactive({ isEditing: false, id: 0, title: '', body: '', order: 0, insertados: null as Insertados | null })

const togglingId = ref<number | null>(null)
const isReordering = ref(false)
const lessonToDelete = ref<LessonItem | null>(null)
const isDeleting = ref(false)

const sortedLessons = computed(() => [...lessons.value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
const dialogRef = ref<HTMLElement | null>(null)

/** Primera línea con texto, sin marcas de Markdown: para reconocer la lección en la lista. */
function excerpt(body: string) {
  const line = body.split('\n').map((l) => l.replace(/[#*`>-]/g, '').trim()).find((l) => l.length > 0) ?? ''
  return line.length > 110 ? line.slice(0, 110) + '…' : line
}

/**
 * Abre el panel. `create` va directo a escribir una lección nueva y `editId` a editar una existente
 * (los usa el constructor del curso para no pasar por la lista).
 */
async function openModal(opts: { create?: boolean; editId?: number } = {}) {
  isOpen.value = true
  showForm.value = false
  feedbackMsg.value = null
  errorMsg.value = null
  lessonToDelete.value = null
  nextTick(() => dialogRef.value?.focus())
  await fetchLessons()
  if (opts.create) openCreateForm()
  else if (opts.editId) {
    const found = lessons.value.find((l) => l.id === opts.editId)
    if (found) openEditForm(found)
  }
}

// Escape: primero cierra el editor o la confirmación de borrar; si no hay nada encima, el panel.
useEscapeToClose(
  () => isOpen.value,
  () => {
    if (recursoForm.open) recursoForm.open = false
    else if (showForm.value) cancelForm()
    else if (lessonToDelete.value) lessonToDelete.value = null
    else handleClose()
  }
)

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
  } catch (err) {
    errorMsg.value = messageOf(err, 'No se pudo cargar la explicación de la lección.')
  } finally {
    isLoading.value = false
  }
}

function openCreateForm() {
  const maxOrder = lessons.value.reduce((max, l) => Math.max(max, l.order ?? 0), 0)
  Object.assign(formState, { isEditing: false, id: 0, title: '', body: '', order: maxOrder + 1, insertados: null })
  formError.value = null
  showForm.value = true
}

function abrirRecurso(recurso: LessonItem | null) {
  const maxOrder = lessons.value.reduce((max, l) => Math.max(max, l.order ?? 0), 0)
  Object.assign(recursoForm, { open: true, order: recurso?.order ?? maxOrder + 1, recurso })
}

function onRecursoGuardado(guardado: Pick<LessonItem, 'id' | 'title' | 'type' | 'metadata' | 'order'>, creado: boolean) {
  const previo = lessons.value.find((l) => l.id === guardado.id)
  const recurso: LessonItem = { learningUnitId: props.unit?.id ?? 0, body: '', isVisible: previo?.isVisible ?? true, ...previo, ...guardado }
  const idx = lessons.value.findIndex((l) => l.id === recurso.id)
  if (idx === -1) lessons.value.push(recurso)
  else lessons.value[idx] = recurso
  feedbackMsg.value = creado ? `Recurso «${recurso.title}» agregado. Ya lo ven tus estudiantes.` : `Recurso «${recurso.title}» guardado.`
  recursoForm.open = false
  vistaPreviaId.value = recurso.id
}

function openEditForm(lesson: LessonItem) {
  if (esRecurso(lesson.type)) { abrirRecurso(lesson); return }
  Object.assign(formState, { isEditing: true, id: lesson.id, title: lesson.title, body: lesson.body || '', order: lesson.order, insertados: insertadosDe(lesson.metadata) })
  formError.value = null
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  formError.value = null
}

async function onEditorSave(payload: { title: string; body: string }) {
  if (!props.unit) return
  if (!payload.title) { formError.value = 'Ponle un título a la explicación.'; return }
  if (!payload.body) { formError.value = 'La explicación está vacía.'; return }
  isSaving.value = true
  formError.value = null
  try {
    if (formState.isEditing) {
      const updated = await api.patch<LessonItem>(`/content/${formState.id}`, { title: payload.title, body: payload.body, order: formState.order })
      const idx = lessons.value.findIndex((l) => l.id === formState.id)
      if (idx !== -1) lessons.value[idx] = updated
      feedbackMsg.value = `Lección «${updated.title}» guardada.`
    } else {
      const created = await api.post<LessonItem>('/content', {
        learningUnitId: props.unit.id,
        title: payload.title,
        type: 'markdown',
        body: payload.body,
        order: formState.order,
        isVisible: true
      })
      lessons.value.push(created)
      feedbackMsg.value = `Lección «${created.title}» creada. Ya la ven tus estudiantes.`
    }
    showForm.value = false
  } catch (err) {
    formError.value = messageOf(err, 'No se pudo guardar la explicación.')
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
    feedbackMsg.value = lesson.isVisible ? `«${lesson.title}» ya es visible.` : `«${lesson.title}» quedó oculta para los estudiantes.`
  } catch (err) {
    errorMsg.value = messageOf(err, 'No se pudo cambiar la visibilidad de la explicación.')
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
  // Se intercambian las posiciones en el arreglo y se numera de 1 a n según el nuevo orden.
  ;[list[index], list[targetIndex]] = [list[targetIndex], list[index]]
  const reorderPayload = list.map((item, idx) => ({ id: item.id, order: idx + 1 }))
  try {
    await api.post('/content/reorder', reorderPayload)
    for (const r of reorderPayload) {
      const found = lessons.value.find((l) => l.id === r.id)
      if (found) found.order = r.order
    }
  } catch (err) {
    errorMsg.value = messageOf(err, 'No se pudo cambiar el orden de las explicaciones.')
    await fetchLessons()
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
    lessons.value = lessons.value.filter((l) => l.id !== lessonToDelete.value!.id)
    feedbackMsg.value = `Lección «${lessonToDelete.value.title}» eliminada.`
    lessonToDelete.value = null
  } catch (err) {
    errorMsg.value = messageOf(err, 'No se pudo eliminar la explicación.')
  } finally {
    isDeleting.value = false
  }
}

defineExpose({ openModal })
</script>
