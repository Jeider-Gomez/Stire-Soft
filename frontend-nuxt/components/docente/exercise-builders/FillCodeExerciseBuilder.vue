<template>
  <div class="space-y-4 text-xs">
    <div>
      <div class="flex items-center justify-between mb-1">
        <label for="fillcode-template" class="block font-semibold text-base-texto-primario">
          Plantilla de Código con Huecos (<code>codeTemplate</code>) *
        </label>
        <button
          type="button"
          @click="insertBlankAtCursor"
          class="px-2 py-0.5 rounded text-[11px] font-semibold bg-acento-ambar/15 text-acento-ambar-fuerte hover:bg-acento-ambar/25 transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
          + Insertar Hueco ___b{{ nextBlankNum }}___
        </button>
      </div>
      <p class="text-[11px] text-base-texto-secundario mb-1.5">
        Define cada espacio en blanco usando el formato <code class="text-acento-ambar-fuerte font-bold">___identificador___</code> (tres guiones bajos al inicio y al final).
      </p>
      <textarea
        id="fillcode-template"
        ref="templateTextareaRef"
        v-model="codeTemplate"
        rows="6"
        spellcheck="false"
        placeholder="const ___b1___ = 42;&#10;if (___b1___ > 10) {&#10;  console.log(___b2___);&#10;}"
        class="w-full px-3 py-2 rounded-md bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs outline-none resize-y border border-[#333] focus:border-acento-ambar-fuerte"></textarea>
    </div>

    <!-- Lista de respuestas esperadas para cada hueco -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-base-texto-primario">Respuestas Correctas para los Huecos</h3>
          <p class="text-[11px] text-base-texto-secundario">
            Texto exacto que el estudiante debe escribir en cada hueco.
          </p>
        </div>
        <button
          type="button"
          @click="addBlank"
          class="px-2.5 py-1 rounded text-xs font-bold bg-acento-ambar/15 text-acento-ambar-fuerte hover:bg-acento-ambar/25 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
          <span>+</span>
          <span>Agregar Hueco</span>
        </button>
      </div>

      <div class="space-y-2">
        <div
          v-for="(b, idx) in blanks"
          :key="idx"
          class="flex items-center gap-3 p-2.5 rounded-lg border border-base-borde-sutil bg-base-bg-secundario/40">
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-base-texto-secundario text-[11px] font-mono">___</span>
            <input
              v-model="b.id"
              type="text"
              placeholder="id"
              class="w-20 px-2 py-1 font-mono text-xs rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
            <span class="text-base-texto-secundario text-[11px] font-mono">___</span>
          </div>

          <div class="flex-1">
            <input
              v-model="b.answer"
              type="text"
              required
              placeholder="Respuesta esperada exacta (ej. let, const, 'Hola')..."
              class="w-full px-3 py-1 font-mono text-xs rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
          </div>

          <button
            v-if="blanks.length > 1"
            type="button"
            @click="removeBlank(idx)"
            class="p-1 text-semantico-falla hover:bg-semantico-falla/10 rounded transition-colors"
            title="Eliminar hueco"
            :aria-label="`Eliminar hueco ${b.id}`">
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BlankItem {
  id: string
  answer: string
}

const templateTextareaRef = ref<HTMLTextAreaElement | null>(null)
const codeTemplate = ref('function suma(a, b) {\n  return ___b1___ + ___b2___;\n}')
const blanks = ref<BlankItem[]>([
  { id: 'b1', answer: 'a' },
  { id: 'b2', answer: 'b' }
])

const nextBlankNum = computed(() => {
  return blanks.value.length + 1
})

function addBlank() {
  const newId = `b${nextBlankNum.value}`
  blanks.value.push({ id: newId, answer: '' })
}

function removeBlank(index: number) {
  if (blanks.value.length > 1) {
    blanks.value.splice(index, 1)
  }
}

function insertBlankAtCursor() {
  const newId = `b${nextBlankNum.value}`
  addBlank()
  const marker = `___${newId}___`
  if (!codeTemplate.value.includes(marker)) {
    codeTemplate.value += ` ${marker}`
  }
}

function reset() {
  codeTemplate.value = 'function suma(a, b) {\n  return ___b1___ + ___b2___;\n}'
  blanks.value = [
    { id: 'b1', answer: 'a' },
    { id: 'b2', answer: 'b' }
  ]
}

function validateAndGetConfig(_totalPoints: number): { valid: boolean; error?: string; config?: any } {
  if (!codeTemplate.value.trim()) {
    return { valid: false, error: 'La plantilla de código no puede estar vacía.' }
  }

  if (blanks.value.length === 0) {
    return { valid: false, error: 'Debes definir al menos un espacio en blanco (hueco).' }
  }

  // Extract markers from codeTemplate: ___id___
  const regex = /___([a-zA-Z0-9_-]+)___/g
  const foundInTemplate = new Set<string>()
  let match: RegExpExecArray | null
  while ((match = regex.exec(codeTemplate.value)) !== null) {
    foundInTemplate.add(match[1])
  }

  if (foundInTemplate.size === 0) {
    return { valid: false, error: 'No se encontraron marcadores ___id___ en la plantilla de código.' }
  }

  // Check each blank in blanks list
  const blankIds = new Set<string>()
  for (let i = 0; i < blanks.value.length; i++) {
    const b = blanks.value[i]
    const cleanId = b.id.trim()
    if (!cleanId) {
      return { valid: false, error: `El hueco #${i + 1} no tiene un identificador válido.` }
    }
    if (blankIds.has(cleanId)) {
      return { valid: false, error: `El identificador de hueco "${cleanId}" está duplicado.` }
    }
    blankIds.add(cleanId)

    if (!b.answer.trim()) {
      return { valid: false, error: `El hueco "${cleanId}" no tiene una respuesta esperada.` }
    }

    if (!foundInTemplate.has(cleanId)) {
      return { valid: false, error: `El hueco "${cleanId}" no aparece en la plantilla como ___${cleanId}___.` }
    }
  }

  // Check each marker in template has an answer
  for (const templateId of foundInTemplate) {
    if (!blankIds.has(templateId)) {
      return { valid: false, error: `El marcador ___${templateId}___ de la plantilla no tiene una respuesta configurada.` }
    }
  }

  return {
    valid: true,
    config: {
      codeTemplate: codeTemplate.value,
      blanks: blanks.value.map(b => ({
        id: b.id.trim(),
        answer: b.answer.trim(),
        regexMode: false
      }))
    }
  }
}

defineExpose({
  validateAndGetConfig,
  reset
})
</script>
