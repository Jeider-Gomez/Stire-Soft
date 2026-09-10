<template>
  <div class="space-y-4">
    <!-- Enunciado de la pregunta -->
    <div class="prose prose-xs text-base-texto-primario">
      <p class="text-xs leading-relaxed whitespace-pre-wrap">{{ question.question }}</p>
    </div>

    <!-- Instrucción -->
    <div class="text-[11px] text-base-texto-secundario bg-base-bg-secundario px-3 py-2 rounded border border-base-borde-sutil">
      Completa los espacios en blanco dentro de la plantilla de código:
    </div>

    <!-- Bloque de código con inputs insertados en los blanks -->
    <div class="bg-[#1e1e1e] text-[#d4d4d4] rounded-lg p-4 font-mono text-xs overflow-x-auto shadow-inner border border-[#333]">
      <div v-for="(line, lineIdx) in parsedLines" :key="lineIdx" class="leading-7 min-h-[1.75rem] flex flex-wrap items-center">
        <template v-for="(token, tokenIdx) in line" :key="tokenIdx">
          <!-- Fragmento de código normal -->
          <span v-if="token.type === 'text'" class="whitespace-pre text-gray-300">{{ token.value }}</span>

          <!-- Input para el blank correspondiente -->
          <span v-else-if="token.type === 'blank'" class="inline-flex items-center mx-1 my-0.5">
            <input
              type="text"
              :id="`blank-${token.id}`"
              v-model="blankAnswers[token.id]"
              :placeholder="token.id"
              class="px-2 py-0.5 bg-[#2d2d2d] text-acento-ambar-fuerte font-mono text-xs border border-[#4d4d4d] focus:border-acento-ambar-fuerte focus:outline-none focus:ring-1 focus:ring-acento-ambar-fuerte rounded transition-colors text-center"
              :style="{ width: `${Math.max(60, (blankAnswers[token.id]?.length || token.id.length || 4) * 10 + 20)}px` }"
            />
          </span>
        </template>
      </div>
    </div>

    <!-- Estado de completitud -->
    <div class="text-[11px] text-base-texto-secundario flex items-center justify-between pt-1">
      <span v-if="allBlanksFilled" class="text-semantico-pasa">
        ✔ Todos los espacios completados ({{ Object.keys(blankAnswers).length }}/{{ expectedBlankIds.length }}).
      </span>
      <span v-else class="text-acento-ambar-fuerte">
        ⚠ Completa todos los espacios en blanco antes de entregar ({{ filledCount }}/{{ expectedBlankIds.length }} completados).
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/workspace'

interface BlankConfig {
  id: string
  regexMode?: boolean
}

interface Props {
  question: { id: number; type: string; question: string; config: Record<string, any> }
}

const props = defineProps<Props>()
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
