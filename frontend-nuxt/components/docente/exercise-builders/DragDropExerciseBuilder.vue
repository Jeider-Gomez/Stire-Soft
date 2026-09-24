<template>
  <div class="space-y-5 text-xs">
    <!-- 1. Destinos / Categorías -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-base-texto-primario">1. Destinos o Categorías (Targets)</h3>
          <p class="text-[11px] text-base-texto-secundario">
            Zonas donde el estudiante arrastrará los elementos (mínimo 2).
          </p>
        </div>
        <button
          type="button"
          @click="addTarget"
          class="px-2.5 py-1 rounded text-xs font-bold bg-acento-ambar/15 text-acento-ambar-fuerte hover:bg-acento-ambar/25 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
          <span>+</span>
          <span>Agregar Destino</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div
          v-for="(target, idx) in targets"
          :key="target.id"
          class="flex items-center gap-2 p-2.5 rounded-lg border border-base-borde-sutil bg-base-bg-secundario/40">
          <span class="font-mono text-[10px] font-bold text-acento-ambar-fuerte px-1.5 py-0.5 rounded bg-acento-ambar/10">
            D{{ idx + 1 }}
          </span>
          <input
            v-model="target.label"
            type="text"
            required
            :placeholder="`Etiqueta del destino ${idx + 1}...`"
            class="flex-1 px-2.5 py-1 text-xs rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
          <button
            v-if="targets.length > 2"
            type="button"
            @click="removeTarget(idx)"
            class="p-1 text-semantico-falla hover:bg-semantico-falla/10 rounded transition-colors"
            title="Eliminar destino"
            :aria-label="`Eliminar destino ${idx + 1}`">
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- 2. Elementos a arrastrar y su mapeo al destino correcto -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-base-texto-primario">2. Elementos e Indicación de Destino Correcto (Items)</h3>
          <p class="text-[11px] text-base-texto-secundario">
            Cada elemento debe estar asignado a su destino correcto (mínimo 2).
          </p>
        </div>
        <button
          type="button"
          @click="addItem"
          class="px-2.5 py-1 rounded text-xs font-bold bg-acento-ambar/15 text-acento-ambar-fuerte hover:bg-acento-ambar/25 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
          <span>+</span>
          <span>Agregar Elemento</span>
        </button>
      </div>

      <div class="space-y-2">
        <div
          v-for="(item, idx) in items"
          :key="item.id"
          class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2.5 rounded-lg border border-base-borde-sutil bg-base-blanco">
          <div class="flex items-center gap-2 flex-1">
            <span class="font-mono text-[10px] text-base-texto-secundario px-1.5 py-0.5 rounded bg-base-bg-secundario">
              #{{ idx + 1 }}
            </span>
            <input
              v-model="item.content"
              type="text"
              required
              :placeholder="`Texto del elemento ${idx + 1}...`"
              class="flex-1 px-2.5 py-1 text-xs rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
          </div>

          <div class="flex items-center gap-2">
            <span class="text-[11px] text-base-texto-secundario">Destino:</span>
            <select
              v-model="item.targetId"
              class="px-2.5 py-1 text-xs rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none">
              <option v-for="t in targets" :key="t.id" :value="t.id">
                {{ t.label || `Destino ${t.id}` }}
              </option>
            </select>

            <button
              v-if="items.length > 2"
              type="button"
              @click="removeItem(idx)"
              class="p-1 text-semantico-falla hover:bg-semantico-falla/10 rounded transition-colors"
              title="Eliminar elemento"
              :aria-label="`Eliminar elemento ${idx + 1}`">
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TargetItem {
  id: string
  label: string
}

interface ItemEntry {
  id: string
  content: string
  targetId: string
}

let targetCounter = 2
let itemCounter = 4

const targets = ref<TargetItem[]>([
  { id: 'target1', label: 'Tipos Primitivos' },
  { id: 'target2', label: 'Tipos de Referencia' }
])

const items = ref<ItemEntry[]>([
  { id: 'item1', content: 'string', targetId: 'target1' },
  { id: 'item2', content: 'boolean', targetId: 'target1' },
  { id: 'item3', content: 'Object', targetId: 'target2' },
  { id: 'item4', content: 'Array', targetId: 'target2' }
])

function addTarget() {
  targetCounter++
  const newId = `target${targetCounter}`
  targets.value.push({ id: newId, label: '' })
}

function removeTarget(index: number) {
  if (targets.value.length > 2) {
    const removed = targets.value.splice(index, 1)[0]
    // Reasignar items que apuntaban a este target
    for (const it of items.value) {
      if (it.targetId === removed.id) {
        it.targetId = targets.value[0].id
      }
    }
  }
}

function addItem() {
  itemCounter++
  const newId = `item${itemCounter}`
  items.value.push({
    id: newId,
    content: '',
    targetId: targets.value[0]?.id || 'target1'
  })
}

function removeItem(index: number) {
  if (items.value.length > 2) {
    items.value.splice(index, 1)
  }
}

function reset() {
  targetCounter = 2
  itemCounter = 4
  targets.value = [
    { id: 'target1', label: 'Tipos Primitivos' },
    { id: 'target2', label: 'Tipos de Referencia' }
  ]
  items.value = [
    { id: 'item1', content: 'string', targetId: 'target1' },
    { id: 'item2', content: 'boolean', targetId: 'target1' },
    { id: 'item3', content: 'Object', targetId: 'target2' },
    { id: 'item4', content: 'Array', targetId: 'target2' }
  ]
}

function validateAndGetConfig(_totalPoints: number): { valid: boolean; error?: string; config?: any } {
  if (targets.value.length < 2) {
    return { valid: false, error: 'Debes definir al menos 2 destinos (targets).' }
  }

  for (let i = 0; i < targets.value.length; i++) {
    if (!targets.value[i].label.trim()) {
      return { valid: false, error: `El destino #${i + 1} debe tener una etiqueta.` }
    }
  }

  if (items.value.length < 2) {
    return { valid: false, error: 'Debes definir al menos 2 elementos para arrastrar.' }
  }

  const mappings: Record<string, string> = {}
  for (let i = 0; i < items.value.length; i++) {
    const it = items.value[i]
    if (!it.content.trim()) {
      return { valid: false, error: `El elemento #${i + 1} no puede estar vacío.` }
    }
    if (!it.targetId) {
      return { valid: false, error: `Une todos los ítems con un destino.` }
    }
    mappings[it.id] = it.targetId
  }

  return {
    valid: true,
    config: {
      items: items.value.map(it => ({ id: it.id, content: it.content.trim() })),
      targets: targets.value.map(t => ({ id: t.id, label: t.label.trim() })),
      mappings
    }
  }
}

defineExpose({
  validateAndGetConfig,
  reset
})
</script>
