<template>
  <div class="max-w-4xl mx-auto space-y-5">
    <!-- Cabecera: dónde va el ejercicio -->
    <header class="space-y-3">
      <NuxtLink
        :to="backToCourse"
        class="inline-flex items-center gap-1 text-xs font-semibold text-base-texto-secundario hover:text-base-texto-primario focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte rounded">
        <ArrowLeft :size="14" aria-hidden="true" /> Volver al curso
      </NuxtLink>
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">Nuevo ejercicio</h1>
          <p class="text-xs text-base-texto-secundario mt-0.5">
            <template v-if="selectedUnit">
              Para <strong class="text-base-texto-primario">{{ selectedUnit.title }}</strong>
              <span v-if="selectedClass"> · {{ selectedClass.name }}</span>
            </template>
            <template v-else>Elige la clase y la unidad donde irá.</template>
          </p>
        </div>
        <button
          v-if="selectedUnit && !showPlacement"
          type="button"
          @click="showPlacement = true"
          class="self-start sm:self-auto text-xs font-semibold text-acento-ambar-fuerte hover:underline focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte rounded">
          Cambiar unidad
        </button>
      </div>

      <!-- Clase y unidad: solo si no llegaron desde el curso o si el docente quiere cambiarlas -->
      <div v-if="showPlacement || !selectedUnit" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-base-blanco rounded-xl border border-base-borde-sutil p-4">
        <div>
          <label for="create-class" class="block font-semibold text-base-texto-primario mb-1">Clase</label>
          <select id="create-class" v-model="selectedClassId" @change="onClassChange"
            class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none">
            <option v-for="c in teacherClasses" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label for="create-unit" class="block font-semibold text-base-texto-primario mb-1">Unidad</label>
          <select id="create-unit" v-model="form.learningUnitId" :disabled="units.length === 0"
            class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none disabled:opacity-50">
            <option v-for="u in units" :key="u.id" :value="u.id">{{ u.title }}</option>
          </select>
          <p v-if="selectedClassId && units.length === 0 && !loadingUnits" class="text-[11px] text-base-texto-secundario mt-1">
            Esta clase aún no tiene unidades. Créalas primero en <NuxtLink to="/docente/contenidos" class="underline">Contenidos</NuxtLink>.
          </p>
        </div>
      </div>
    </header>

    <!-- Ejercicio creado -->
    <section v-if="created" role="status" class="bg-base-blanco rounded-xl border border-semantico-pasa/40 p-6 text-center space-y-3">
      <CircleCheck :size="36" class="mx-auto text-semantico-pasa" aria-hidden="true" />
      <h2 class="text-base font-bold text-base-texto-primario">«{{ created.title }}» {{ created.published ? 'ya está visible para tus estudiantes' : 'quedó guardado como borrador' }}</h2>
      <p class="text-xs text-base-texto-secundario">Lo encuentras en la unidad, dentro de Contenidos.</p>
      <div class="flex flex-wrap justify-center gap-2 pt-1">
        <button type="button" @click="startAnother" class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco text-xs font-bold hover:bg-acento-ambar focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
          Crear otro en esta unidad
        </button>
        <NuxtLink :to="backToCourse" class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario">
          Volver al curso
        </NuxtLink>
      </div>
    </section>

    <template v-else>
      <!-- Pasos -->
      <ol class="flex items-center gap-2 text-[11px] font-semibold" aria-label="Pasos para crear el ejercicio">
        <li v-for="(s, i) in STEPS" :key="s" class="flex items-center gap-2">
          <span
            class="w-6 h-6 rounded-full flex items-center justify-center"
            :class="step === i + 1 ? 'bg-acento-ambar-fuerte text-base-blanco' : step > i + 1 ? 'bg-semantico-pasa/20 text-semantico-pasa' : 'bg-base-bg-secundario text-base-texto-secundario'"
            :aria-current="step === i + 1 ? 'step' : undefined">
            {{ i + 1 }}
          </span>
          <span :class="step === i + 1 ? 'text-base-texto-primario' : 'text-base-texto-secundario'">{{ s }}</span>
          <ChevronRight v-if="i < STEPS.length - 1" :size="14" class="text-base-borde-fuerte" aria-hidden="true" />
        </li>
      </ol>

      <!-- Paso 1: tipo -->
      <section v-if="step === 1" class="space-y-3">
        <h2 class="text-sm font-bold text-base-texto-primario">¿Qué va a hacer el estudiante?</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Tipo de ejercicio">
          <button
            v-for="t in EXERCISE_TYPES"
            :key="t.id"
            type="button"
            role="radio"
            :aria-checked="exerciseType === t.id"
            @click="chooseType(t.id)"
            class="text-left bg-base-blanco rounded-xl border p-4 hover:border-acento-ambar-fuerte hover:shadow-sm transition focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
            :class="exerciseType === t.id ? 'border-acento-ambar-fuerte ring-1 ring-acento-ambar-fuerte' : 'border-base-borde-sutil'">
            <div class="flex items-start gap-3">
              <span class="w-9 h-9 rounded-lg bg-acento-ambar/15 text-acento-ambar-fuerte flex items-center justify-center shrink-0">
                <DocenteExerciseTypeIcon :type="t.id" />
              </span>
              <span class="space-y-0.5">
                <span class="block text-sm font-bold text-base-texto-primario">{{ t.name }}</span>
                <span class="block text-xs text-base-texto-primario">{{ t.student }}</span>
                <span class="block text-[11px] text-base-texto-secundario">Ideal para: {{ t.idealFor }}</span>
              </span>
            </div>
          </button>
        </div>
      </section>

      <!-- Paso 2: contenido (se oculta con v-show para no perder lo escrito al ir a la vista previa) -->
      <form v-show="step === 2" novalidate @submit.prevent="goToPreview" class="space-y-4">
        <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 space-y-4 text-xs">
          <div class="flex items-center justify-between">
            <p class="flex items-center gap-2 text-sm font-bold text-base-texto-primario">
              <DocenteExerciseTypeIcon :type="exerciseType" :size="18" /> {{ typeInfo?.name }}
            </p>
            <button type="button" @click="step = 1" class="text-[11px] font-semibold text-acento-ambar-fuerte hover:underline">Cambiar tipo</button>
          </div>
          <p class="text-[11px] text-base-texto-secundario -mt-2">{{ typeInfo?.grading }}</p>

          <div>
            <label for="create-title" class="block font-semibold text-base-texto-primario mb-1">Título</label>
            <input id="create-title" v-model="form.title" type="text" placeholder="Ej.: Suma de dos números"
              class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
          </div>
          <div>
            <label for="create-question" class="block font-semibold text-base-texto-primario mb-1">Enunciado</label>
            <p class="text-[11px] text-base-texto-secundario mb-1">Lo que el estudiante lee antes de responder. Escríbelo como se lo dirías en clase: corto y con un ejemplo si hace falta.</p>
            <textarea id="create-question" v-model="form.questionText" rows="4" :placeholder="statementPlaceholder"
              class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none resize-y focus:ring-2 focus:ring-acento-ambar-fuerte/30"></textarea>
          </div>

          <div class="pt-3 border-t border-base-borde-sutil">
            <CodingExerciseBuilder v-show="exerciseType === 'coding'" ref="codingBuilderRef" />
            <McqExerciseBuilder v-show="exerciseType === 'mcq'" ref="mcqBuilderRef" />
            <FillCodeExerciseBuilder v-show="exerciseType === 'fill_code'" ref="fillCodeBuilderRef" />
            <DragDropExerciseBuilder v-show="exerciseType === 'drag_drop'" ref="dragDropBuilderRef" />
            <MatchingExerciseBuilder v-show="exerciseType === 'matching'" ref="matchingBuilderRef" />
            <OrderingExerciseBuilder v-show="exerciseType === 'ordering'" ref="orderingBuilderRef" />
            <HtmlCssExerciseBuilder v-show="exerciseType === 'html_css'" ref="htmlCssBuilderRef" />
          </div>
        </section>

        <!-- Ajustes con valores por defecto: casi nunca hay que tocarlos -->
        <details class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 text-xs group">
          <summary class="cursor-pointer select-none font-semibold text-base-texto-primario flex items-center gap-2">
            <Settings2 :size="16" aria-hidden="true" /> Ajustes
            <span class="font-normal text-base-texto-secundario">— {{ settingsSummary }}</span>
          </summary>
          <div class="mt-4 space-y-4">
            <fieldset>
              <legend class="font-semibold text-base-texto-primario mb-1">¿Cuánto cuenta?</legend>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label v-for="t in activityTypes" :key="t.id"
                  class="flex items-start gap-2 rounded-lg border p-2.5 cursor-pointer"
                  :class="activityTypeId === t.id ? 'border-acento-ambar-fuerte bg-acento-ambar/10' : 'border-base-borde-sutil'">
                  <input v-model="activityTypeId" type="radio" name="activity-type" :value="t.id" class="mt-0.5 accent-acento-ambar-fuerte" />
                  <span>
                    <span class="block font-semibold text-base-texto-primario">{{ t.name }}</span>
                    <span class="block text-[10px] text-base-texto-secundario">{{ weightHint(t.baseWeight) }}</span>
                  </span>
                </label>
              </div>
            </fieldset>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label for="create-difficulty" class="block font-semibold text-base-texto-primario mb-1">Dificultad</label>
                <select id="create-difficulty" v-model="form.difficulty" class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte">
                  <option value="basico">Básico</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
              <div>
                <label for="create-points" class="block font-semibold text-base-texto-primario mb-1">Puntos</label>
                <input id="create-points" v-model.number="form.totalPoints" type="number" min="5" max="100" class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte" />
              </div>
              <div>
                <label for="create-attempts" class="block font-semibold text-base-texto-primario mb-1">Intentos</label>
                <input id="create-attempts" v-model.number="form.attemptsAllowed" type="number" min="1" max="10" class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte" />
              </div>
            </div>
          </div>
        </details>

        <p v-if="stepError" role="alert" class="p-3 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded-lg text-xs">{{ stepError }}</p>

        <div class="flex justify-between gap-3">
          <button type="button" @click="step = 1" class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario">
            Atrás
          </button>
          <button type="submit" class="px-5 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco text-xs font-bold hover:bg-acento-ambar inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
            Ver cómo lo verá el estudiante <ChevronRight :size="14" aria-hidden="true" />
          </button>
        </div>
      </form>

      <!-- Paso 3: vista previa y publicar -->
      <section v-if="step === 3 && previewConfig" class="space-y-4">
        <DocenteExercisePreview :type="exerciseType" :title="form.title" :statement="form.questionText" :config="previewConfig" />

        <fieldset class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 text-xs space-y-2">
          <legend class="sr-only">Visibilidad</legend>
          <label class="flex items-center gap-2 cursor-pointer">
            <input id="publish-now" v-model="publishImmediately" type="radio" :value="true" name="visibility" class="accent-acento-ambar-fuerte" />
            <span><strong>Publicar ahora</strong> — tus estudiantes lo ven de inmediato.</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="publishImmediately" type="radio" :value="false" name="visibility" class="accent-acento-ambar-fuerte" />
            <span><strong>Guardar como borrador</strong> — lo publicas después desde el curso.</span>
          </label>
        </fieldset>

        <p v-if="submitError" role="alert" class="p-3 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded-lg text-xs">{{ submitError }}</p>

        <div class="flex justify-between gap-3">
          <button type="button" @click="step = 2" class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario">
            Seguir editando
          </button>
          <button type="button" id="save-exercise" :disabled="isSubmitting" @click="submitExercise"
            class="px-6 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco text-xs font-bold hover:bg-acento-ambar disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
            {{ isSubmitting ? 'Guardando…' : publishImmediately ? 'Publicar ejercicio' : 'Guardar borrador' }}
          </button>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ChevronRight, CircleCheck, Settings2 } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { EXERCISE_TYPES, exerciseTypeInfo, type ExerciseTypeId } from '~/utils/exerciseTypes'
