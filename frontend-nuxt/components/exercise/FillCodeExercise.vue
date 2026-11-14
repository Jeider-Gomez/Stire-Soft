<template>
  <div class="space-y-4">
    <!-- Enunciado de la pregunta -->
    <div v-if="showStatement" class="prose prose-xs text-base-texto-primario">
      <p class="text-xs leading-relaxed whitespace-pre-wrap">{{ question.question }}</p>
    </div>

    <!-- Instrucción -->
    <p class="m-0 text-[15px] text-base-texto-primario">Toca cada espacio en blanco y escribe lo que falta.</p>

    <!-- Bloque de código con inputs insertados en los blanks -->
    <div class="bg-editor-bg text-editor-text rounded-2xl px-4 py-3.5 font-mono text-sm overflow-x-auto shadow-inner border border-editor-border">
      <div v-for="(line, lineIdx) in parsedLines" :key="lineIdx" class="leading-9 min-h-[2.25rem] flex flex-wrap items-center">
        <template v-for="(token, tokenIdx) in line" :key="tokenIdx">
          <!-- Fragmento de código normal (resaltado con fallback a texto plano) -->
          <template v-if="token.type === 'text'">
            <span
              v-for="(span, sIdx) in (highlightedTokens[`${lineIdx}-${tokenIdx}`] || [{ text: token.value, cls: '' }])"
              :key="sIdx"
              :class="['whitespace-pre', span.cls || 'text-gray-300']"
            >{{ span.text }}</span>
          </template>

          <!-- Input para el blank correspondiente -->
          <span v-else-if="token.type === 'blank'" class="inline-flex items-center mx-1 my-0.5">
            <input
              type="text"
              :id="`blank-${token.id}`"
              v-model="blankAnswers[token.id]"
              :aria-label="`Espacio ${expectedBlankIds.indexOf(token.id) + 1} de ${expectedBlankIds.length}`"
              class="hueco-codigo min-h-[36px] px-2 py-0.5 font-mono text-sm rounded-lg text-center focus:outline-none"
              :class="{ lleno: !!blankAnswers[token.id]?.trim() }"
              :style="{ width: `${Math.max(60, (blankAnswers[token.id]?.length || token.id.length || 4) * 10 + 20)}px` }"
            />
          </span>
        </template>
      </div>
    </div>

    <!-- Estado de completitud (v3, cuadro «E-Tipo-Completar»: «Llevas 1 de 3») -->
    <p class="m-0 text-xs" :class="allBlanksFilled ? 'text-semantico-pasa font-semibold' : 'text-base-texto-secundario'" role="status">
      <template v-if="allBlanksFilled">Completaste los {{ expectedBlankIds.length }} espacios. Revisa y entrega.</template>
      <template v-else>Llevas {{ filledCount }} de {{ expectedBlankIds.length }}.</template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/workspace'
import { highlightCode, type HighlightedSpan } from '~/utils/highlightCode'

interface BlankConfig {
  id: string
  regexMode?: boolean
}

interface Props {
  question: { id: number; type: string; question: string; config: Record<string, any> }
  /** La pantalla del ejercicio ya muestra el enunciado con formato arriba. */
  showStatement?: boolean
}

const props = withDefaults(defineProps<Props>(), { showStatement: true })
const workspaceStore = useWorkspaceStore()

const codeTemplate = computed<string>(() => props.question.config?.codeTemplate || '')
const blanks = computed<BlankConfig[]>(() => props.question.config?.blanks || [])

const expectedBlankIds = computed<string[]>(() => blanks.value.map(b => b.id))
const blankAnswers = reactive<Record<string, string>>({})

// Inicializar blankAnswers con los IDs esperados
watch(
  blanks,
  (newBlanks) => {
    Object.keys(blankAnswers).forEach(k => delete blankAnswers[k])
    newBlanks.forEach(b => {
      blankAnswers[b.id] = ''
    })
  },
  { immediate: true }
)

// Parsear codeTemplate en líneas y tokens (texto o blank)
type Token = { type: 'text'; value: string } | { type: 'blank'; id: string }

const parsedLines = computed<Token[][]>(() => {
  const lines = codeTemplate.value.split('\n')
  return lines.map(line => {
    const tokens: Token[] = []
    // Los blanks siguen el patrón ___id___
    const regex = /___([a-zA-Z0-9_-]+)___/g
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ type: 'text', value: line.substring(lastIndex, match.index) })
      }
      tokens.push({ type: 'blank', id: match[1] })
      lastIndex = regex.lastIndex
    }

    if (lastIndex < line.length) {
      tokens.push({ type: 'text', value: line.substring(lastIndex) })
    }

    // Si la línea está vacía, dejar un espacio para mantener altura
    if (tokens.length === 0) {
      tokens.push({ type: 'text', value: ' ' })
    }

    return tokens
  })
})

const language = computed<string>(() => props.question.config?.language || 'text')
const highlightedTokens = ref<Record<string, HighlightedSpan[]>>({})

watch(
  [parsedLines, language],
  async ([lines, lang]) => {
    if (!lang || lang === 'text') {
      highlightedTokens.value = {}
      return
    }
    const newTokens: Record<string, HighlightedSpan[]> = {}
    await Promise.all(
      lines.flatMap((line, lineIdx) =>
        line.map(async (token, tokenIdx) => {
          if (token.type === 'text') {
            const key = `${lineIdx}-${tokenIdx}`
            const spans = await highlightCode(token.value, lang)
            newTokens[key] = spans
          }
        })
      )
    )
    highlightedTokens.value = newTokens
  },
  { immediate: true }
)

const filledCount = computed(() => {
  return expectedBlankIds.value.filter(id => (blankAnswers[id] || '').trim().length > 0).length
})

const allBlanksFilled = computed(() => {
  return expectedBlankIds.value.length > 0 && filledCount.value === expectedBlankIds.value.length
})

// Sincronizar con pendingAnswer del store: { blanks: { b1: "...", b2: "..." } }
watch(
  blankAnswers,
  () => {
    workspaceStore.huecosEscritos = { ...blankAnswers }
    if (allBlanksFilled.value) {
      const cleanBlanks: Record<string, string> = {}
      expectedBlankIds.value.forEach(id => {
        cleanBlanks[id] = blankAnswers[id].trim()
      })
      workspaceStore.pendingAnswer = { blanks: cleanBlanks }
    } else {
      workspaceStore.pendingAnswer = null
    }
  },
  { deep: true }
)

onMounted(() => {
  workspaceStore.pendingAnswer = null
})
</script>

<style scoped>
.hueco-codigo { background: rgb(255 255 255 / 0.06); color: #5eead4; border: 2px dashed #5eead4; transition: background-color 0.15s ease; }
.hueco-codigo:focus { border-style: solid; background: rgb(94 234 212 / 0.12); }
.hueco-codigo.lleno { border-style: solid; background: rgb(94 234 212 / 0.16); }
</style>
