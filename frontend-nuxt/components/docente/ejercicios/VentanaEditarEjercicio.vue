<template>
  <!-- Editar un ejercicio: datos, enunciado y sus respuestas con el editor de su tipo (antes dentro de
       UnitExercisesPanel.vue, sin atrapar el foco). Base común de ventanas: el foco entra al título (o a las respuestas,
       si es una variante recién duplicada), Tab no se sale, Escape cierra y el foco vuelve a su botón «Editar». -->
  <Teleport to="body">
    <AdminDialogo id-titulo="edit-exercise-title" :titulo="variante ? 'Revisar la variante' : 'Editar ejercicio'" :subtitulo="ejercicio.title"
      ancho="2xl" :devolver-foco="`editar-ejercicio-${ejercicio.id}`" :ocupado="guardando" @cerrar="emit('cerrar')">
      <template #icono><Pencil :size="18" aria-hidden="true" /></template>
      <form class="space-y-4 text-xs" novalidate @submit.prevent="guardarCambios">
        <div>
          <label for="edit-ex-title" class="block font-semibold text-base-texto-primario mb-1">Título</label>
          <input id="edit-ex-title" v-model="f.title" :data-foco-inicial="variante ? undefined : ''" type="text" required class="input-stire min-h-[44px]" />
        </div>
        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="edit-ex-statement" class="font-semibold text-base-texto-primario">Enunciado</label>
            <button type="button" :aria-pressed="vistaEnunciado" class="min-h-[44px] sm:min-h-0 text-[11px] font-semibold text-acento-ambar-fuerte hover:underline"
              @click="vistaEnunciado = !vistaEnunciado">
              {{ vistaEnunciado ? 'Editar texto' : 'Vista previa del enunciado' }}
            </button>
          </div>
          <textarea v-if="!vistaEnunciado" id="edit-ex-statement" v-model="f.description" v-crece rows="8"
            class="input-stire font-codigo text-[11px] leading-relaxed"></textarea>
          <div v-else class="rounded-md border border-base-borde-sutil bg-base-bg-secundario/40 p-3 text-xs leading-relaxed text-base-texto-primario"
            v-html="formatMarkdown(f.description, { escapeHtml: true })"></div>
          <p class="text-[11px] text-slate-600 mt-1">
            Admite **negrita**, `código`, bloques de código entre ```, listas y tablas. Los estudiantes ven el cambio al abrir el ejercicio.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="edit-ex-difficulty" class="block font-semibold text-base-texto-primario mb-1">Dificultad</label>
            <select id="edit-ex-difficulty" v-model="f.difficulty" class="input-stire min-h-[44px]">
              <option value="basico">Básico</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
          <div>
            <label for="edit-ex-points" class="block font-semibold text-base-texto-primario mb-1">Puntos</label>
            <input id="edit-ex-points" v-model.number="f.totalPoints" type="number" min="5" max="100" class="input-stire min-h-[44px]" />
          </div>
        </div>
        <div>
          <label for="edit-ex-type" class="block font-semibold text-base-texto-primario mb-1">Tipo de actividad</label>
          <select id="edit-ex-type" v-model="f.activityTypeId" class="input-stire min-h-[44px]">
            <option v-for="t in tipos" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
          <p class="text-[11px] text-slate-600 mt-1">Un taller o un parcial cuentan más en el dominio del estudiante que una práctica.</p>
        </div>

        <!-- Respuestas del ejercicio (Fase 28): el editor de su tipo, ya cargado -->
        <section ref="seccionRespuestas" tabindex="-1" aria-labelledby="edit-ex-answers-title" :data-foco-inicial="variante ? '' : undefined"
          class="border-t border-base-borde-sutil pt-3 space-y-3 focus:outline-none">
          <div class="flex items-center justify-between gap-2">
            <h4 id="edit-ex-answers-title" class="font-semibold text-base-texto-primario">Respuestas del ejercicio</h4>
            <button v-if="r.estado === 'editable'" type="button" :aria-pressed="r.vistaPrevia"
              class="min-h-[44px] sm:min-h-0 inline-flex items-center gap-1 text-[11px] font-semibold text-acento-ambar-fuerte hover:underline" @click="alternarVistaPrevia">
              <Eye :size="12" aria-hidden="true" />
              {{ r.vistaPrevia ? 'Volver al editor' : 'Ver como el estudiante' }}
            </button>
          </div>
          <p v-if="variante && r.estado === 'editable'" role="note" class="rounded-md bg-acento-ambar/10 border border-acento-ambar/30 p-2 text-[11px] text-base-texto-primario">
            Esta es una copia. Cambia los datos (números, opciones, casos) para que sea un ejercicio distinto del original.
          </p>
          <p v-if="r.estado === 'cargando'" role="status" class="flex items-center gap-2 text-slate-600">
            <Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Cargando respuestas…
          </p>
          <p v-else-if="r.estado === 'error'" role="alert" class="text-semantico-falla text-[11px]">{{ r.error }}</p>
          <p v-else-if="r.estado === 'sin-editor'" class="text-slate-600 text-[11px]">Las respuestas de este tipo de ejercicio no se editan desde aquí.</p>
          <div v-else-if="r.estado === 'bloqueado'" class="rounded-md border border-base-borde-fuerte bg-base-bg-secundario/40 p-3 space-y-2">
            <p class="text-[11px] text-base-texto-primario">
              Este ejercicio ya tiene {{ plural(r.entregas, 'entrega', 'entregas') }}: sus respuestas no se pueden cambiar sin alterar notas ya puestas.
            </p>
            <button type="button" :disabled="duplicando" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-acento-ambar-fuerte text-acento-ambar-fuerte font-semibold hover:bg-acento-ambar/10 disabled:opacity-50"
              @click="emit('duplicar', ejercicio.id)">
              <Copy :size="13" aria-hidden="true" /> Duplicar como variante
            </button>
          </div>
          <!-- Solo se monta el editor del tipo de este ejercicio: los demás, ocultos, tendrían campos `required` vacíos
               que el navegador no puede enfocar y bloquearían el envío del formulario. -->
          <div v-if="r.estado === 'editable'" v-show="!r.vistaPrevia">
            <CodingExerciseBuilder v-if="r.tipo === 'coding'" ref="coding" />
            <McqExerciseBuilder v-else-if="r.tipo === 'mcq'" ref="mcq" />
            <FillCodeExerciseBuilder v-else-if="r.tipo === 'fill_code'" ref="fillCode" />
            <DragDropExerciseBuilder v-else-if="r.tipo === 'drag_drop'" ref="dragDrop" />
            <MatchingExerciseBuilder v-else-if="r.tipo === 'matching'" ref="matching" />
            <OrderingExerciseBuilder v-else-if="r.tipo === 'ordering'" ref="ordering" />
            <HtmlCssExerciseBuilder v-else-if="r.tipo === 'html_css'" ref="htmlCss" />
          </div>
          <DocenteExercisePreview v-if="r.vistaPrevia && r.vistaConfig && r.tipo"
            :type="r.tipo" :title="f.title" :statement="f.description" :config="r.vistaConfig" />
          <p v-if="r.errorEditor" role="alert" class="text-semantico-falla text-[11px]">{{ r.errorEditor }}</p>
        </section>

        <details class="border-t border-base-borde-sutil pt-3">
          <summary class="min-h-[44px] sm:min-h-0 flex items-center text-[11px] font-semibold text-slate-600 cursor-pointer select-none">Tutor IA en este ejercicio</summary>
          <div class="mt-3"><DocenteTutorSettingsPanel scope-type="activity" :scope-id="ejercicio.id" /></div>
        </details>
        <p v-if="error" role="alert" class="text-semantico-falla text-[11px]">{{ error }}</p>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-stire-secondary min-h-[44px]" :disabled="guardando" @click="emit('cerrar')">Cancelar</button>
          <button type="submit" :disabled="guardando" class="btn-stire-primary min-h-[44px] disabled:opacity-50">
            {{ guardando ? 'Guardando…' : 'Guardar cambios' }}
          </button>
        </div>
      </form>
    </AdminDialogo>
  </Teleport>
</template>

<script setup lang="ts">
import { inject, nextTick, onMounted, reactive, ref } from 'vue'
import { Copy, Eye, Loader2, Pencil } from 'lucide-vue-next'
import { CLAVE_EJERCICIOS_UNIDAD, type DatosEjercicio } from '~/composables/useEjerciciosUnidad'
import { formatMarkdown } from '~/utils/formatMarkdown'
import { EXERCISE_TYPES, type ExerciseTypeId } from '~/utils/exerciseTypes'
import { stableJson } from '~/utils/exerciseConfig'
import type { EjercicioDeLaLeccion } from '~/utils/ejerciciosUnidad'
import CodingExerciseBuilder from '~/components/docente/exercise-builders/CodingExerciseBuilder.vue'
import McqExerciseBuilder from '~/components/docente/exercise-builders/McqExerciseBuilder.vue'
import FillCodeExerciseBuilder from '~/components/docente/exercise-builders/FillCodeExerciseBuilder.vue'
import DragDropExerciseBuilder from '~/components/docente/exercise-builders/DragDropExerciseBuilder.vue'
import MatchingExerciseBuilder from '~/components/docente/exercise-builders/MatchingExerciseBuilder.vue'
import OrderingExerciseBuilder from '~/components/docente/exercise-builders/OrderingExerciseBuilder.vue'
import HtmlCssExerciseBuilder from '~/components/docente/exercise-builders/HtmlCssExerciseBuilder.vue'

/** variante: viene de «Duplicar como variante»; la ventana invita a cambiar las respuestas. */
const props = defineProps<{ ejercicio: EjercicioDeLaLeccion; variante?: boolean }>()
const emit = defineEmits<{ cerrar: []; duplicar: [id: number] }>()
const estado = inject(CLAVE_EJERCICIOS_UNIDAD)
if (!estado) throw new Error('VentanaEditarEjercicio necesita useEjerciciosUnidad() con provide(CLAVE_EJERCICIOS_UNIDAD).')
const { tipos, duplicando, advertencia, respuestasDe, guardar } = estado
const { messageOf } = useApiErrorMessage()

const f = reactive<DatosEjercicio>({
  title: props.ejercicio.title,
  description: props.ejercicio.description ?? '',
  difficulty: props.ejercicio.difficulty || 'basico',
  totalPoints: props.ejercicio.totalPoints,
  activityTypeId: props.ejercicio.activityTypeId ?? props.ejercicio.activityType?.id ?? tipos.value[0]?.id ?? null,
})
const vistaEnunciado = ref(false)
const guardando = ref(false)
const error = ref<string | null>(null)

// Las respuestas (Fase 28): el editor de su tipo, cargado con el config guardado.
type ResultadoEditor = { valid: boolean; error?: string; config?: unknown }
interface EditorDeRespuestas { validateAndGetConfig: (puntos: number) => ResultadoEditor; load: (config: unknown) => void }
const seccionRespuestas = ref<HTMLElement | null>(null)
const coding = ref<InstanceType<typeof CodingExerciseBuilder> | null>(null)
const mcq = ref<InstanceType<typeof McqExerciseBuilder> | null>(null)
const fillCode = ref<InstanceType<typeof FillCodeExerciseBuilder> | null>(null)
const dragDrop = ref<InstanceType<typeof DragDropExerciseBuilder> | null>(null)
const matching = ref<InstanceType<typeof MatchingExerciseBuilder> | null>(null)
const ordering = ref<InstanceType<typeof OrderingExerciseBuilder> | null>(null)
const htmlCss = ref<InstanceType<typeof HtmlCssExerciseBuilder> | null>(null)

const r = reactive({
  estado: 'cargando' as 'cargando' | 'editable' | 'bloqueado' | 'sin-editor' | 'error',
  preguntaId: null as number | null,
  tipo: null as ExerciseTypeId | null,
  entregas: 0,
  error: null as string | null,
  errorEditor: null as string | null,
  /** El config tal como lo dejó el editor al cargar: sirve para saber si una variante quedó igual al original. */
  base: '',
  vistaPrevia: false,
  vistaConfig: null as Record<string, unknown> | null,
})

function editorActivo(): EditorDeRespuestas | null {
  switch (r.tipo) {
    case 'coding': return coding.value
    case 'mcq': return mcq.value
    case 'fill_code': return fillCode.value
    case 'drag_drop': return dragDrop.value
    case 'matching': return matching.value
    case 'ordering': return ordering.value
    case 'html_css': return htmlCss.value
    default: return null
  }
}
const esTipoEditable = (tipo: string): tipo is ExerciseTypeId => EXERCISE_TYPES.some((t) => t.id === tipo)

onMounted(async () => {
  try {
    const { pregunta, editable, entregas } = await respuestasDe(props.ejercicio.id)
    if (!pregunta || !esTipoEditable(pregunta.type)) { r.estado = 'sin-editor'; return }
    r.preguntaId = pregunta.id
    r.tipo = pregunta.type
    r.entregas = entregas
    if (!editable) { r.estado = 'bloqueado'; return }
    r.estado = 'editable'
    await nextTick()
    const editor = editorActivo()
    if (!editor) { r.estado = 'sin-editor'; return }
    editor.load(pregunta.config)
    const inicial = editor.validateAndGetConfig(f.totalPoints)
    r.base = inicial.valid ? stableJson(inicial.config) : ''
    if (props.variante) seccionRespuestas.value?.focus()
  } catch (err) {
    r.estado = 'error'
    r.error = messageOf(err, 'No se pudieron cargar las respuestas del ejercicio.')
  }
})

function alternarVistaPrevia() {
  r.errorEditor = null
  if (r.vistaPrevia) { r.vistaPrevia = false; return }
  const res = editorActivo()?.validateAndGetConfig(f.totalPoints)
  if (!res?.valid || typeof res.config !== 'object' || res.config === null) {
    r.errorEditor = res?.error || 'Revisa las respuestas del ejercicio antes de verlo como el estudiante.'
    return
  }
  r.vistaConfig = res.config as Record<string, unknown>
  r.vistaPrevia = true
}

async function guardarCambios() {
  if (!f.title.trim()) { error.value = 'El título es obligatorio.'; return }
  if (!f.description.trim()) { error.value = 'El enunciado no puede quedar vacío.'; return }
  // Se valida el editor de respuestas ANTES de guardar nada: si no valida, no se toca el ejercicio.
  r.errorEditor = null
  let config: unknown
  if (r.estado === 'editable') {
    const res = editorActivo()?.validateAndGetConfig(f.totalPoints)
    if (res && !res.valid) { r.errorEditor = res.error || 'Revisa las respuestas del ejercicio.'; return }
    config = res?.config
  }
  guardando.value = true
  error.value = await guardar(props.ejercicio.id, f, config !== undefined && r.preguntaId !== null ? { id: r.preguntaId, config } : null)
  guardando.value = false
  if (error.value) return
  advertencia.value = props.variante && config !== undefined && stableJson(config) === r.base
    ? 'La variante quedó igual al original: en un reintento el estudiante verá las mismas respuestas.'
    : null
  emit('cerrar')
}
</script>