import CodingExerciseBuilder from '~/components/docente/exercise-builders/CodingExerciseBuilder.vue'
import McqExerciseBuilder from '~/components/docente/exercise-builders/McqExerciseBuilder.vue'
import FillCodeExerciseBuilder from '~/components/docente/exercise-builders/FillCodeExerciseBuilder.vue'
import DragDropExerciseBuilder from '~/components/docente/exercise-builders/DragDropExerciseBuilder.vue'
import MatchingExerciseBuilder from '~/components/docente/exercise-builders/MatchingExerciseBuilder.vue'
import OrderingExerciseBuilder from '~/components/docente/exercise-builders/OrderingExerciseBuilder.vue'
import HtmlCssExerciseBuilder from '~/components/docente/exercise-builders/HtmlCssExerciseBuilder.vue'

definePageMeta({ layout: 'teacher' })

interface TeacherClass { id: number; code: string; name: string }
interface LearningUnitItem { id: number; title: string; difficulty: string }
interface ActivityTypeOption { id: number; name: string; code: string; baseWeight: number }
type BuilderResult = { valid: boolean; error?: string; config?: unknown }

function isConfig(v: unknown): v is Record<string, any> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

const STEPS = ['Tipo', 'Contenido', 'Revisar y publicar']

const api = useApi()
const route = useRoute()
const { messageOf } = useApiErrorMessage()

