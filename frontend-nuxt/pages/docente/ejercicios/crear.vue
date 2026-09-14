<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Cabecera DOC-V03 -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info uppercase tracking-wider">
            Diseñador de Ejercicios • DOC-V03
          </span>
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          Crear Nuevo Ejercicio y Casos de Prueba
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">
          Configuración pedagógica y rúbrica de evaluación para el Sandbox STIRE
        </p>
      </div>

      <NuxtLink
        to="/docente/contenidos"
        class="borde-afordancia px-3 py-1.5 rounded-md text-xs font-semibold text-base-texto-secundario hover:text-base-texto-primario flex items-center gap-1 self-start sm:self-auto">
        <span>←</span>
        <span>Ver Contenidos</span>
      </NuxtLink>
    </header>

    <!-- Feedback de Éxito -->
    <div v-if="successCreatedId" class="p-4 bg-semantico-pasa/10 border border-semantico-pasa/40 text-semantico-pasa rounded-xl text-xs space-y-2">
      <div class="flex items-center justify-between font-bold">
        <span>🎉 ¡Ejercicio creado exitosamente con ID #{{ successCreatedId }}!</span>
        <button @click="successCreatedId = null" class="underline text-[11px]">Cerrar</button>
      </div>
      <p class="text-base-texto-secundario text-[11px]">
        El ejercicio ya está disponible en el banco de actividades de la unidad de aprendizaje seleccionada.
      </p>
    </div>

    <!-- Formulario Principal -->
    <form @submit.prevent="submitExercise" class="space-y-6">
      <!-- Sección 1: Asociación Curricular -->
      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4">
        <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider flex items-center gap-2">
          <span>1.</span>
          <span>Asociación Curricular y Metadatos</span>
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <!-- Clase -->
          <div>
            <label class="block font-semibold text-base-texto-primario mb-1">Clase Académica *</label>
            <select
              v-model="selectedClassId"
              @change="onClassChange"
              required
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none">
              <option :value="null" disabled>-- Selecciona una clase --</option>
              <option v-for="c in teacherClasses" :key="c.id" :value="c.id">
                {{ c.name }} ({{ c.code }})
              </option>
            </select>
          </div>

          <!-- Unidad de Aprendizaje -->
          <div>
            <label class="block font-semibold text-base-texto-primario mb-1">Unidad de Aprendizaje *</label>
            <select
              v-model="form.learningUnitId"
              required
              :disabled="units.length === 0"
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none disabled:opacity-50">
              <option :value="null" disabled>-- Selecciona una unidad --</option>
              <option v-for="u in units" :key="u.id" :value="u.id">
                {{ u.title }} (Dificultad: {{ u.difficulty }})
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <!-- Título -->
          <div class="sm:col-span-2">
            <label class="block font-semibold text-base-texto-primario mb-1">Título del Ejercicio *</label>
            <input
              v-model="form.title"
              type="text"
              required
              placeholder="Ej: Desafío de Código: Validador de Contraseñas"
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
          </div>

          <!-- Dificultad -->
          <div>
            <label class="block font-semibold text-base-texto-primario mb-1">Nivel de Dificultad *</label>
            <select
              v-model="form.difficulty"
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none">
              <option value="BASICO">Básico</option>
              <option value="INTERMEDIO">Intermedio</option>
              <option value="AVANZADO">Avanzado</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 text-xs">
          <!-- Puntos -->
          <div>
            <label class="block font-semibold text-base-texto-primario mb-1">Puntos Totales</label>
            <input
              v-model.number="form.totalPoints"
              type="number"
              min="5"
              max="100"
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
          </div>

          <!-- Intentos -->
          <div>
            <label class="block font-semibold text-base-texto-primario mb-1">Intentos Permitidos</label>
            <input
              v-model.number="form.attemptsAllowed"
              type="number"
              min="1"
              max="10"
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
          </div>

          <!-- Peso Adaptativo -->
          <div>
            <label class="block font-semibold text-base-texto-primario mb-1">Peso Adaptativo (0-1)</label>
            <input
              v-model.number="form.adaptiveWeight"
              type="number"
              step="0.05"
              min="0.1"
              max="1"
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
          </div>
        </div>
      </section>

      <!-- Sección 2: Enunciado y Código Inicial -->
      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4">
        <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider flex items-center gap-2">
          <span>2.</span>
          <span>Enunciado y Plantilla de Código (JavaScript)</span>
        </h2>

        <div class="text-xs">
          <label class="block font-semibold text-base-texto-primario mb-1">
            Enunciado Pedagógico del Problema *
          </label>
          <textarea
            v-model="form.questionText"
            required
            rows="4"
            placeholder="Describe con claridad las entradas esperadas por stdin, las condiciones lógicas y la salida requerida..."
            class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none resize-y"></textarea>
        </div>

        <div class="text-xs">
          <label class="block font-semibold text-base-texto-primario mb-1">
            Código Plantilla Inicial (`starterCode`)
          </label>
          <textarea
            v-model="form.starterCode"
            rows="5"
            spellcheck="false"
            class="w-full px-3 py-2 rounded-md bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs outline-none resize-y border border-[#333]"></textarea>
        </div>
      </section>

      <!-- Sección 3: Casos de Prueba (Públicos y Privados) -->
      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider flex items-center gap-2">
            <span>3.</span>
            <span>Rúbrica: Casos de Prueba para Evaluación</span>
          </h2>

          <button
            type="button"
            @click="addTestCase"
            class="px-3 py-1 rounded text-xs font-bold bg-acento-ambar/15 text-acento-ambar-fuerte hover:bg-acento-ambar/25 transition-colors flex items-center gap-1">
            <span>+</span>
            <span>Agregar Caso</span>
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="(tc, idx) in form.testCases"
            :key="idx"
            class="p-3 rounded-lg border border-base-borde-sutil bg-base-bg-secundario/40 space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-base-texto-primario">Caso #{{ idx + 1 }}</span>
              <div class="flex items-center gap-3">
                <label class="flex items-center gap-1.5 cursor-pointer text-[11px] select-none">
                  <input type="checkbox" v-model="tc.isPublic" class="accent-acento-ambar-fuerte" />
                  <span :class="tc.isPublic ? 'text-semantico-pasa font-bold' : 'text-base-texto-secundario'">
                    {{ tc.isPublic ? '👁 Público (visible)' : '🔒 Privado (ciego)' }}
                  </span>
                </label>

                <button
                  v-if="form.testCases.length > 1"
                  type="button"
                  @click="removeTestCase(idx)"
                  class="text-semantico-falla text-[11px] hover:underline">
                  Eliminar
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label class="block text-[11px] text-base-texto-secundario mb-1">Entrada (`stdin`)</label>
                <input
                  v-model="tc.input"
                  type="text"
                  placeholder="Ej: 15"
                  class="w-full px-2.5 py-1.5 font-mono text-xs rounded bg-base-blanco border border-base-borde-sutil focus:border-acento-ambar-fuerte outline-none" />
              </div>

              <div>
                <label class="block text-[11px] text-base-texto-secundario mb-1">Salida Esperada (`stdout`)</label>
                <input
                  v-model="tc.expected"
                  type="text"
                  placeholder="Ej: Acceso denegado"
                  class="w-full px-2.5 py-1.5 font-mono text-xs rounded bg-base-blanco border border-base-borde-sutil focus:border-acento-ambar-fuerte outline-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Mensaje de Error -->
      <div v-if="submitError" class="p-3 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded-lg text-xs">
        {{ submitError }}
      </div>

      <!-- Barra de Acciones de Envío -->
      <div class="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          @click="resetForm"
          class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario">
          Restablecer Formulario
        </button>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-6 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm">
          <span v-if="isSubmitting" class="animate-spin">⚙️</span>
          <span>{{ isSubmitting ? 'Guardando Ejercicio...' : '🚀 Guardar y Publicar Ejercicio' }}</span>
        </button>
      </div>
    </form>
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
}

