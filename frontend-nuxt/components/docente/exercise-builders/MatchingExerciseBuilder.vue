<template>
  <div class="space-y-4 text-xs">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-bold text-base-texto-primario">Pares para Emparejar (Izquierda ↔ Derecha)</h3>
        <p class="text-[11px] text-base-texto-secundario">
          Escribe las parejas correctas en cada fila. El sistema barajará la columna derecha al estudiante (mínimo 2 parejas).
        </p>
      </div>
      <button
        type="button"
        @click="addPair"
        class="px-2.5 py-1 rounded text-xs font-bold bg-acento-ambar/15 text-acento-ambar-fuerte hover:bg-acento-ambar/25 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
        <span>+</span>
        <span>Agregar Pareja</span>
      </button>
    </div>

    <!-- Lista de parejas -->
    <div class="space-y-2.5">
      <div
        v-for="(pair, idx) in pairs"
        :key="pair.id"
        class="flex items-center gap-2 p-2.5 rounded-lg border border-base-borde-sutil bg-base-blanco">
        <span class="font-mono text-[10px] text-base-texto-secundario px-1.5 py-0.5 rounded bg-base-bg-secundario">
          #{{ idx + 1 }}
        </span>

        <!-- Columna Izquierda -->
        <div class="flex-1">
          <input
            v-model="pair.left"
            type="text"
            required
            :placeholder="`Concepto / Término ${idx + 1}...`"
            class="w-full px-2.5 py-1.5 text-xs rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
        </div>

        <span class="text-acento-ambar-fuerte font-bold">↔</span>

        <!-- Columna Derecha -->
        <div class="flex-1">
          <input
            v-model="pair.right"
            type="text"
            required
            :placeholder="`Definición / Valor correspondiente ${idx + 1}...`"
            class="w-full px-2.5 py-1.5 text-xs rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
        </div>

        <button
          v-if="pairs.length > 2"
          type="button"
          @click="removePair(idx)"
          class="p-1 text-semantico-falla hover:bg-semantico-falla/10 rounded transition-colors"
          title="Eliminar pareja"
          :aria-label="`Eliminar pareja ${idx + 1}`">
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PairRow {
  id: string
  left: string
  right: string
}

let counter = 3

const pairs = ref<PairRow[]>([
  { id: '1', left: 'const', right: 'Declaración de variable de solo lectura' },
  { id: '2', left: 'let', right: 'Declaración de variable reasignable con ámbito de bloque' },
  { id: '3', left: 'var', right: 'Declaración antigua con ámbito de función o global' }
])

function addPair() {
  counter++
  pairs.value.push({
    id: String(counter),
    left: '',
    right: ''
  })
}

function removePair(index: number) {
  if (pairs.value.length > 2) {
    pairs.value.splice(index, 1)
  }
}

function reset() {
  counter = 3
  pairs.value = [
    { id: '1', left: 'const', right: 'Declaración de variable de solo lectura' },
    { id: '2', left: 'let', right: 'Declaración de variable reasignable con ámbito de bloque' },
    { id: '3', left: 'var', right: 'Declaración antigua con ámbito de función o global' }
  ]
}

function validateAndGetConfig(_totalPoints: number): { valid: boolean; error?: string; config?: any } {
  if (pairs.value.length < 2) {
    return { valid: false, error: 'Debes definir al menos 2 parejas para emparejar.' }
  }

  for (let i = 0; i < pairs.value.length; i++) {
    const p = pairs.value[i]
    if (!p.left.trim()) {
      return { valid: false, error: `El término izquierdo en la fila #${i + 1} no puede estar vacío.` }
    }
    if (!p.right.trim()) {
      return { valid: false, error: `La definición derecha en la fila #${i + 1} no puede estar vacía.` }
    }
  }

  const leftColumn = pairs.value.map((p, idx) => ({
    id: `left_${idx + 1}`,
    content: p.left.trim()
  }))

  const rightColumn = pairs.value.map((p, idx) => ({
    id: `right_${idx + 1}`,
    content: p.right.trim()
  }))

  const pairsMap: Record<string, string> = {}
  for (let i = 0; i < pairs.value.length; i++) {
    pairsMap[`left_${i + 1}`] = `right_${i + 1}`
  }

  return {
    valid: true,
    config: {
      leftColumn,
      rightColumn,
      pairs: pairsMap
    }
  }
}

defineExpose({
  validateAndGetConfig,
  reset
})
</script>