const teacherClasses = ref<TeacherClass[]>([])
const selectedClassId = ref<number | null>(null)
const units = ref<LearningUnitItem[]>([])
const loadingUnits = ref(false)
const showPlacement = ref(false)
const activityTypes = ref<ActivityTypeOption[]>([])
const activityTypeId = ref<number | null>(null)

const step = ref(1)
const exerciseType = ref<ExerciseTypeId>('mcq')
const publishImmediately = ref(true)
const previewConfig = ref<Record<string, any> | null>(null)
const stepError = ref<string | null>(null)
const submitError = ref<string | null>(null)
const isSubmitting = ref(false)
const created = ref<{ title: string; published: boolean } | null>(null)

const form = reactive({
  learningUnitId: null as number | null,
  title: '',
  difficulty: 'basico',
  totalPoints: 20,
  attemptsAllowed: 3,
  questionText: ''
})

const codingBuilderRef = ref<InstanceType<typeof CodingExerciseBuilder> | null>(null)
const mcqBuilderRef = ref<InstanceType<typeof McqExerciseBuilder> | null>(null)
const fillCodeBuilderRef = ref<InstanceType<typeof FillCodeExerciseBuilder> | null>(null)
const dragDropBuilderRef = ref<InstanceType<typeof DragDropExerciseBuilder> | null>(null)
const matchingBuilderRef = ref<InstanceType<typeof MatchingExerciseBuilder> | null>(null)
const orderingBuilderRef = ref<InstanceType<typeof OrderingExerciseBuilder> | null>(null)
const htmlCssBuilderRef = ref<InstanceType<typeof HtmlCssExerciseBuilder> | null>(null)

