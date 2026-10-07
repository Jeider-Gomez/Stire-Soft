
<template>
  <div class="space-y-6 text-xs">

    <!-- Aviso de alcance (§25.3) -->
    <div class="p-3 rounded-lg bg-semantico-info/8 border border-semantico-info/30 text-semantico-info leading-relaxed">
      <span class="font-bold">Alcance de la calificación automática:</span>
      se evalúa presencia y jerarquía de etiquetas, atributos, textos, propiedades CSS declaradas y accesibilidad básica.
      <strong>No</strong> se califica posición, tamaño renderizado, <code class="font-mono">@media</code>/responsive ni animaciones; indícalo a los estudiantes en el enunciado.
    </div>

    <!-- ── 1. Código inicial ──────────────────────────────────────────────── -->
    <fieldset class="space-y-3">
      <legend class="font-bold text-base-texto-primario text-xs uppercase tracking-wider mb-2">
        1. Código inicial (lo que ve el estudiante al abrir el ejercicio)
      </legend>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label for="hc-starter-html" class="block font-semibold text-base-texto-primario mb-1">HTML inicial</label>
          <div class="rounded-md overflow-hidden border border-base-borde-fuerte focus-within:border-acento-ambar-fuerte" style="min-height:8rem">
            <CodeEditor
              id="hc-starter-html"
              v-model="starterHtml"
              language="html"
              aria-label="HTML inicial"
              placeholder="HTML de partida, puede estar vacío"
              min-height="8rem"
              class="w-full"
            />
          </div>
        </div>
        <div>
          <label for="hc-starter-css" class="block font-semibold text-base-texto-primario mb-1">CSS inicial</label>
          <div class="rounded-md overflow-hidden border border-base-borde-fuerte focus-within:border-acento-ambar-fuerte" style="min-height:8rem">
            <CodeEditor
              id="hc-starter-css"
              v-model="starterCss"
              language="css"
              aria-label="CSS inicial"
              placeholder="CSS de partida, puede estar vacío"
              min-height="8rem"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </fieldset>

    <!-- ── 2. Solución modelo ─────────────────────────────────────────────── -->
    <fieldset class="space-y-3">
      <legend class="font-bold text-base-texto-primario text-xs uppercase tracking-wider mb-2">
        2. Solución modelo
        <span class="font-normal text-base-texto-secundario">(no se muestra al estudiante; el sistema comprueba que cumple todas tus reglas)</span>
      </legend>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label for="hc-model-html" class="block font-semibold text-base-texto-primario mb-1">HTML de la solución *</label>
          <div class="rounded-md overflow-hidden border border-base-borde-fuerte focus-within:border-acento-ambar-fuerte" style="min-height:8rem">
            <CodeEditor
              id="hc-model-html"
              v-model="modelHtml"
              language="html"
              aria-label="HTML de la solución"
              placeholder="HTML que cumple el 100% de las reglas"
              min-height="8rem"
              class="w-full"
            />
          </div>
        </div>
        <div>
          <label for="hc-model-css" class="block font-semibold text-base-texto-primario mb-1">CSS de la solución</label>
          <div class="rounded-md overflow-hidden border border-base-borde-fuerte focus-within:border-acento-ambar-fuerte" style="min-height:8rem">
            <CodeEditor
              id="hc-model-css"
              v-model="modelCss"
              language="css"
              aria-label="CSS de la solución"
              placeholder="CSS que cumple el 100% de las reglas"
              min-height="8rem"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </fieldset>

    <!-- ── 3. Lista de reglas ─────────────────────────────────────────────── -->
    <fieldset class="space-y-3">
      <div class="flex items-center justify-between">
        <legend class="font-bold text-base-texto-primario text-xs uppercase tracking-wider">
          3. Reglas de calificación
          <span class="ml-1 text-base-texto-secundario font-normal">({{ rules.length }}/30 — al menos 1 pública)</span>
        </legend>
        <button
          type="button"
          :disabled="rules.length >= 30"
          @click="addRule"
          class="px-2.5 py-1 rounded text-xs font-bold bg-acento-ambar/15 text-acento-ambar-fuerte hover:bg-acento-ambar/25 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte disabled:opacity-40"
        >
          <span>+</span><span>Agregar regla</span>
        </button>
      </div>

      <div v-if="rules.length === 0" class="text-base-texto-secundario italic py-2">
        Agrega al menos una regla.
      </div>

      <DocenteExerciseBuildersEditorReglaHtmlCss
        v-for="(rule, idx) in rules"
        :key="rule._key"
        :rule="rule"
        :idx="idx"
        :total="rules.length"
        @mover="(d) => moveRule(idx, d)"
        @quitar="removeRule(idx)"
      />
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { MAX_REGLAS, defaultRule, ejercicioDesdeConfig, validarEjercicio, type RuleItem } from '~/utils/reglasHtmlCss'

/**
 * Configurar un ejercicio HTML/CSS: código inicial, solución modelo y reglas. La lógica de las reglas (crear, convertir,
 * leer y validar) está en utils/reglasHtmlCss.ts, con prueba; cada regla se edita en EditorReglaHtmlCss.vue.
 */
const starterHtml = ref('')
const starterCss = ref('')
const modelHtml = ref('')
const modelCss = ref('')
const rules = ref<RuleItem[]>([defaultRule()])

function addRule() {
  if (rules.value.length >= MAX_REGLAS) return
  rules.value.push(defaultRule())
}

function removeRule(index: number) {
  rules.value.splice(index, 1)
}

function moveRule(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= rules.value.length) return
  const temp = rules.value[index]!
  rules.value[index] = rules.value[target]!
  rules.value[target] = temp
}

function load(config: unknown) {
  const e = ejercicioDesdeConfig(config)
  starterHtml.value = e.starterHtml
  starterCss.value = e.starterCss
  modelHtml.value = e.modelHtml
  modelCss.value = e.modelCss
  // Sin reglas guardadas se conserva la lista actual (como antes).
  if (e.rules.length > 0) rules.value = e.rules
}

function reset() {
  starterHtml.value = ''
  starterCss.value = ''
  modelHtml.value = ''
  modelCss.value = ''
  rules.value = [defaultRule()]
}

function validateAndGetConfig(_totalPoints: number): { valid: boolean; error?: string; config?: unknown } {
  return validarEjercicio({ starterHtml: starterHtml.value, starterCss: starterCss.value, modelHtml: modelHtml.value, modelCss: modelCss.value, rules: rules.value })
}

defineExpose({ validateAndGetConfig, reset, load })
</script>