interface SectionItem {
  id: number
  topics?: Array<{
    learningUnits?: LearningUnitItem[]
  }>
}

const api = useApi()

const teacherClasses = ref<TeacherClass[]>([])
const selectedClassId = ref<number | null>(null)
const units = ref<LearningUnitItem[]>([])
const activityTypeId = ref<number>(1) // Default autoType

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const successCreatedId = ref<number | null>(null)

const form = reactive({
  learningUnitId: null as number | null,
  title: '',
  difficulty: 'BASICO',
  totalPoints: 25,
  attemptsAllowed: 3,
  adaptiveWeight: 0.4,
  questionText: '',
  starterCode: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\n\n// Escribe tu solución aquí\n`,
  testCases: [
    { label: 'Caso 1', input: '10', expected: '10', isPublic: true },
    { label: 'Caso Oculto', input: '20', expected: '20', isPublic: false }
  ]
})

function addTestCase() {
  form.testCases.push({
    label: `Caso ${form.testCases.length + 1}`,
    input: '',
    expected: '',
    isPublic: true
  })
}

function removeTestCase(index: number) {
  form.testCases.splice(index, 1)
}

function resetForm() {
  form.title = ''
  form.questionText = ''
  form.testCases = [
    { label: 'Caso 1', input: '10', expected: '10', isPublic: true },
    { label: 'Caso Oculto', input: '20', expected: '20', isPublic: false }
  ]
  submitError.value = null
}

