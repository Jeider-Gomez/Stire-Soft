
<template>
  <div class="space-y-6 text-xs">

    <!-- Aviso de alcance (§25.3) -->
    <div class="p-3 rounded-lg bg-semantico-info/8 border border-semantico-info/30 text-semantico-info leading-relaxed">
      <span class="font-bold">ℹ Alcance de la calificación automática:</span>
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
          <span>+</span><span>Agregar Regla</span>
        </button>
      </div>

      <div v-if="rules.length === 0" class="text-base-texto-secundario italic py-2">
        Agrega al menos una regla.
      </div>

      <div
        v-for="(rule, idx) in rules"
        :key="rule._key"
        class="rounded-lg border border-base-borde-fuerte bg-base-bg-secundario/40 p-3 space-y-3"
      >
        <!-- Cabecera de la regla -->
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 rounded bg-acento-ambar/20 text-acento-ambar-fuerte font-bold text-[10px] flex items-center justify-center shrink-0">
            {{ idx + 1 }}
          </span>
          <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label :for="`hc-rule-id-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">ID (a-z0-9_-) *</label>
              <input
                :id="`hc-rule-id-${idx}`"
                v-model="rule.id"
                type="text"
                maxlength="40"
                placeholder="ej: tiene_h1"
                class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono"
              />
            </div>
            <div>
              <label :for="`hc-rule-label-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Etiqueta visible *</label>
              <input
                :id="`hc-rule-label-${idx}`"
                v-model="rule.label"
                type="text"
                maxlength="160"
                placeholder="Hay un h1 con el texto Hola"
                class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none"
              />
            </div>
          </div>
          <!-- Controles de orden y borrado -->
          <div class="flex items-center gap-0.5 shrink-0">
            <button
              :disabled="idx === 0"
              type="button"
              @click="moveRule(idx, -1)"
              class="p-1 text-base-texto-secundario hover:text-base-texto-primario disabled:opacity-30 rounded"
              title="Subir regla"
            >▲</button>
            <button
              :disabled="idx === rules.length - 1"
              type="button"
              @click="moveRule(idx, 1)"
              class="p-1 text-base-texto-secundario hover:text-base-texto-primario disabled:opacity-30 rounded"
              title="Bajar regla"
            >▼</button>
            <button
              type="button"
              @click="removeRule(idx)"
              class="p-1 text-semantico-falla hover:bg-semantico-falla/10 rounded transition-colors"
              :aria-label="`Eliminar regla ${idx + 1}`"
            >✕</button>
          </div>
        </div>

        <!-- Pista, visibilidad y peso -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
          <div class="sm:col-span-2">
            <label :for="`hc-rule-hint-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Pista (opcional)</label>
            <input
              :id="`hc-rule-hint-${idx}`"
              v-model="rule.hint"
              type="text"
              maxlength="240"
              placeholder="Usa la etiqueta header..."
              class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none"
            />
          </div>
          <div class="flex items-center gap-3">
            <label :for="`hc-rule-public-${idx}`" class="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                :id="`hc-rule-public-${idx}`"
                type="checkbox"
                v-model="rule.isPublic"
                class="accent-acento-ambar-fuerte h-3.5 w-3.5 rounded"
              />
              <span class="text-[10px] font-semibold text-base-texto-primario">Pública</span>
            </label>
            <div class="flex-1">
              <label :for="`hc-rule-weight-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Peso (1-100)</label>
              <input
                :id="`hc-rule-weight-${idx}`"
                v-model.number="rule.weight"
                type="number"
                min="1"
                max="100"
                class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <!-- Tipo de comprobación -->
        <div class="space-y-2">
          <div>
            <label :for="`hc-rule-kind-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Tipo de comprobación *</label>
            <select
              :id="`hc-rule-kind-${idx}`"
              v-model="rule.kind"
              @change="onKindChange(rule)"
              class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none"
            >
              <option value="element_exists">element_exists — existe el selector (min. 1)</option>
              <option value="element_count">element_count — número exacto o rango de elementos</option>
              <option value="text">text — texto de un elemento (contiene / igual)</option>
              <option value="attribute">attribute — atributo de un elemento</option>
              <option value="css_property">css_property — propiedad CSS calculada</option>
              <option value="a11y">a11y — comprobación de accesibilidad</option>
            </select>
          </div>

          <!-- element_exists -->
          <div v-if="rule.kind === 'element_exists'" class="grid grid-cols-2 gap-2">
            <div>
              <label :for="`hc-rule-sel-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Selector CSS *</label>
              <input :id="`hc-rule-sel-${idx}`" v-model="rule.selector" type="text" placeholder="h1, .tarjeta, img"
                class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
            </div>
            <div>
              <label :for="`hc-rule-min-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Min. ocurrencias (por defecto 1)</label>
              <input :id="`hc-rule-min-${idx}`" v-model.number="rule.min" type="number" min="1" placeholder="1"
                class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
            </div>
          </div>

          <!-- element_count -->
          <div v-else-if="rule.kind === 'element_count'" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div class="sm:col-span-2">
              <label :for="`hc-rule-sel2-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Selector CSS *</label>
              <input :id="`hc-rule-sel2-${idx}`" v-model="rule.selector" type="text" placeholder="li, .item"
                class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
            </div>
            <div>
              <label :for="`hc-rule-equals-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Exacto</label>
              <input :id="`hc-rule-equals-${idx}`" v-model.number="rule.equals" type="number" min="0"
                class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
            </div>
            <div class="grid grid-cols-2 gap-1">
              <div>
                <label :for="`hc-rule-cmin-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Min.</label>
                <input :id="`hc-rule-cmin-${idx}`" v-model.number="rule.min" type="number" min="0"
                  class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
              </div>
              <div>
                <label :for="`hc-rule-cmax-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Max.</label>
                <input :id="`hc-rule-cmax-${idx}`" v-model.number="rule.max" type="number" min="0"
                  class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
              </div>
            </div>
          </div>

          <!-- text -->
          <div v-else-if="rule.kind === 'text'" class="space-y-2">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label :for="`hc-rule-sel3-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Selector CSS *</label>
                <input :id="`hc-rule-sel3-${idx}`" v-model="rule.selector" type="text" placeholder="h1, p.intro"
                  class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
              </div>
              <div>
                <label :for="`hc-rule-mode-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Modo *</label>
                <select :id="`hc-rule-mode-${idx}`" v-model="rule.mode"
                  class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none">
                  <option value="contains">contains</option>
                  <option value="equals">equals</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label :for="`hc-rule-value-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Valor *</label>
                <input :id="`hc-rule-value-${idx}`" v-model="rule.value" type="text" placeholder="Hola Mundo"
                  class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
              </div>
              <div class="flex items-end pb-1.5">
                <label :for="`hc-rule-case-${idx}`" class="flex items-center gap-1.5 cursor-pointer select-none">
                  <input :id="`hc-rule-case-${idx}`" type="checkbox" v-model="rule.caseSensitive"
                    class="accent-acento-ambar-fuerte h-3.5 w-3.5 rounded" />
                  <span class="text-[10px] font-semibold text-base-texto-primario">Distinguir mayusculas</span>
                </label>
              </div>
            </div>
          </div>

          <!-- attribute -->
          <div v-else-if="rule.kind === 'attribute'" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label :for="`hc-rule-sel4-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Selector CSS *</label>
              <input :id="`hc-rule-sel4-${idx}`" v-model="rule.selector" type="text" placeholder="img, a"
                class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
            </div>
            <div>
              <label :for="`hc-rule-attr-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Atributo *</label>
              <input :id="`hc-rule-attr-${idx}`" v-model="rule.name" type="text" placeholder="alt, href, lang"
                class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
            </div>
            <div>
              <label :for="`hc-rule-amode-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Modo *</label>
              <select :id="`hc-rule-amode-${idx}`" v-model="rule.attrMode"
                class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none">
                <option value="exists">exists</option>
                <option value="equals">equals</option>
                <option value="contains">contains</option>
              </select>
            </div>
            <div>
              <label :for="`hc-rule-aval-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Valor (si no es exists)</label>
              <input :id="`hc-rule-aval-${idx}`" v-model="rule.attrValue" type="text" :disabled="rule.attrMode === 'exists'" placeholder="es, https://..."
                class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none disabled:opacity-40" />
            </div>
          </div>

          <!-- css_property -->
          <div v-else-if="rule.kind === 'css_property'" class="space-y-2">
            <p class="text-[10px] text-base-texto-secundario">
              Compara el valor calculado de la propiedad. Los colores (#F00, red, rgb(255,0,0)) se consideran iguales.
              Para otras propiedades lista todas las variantes aceptables separadas por coma (ej: 0 auto, 0px auto).
            </p>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label :for="`hc-rule-sel5-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Selector CSS *</label>
                <input :id="`hc-rule-sel5-${idx}`" v-model="rule.selector" type="text" placeholder=".tarjeta, header"
                  class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
              </div>
              <div>
                <label :for="`hc-rule-prop-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Propiedad CSS *</label>
                <input :id="`hc-rule-prop-${idx}`" v-model="rule.property" type="text" placeholder="display, color"
                  class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
              </div>
              <div>
                <label :for="`hc-rule-oneof-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Valores aceptados (sep. coma) *</label>
                <input :id="`hc-rule-oneof-${idx}`" v-model="rule.oneOfRaw" type="text" placeholder="flex, inline-flex"
                  class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
              </div>
            </div>
          </div>

          <!-- a11y -->
          <div v-else-if="rule.kind === 'a11y'" class="space-y-2">
            <p class="text-[10px] text-base-texto-secundario leading-relaxed">
              <strong>Si el elemento no existe, la comprobación pasa</strong> (sin imágenes, img_alt se cumple).
              Para exigir imágenes combina con element_exists sobre img.
              html_lang y document_title exigen un documento completo (doctype html); con un fragmento fallan.
            </p>
            <div>
              <label :for="`hc-rule-a11y-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Comprobación *</label>
              <select :id="`hc-rule-a11y-${idx}`" v-model="rule.a11yCheck"
                class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none">
                <option value="img_alt">img_alt — todas las img tienen alt</option>
                <option value="form_labels">form_labels — todos los campos tienen label</option>
                <option value="html_lang">html_lang — html tiene atributo lang (doc. completo)</option>
                <option value="document_title">document_title — title no esta vacio (doc. completo)</option>
                <option value="single_h1">single_h1 — exactamente un h1</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
type RuleKind = 'element_exists' | 'element_count' | 'text' | 'attribute' | 'css_property' | 'a11y'

interface RuleItem {
  _key: string
  id: string
  label: string
  hint: string
  isPublic: boolean
  weight: number
  kind: RuleKind
  selector: string
  min: number | undefined
  equals: number | undefined
  max: number | undefined
  mode: 'contains' | 'equals'
  value: string
  caseSensitive: boolean
  name: string
  attrMode: 'exists' | 'equals' | 'contains'
  attrValue: string
  property: string
  oneOfRaw: string
  a11yCheck: 'img_alt' | 'form_labels' | 'html_lang' | 'document_title' | 'single_h1'
}

const starterHtml = ref('')
const starterCss = ref('')
const modelHtml = ref('')
const modelCss = ref('')

let _keyCounter = 0
function makeKey() { return `r${++_keyCounter}` }

function defaultRule(): RuleItem {
  return {
    _key: makeKey(),
    id: '',
    label: '',
    hint: '',
    isPublic: true,
    weight: 10,
    kind: 'element_exists',
    selector: '',
    min: undefined,
    equals: undefined,
    max: undefined,
    mode: 'contains',
    value: '',
    caseSensitive: false,
    name: '',
    attrMode: 'exists',
    attrValue: '',
    property: '',
    oneOfRaw: '',
    a11yCheck: 'img_alt',
  }
}

const rules = ref<RuleItem[]>([defaultRule()])

function addRule() {
  if (rules.value.length >= 30) return
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

function onKindChange(rule: RuleItem) {
  rule.selector = ''
  rule.min = undefined
  rule.equals = undefined
  rule.max = undefined
  rule.mode = 'contains'
  rule.value = ''
  rule.caseSensitive = false
  rule.name = ''
  rule.attrMode = 'exists'
  rule.attrValue = ''
  rule.property = ''
  rule.oneOfRaw = ''
  rule.a11yCheck = 'img_alt'
}

function buildCheck(rule: RuleItem): object {
  switch (rule.kind) {
    case 'element_exists': {
      const obj: Record<string, unknown> = { kind: 'element_exists', selector: rule.selector }
      const m = Number(rule.min)
      if (rule.min !== undefined && !isNaN(m)) obj.min = m
      return obj
    }
    case 'element_count': {
      const obj: Record<string, unknown> = { kind: 'element_count', selector: rule.selector }
      const eq = Number(rule.equals)
      const mn = Number(rule.min)
      const mx = Number(rule.max)
      if (rule.equals !== undefined && !isNaN(eq)) obj.equals = eq
      if (rule.min !== undefined && !isNaN(mn)) obj.min = mn
      if (rule.max !== undefined && !isNaN(mx)) obj.max = mx
      return obj
    }
    case 'text': {
      const obj: Record<string, unknown> = { kind: 'text', selector: rule.selector, mode: rule.mode, value: rule.value }
      if (rule.caseSensitive) obj.caseSensitive = true
      return obj
    }
    case 'attribute': {
      const obj: Record<string, unknown> = { kind: 'attribute', selector: rule.selector, name: rule.name, mode: rule.attrMode }
      if (rule.attrMode !== 'exists' && rule.attrValue.trim()) obj.value = rule.attrValue.trim()
      return obj
    }
    case 'css_property': {
      const oneOf = rule.oneOfRaw.split(',').map((s: string) => s.trim()).filter(Boolean)
      return { kind: 'css_property', selector: rule.selector, property: rule.property, oneOf }
    }
    case 'a11y':
      return { kind: 'a11y', check: rule.a11yCheck }
    default:
      return { kind: rule.kind }
  }
}

function reset() {
  starterHtml.value = ''
  starterCss.value = ''
  modelHtml.value = ''
  modelCss.value = ''
  rules.value = [defaultRule()]
}

function validateAndGetConfig(_totalPoints: number): { valid: boolean; error?: string; config?: unknown } {
  if (!modelHtml.value.trim()) {
    return { valid: false, error: 'La solución modelo (HTML) es obligatoria.' }
  }
  if (rules.value.length === 0) {
    return { valid: false, error: 'Debes agregar al menos una regla.' }
  }
  if (rules.value.length > 30) {
    return { valid: false, error: 'Solo se permiten hasta 30 reglas.' }
  }
  if (!rules.value.some((r: RuleItem) => r.isPublic)) {
    return { valid: false, error: 'Al menos una regla debe ser publica (visible al estudiante).' }
  }

  const ids = new Set<string>()
  for (let i = 0; i < rules.value.length; i++) {
    const rule = rules.value[i]!
    const num = i + 1

    if (!rule.id.trim()) return { valid: false, error: `Regla ${num}: el ID no puede estar vacio.` }
    if (!/^[a-z0-9_-]{1,40}$/.test(rule.id.trim())) {
      return { valid: false, error: `Regla ${num}: el ID solo puede tener letras minusculas, digitos, guion o guion_bajo (max 40).` }
    }
    if (ids.has(rule.id.trim())) return { valid: false, error: `Regla ${num}: ID duplicado «${rule.id}».` }
    ids.add(rule.id.trim())

    if (!rule.label.trim()) return { valid: false, error: `Regla ${num}: la etiqueta no puede estar vacia.` }

    const w = Number(rule.weight)
    if (!Number.isInteger(w) || w < 1 || w > 100) {
      return { valid: false, error: `Regla ${num}: el peso debe ser un entero entre 1 y 100.` }
    }

    if (rule.kind !== 'a11y' && !rule.selector.trim()) {
      return { valid: false, error: `Regla ${num}: el selector CSS no puede estar vacio.` }
    }
    if (rule.kind === 'text' && !rule.value.trim()) {
      return { valid: false, error: `Regla ${num}: el valor del texto no puede estar vacio.` }
    }
    if (rule.kind === 'attribute') {
      if (!rule.name.trim()) return { valid: false, error: `Regla ${num}: el nombre del atributo no puede estar vacio.` }
      if (rule.attrMode !== 'exists' && !rule.attrValue.trim()) {
        return { valid: false, error: `Regla ${num}: debes especificar el valor del atributo para el modo «${rule.attrMode}».` }
      }
    }
    if (rule.kind === 'css_property') {
      if (!rule.property.trim()) return { valid: false, error: `Regla ${num}: el nombre de la propiedad CSS no puede estar vacio.` }
      if (!rule.oneOfRaw.split(',').map((s: string) => s.trim()).filter(Boolean).length) {
        return { valid: false, error: `Regla ${num}: especifica al menos un valor aceptado.` }
      }
    }
  }

  const builtRules = rules.value.map((rule: RuleItem) => {
    const r: Record<string, unknown> = {
      id: rule.id.trim(),
      label: rule.label.trim(),
      isPublic: rule.isPublic,
      weight: Number(rule.weight),
      check: buildCheck(rule),
    }
    if (rule.hint.trim()) r.hint = rule.hint.trim()
    return r
  })

  return {
    valid: true,
    config: {
      starterHtml: starterHtml.value,
      starterCss: starterCss.value,
      rules: builtRules,
      modelSolution: { html: modelHtml.value, css: modelCss.value },
    },
  }
}

defineExpose({ validateAndGetConfig, reset })
</script>

