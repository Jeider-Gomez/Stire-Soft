<template>
  <div class="space-y-5 text-xs">
    <!-- Código inicial -->
    <div>
      <label for="coding-starter" class="block font-semibold text-base-texto-primario mb-1">
        Código Plantilla Inicial (<code>starterCode</code>)
      </label>
      <p class="text-[11px] text-base-texto-secundario mb-1">
        Código base con el que arrancará el editor del estudiante (opcional).
      </p>
      <textarea
        id="coding-starter"
        v-model="starterCode"
        rows="5"
        spellcheck="false"
        placeholder="// Código base con el que arrancará el editor del estudiante.&#10;// El sandbox lee la entrada por process.stdin:&#10;process.stdin.resume();&#10;process.stdin.setEncoding('utf8');&#10;let datos = '';&#10;process.stdin.on('data', c => datos += c);&#10;process.stdin.on('end', () => {&#10;  // Tu lógica aquí&#10;  console.log(parseInt(datos.trim()) * 2);&#10;});"
        class="w-full px-3 py-2 rounded-md bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs outline-none resize-y border border-[#333] focus:border-acento-ambar-fuerte"></textarea>
    </div>

    <!-- Casos de prueba -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-base-texto-primario">Casos de Prueba (Rúbrica de Evaluación)</h3>
          <p class="text-[11px] text-base-texto-secundario">
            El juez distribuirá automáticamente el puntaje total entre los casos de prueba.
          </p>
        </div>
        <button
          type="button"
          @click="addTestCase"
          class="px-2.5 py-1 rounded text-xs font-bold bg-acento-ambar/15 text-acento-ambar-fuerte hover:bg-acento-ambar/25 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
          <span>+</span>
          <span>Agregar Caso</span>
        </button>
      </div>

      <div class="space-y-3">
        <div
          v-for="(tc, idx) in testCases"
          :key="idx"
          class="p-3 rounded-lg border border-base-borde-sutil bg-base-bg-secundario/40 space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-bold text-base-texto-primario">Caso #{{ idx + 1 }}</span>
            <div class="flex items-center gap-3">
              <label :for="`tc-public-${idx}`" class="flex items-center gap-1.5 cursor-pointer text-[11px] select-none">
                <input
                  :id="`tc-public-${idx}`"
                  type="checkbox"
                  v-model="tc.isPublic"
                  class="accent-acento-ambar-fuerte" />
                <span :class="tc.isPublic ? 'text-semantico-pasa font-bold' : 'text-base-texto-secundario'">
                  {{ tc.isPublic ? '👁 Público (visible)' : '🔒 Privado (oculto)' }}
                </span>
              </label>

              <button
                v-if="testCases.length > 1"
                type="button"
                @click="removeTestCase(idx)"
                class="text-semantico-falla text-[11px] hover:underline focus:outline-none focus:ring-2 focus:ring-semantico-falla rounded"
                :aria-label="`Eliminar caso ${idx + 1}`">
                Eliminar
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label :for="`tc-input-${idx}`" class="block text-[11px] text-base-texto-secundario mb-1">
                Entrada (<code>stdin</code>)
              </label>
              <input
                :id="`tc-input-${idx}`"
                v-model="tc.input"
                type="text"
                placeholder="Ej. 10 20"
                class="w-full px-2.5 py-1.5 font-mono text-xs rounded bg-base-blanco border border-base-borde-sutil focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
            </div>

            <div>
              <label :for="`tc-expected-${idx}`" class="block text-[11px] text-base-texto-secundario mb-1">
                Salida Esperada (<code>stdout</code>) *
              </label>
              <input
                :id="`tc-expected-${idx}`"
                v-model="tc.expected"
                type="text"
                required
                placeholder="Ej. 30"
                class="w-full px-2.5 py-1.5 font-mono text-xs rounded bg-base-blanco border border-base-borde-sutil focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TestCaseItem {
  label?: string
  input: string
  expected: string
  isPublic: boolean
}

const starterCode = ref('')
const testCases = ref<TestCaseItem[]>([
  { label: 'Caso Público 1', input: '', expected: '', isPublic: true },
  { label: 'Caso Oculto 2', input: '', expected: '', isPublic: false }
])

function addTestCase() {
  const num = testCases.value.length + 1
  testCases.value.push({
    label: `Caso #${num}`,
    input: '',
    expected: '',
    isPublic: false
  })
}

function removeTestCase(index: number) {
  if (testCases.value.length > 1) {
    testCases.value.splice(index, 1)
  }
}

function reset() {
  starterCode.value = ''
  testCases.value = [
    { label: 'Caso Público 1', input: '', expected: '', isPublic: true },
    { label: 'Caso Oculto 2', input: '', expected: '', isPublic: false }
  ]
}

function validateAndGetConfig(totalPoints: number): { valid: boolean; error?: string; config?: any } {
  if (testCases.value.length === 0) {
    return { valid: false, error: 'Debes agregar al menos un caso de prueba.' }
  }

  const hasPublic = testCases.value.some(tc => tc.isPublic)
  if (!hasPublic) {
    return { valid: false, error: 'Debe haber al menos un caso de prueba público (visible).' }
  }

  for (let i = 0; i < testCases.value.length; i++) {
    const tc = testCases.value[i]
    if (tc.expected === undefined || tc.expected === null || tc.expected.trim() === '') {
      return { valid: false, error: `El caso de prueba #${i + 1} no tiene salida esperada.` }
    }
  }

  const n = testCases.value.length
  const baseWeight = Math.floor(totalPoints / n)
  const remainder = totalPoints % n

  const formattedTestCases = testCases.value.map((tc, idx) => ({
    label: tc.label || `Caso #${idx + 1}`,
    input: tc.input ?? '',
    expected: tc.expected.trim(),
    isPublic: !!tc.isPublic,
    weight: idx === n - 1 ? baseWeight + remainder : baseWeight
  }))

  return {
    valid: true,
    config: {
      language: 'javascript',
      starterCode: starterCode.value,
      testCases: formattedTestCases
    }
  }
}

defineExpose({
  validateAndGetConfig,
  reset
})
</script>
