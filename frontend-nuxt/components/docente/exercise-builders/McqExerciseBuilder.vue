<template>
  <div class="space-y-4 text-xs">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-bold text-base-texto-primario">Opciones de Respuesta (Selección Única)</h3>
        <p class="text-[11px] text-base-texto-secundario">
          Agrega las opciones y marca cuál es la respuesta correcta con el botón radial.
        </p>
      </div>
      <button
        type="button"
        @click="addOption"
        class="px-2.5 py-1 rounded text-xs font-bold bg-acento-ambar/15 text-acento-ambar-fuerte hover:bg-acento-ambar/25 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
        <span>+</span>
        <span>Agregar Opción</span>
      </button>
    </div>

    <!-- Lista de opciones -->
    <div class="space-y-2.5">
      <div
        v-for="(opt, idx) in options"
        :key="opt.id"
        class="flex items-center gap-3 p-3 rounded-lg border bg-base-blanco transition-colors"
        :class="correctAnswerId === opt.id ? 'border-acento-ambar-fuerte bg-acento-ambar/5' : 'border-base-borde-sutil'">
        <!-- Radio para marcar la correcta -->
        <label :for="`mcq-builder-correct-${opt.id}`" class="flex items-center gap-1.5 cursor-pointer shrink-0" title="Marcar como respuesta correcta">
          <input
            :id="`mcq-builder-correct-${opt.id}`"
            type="radio"
            name="mcq-correct"
            :value="opt.id"
            v-model="correctAnswerId"
            class="accent-acento-ambar-fuerte" />
          <span
            class="text-[10px] font-bold px-1.5 py-0.5 rounded"
            :class="correctAnswerId === opt.id ? 'bg-semantico-pasa/20 text-semantico-pasa' : 'bg-base-bg-secundario text-base-texto-secundario'">
            {{ correctAnswerId === opt.id ? 'Correcta' : 'Opción' }}
          </span>
        </label>

        <!-- Campo de texto de la opción -->
        <input
          v-model="opt.text"
          type="text"
          required
          :placeholder="`Texto de la opción ${idx + 1}...`"
          class="flex-1 px-3 py-1.5 text-xs rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />

        <!-- Botón eliminar opción -->
        <button
          v-if="options.length > 2"
          type="button"
          @click="removeOption(idx)"
          class="p-1 text-semantico-falla hover:bg-semantico-falla/10 rounded transition-colors"
          title="Eliminar opción"
          :aria-label="`Eliminar opción ${idx + 1}`">
          ✕
        </button>
      </div>
    </div>

    <!-- Explicación pedagógica opcional -->
    <div>
      <label for="mcq-explanation" class="block font-semibold text-base-texto-primario mb-1">
        Explicación de Retroalimentación (opcional)
      </label>
      <input
        id="mcq-explanation"
        v-model="explanation"
        type="text"
        placeholder="Breve justificación que se mostrará tras calificar la pregunta..."
        class="w-full px-3 py-2 text-xs rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface OptionItem {
  id: string
  text: string
}

let counter = 3

const options = ref<OptionItem[]>([
  { id: 'opt1', text: '' },
  { id: 'opt2', text: '' }
])

const correctAnswerId = ref('opt1')
const explanation = ref('')

function addOption() {
  counter++
  options.value.push({
    id: `opt${counter}`,
    text: ''
  })
}

function removeOption(index: number) {
  if (options.value.length > 2) {
    const removed = options.value.splice(index, 1)[0]
    if (correctAnswerId.value === removed.id) {
      correctAnswerId.value = options.value[0].id
    }
  }
}

function reset() {
  counter = 2
  options.value = [
    { id: 'opt1', text: '' },
    { id: 'opt2', text: '' }
  ]
  correctAnswerId.value = 'opt1'
  explanation.value = ''
}

function validateAndGetConfig(_totalPoints: number): { valid: boolean; error?: string; config?: any } {
  if (options.value.length < 2) {
    return { valid: false, error: 'Debes proporcionar al menos 2 opciones de respuesta.' }
  }

  for (let i = 0; i < options.value.length; i++) {
    if (!options.value[i].text.trim()) {
      return { valid: false, error: `La opción #${i + 1} no puede estar vacía.` }
    }
  }

  if (!correctAnswerId.value) {
    return { valid: false, error: 'Marca cuál es la opción correcta.' }
  }

  const validCorrect = options.value.some(o => o.id === correctAnswerId.value)
  if (!validCorrect) {
    return { valid: false, error: 'La opción marcada como correcta no es válida.' }
  }

  return {
    valid: true,
    config: {
      options: options.value.map(o => ({ id: o.id, text: o.text.trim() })),
      correctAnswerId: correctAnswerId.value,
      isMultipleChoice: false,
      explanation: explanation.value.trim() || undefined
    }
  }
}

defineExpose({
  validateAndGetConfig,
  reset
})
</script>