const typeInfo = computed(() => exerciseTypeInfo(exerciseType.value))
const selectedClass = computed(() => teacherClasses.value.find((c) => c.id === selectedClassId.value))
const selectedUnit = computed(() => units.value.find((u) => u.id === form.learningUnitId))
const backToCourse = computed(() =>
  selectedClassId.value
    ? `/docente/contenidos?classId=${selectedClassId.value}${form.learningUnitId ? `&unitId=${form.learningUnitId}` : ''}`
    : '/docente/contenidos'
)

const statementPlaceholder = computed(() => ({
  mcq: '¿Con qué palabra se declara una variable que no se puede reasignar?',
  coding: 'Lee dos números (uno por línea) e imprime su suma.',
  fill_code: 'Completa el código para que imprima los números del 1 al 5.',
  ordering: 'Ordena los pasos para calcular el promedio de tres notas.',
  matching: 'Une cada operador con lo que hace.',
  drag_drop: 'Clasifica cada valor según su tipo de dato.',
  html_css: 'Crea una tarjeta con un título h1 y un párrafo de color gris.'
} as Record<string, string>)[exerciseType.value])

const settingsSummary = computed(() => {
  const t = activityTypes.value.find((x) => x.id === activityTypeId.value)
  const d = form.difficulty === 'intermedio' ? 'intermedio' : form.difficulty === 'avanzado' ? 'avanzado' : 'básico'
  return `${t?.name ?? 'Práctica'}, ${d}, ${form.totalPoints} puntos, ${form.attemptsAllowed} intentos`
})

function weightHint(w: number) {
  if (w >= 3) return 'Cuenta como un examen: pesa el triple.'
  if (w > 1) return 'Cuenta un poco más que una práctica.'
  return 'Práctica libre: el peso normal.'
}

function chooseType(id: ExerciseTypeId) {
  exerciseType.value = id
  stepError.value = null
  step.value = 2
  nextTick(() => document.getElementById('create-title')?.focus())
}

function activeBuilderConfig(): BuilderResult {
  const refs: Record<ExerciseTypeId, { value: { validateAndGetConfig: (p: number) => BuilderResult } | null }> = {
    coding: codingBuilderRef, mcq: mcqBuilderRef, fill_code: fillCodeBuilderRef, drag_drop: dragDropBuilderRef,
    matching: matchingBuilderRef, ordering: orderingBuilderRef, html_css: htmlCssBuilderRef
  }
  return refs[exerciseType.value].value?.validateAndGetConfig(form.totalPoints) ?? { valid: false, error: 'El editor de este tipo no está disponible.' }
}

