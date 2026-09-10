<template>
  <div class="space-y-5">
    <!-- Enunciado de la pregunta -->
    <div class="prose prose-xs text-base-texto-primario">
      <p class="text-xs leading-relaxed whitespace-pre-wrap">{{ question.question }}</p>
    </div>

    <!-- Opciones de selección única (radio) -->
    <div class="space-y-3">
      <label
        v-for="option in options"
        :key="option.id"
        :for="`mcq-opt-${option.id}`"
        class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150 select-none"
        :class="selectedId === option.id
          ? 'border-acento-ambar-fuerte bg-acento-ambar/10 shadow-sm'
          : 'border-base-borde-sutil bg-base-blanco hover:border-acento-ambar/50 hover:bg-base-bg-secundario'"
      >
        <input
          :id="`mcq-opt-${option.id}`"
          type="radio"
          :value="option.id"
          v-model="selectedId"
          class="mt-0.5 accent-acento-ambar-fuerte flex-shrink-0"
        />
        <span class="text-xs text-base-texto-primario leading-relaxed">{{ option.text }}</span>
      </label>
    </div>

    <!-- Estado de selección -->
    <div class="text-[11px] text-base-texto-secundario flex items-center gap-1.5 pt-1">
      <span v-if="selectedId" class="text-semantico-pasa">✔ Opción seleccionada.</span>
      <span v-else class="text-acento-ambar-fuerte">⚠ Selecciona una opción antes de entregar.</span>
      <span v-if="selectedId"> Presiona <strong>🚀 Entregar solución</strong> en la barra superior para calificar.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/workspace'

interface McqOption {
  id: string
  text: string
}

interface Props {
  question: { id: number; type: string; question: string; config: Record<string, any> }
}

const props = defineProps<Props>()
const workspaceStore = useWorkspaceStore()

const options = computed<McqOption[]>(() => props.question.config?.options ?? [])
const selectedId = ref<string | null>(null)

// Actualizar pendingAnswer cada vez que el estudiante cambia la selección
watch(selectedId, (val) => {
  workspaceStore.pendingAnswer = val ? { selectedId: val } : null
})

// Limpiar al montar (nueva actividad)
onMounted(() => {
  selectedId.value = null
  workspaceStore.pendingAnswer = null
})
</script>
