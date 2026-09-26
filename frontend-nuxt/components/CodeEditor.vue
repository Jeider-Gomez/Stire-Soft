<template>
  <div
    class="code-editor-root relative w-full h-full flex flex-col font-codigo text-xs overflow-hidden"
    :style="{ minHeight: minHeight || '12rem' }"
  >
    <!-- Contenedor del Editor CodeMirror 6 -->
    <div
      v-show="isLoaded && !isFallback"
      ref="editorContainer"
      class="cm-host-container flex-1 w-full flex flex-col overflow-hidden"
    ></div>

    <!-- Fallback Funcional: textarea mientras carga o ante fallo de red -->
    <textarea
      v-if="!isLoaded || isFallback"
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :readonly="readOnly"
      :aria-label="ariaLabel"
      spellcheck="false"
      class="flex-1 w-full h-full bg-[#1e1e1e] text-[#d4d4d4] font-codigo text-xs p-3 leading-relaxed outline-none resize-none selection:bg-[#264f78]"
      @input="onFallbackInput"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import type { Compartment, Extension } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import type { HighlightLanguage } from '~/utils/codeLanguages'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    language?: HighlightLanguage | string
    ariaLabel?: string
    placeholder?: string
    readOnly?: boolean
    minHeight?: string
    id?: string
  }>(),
  {
    modelValue: '',
    language: 'text',
    ariaLabel: 'Editor de código',
    placeholder: '',
    readOnly: false,
    minHeight: '12rem',
    id: undefined
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editorContainer = ref<HTMLDivElement | null>(null)
const isLoaded = ref(false)
const isFallback = ref(false)

// Solo tipos: CodeMirror se sigue cargando bajo demanda con import() dentro de onMounted.
let view: EditorView | null = null
let languageCompartment: Compartment | null = null
let readOnlyCompartment: Compartment | null = null
let tabTrapDisabled = false
// Teclas que no cancelan el «Esc»: sin esto, soltar Esc y pulsar Shift+Tab nunca salía del editor hacia atrás.
const MODIFIER_KEYS = new Set(['Escape', 'Tab', 'Shift', 'Control', 'Alt', 'Meta'])

function onFallbackInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

async function loadLanguageExtension(lang: string): Promise<Extension> {
  switch (lang) {
    case 'javascript': {
      const { javascript } = await import('@codemirror/lang-javascript')
      return javascript()
    }
    case 'html': {
      const { html } = await import('@codemirror/lang-html')
      return html({ autoCloseTags: true })
    }
    case 'css': {
      const { css } = await import('@codemirror/lang-css')
      return css()
    }
    case 'python': {
      const { python } = await import('@codemirror/lang-python')
      return python()
    }
    case 'sql': {
      const { sql } = await import('@codemirror/lang-sql')
      return sql()
    }
    case 'text':
    default:
      return []
  }
}

onMounted(async () => {
  try {
    const [
      { EditorState, Compartment },
      {
        EditorView,
        lineNumbers,
        highlightActiveLineGutter,
        highlightSpecialChars,
        drawSelection,
        dropCursor,
        rectangularSelection,
        crosshairCursor,
        highlightActiveLine,
        keymap,
        placeholder: cmPlaceholder
      },
      { defaultKeymap, history, historyKeymap, indentMore, indentLess },
      {
        indentOnInput,
        syntaxHighlighting,
        bracketMatching,
        HighlightStyle
      },
      { closeBrackets, closeBracketsKeymap },
      { tags: t }
    ] = await Promise.all([
      import('@codemirror/state'),
      import('@codemirror/view'),
      import('@codemirror/commands'),
      import('@codemirror/language'),
      import('@codemirror/autocomplete'),
      import('@lezer/highlight')
    ])

    if (!editorContainer.value) return

    languageCompartment = new Compartment()
    readOnlyCompartment = new Compartment()

    // Tema visual oscuro integrado con la estética de STIRE (#1e1e1e)
    const stireTheme = EditorView.theme(
      {
        '&': {
          color: '#d4d4d4',
          backgroundColor: '#1e1e1e',
          height: '100%',
          fontSize: '12px',
          fontFamily: 'var(--font-codigo, monospace)'
        },
        '.cm-scroller': {
          overflow: 'auto',
          lineHeight: '1.6',
          fontFamily: 'var(--font-codigo, monospace)'
        },
        '.cm-content': {
          caretColor: '#d4d4d4',
          padding: '12px 4px',
          fontFamily: 'var(--font-codigo, monospace)'
        },
        '&.cm-focused': {
          outline: 'none'
        },
        '.cm-cursor, .cm-dropCursor': {
          borderLeftColor: '#d4d4d4'
        },
        '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
          backgroundColor: '#264f78 !important'
        },
        '.cm-panels': {
          backgroundColor: '#252526',
          color: '#d4d4d4'
        },
        '.cm-panels.cm-panels-top': {
          borderBottom: '1px solid #333333'
        },
        '.cm-panels.cm-panels-bottom': {
          borderTop: '1px solid #333333'
        },
        '.cm-activeLine': {
          backgroundColor: '#28282840'
        },
        '.cm-gutters': {
          backgroundColor: '#1e1e1e',
          color: '#5a5a5a',
          borderRight: '1px solid #2d2d2d',
          userSelect: 'none'
        },
        '.cm-activeLineGutter': {
          backgroundColor: '#28282860',
          color: '#d4d4d4'
        },
        '.cm-lineNumbers .cm-gutterElement': {
          padding: '0 8px 0 12px',
          minWidth: '32px',
          textAlign: 'right'
        },
        '.cm-matchingBracket': {
          backgroundColor: '#3b5166',
          outline: '1px solid #5180aa',
          color: '#ffffff'
        },
        '.cm-nonmatchingBracket': {
          backgroundColor: '#5a2222',
          outline: '1px solid #993333',
          color: '#ffffff'
        },
        '.cm-placeholder': {
          color: '#6e7681',
          fontStyle: 'italic'
        }
      },
      { dark: true }
    )

    // Resaltado de sintaxis coherente
    const stireHighlightStyle = HighlightStyle.define([
      { tag: [t.keyword, t.operatorKeyword, t.modifier], color: '#569cd6' },
      { tag: [t.string, t.special(t.string)], color: '#ce9178' },
      { tag: [t.number, t.integer, t.float], color: '#b5cea8' },
      { tag: [t.comment, t.lineComment, t.blockComment], color: '#6a9955', fontStyle: 'italic' },
      { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#dcdcaa' },
      { tag: [t.tagName], color: '#569cd6' },
      { tag: [t.attributeName], color: '#9cdcfe' },
      { tag: [t.variableName, t.propertyName], color: '#9cdcfe' },
      { tag: [t.className, t.typeName], color: '#4ec9b0' },
      { tag: [t.operator], color: '#d4d4d4' },
      { tag: [t.punctuation, t.bracket], color: '#d4d4d4' }
    ])

    // Keymap accesible: WCAG 2.1.2 (sin trampa de foco)
    // Tab sangra; Esc y luego Tab sale del editor
    const accessibleTabKeymap = [
      {
        key: 'Escape',
        run: () => {
          tabTrapDisabled = true
          return true
        }
      },
      {
        key: 'Tab',
        run: (targetView: EditorView) => {
          if (tabTrapDisabled) {
            tabTrapDisabled = false
            return false // Deja que el navegador mueva el foco
          }
          return indentMore(targetView)
        },
        shift: (targetView: EditorView) => {
          if (tabTrapDisabled) {
            tabTrapDisabled = false
            return false // Deja que el navegador mueva el foco hacia atrás
          }
          return indentLess(targetView)
        }
      }
    ]

    // Resetear tabTrapDisabled si se presiona cualquier otra tecla o se pierde el foco
    const resetTabTrapExtension = EditorView.domEventHandlers({
      keydown: (event) => {
        if (!MODIFIER_KEYS.has(event.key)) {
          tabTrapDisabled = false
        }
      },
      blur: () => {
        tabTrapDisabled = false
      }
    })

    const initialLangExt = await loadLanguageExtension(props.language)

    const state = EditorState.create({
      doc: props.modelValue ?? '',
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(stireHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        resetTabTrapExtension,
        keymap.of([
          ...accessibleTabKeymap,
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap
        ]),
        languageCompartment.of(initialLangExt),
        readOnlyCompartment.of(EditorState.readOnly.of(Boolean(props.readOnly))),
        stireTheme,
        cmPlaceholder(props.placeholder || ''),
        EditorView.contentAttributes.of({
          ...(props.id ? { id: props.id } : {}),
          'aria-label': props.ariaLabel,
          'aria-multiline': 'true'
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newDoc = update.state.doc.toString()
            if (newDoc !== props.modelValue) {
              emit('update:modelValue', newDoc)
            }
          }
        })
      ]
    })

    view = new EditorView({
      state,
      parent: editorContainer.value
    })

    isLoaded.value = true
  } catch (err) {
    console.warn('[STIRE CodeEditor] Error cargando CodeMirror bajo demanda, usando fallback:', err)
    isFallback.value = true
  }
})

