<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[60] bg-base-bg-secundario flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lesson-editor-heading">
      <!-- Barra superior -->
      <header class="flex items-center justify-between gap-3 px-5 py-3 bg-base-blanco border-b border-base-borde-sutil">
        <div class="min-w-0">
          <p class="text-[11px] text-base-texto-secundario truncate">{{ unitTitle }}</p>
          <h2 id="lesson-editor-heading" class="text-sm font-bold text-base-texto-primario">
            {{ isEditing ? 'Editar lección' : 'Nueva lección' }}
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <p v-if="error" role="alert" class="text-[11px] text-semantico-falla max-w-xs">{{ error }}</p>
          <button type="button" @click="$emit('cancel')"
            class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario">
            Cancelar
          </button>
          <button type="button" :disabled="saving" @click="save"
            class="px-5 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco text-xs font-bold hover:bg-acento-ambar disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
            {{ saving ? 'Guardando…' : 'Guardar lección' }}
          </button>
        </div>
      </header>

      <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2">
        <!-- Escritura -->
        <section class="flex flex-col min-h-0 p-5 gap-3 bg-base-blanco lg:border-r border-base-borde-sutil">
          <label for="lesson-title-input" class="sr-only">Título de la lección</label>
          <input
            id="lesson-title-input"
            ref="titleRef"
            v-model="title"
            type="text"
            placeholder="Título de la lección (ej.: ¿Qué es una variable?)"
            class="w-full text-lg font-bold text-base-texto-primario px-1 py-1 border-0 border-b border-base-borde-sutil focus:border-acento-ambar-fuerte outline-none" />

          <div class="flex flex-wrap items-center gap-1" role="toolbar" aria-label="Formato del texto">
            <button v-for="t in TOOLS" :key="t.label" type="button" @click="apply(t.action)"
              class="p-1.5 rounded text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
              :title="t.label" :aria-label="t.label">
              <component :is="t.icon" :size="16" aria-hidden="true" />
            </button>
            <span class="mx-1 h-5 w-px bg-base-borde-sutil" aria-hidden="true"></span>
            <button type="button" @click="insertTemplate"
              class="px-2 py-1 rounded text-[11px] font-semibold text-acento-ambar-fuerte hover:bg-acento-ambar/10 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
              Usar plantilla de lección
            </button>
          </div>

          <label for="lesson-body-input" class="sr-only">Contenido de la lección</label>
          <textarea
            id="lesson-body-input"
            ref="bodyRef"
            v-model="body"
            @keydown="onKeydown"
            placeholder="Explica la idea con tus palabras, pon un ejemplo en un bloque de código y cierra con algo para que el estudiante pruebe."
            class="flex-1 min-h-[16rem] w-full resize-none rounded-lg border border-base-borde-sutil p-3 font-mono text-[13px] leading-relaxed text-base-texto-primario focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30"></textarea>
          <p class="text-[10px] text-base-texto-secundario">
            Atajos: Ctrl+B negrita · Ctrl+I cursiva · Ctrl+E código · Tab sangría en los bloques de código.
          </p>
        </section>

        <!-- Vista previa en vivo -->
        <section class="min-h-0 overflow-y-auto p-6" aria-label="Vista previa de la lección">
          <p class="text-[10px] font-bold uppercase tracking-wider text-base-texto-secundario mb-3">Así la verá el estudiante</p>
          <article class="max-w-2xl bg-base-blanco rounded-xl border border-base-borde-sutil p-6 space-y-3">
            <h3 class="text-base font-bold text-base-texto-primario">{{ title || 'Título de la lección' }}</h3>
            <div v-if="body.trim()" class="prose prose-xs max-w-none text-sm text-base-texto-primario space-y-2" v-html="previewHtml"></div>
            <p v-else class="text-xs text-base-texto-secundario italic">La vista previa aparece mientras escribes.</p>
          </article>
        </section>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Heading2, Bold, Italic, Code, SquareCode, List, ListOrdered } from 'lucide-vue-next'
import { formatMarkdown } from '~/utils/formatMarkdown'

const props = defineProps<{
  unitTitle: string
  isEditing: boolean
  initialTitle: string
  initialBody: string
  saving: boolean
  error: string | null
}>()
const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'save', payload: { title: string; body: string }): void
}>()