async function onClassChange() {
  units.value = []
  form.learningUnitId = null
  if (!selectedClassId.value) return

  try {
    const secList = await api.get<SectionItem[]>(`/sections/class/${selectedClassId.value}`)
    const unitCollector: LearningUnitItem[] = []
    if (Array.isArray(secList)) {
      for (const s of secList) {
        const topics = await api.get<any[]>(`/topic/section/${s.id}`)
        if (Array.isArray(topics)) {
          for (const t of topics) {
            if (Array.isArray(t.learningUnits)) {
              unitCollector.push(...t.learningUnits)
            }
          }
        }
      }
    }
    units.value = unitCollector
    if (unitCollector.length > 0) {
      form.learningUnitId = unitCollector[0].id
    }
  } catch (err: any) {
    console.error('Error al cargar unidades de la clase:', err)
  }
}

async function fetchInitialData() {
  try {
    const [classesRes, typesRes] = await Promise.all([
      api.get<TeacherClass[]>('/class/my-classes'),
      api.get<any>('/activity-types')
    ])

    if (Array.isArray(classesRes) && classesRes.length > 0) {
      teacherClasses.value = classesRes
      selectedClassId.value = classesRes[0].id
      await onClassChange()
    }

    const typesList = Array.isArray(typesRes) ? typesRes : typesRes?.items || []
    if (typesList.length > 0) {
      activityTypeId.value = typesList[0].id
    }
  } catch (err: any) {
    console.error('Error al inicializar diseñador:', err)
  }
}

async function submitExercise() {
  if (!form.learningUnitId || !form.title.trim() || !form.questionText.trim()) {
    submitError.value = 'Completa los campos obligatorios del ejercicio.'
    return
  }

  isSubmitting.value = true
  submitError.value = null

  try {
    // 1. Crear Activity
    const actRes = await api.post<any>('/activities', {
      learningUnitId: form.learningUnitId,
      activityTypeId: activityTypeId.value,
      title: form.title.trim(),
      description: form.questionText.trim(),
      difficulty: form.difficulty,
      totalPoints: form.totalPoints,
      passingScore: 60,
      attemptsAllowed: form.attemptsAllowed,
      isRequired: true,
      adaptiveWeight: form.adaptiveWeight
    })

    if (actRes && actRes.id) {
      // 2. Crear ActivityQuestion asociada
      await api.post('/activity-questions', {
        activityId: actRes.id,
        type: 'coding',
        question: form.questionText.trim(),
        points: form.totalPoints,
        order: 0,
        config: {
          language: 'javascript',
          starterCode: form.starterCode,
          testCases: form.testCases.map((tc, i) => ({
            label: `Caso ${i + 1}`,
            input: tc.input,
            expected: tc.expected,
            isPublic: tc.isPublic
          }))
        }
      })

      successCreatedId.value = actRes.id
      resetForm()
    }
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Error al guardar el ejercicio'
    submitError.value = Array.isArray(msg) ? msg.join(', ') : msg
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchInitialData()
})
</script>