function goToPreview() {
  stepError.value = null
  if (!form.learningUnitId) { stepError.value = 'Elige la unidad donde irá el ejercicio.'; return }
  if (!form.title.trim()) { stepError.value = 'Ponle un título al ejercicio.'; return }
  if (!form.questionText.trim()) { stepError.value = 'Escribe el enunciado.'; return }
  const res = activeBuilderConfig()
  if (!res.valid || !isConfig(res.config)) { stepError.value = res.error || 'Revisa las respuestas del ejercicio.'; return }
  previewConfig.value = res.config
  step.value = 3
}

async function submitExercise() {
  if (!previewConfig.value || !form.learningUnitId) return
  isSubmitting.value = true
  submitError.value = null
  let activityId: number | null = null
  try {
    const act = await api.post<{ id: number }>('/activities', {
      learningUnitId: form.learningUnitId,
      activityTypeId: activityTypeId.value ?? undefined,
      title: form.title.trim(),
      description: form.questionText.trim(),
      difficulty: form.difficulty,
      totalPoints: form.totalPoints,
      passingScore: 60,
      attemptsAllowed: form.attemptsAllowed,
      isRequired: true,
      adaptiveWeight: 0.4
    })
    if (!act?.id) throw new Error('El servidor no devolvió el ejercicio creado.')
    activityId = act.id
    try {
      await api.post('/activity-questions', {
        activityId,
        type: exerciseType.value,
        question: form.questionText.trim(),
        points: form.totalPoints,
        order: 0,
        config: previewConfig.value
      })
    } catch (questionErr) {
      // Si falla la pregunta no queda un ejercicio vacío: se borra la actividad recién creada.
      await api.del(`/activities/${activityId}`).catch(() => undefined)
      throw questionErr
    }
    let published = false
    if (publishImmediately.value) {
      published = await api.patch(`/activities/${activityId}/publish`).then(() => true, () => false)
    }
    created.value = { title: form.title.trim(), published }
  } catch (err) {
    submitError.value = messageOf(err, 'No se pudo guardar el ejercicio.')
  } finally {
    isSubmitting.value = false
  }
}

function startAnother() {
  created.value = null
  previewConfig.value = null
  form.title = ''
  form.questionText = ''
  ;[codingBuilderRef, mcqBuilderRef, fillCodeBuilderRef, dragDropBuilderRef, matchingBuilderRef, orderingBuilderRef, htmlCssBuilderRef]
    .forEach((r) => (r.value as { reset?: () => void } | null)?.reset?.())
  step.value = 1
}

async function onClassChange() {
  units.value = []
  form.learningUnitId = null
  if (!selectedClassId.value) return
  loadingUnits.value = true
  try {
    const sections = await api.get<Array<{ id: number }>>(`/sections/class/${selectedClassId.value}`)
    const collected: LearningUnitItem[] = []
    for (const s of Array.isArray(sections) ? sections : []) {
      const topics = await api.get<Array<{ learningUnits?: LearningUnitItem[] }>>(`/topic/section/${s.id}`)
      for (const t of Array.isArray(topics) ? topics : []) collected.push(...(t.learningUnits ?? []))
    }
    units.value = collected
    form.learningUnitId = collected[0]?.id ?? null
  } catch (err) {
    stepError.value = messageOf(err, 'No se pudieron cargar las unidades de la clase.')
  } finally {
    loadingUnits.value = false
  }
}

onMounted(async () => {
  try {
    const [classes, types] = await Promise.all([
      api.get<TeacherClass[]>('/class/my-classes'),
      api.get<ActivityTypeOption[] | { data?: ActivityTypeOption[] }>('/activity-types')
    ])
    const typeList = Array.isArray(types) ? types : (types?.data ?? [])
    activityTypes.value = typeList
    activityTypeId.value = (typeList.find((t) => t.code === 'AUTO-EVAL') ?? typeList[0])?.id ?? null

    teacherClasses.value = Array.isArray(classes) ? classes : []
    const qClass = Number(route.query.classId)
    const qUnit = Number(route.query.unitId)
    selectedClassId.value = teacherClasses.value.find((c) => c.id === qClass)?.id ?? teacherClasses.value[0]?.id ?? null
    await onClassChange()
    if (qUnit && units.value.some((u) => u.id === qUnit)) form.learningUnitId = qUnit
  } catch (err) {
    stepError.value = messageOf(err, 'No se pudo cargar la información inicial.')
  }
})
</script>