type Action = 'h2' | 'bold' | 'italic' | 'code' | 'block' | 'list' | 'olist'
const TOOLS: Array<{ label: string; icon: unknown; action: Action }> = [
  { label: 'Subtítulo', icon: Heading2, action: 'h2' },
  { label: 'Negrita (Ctrl+B)', icon: Bold, action: 'bold' },
  { label: 'Cursiva (Ctrl+I)', icon: Italic, action: 'italic' },
  { label: 'Código en línea (Ctrl+E)', icon: Code, action: 'code' },
  { label: 'Bloque de código', icon: SquareCode, action: 'block' },
  { label: 'Lista', icon: List, action: 'list' },
  { label: 'Lista numerada', icon: ListOrdered, action: 'olist' }
]

// Estructura de una lección que funciona con principiantes: idea, ejemplo, error típico y algo para probar.
const TEMPLATE = `## La idea

Explica el concepto en dos o tres frases, con un ejemplo de la vida diaria.

## Un ejemplo

\`\`\`javascript
let edad = 18;
console.log(edad);
\`\`\`

Qué hace cada línea:

- \`let edad = 18;\` guarda el número 18 con el nombre \`edad\`.
- \`console.log(edad);\` lo muestra en pantalla.

## Error común

Qué suele salir mal la primera vez y cómo darse cuenta.

## Pruébalo

Una pregunta corta para que el estudiante piense antes de pasar a los ejercicios.
`

const title = ref(props.initialTitle)
const body = ref(props.initialBody)
const titleRef = ref<HTMLInputElement | null>(null)
const bodyRef = ref<HTMLTextAreaElement | null>(null)

const previewHtml = computed(() => formatMarkdown(body.value, { escapeHtml: true }))

function replaceSelection(transform: (selected: string) => { text: string; cursorStart: number; cursorEnd: number }) {
  const el = bodyRef.value
  if (!el) return
  const { selectionStart: s, selectionEnd: e } = el
  const selected = body.value.slice(s, e)
  const out = transform(selected)
  body.value = body.value.slice(0, s) + out.text + body.value.slice(e)
  nextTick(() => {
    el.focus()
    el.setSelectionRange(s + out.cursorStart, s + out.cursorEnd)
  })
}

function wrap(before: string, after: string, placeholder: string) {
  replaceSelection((sel) => {
    const inner = sel || placeholder
    return { text: before + inner + after, cursorStart: before.length, cursorEnd: before.length + inner.length }
  })
}

function prefixLines(prefix: (i: number) => string, placeholder: string) {
  replaceSelection((sel) => {
    const lines = (sel || placeholder).split('\n')
    const text = lines.map((l, i) => prefix(i) + l).join('\n')
    return { text, cursorStart: 0, cursorEnd: text.length }
  })
}

function apply(action: Action) {
  switch (action) {
    case 'h2': return prefixLines(() => '## ', 'Subtítulo')
    case 'bold': return wrap('**', '**', 'texto importante')
    case 'italic': return wrap('*', '*', 'texto')
    case 'code': return wrap('`', '`', 'codigo')
    case 'block': return wrap('\n```javascript\n', '\n```\n', '// tu ejemplo aquí')
    case 'list': return prefixLines(() => '- ', 'elemento')
    case 'olist': return prefixLines((i) => `${i + 1}. `, 'paso')
  }
}

function onKeydown(ev: KeyboardEvent) {
  if ((ev.ctrlKey || ev.metaKey) && ['b', 'i', 'e'].includes(ev.key.toLowerCase())) {
    ev.preventDefault()
    apply(({ b: 'bold', i: 'italic', e: 'code' } as const)[ev.key.toLowerCase() as 'b' | 'i' | 'e'])
    return
  }
  // Tab escribe una sangría (para los bloques de código) en lugar de salir del cuadro. Shift+Tab sigue saliendo.
  if (ev.key === 'Tab' && !ev.shiftKey) {
    ev.preventDefault()
    replaceSelection(() => ({ text: '  ', cursorStart: 2, cursorEnd: 2 }))
  }
}

function insertTemplate() {
  body.value = body.value.trim() ? `${body.value.trimEnd()}\n\n${TEMPLATE}` : TEMPLATE
  nextTick(() => bodyRef.value?.focus())
}

function save() {
  emit('save', { title: title.value.trim(), body: body.value.trim() })
}

onMounted(() => nextTick(() => (props.initialTitle ? bodyRef.value : titleRef.value)?.focus()))
</script>
