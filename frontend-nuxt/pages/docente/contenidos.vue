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
        <label class="text-xs font-semibold text-base-texto-secundario whitespace-nowrap">Clase:</label>
        <select
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
    <div v-if="actionFeedback" class="p-3 bg-semantico-pasa/10 border border-semantico-pasa/40 text-semantico-pasa rounded-lg text-xs flex items-center justify-between">
      <span>✔ {{ actionFeedback }}</span>
      <button @click="actionFeedback = null" class="text-[11px] underline">Cerrar</button>
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
              class="px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer border"
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
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-base-texto-primario flex items-center gap-1.5">
                <span class="text-acento-ambar-fuerte">📁</span>
                <span>{{ topic.title }}</span>
              </span>
              <span class="text-[10px] text-base-texto-secundario font-mono">
                Orden: {{ topic.order }}
              </span>
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
                  <span class="text-[10px] text-base-texto-secundario px-1.5 py-0.2 rounded bg-base-blanco border border-base-borde-sutil">
                    Dificultad: {{ unit.difficulty }}
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded"
                    :class="unit.isActive !== false ? 'bg-semantico-pasa/15 text-semantico-pasa' : 'bg-base-texto-secundario/15 text-base-texto-secundario'">
                    {{ unit.isActive !== false ? 'Activa' : 'Inactiva' }}
                  </span>
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
  difficulty: string
  order: number
  isActive?: boolean
}

interface TopicItem {
  id: number
  title: string
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

const selectedClass = computed(() => {
  return teacherClasses.value.find(c => c.id === selectedClassId.value)
})

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
      // Para cada sección, cargar sus topics si no vienen incrustados
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
    errorMessage.value = 'No se pudo actualizar el estado de publicación.'
  }
}

onMounted(() => {
  fetchClasses()
})
</script>
