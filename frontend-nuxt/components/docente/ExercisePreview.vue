<template>
  <div class="space-y-4">
    <p class="text-[11px] text-base-texto-secundario flex items-center gap-1.5">
      <Eye :size="14" aria-hidden="true" />
      Así lo verá el estudiante. Puedes probar a responder: nada de lo que hagas aquí se guarda.
    </p>

    <div class="rounded-xl border border-base-borde-fuerte bg-base-blanco p-5">
      <h3 class="text-sm font-bold text-base-texto-primario mb-3">{{ title || 'Ejercicio sin título' }}</h3>

      <!-- Programar: enunciado, código inicial y casos visibles -->
      <template v-if="type === 'coding'">
        <div class="prose prose-xs max-w-none text-base-texto-primario" v-html="statementHtml"></div>
        <div v-if="previewConfig.starterCode" class="mt-3">
          <p class="text-[11px] font-semibold text-base-texto-secundario mb-1">Código con el que empieza</p>
          <pre class="rounded-lg bg-base-texto-primario text-base-blanco text-[11px] p-3 overflow-x-auto"><code>{{ previewConfig.starterCode }}</code></pre>
        </div>
        <div class="mt-3 text-xs">
          <p class="font-semibold text-base-texto-primario mb-1">Casos de prueba que puede ver</p>
          <table v-if="previewConfig.testCases?.length" class="w-full text-[11px] border border-base-borde-sutil rounded">
            <thead class="bg-base-bg-secundario text-base-texto-secundario">
              <tr><th class="p-1.5 text-left">Entrada</th><th class="p-1.5 text-left">Salida esperada</th></tr>
            </thead>
            <tbody>
              <tr v-for="(tc, i) in previewConfig.testCases" :key="i" class="border-t border-base-borde-sutil font-mono">
                <td class="p-1.5 whitespace-pre">{{ tc.input }}</td>
                <td class="p-1.5 whitespace-pre">{{ tc.expectedOutput }}</td>
              </tr>
            </tbody>
          </table>
          <p class="text-[11px] text-base-texto-secundario mt-1">
            Y {{ previewConfig.hiddenTestCaseCount || 0 }} caso(s) oculto(s) que solo cuentan al entregar.
          </p>
        </div>
      </template>

      <!-- HTML y CSS: enunciado y reglas visibles -->
      <template v-else-if="type === 'html_css'">
        <div class="prose prose-xs max-w-none text-base-texto-primario" v-html="statementHtml"></div>
        <p class="text-xs font-semibold text-base-texto-primario mt-3 mb-1">Reglas que debe cumplir</p>
        <ul class="text-xs list-disc pl-5 text-base-texto-primario">
          <li v-for="r in previewConfig.publicRules || []" :key="r.id">{{ r.label }}</li>
        </ul>
        <p class="text-[11px] text-base-texto-secundario mt-1">
          Y {{ previewConfig.hiddenRuleCount || 0 }} regla(s) oculta(s) que solo cuentan al entregar.
        </p>
      </template>

      <!-- Los demás tipos: el mismo componente que usa el estudiante -->
      <template v-else>
        <div class="prose prose-sm max-w-none text-base-texto-primario mb-4" v-html="statementHtml"></div>
        <ExerciseMcqExercise v-if="type === 'mcq'" :question="question" :show-statement="false" />
        <ExerciseFillCodeExercise v-else-if="type === 'fill_code'" :question="question" :show-statement="false" />
        <ExerciseDragDropExercise v-else-if="type === 'drag_drop'" :question="question" :show-statement="false" />
        <ExerciseOrderingExercise v-else-if="type === 'ordering'" :question="question" :show-statement="false" />
        <ExerciseMatchingExercise v-else-if="type === 'matching'" :question="question" :show-statement="false" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye } from 'lucide-vue-next'
import { useWorkspaceStore } from '~/stores/workspace'
import { toStudentPreviewConfig } from '~/utils/exercisePreview'
import { formatMarkdown } from '~/utils/formatMarkdown'

const props = defineProps<{
  type: string
  title: string
  statement: string
  /** Configuración completa del constructor (con respuestas); aquí se les quitan. */
  config: Record<string, any>
}>()

const previewConfig = computed(() => toStudentPreviewConfig(props.type, props.config))
const question = computed(() => ({ id: 0, type: props.type, question: props.statement, config: previewConfig.value }))
const statementHtml = computed(() => formatMarkdown(props.statement || '', { escapeHtml: true }))

// Los componentes del estudiante escriben su respuesta en el store del ejercicio: se limpia al cerrar la vista
// previa para que no quede una respuesta «pendiente» de mentira.
const workspaceStore = useWorkspaceStore()
onBeforeUnmount(() => { workspaceStore.pendingAnswer = null })
</script>