// Sincronización del valor externo sin perder posición de cursor
watch(
  () => props.modelValue,
  (newVal) => {
    if (!view) return
    const currentDoc = view.state.doc.toString()
    if (newVal !== currentDoc) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: newVal ?? '' }
      })
    }
  }
)

// Cambio dinámico de lenguaje sin recrear el editor
watch(
  () => props.language,
  async (newLang) => {
    if (!view || !languageCompartment) return
    const langExt = await loadLanguageExtension(newLang)
    view.dispatch({
      effects: languageCompartment.reconfigure(langExt)
    })
  }
)

// Cambio dinámico de readOnly
watch(
  () => props.readOnly,
  async (newRo) => {
    if (!view || !readOnlyCompartment) return
    const { EditorState } = await import('@codemirror/state')
    view.dispatch({
      effects: readOnlyCompartment.reconfigure(EditorState.readOnly.of(Boolean(newRo)))
    })
  }
)

function requestMeasure() {
  if (view) {
    view.requestMeasure()
  }
}

function focus() {
  if (view) {
    view.focus()
  }
}

onBeforeUnmount(() => {
  if (view) {
    view.destroy()
    view = null
  }
})

defineExpose({
  requestMeasure,
  focus
})
</script>

<style scoped>
/* El editor crece hasta llenar su recuadro (flex), no con height:100%: en los constructores del docente el
   contenedor no tiene una altura definida y el 100% se resolvía como una sola línea, con el resto en blanco. */
.code-editor-root :deep(.cm-editor) {
  flex: 1 1 auto;
  min-height: 0;
}
.code-editor-root :deep(.cm-scroller) {
  font-family: inherit;
}
</style>

