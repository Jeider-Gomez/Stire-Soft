<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Cabecera DOC-V02 -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info uppercase tracking-wider">
            Gestor Curricular • DOC-V02
          </span>
          <span v-if="selectedClass" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-acento-ambar/15 text-acento-ambar-fuerte">
            {{ selectedClass.code }}
          </span>
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          Contenidos y Temas Curriculares
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">
          Organización del árbol de aprendizaje: Módulos, Temas y Unidades didácticas
        </p>
      </div>

      <!-- Selector de Clase -->
      <div class="flex items-center gap-2">
        <label for="class-selector" class="text-xs font-semibold text-base-texto-secundario whitespace-nowrap">Clase:</label>
        <select
          id="class-selector"
          v-model="selectedClassId"
          @change="loadSections"
          class="text-xs bg-base-blanco text-base-texto-primario border border-base-borde-fuerte rounded-md px-3 py-1.5 outline-none focus:border-acento-ambar-fuerte">
          <option v-for="c in teacherClasses" :key="c.id" :value="c.id">
            {{ c.name }} ({{ c.code }})
          </option>
        </select>
      </div>
    </header>

    <!-- Feedback de guardado -->
    <div v-if="actionFeedback" role="status" aria-live="polite" class="p-3 bg-semantico-pasa/10 border border-semantico-pasa/40 text-semantico-pasa rounded-lg text-xs flex items-center justify-between">
      <span>✔ {{ actionFeedback }}</span>
      <button @click="actionFeedback = null" class="text-[11px] underline focus:outline-none focus:ring-2 focus:ring-semantico-pasa rounded">Cerrar</button>
    </div>

    <!-- Feedback de error de acción -->
    <div v-if="actionError" role="alert" aria-live="assertive" class="p-3 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded-lg text-xs flex items-center justify-between">
      <span>✖ {{ actionError }}</span>
      <button @click="actionError = null" class="text-[11px] underline focus:outline-none focus:ring-2 focus:ring-semantico-falla rounded">Cerrar</button>
    </div>

    <!-- ESTADO 1: Cargando -->
    <div v-if="isLoading" class="p-12 text-center text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil">
      <span class="inline-block animate-spin mr-2">⏳</span> Cargando estructura curricular...
    </div>

    <!-- ESTADO 2: Error -->
    <div v-else-if="errorMessage" class="p-8 text-center bg-base-blanco rounded-xl border border-semantico-falla/30 text-xs space-y-3">
      <span class="text-2xl">⚠</span>
      <p class="font-bold text-semantico-falla">{{ errorMessage }}</p>
      <button
        @click="loadSections"
        class="px-4 py-2 rounded-md bg-base-bg-secundario border border-base-borde-fuerte font-semibold hover:bg-base-borde-sutil transition-colors">
        Reintentar carga
      </button>
    </div>

    <!-- ESTADO 3: Vacío -->
    <div v-else-if="sections.length === 0" class="p-12 text-center bg-base-blanco rounded-xl border border-base-borde-fuerte text-xs space-y-3">
      <span class="text-3xl">📚</span>
      <h3 class="font-bold text-base-texto-primario text-sm">Sin módulos curriculares</h3>
      <p class="text-base-texto-secundario max-w-md mx-auto">
        Esta clase aún no cuenta con secciones temáticas configuradas en el sistema.
      </p>
    </div>

    <!-- ESTADO 4: Defecto (Árbol Curricular) -->
    <div v-else class="space-y-4">
      <div
        v-for="sec in sections"
        :key="sec.id"
        class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-hidden">
        <!-- Cabecera de Sección / Módulo -->
        <div class="p-4 bg-base-bg-secundario flex items-center justify-between gap-3 border-b border-base-borde-sutil">
          <div class="flex items-center gap-3">
            <span class="w-6 h-6 rounded bg-acento-ambar/20 text-acento-ambar-fuerte font-bold text-xs flex items-center justify-center">
              {{ sec.order || 'M' }}
            </span>
            <div>
              <h2 class="text-xs font-bold text-base-texto-primario">
                {{ sec.title }}
              </h2>
              <p v-if="sec.description" class="text-[11px] text-base-texto-secundario">
                {{ sec.description }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="toggleSectionPublish(sec)"
              class="px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer border focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
              :class="sec.isPublished
                ? 'bg-semantico-pasa/15 text-semantico-pasa border-semantico-pasa/40 hover:bg-semantico-pasa/25'
                : 'bg-base-blanco text-base-texto-secundario border-base-borde-fuerte hover:text-base-texto-primario'">
              {{ sec.isPublished ? '✔ Publicado' : '○ Borrador' }}
            </button>
          </div>
        </div>

        <!-- Temas y Unidades -->
        <div class="p-4 space-y-3">
          <div v-if="!sec.topics || sec.topics.length === 0" class="text-xs text-base-texto-secundario italic p-2">
            Sin temas agregados a este módulo.
          </div>

          <div
            v-for="topic in sec.topics"
            :key="topic.id"
            class="rounded-lg border border-base-borde-sutil p-3 bg-base-blanco space-y-2">
            <!-- Cabecera del Topic con acciones Editar / Archivar -->
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-base-texto-primario flex items-center gap-1.5">
                <span class="text-acento-ambar-fuerte">📁</span>
                <span>{{ topic.title }}</span>
              </span>
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-base-texto-secundario font-mono">
                  Orden: {{ topic.order }}
                </span>
                <button
                  @click="openEditTopicModal(topic)"
                  class="px-2 py-0.5 rounded text-[11px] font-semibold bg-base-bg-secundario border border-base-borde-fuerte text-base-texto-primario hover:bg-acento-ambar/10 hover:border-acento-ambar-fuerte transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                  :aria-label="`Editar tema ${topic.title}`">
                  ✏ Editar
                </button>
                <button
                  @click="confirmArchiveTopic(topic)"
                  class="px-2 py-0.5 rounded text-[11px] font-semibold border border-semantico-falla/30 text-semantico-falla hover:bg-semantico-falla/10 transition-colors focus:outline-none focus:ring-2 focus:ring-semantico-falla"
                  :aria-label="`Archivar tema ${topic.title}`">
                  🗄 Archivar
                </button>
              </div>
            </div>

            <!-- Lista de Unidades de Aprendizaje dentro del Topic -->
            <div v-if="topic.learningUnits && topic.learningUnits.length > 0" class="pl-4 space-y-1.5 pt-1">
              <div
                v-for="unit in topic.learningUnits"
                :key="unit.id"
                class="flex items-center justify-between p-2 rounded bg-base-bg-secundario text-xs">
                <div class="flex items-center gap-2">
                  <span class="text-acento-ambar-fuerte font-bold">📄</span>
                  <span class="text-base-texto-primario font-medium">{{ unit.title }}</span>
                  <span class="text-[10px] text-base-texto-secundario px-1.5 py-0.5 rounded bg-base-blanco border border-base-borde-sutil">
                    {{ unit.difficulty }}
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded"
                    :class="unit.isActive !== false ? 'bg-semantico-pasa/15 text-semantico-pasa' : 'bg-base-texto-secundario/15 text-base-texto-secundario'">
                    {{ unit.isActive !== false ? 'Activa' : 'Inactiva' }}
                  </span>
                  <button
                    @click="openEditUnitModal(unit)"
                    class="px-2 py-0.5 rounded text-[11px] font-semibold bg-base-blanco border border-base-borde-fuerte text-base-texto-primario hover:bg-acento-ambar/10 hover:border-acento-ambar-fuerte transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                    :aria-label="`Editar unidad ${unit.title}`">
                    ✏ Editar
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-[11px] text-base-texto-secundario pl-4 italic">
              Sin unidades asociadas aún.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: Editar Topic -->
    <Teleport to="body">
      <div
        v-if="editTopicModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-topic-title"
        @click.self="closeEditTopicModal">
        <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
        <div class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-md p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 id="modal-topic-title" class="text-sm font-bold text-base-texto-primario">Editar Tema Curricular</h2>
            <button
              @click="closeEditTopicModal"
              class="text-base-texto-secundario hover:text-base-texto-primario transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte rounded"
              aria-label="Cerrar modal de edición de tema">
              ✕
            </button>
          </div>

          <form @submit.prevent="submitEditTopic" class="space-y-4 text-xs">
            <div>
              <label for="topic-title" class="block font-semibold text-base-texto-primario mb-1">Título *</label>
              <input
                id="topic-title"
                ref="editTopicTitleRef"
                v-model="editTopicModal.form.title"
                type="text"
                required
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario" />
            </div>

            <div>
              <label for="topic-desc" class="block font-semibold text-base-texto-primario mb-1">Descripción</label>
              <textarea
                id="topic-desc"
                v-model="editTopicModal.form.description"
                rows="3"
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 resize-y text-base-texto-primario"></textarea>
            </div>

            <div>
              <label for="topic-order" class="block font-semibold text-base-texto-primario mb-1">Orden</label>
              <input
                id="topic-order"
                v-model.number="editTopicModal.form.order"
                type="number"
                min="0"
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario" />
            </div>

            <p v-if="editTopicModal.error" role="alert" class="text-semantico-falla text-[11px]">{{ editTopicModal.error }}</p>

            <div class="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                @click="closeEditTopicModal"
                class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-base-borde-fuerte">
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="editTopicModal.saving"
                class="px-5 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
                <span v-if="editTopicModal.saving" class="animate-spin">⚙️</span>
                <span>{{ editTopicModal.saving ? 'Guardando…' : '✔ Guardar cambios' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- MODAL: Confirmar Archivar Topic -->
    <Teleport to="body">
      <div
        v-if="archiveTopicModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-archive-title"
        @click.self="archiveTopicModal.open = false">
        <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
        <div class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-sm p-6 space-y-4">
          <h2 id="modal-archive-title" class="text-sm font-bold text-base-texto-primario">¿Archivar este tema?</h2>
          <p class="text-xs text-base-texto-secundario">
            El tema <strong class="text-base-texto-primario">{{ archiveTopicModal.topic?.title }}</strong>
            quedará inactivo (soft delete). Esta acción es reversible por un administrador.
          </p>
          <p v-if="archiveTopicModal.error" role="alert" class="text-semantico-falla text-[11px]">{{ archiveTopicModal.error }}</p>
          <div class="flex items-center justify-end gap-3">
            <button
              @click="archiveTopicModal.open = false"
              class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-base-borde-fuerte">
              Cancelar
            </button>
            <button
              @click="submitArchiveTopic"
              :disabled="archiveTopicModal.saving"
              class="px-5 py-2 rounded-md bg-semantico-falla text-base-blanco font-bold text-xs hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-semantico-falla">
              <span v-if="archiveTopicModal.saving" class="animate-spin">⚙️</span>
              <span>{{ archiveTopicModal.saving ? 'Archivando…' : '🗄 Confirmar Archivo' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL: Editar LearningUnit -->
    <Teleport to="body">
      <div
        v-if="editUnitModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-unit-title"
        @click.self="closeEditUnitModal">
        <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
        <div class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-md p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 id="modal-unit-title" class="text-sm font-bold text-base-texto-primario">Editar Unidad de Aprendizaje</h2>
            <button
              @click="closeEditUnitModal"
              class="text-base-texto-secundario hover:text-base-texto-primario transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte rounded"
              aria-label="Cerrar modal de edición de unidad">
              ✕
            </button>
          </div>

          <form @submit.prevent="submitEditUnit" class="space-y-4 text-xs">
            <div>
              <label for="unit-title" class="block font-semibold text-base-texto-primario mb-1">Título *</label>
              <input
                id="unit-title"
                ref="editUnitTitleRef"
                v-model="editUnitModal.form.title"
                type="text"
                required
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario" />
            </div>

            <div>
              <label for="unit-desc" class="block font-semibold text-base-texto-primario mb-1">Descripción</label>
              <textarea
                id="unit-desc"
                v-model="editUnitModal.form.description"
                rows="3"
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 resize-y text-base-texto-primario"></textarea>
            </div>

            <div>
              <label for="unit-difficulty" class="block font-semibold text-base-texto-primario mb-1">Nivel de Dificultad</label>
              <select
                id="unit-difficulty"
                v-model="editUnitModal.form.difficulty"
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario">
                <option value="basico">Básico</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>

            <div>
              <label for="unit-order" class="block font-semibold text-base-texto-primario mb-1">Orden</label>
              <input
                id="unit-order"
                v-model.number="editUnitModal.form.order"
                type="number"
                min="0"
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario" />
            </div>

            <!-- Sección plegable: Tutor IA en esta unidad (§20.1) -->
            <details v-if="editUnitModal.unitId" class="border-t border-base-borde-sutil pt-3">
              <summary class="text-[11px] font-semibold text-base-texto-secundario cursor-pointer hover:text-base-texto-primario select-none flex items-center gap-1.5">
                <span aria-hidden="true">🤖</span> Tutor IA en esta unidad
              </summary>
              <div class="mt-3">
                <DocenteTutorSettingsPanel scope-type="unit" :scope-id="editUnitModal.unitId" />
              </div>
            </details>

            <p v-if="editUnitModal.error" role="alert" class="text-semantico-falla text-[11px]">{{ editUnitModal.error }}</p>

            <div class="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                @click="closeEditUnitModal"
                class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-base-borde-fuerte">
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="editUnitModal.saving"
                class="px-5 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
                <span v-if="editUnitModal.saving" class="animate-spin">⚙️</span>
                <span>{{ editUnitModal.saving ? 'Guardando…' : '✔ Guardar cambios' }}</span>
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

definePageMeta({
  layout: 'teacher'
})

interface TeacherClass {
  id: number
  code: string
  name: string
}

interface LearningUnitItem {
  id: number
  title: string
  description?: string
  difficulty: string
  order: number
  isActive?: boolean
}

interface TopicItem {
  id: number
  title: string
  description?: string
  order: number
  learningUnits?: LearningUnitItem[]
}

interface SectionItem {
  id: number
  title: string
  description?: string
  order: number
  isPublished: boolean
  topics?: TopicItem[]
}

const api = useApi()

const teacherClasses = ref<TeacherClass[]>([])
const selectedClassId = ref<number | null>(null)
const sections = ref<SectionItem[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const actionFeedback = ref<string | null>(null)
const actionError = ref<string | null>(null)

// Refs para autofocus en modales
const editTopicTitleRef = ref<HTMLInputElement | null>(null)
const editUnitTitleRef = ref<HTMLInputElement | null>(null)

const selectedClass = computed(() => {
  return teacherClasses.value.find(c => c.id === selectedClassId.value)
})

// ─── Modal Editar Topic ────────────────────────────────────────────────────────
const editTopicModal = reactive({
  open: false,
  topicId: null as number | null,
  form: { title: '', description: '', order: 0 },
  saving: false,
  error: null as string | null
})

function openEditTopicModal(topic: TopicItem) {
  editTopicModal.topicId = topic.id
  editTopicModal.form.title = topic.title
  editTopicModal.form.description = topic.description || ''
  editTopicModal.form.order = topic.order
  editTopicModal.error = null
  editTopicModal.open = true
  nextTick(() => editTopicTitleRef.value?.focus())
}

function closeEditTopicModal() {
  editTopicModal.open = false
}

async function submitEditTopic() {
  if (!editTopicModal.form.title.trim()) {
    editTopicModal.error = 'El título es obligatorio.'
    return
  }
  editTopicModal.saving = true
  editTopicModal.error = null
  try {
    await api.patch(`/topic/${editTopicModal.topicId}`, {
      title: editTopicModal.form.title.trim(),
      description: editTopicModal.form.description.trim() || undefined,
      order: editTopicModal.form.order
    })
    // Actualizar en memoria
    for (const sec of sections.value) {
      const t = sec.topics?.find(t => t.id === editTopicModal.topicId)
      if (t) {
        t.title = editTopicModal.form.title.trim()
        t.description = editTopicModal.form.description.trim()
        t.order = editTopicModal.form.order
        break
      }
    }
    actionFeedback.value = `Tema "${editTopicModal.form.title}" actualizado correctamente.`
    closeEditTopicModal()
  } catch (err: any) {
    editTopicModal.error = err?.data?.message || 'Error al actualizar el tema.'
  } finally {
    editTopicModal.saving = false
  }
}

// ─── Modal Archivar Topic ──────────────────────────────────────────────────────
const archiveTopicModal = reactive({
  open: false,
  topic: null as TopicItem | null,
  saving: false,
  error: null as string | null
})

function confirmArchiveTopic(topic: TopicItem) {
  archiveTopicModal.topic = topic
  archiveTopicModal.error = null
  archiveTopicModal.open = true
}

async function submitArchiveTopic() {
  if (!archiveTopicModal.topic) return
  archiveTopicModal.saving = true
  archiveTopicModal.error = null
  try {
    await api.del(`/topic/${archiveTopicModal.topic.id}`)
    // Remover de la vista
    for (const sec of sections.value) {
      if (sec.topics) {
        const idx = sec.topics.findIndex(t => t.id === archiveTopicModal.topic!.id)
        if (idx !== -1) {
          sec.topics.splice(idx, 1)
          break
        }
      }
    }
    actionFeedback.value = `Tema "${archiveTopicModal.topic.title}" archivado correctamente.`
    archiveTopicModal.open = false
  } catch (err: any) {
    archiveTopicModal.error = err?.data?.message || 'Error al archivar el tema.'
  } finally {
    archiveTopicModal.saving = false
  }
}

// ─── Modal Editar LearningUnit ────────────────────────────────────────────────
const editUnitModal = reactive({
  open: false,
  unitId: null as number | null,
  form: { title: '', description: '', difficulty: 'basico', order: 0 },
  saving: false,
  error: null as string | null
})

function openEditUnitModal(unit: LearningUnitItem) {
  editUnitModal.unitId = unit.id
  editUnitModal.form.title = unit.title
  editUnitModal.form.description = unit.description || ''
  editUnitModal.form.difficulty = unit.difficulty || 'basico'
  editUnitModal.form.order = unit.order
  editUnitModal.error = null
  editUnitModal.open = true
  nextTick(() => editUnitTitleRef.value?.focus())
}

function closeEditUnitModal() {
  editUnitModal.open = false
}

async function submitEditUnit() {
  if (!editUnitModal.form.title.trim()) {
    editUnitModal.error = 'El título es obligatorio.'
    return
  }
  editUnitModal.saving = true
  editUnitModal.error = null
  try {
    await api.patch(`/learning-unit/${editUnitModal.unitId}`, {
      title: editUnitModal.form.title.trim(),
      description: editUnitModal.form.description.trim() || undefined,
      difficulty: editUnitModal.form.difficulty,
      order: editUnitModal.form.order
    })
    // Actualizar en memoria
    for (const sec of sections.value) {
      for (const t of sec.topics || []) {
        const u = t.learningUnits?.find(u => u.id === editUnitModal.unitId)
        if (u) {
          u.title = editUnitModal.form.title.trim()
          u.description = editUnitModal.form.description.trim()
          u.difficulty = editUnitModal.form.difficulty
          u.order = editUnitModal.form.order
          break
        }
      }
    }
    actionFeedback.value = `Unidad "${editUnitModal.form.title}" actualizada correctamente.`
    closeEditUnitModal()
  } catch (err: any) {
    editUnitModal.error = err?.data?.message || 'Error al actualizar la unidad.'
  } finally {
    editUnitModal.saving = false
  }
}

// ─── Carga de datos ────────────────────────────────────────────────────────────
async function fetchClasses() {
  isLoading.value = true
  errorMessage.value = null

  try {
    const cls = await api.get<TeacherClass[]>('/class/my-classes')
    if (Array.isArray(cls) && cls.length > 0) {
      teacherClasses.value = cls
      selectedClassId.value = cls[0].id
      await loadSections()
    } else {
      teacherClasses.value = []
      isLoading.value = false
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Error al cargar las clases del docente'
    isLoading.value = false
  }
}

async function loadSections() {
  if (!selectedClassId.value) return
  isLoading.value = true
  errorMessage.value = null

  try {
    const secList = await api.get<SectionItem[]>(`/sections/class/${selectedClassId.value}`)
    if (Array.isArray(secList)) {
      const fullSections: SectionItem[] = []
      for (const s of secList) {
        try {
          const topics = await api.get<TopicItem[]>(`/topic/section/${s.id}`)
          fullSections.push({
            ...s,
            topics: Array.isArray(topics) ? topics : []
          })
        } catch {
          fullSections.push({ ...s, topics: [] })
        }
      }
      sections.value = fullSections
    } else {
      sections.value = []
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Error al cargar los contenidos de la clase'
  } finally {
    isLoading.value = false
  }
}

async function toggleSectionPublish(sec: SectionItem) {
  try {
    const newStatus = !sec.isPublished
    await api.patch(`/sections/${sec.id}/publish`, { isPublished: newStatus })
    sec.isPublished = newStatus
    actionFeedback.value = `Sección "${sec.title}" actualizada a ${newStatus ? 'Publicado' : 'Borrador'}.`
  } catch (err: any) {
    actionError.value = 'No se pudo actualizar el estado de publicación.'
  }
}

onMounted(() => {
  fetchClasses()
})
</script>
