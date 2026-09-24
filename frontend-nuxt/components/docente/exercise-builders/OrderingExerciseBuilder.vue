<template>
  <div class="space-y-4 text-xs">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-bold text-base-texto-primario">Bloques en Secuencia Correcta</h3>
        <p class="text-[11px] text-base-texto-secundario">
          Escribe los bloques en el orden correcto (paso 1, paso 2...). El sistema los barajará automáticamente al estudiante.
        </p>
      </div>
      <button
        type="button"
        @click="addBlock"
        class="px-2.5 py-1 rounded text-xs font-bold bg-acento-ambar/15 text-acento-ambar-fuerte hover:bg-acento-ambar/25 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
        <span>+</span>
        <span>Agregar Bloque</span>
      </button>
    </div>

    <!-- Lista de bloques -->
    <div class="space-y-2">
      <div
        v-for="(block, idx) in blocks"
        :key="block.id"
        class="flex items-center gap-2 p-2.5 rounded-lg border border-base-borde-sutil bg-base-blanco">
        <!-- Indicador de orden -->
        <span class="w-6 h-6 rounded bg-acento-ambar/20 text-acento-ambar-fuerte font-bold text-xs flex items-center justify-center shrink-0">
          {{ idx + 1 }}
        </span>

        <!-- Input de contenido del bloque -->
        <input
          v-model="block.content"
          type="text"
          required
          :placeholder="`Paso o instrucción ${idx + 1}...`"
          class="flex-1 px-3 py-1.5 text-xs rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />

        <!-- Subir / Bajar para que el docente acomode el orden correcto -->
        <div class="flex items-center gap-0.5 shrink-0">
          <button
            :disabled="idx === 0"
            type="button"
            @click="moveBlock(idx, -1)"
            class="p-1 text-base-texto-secundario hover:text-base-texto-primario disabled:opacity-30 rounded"
            title="Subir paso">
            ▲
          </button>
          <button
            :disabled="idx === blocks.length - 1"
            type="button"
            @click="moveBlock(idx, 1)"
            class="p-1 text-base-texto-secundario hover:text-base-texto-primario disabled:opacity-30 rounded"
            title="Bajar paso">
            ▼
          </button>
        </div>

        <button
          v-if="blocks.length > 2"
          type="button"
          @click="removeBlock(idx)"
          class="p-1 text-semantico-falla hover:bg-semantico-falla/10 rounded transition-colors"
          title="Eliminar bloque"
          :aria-label="`Eliminar bloque ${idx + 1}`">
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BlockItem {
  id: string
  content: string
}

let counter = 3

const blocks = ref<BlockItem[]>([
  { id: 'b1', content: 'Declarar la variable let total = 0' },
  { id: 'b2', content: 'Iniciar un bucle for de 1 a n' },
  { id: 'b3', content: 'Retornar el valor acumulado total' }
])

function addBlock() {
  counter++
  blocks.value.push({
    id: `b${counter}`,
    content: ''
  })
}

function removeBlock(index: number) {
  if (blocks.value.length > 2) {
    blocks.value.splice(index, 1)
  }
}

function moveBlock(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= blocks.value.length) return
  const temp = blocks.value[index]
  blocks.value[index] = blocks.value[target]
  blocks.value[target] = temp
}

function reset() {
  counter = 3
  blocks.value = [
    { id: 'b1', content: 'Declarar la variable let total = 0' },
    { id: 'b2', content: 'Iniciar un bucle for de 1 a n' },
    { id: 'b3', content: 'Retornar el valor acumulado total' }
  ]
}

function validateAndGetConfig(_totalPoints: number): { valid: boolean; error?: string; config?: any } {
  if (blocks.value.length < 2) {
    return { valid: false, error: 'Debes definir al menos 2 bloques para ordenar.' }
  }

  for (let i = 0; i < blocks.value.length; i++) {
    if (!blocks.value[i].content.trim()) {
      return { valid: false, error: `El bloque #${i + 1} no puede estar vacío.` }
    }
  }

  const formattedBlocks = blocks.value.map((b, idx) => ({
    id: `step_${idx + 1}`,
    content: b.content.trim()
  }))

  const correctOrder = formattedBlocks.map(b => b.id)

  return {
    valid: true,
    config: {
      blocks: formattedBlocks,
      correctOrder
    }
  }
}

defineExpose({
  validateAndGetConfig,
  reset
})
</script>
